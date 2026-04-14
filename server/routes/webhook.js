const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// POST /api/webhook/stripe
// This route receives raw body (configured in index.js before express.json())
router.post('/stripe', async (req, res) => {
  const stripe = process.env.STRIPE_SECRET_KEY
    ? require('stripe')(process.env.STRIPE_SECRET_KEY)
    : null;

  if (!stripe) return res.status(200).send('Stripe not configured');

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Stripe] STRIPE_WEBHOOK_SECRET is not set — rejecting webhook');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription;
        if (!userId || !subscriptionId) break;

        // Verify user exists before updating
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
          console.error(`[Stripe] Checkout completed for unknown userId: ${userId}`);
          break;
        }

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'plus',
            stripeSubscriptionId: subscriptionId,
            planExpiresAt: new Date(sub.current_period_end * 1000),
          },
        });
        console.log(`[Stripe] User ${userId} upgraded to Plus`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: sub.customer },
        });
        if (user) {
          const active = ['active', 'trialing'].includes(sub.status);
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: active ? 'plus' : 'free',
              planExpiresAt: new Date(sub.current_period_end * 1000),
            },
          });
          console.log(`[Stripe] Subscription ${sub.id} updated: ${sub.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: sub.customer },
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: 'free',
              stripeSubscriptionId: null,
              planExpiresAt: null,
            },
          });
          console.log(`[Stripe] User ${user.id} downgraded to Free`);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('[Stripe webhook] Error processing event:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }

  res.json({ received: true });
});

module.exports = router;
