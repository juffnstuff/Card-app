const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// ─── Mail-by date helpers ───────────────────────────────────

// US state/region groupings for estimating USPS transit time
// Same state = 2 days, same region = 3 days, adjacent region = 4 days, cross-country = 5 days
const REGIONS = {
  northeast: ['CT', 'DE', 'MA', 'MD', 'ME', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT', 'DC'],
  southeast: ['AL', 'FL', 'GA', 'KY', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV'],
  midwest: ['IA', 'IL', 'IN', 'KS', 'MI', 'MN', 'MO', 'ND', 'NE', 'OH', 'SD', 'WI'],
  south: ['AR', 'LA', 'OK', 'TX'],
  mountain: ['AZ', 'CO', 'ID', 'MT', 'NM', 'NV', 'UT', 'WY'],
  pacific: ['AK', 'CA', 'HI', 'OR', 'WA'],
};

const ADJACENT_REGIONS = {
  northeast: ['southeast', 'midwest'],
  southeast: ['northeast', 'midwest', 'south'],
  midwest: ['northeast', 'southeast', 'south', 'mountain'],
  south: ['southeast', 'midwest', 'mountain'],
  mountain: ['midwest', 'south', 'pacific'],
  pacific: ['mountain'],
};

function extractState(address) {
  if (!address) return null;
  // Match 2-letter state code (common patterns: "City, ST ZIP" or "City, State")
  const match = address.match(/\b([A-Z]{2})\s+\d{5}/);
  if (match) return match[1];
  // Try matching state abbreviation after comma
  const commaMatch = address.match(/,\s*([A-Z]{2})\b/);
  if (commaMatch) return commaMatch[1];
  return null;
}

function getRegion(stateCode) {
  if (!stateCode) return null;
  for (const [region, states] of Object.entries(REGIONS)) {
    if (states.includes(stateCode)) return region;
  }
  return null;
}

function estimateTransitDays(senderAddress, receiverAddress) {
  const senderState = extractState(senderAddress);
  const receiverState = extractState(receiverAddress);

  if (!senderState || !receiverState) return 5; // Default: 5 business days if addresses unknown

  if (senderState === receiverState) return 2; // Same state

  const senderRegion = getRegion(senderState);
  const receiverRegion = getRegion(receiverState);

  if (!senderRegion || !receiverRegion) return 5;

  if (senderRegion === receiverRegion) return 3; // Same region
  if (ADJACENT_REGIONS[senderRegion]?.includes(receiverRegion)) return 4; // Adjacent regions
  return 5; // Cross-country
}

function subtractBusinessDays(date, days) {
  const result = new Date(date);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() - 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) remaining--;
  }
  return result;
}

function computeMailByDate(eventMonth, eventDay, transitDays) {
  const now = new Date();
  const year = now.getFullYear();
  let target = new Date(year, eventMonth - 1, eventDay);
  const today = new Date(year, now.getMonth(), now.getDate());
  if (target <= today) {
    target = new Date(year + 1, eventMonth - 1, eventDay);
  }
  // Subtract transit days (business days) + 1 day buffer
  return subtractBusinessDays(target, transitDays + 1);
}

// ─── Routes ─────────────────────────────────────────────────

// GET /api/orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.cardOrder.findMany({
      where: { userId: req.userId },
      include: { contact: true, date: true },
      orderBy: { orderedAt: 'desc' },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders
router.post('/', async (req, res, next) => {
  try {
    const { contactId, dateId, cardProductId, cardTitle, cardImageUrl, cardPrice, affiliateUrl } = req.body;

    if (!contactId || !dateId || !cardProductId || !cardTitle || !cardPrice) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId: req.userId },
    });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const order = await prisma.cardOrder.create({
      data: {
        userId: req.userId,
        contactId,
        dateId,
        cardProductId,
        cardTitle,
        cardImageUrl: cardImageUrl || '',
        cardPrice,
        affiliateUrl: affiliateUrl || '',
        status: 'pending',
      },
      include: { contact: true, date: true },
    });
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const VALID_STATUSES = ['pending', 'ordered', 'shipped', 'delivered', 'cancelled'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const order = await prisma.cardOrder.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { date: true, contact: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const data = { status };

    // When confirming purchase → compute mail-by date
    if (status === 'ordered' && order.status === 'pending') {
      data.confirmedAt = new Date();

      // Smart mail-by calculation using sender/receiver addresses
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { mailingAddress: true },
      });

      const transitDays = estimateTransitDays(
        user?.mailingAddress,
        order.contact.mailingAddress
      );

      data.mailByDate = computeMailByDate(
        order.date.month,
        order.date.day,
        transitDays
      );
    }

    const updated = await prisma.cardOrder.update({
      where: { id: req.params.id },
      data,
      include: { contact: true, date: true },
    });
    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
