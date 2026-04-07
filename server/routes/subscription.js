const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Only init Stripe if keys are configured
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const PLANS = {
  free: { name: 'Free', contactLimit: Infinity, price: 0 },
  plus: { name: 'Plus', contactLimit: Infinity, price: 3.99 },
};

// GET /api/subscription — current plan info
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { plan: true, planExpiresAt: true },
    });
    const contactCount = await prisma.contact.count({ where: { userId: req.userId } });
    const planInfo = PLANS[user.plan] || PLANS.free;

    res.json({
      plan: user.plan,
      planName: planInfo.name,
      contactLimit: planInfo.contactLimit === Infinity ? null : planInfo.contactLimit,
      contactCount,
      planExpiresAt: user.planExpiresAt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscription/checkout — create Stripe checkout session
router.post('/checkout', authenticate, async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payments not configured. Set STRIPE_SECRET_KEY.' });
    }

    const { interval } = req.body; // "month" or "year"
    const priceId = interval === 'year'
      ? process.env.STRIPE_PRICE_ID_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY;

    if (!priceId) {
      return res.status(503).json({ error: 'Stripe price IDs not configured.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    // Reuse or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/profile?upgraded=1`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { userId: user.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscription/portal — Stripe billing portal for managing subscription
router.post('/portal', authenticate, async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payments not configured.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No billing account found.' });
    }

    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/profile`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.PLANS = PLANS;
