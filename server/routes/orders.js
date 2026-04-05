const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

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
// DECISION: Stub checkout — no real payment. Status starts as "pending". Ready for Stripe integration.
router.post('/', async (req, res, next) => {
  try {
    const { contactId, dateId, cardProductId, cardTitle, cardImageUrl, cardPrice } = req.body;

    if (!contactId || !dateId || !cardProductId || !cardTitle || !cardPrice) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    // Verify contact belongs to user
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
    const order = await prisma.cardOrder.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updated = await prisma.cardOrder.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
