const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/dashboard
// Returns upcoming dates (next 60 days), recent orders, and stats
router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // Get all contacts with dates for this user
    const contacts = await prisma.contact.findMany({
      where: { userId: req.userId },
      include: { importantDates: true },
    });

    // Calculate upcoming dates within ~60 days
    const upcoming = [];
    for (const contact of contacts) {
      for (const d of contact.importantDates) {
        const daysUntil = getDaysUntil(currentMonth, currentDay, d.month, d.day);
        if (daysUntil <= 60) {
          upcoming.push({
            ...d,
            contactName: contact.name,
            contactRelationship: contact.relationship,
            contactTone: contact.tonePreference,
            daysUntil,
          });
        }
      }
    }

    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

    // Look up active orders for these upcoming dates
    const upcomingDateIds = upcoming.map((u) => u.id);
    const ordersForDates = await prisma.cardOrder.findMany({
      where: {
        userId: req.userId,
        dateId: { in: upcomingDateIds },
        status: { not: 'cancelled' },
      },
      select: { id: true, dateId: true, status: true, cardTitle: true, mailByDate: true },
      orderBy: { orderedAt: 'desc' },
    });

    // Build lookup: dateId → most recent non-cancelled order
    const ordersByDateId = {};
    for (const o of ordersForDates) {
      if (!ordersByDateId[o.dateId]) {
        ordersByDateId[o.dateId] = o;
      }
    }

    // Attach order info to each upcoming date
    for (const item of upcoming) {
      item.order = ordersByDateId[item.id] || null;
    }

    // Recent orders
    const recentOrders = await prisma.cardOrder.findMany({
      where: { userId: req.userId },
      include: { contact: true, date: true },
      orderBy: { orderedAt: 'desc' },
      take: 5,
    });

    // Stats
    const totalContacts = contacts.length;
    const totalDates = contacts.reduce((sum, c) => sum + c.importantDates.length, 0);
    const needsAction = await prisma.cardOrder.count({
      where: { userId: req.userId, status: { in: ['pending', 'ordered'] } },
    });

    res.json({
      upcoming,
      recentOrders,
      stats: { totalContacts, totalDates, needsAction },
    });
  } catch (err) {
    next(err);
  }
});

function getDaysUntil(currentMonth, currentDay, targetMonth, targetDay) {
  const now = new Date();
  const year = now.getFullYear();

  let target = new Date(year, targetMonth - 1, targetDay);
  const today = new Date(year, currentMonth - 1, currentDay);

  if (target < today) {
    target = new Date(year + 1, targetMonth - 1, targetDay);
  }

  const diffMs = target - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

module.exports = router;
