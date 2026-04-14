const cron = require('node-cron');
const prisma = require('../lib/prisma');
const {
  sendReminderEmail,
  sendPurchaseNudgeEmail,
  sendMailByEmail,
  sendYearlySuggestionEmail,
} = require('../services/email');

// Lead times for event reminders (days before the event)
const LEAD_DAYS = [14, 7];

// ─── 1. Existing: Event reminders (14/7 days before) ───────

const BATCH_SIZE = 500;

async function checkUpcomingDates() {
  console.log('[Cron] Checking for upcoming dates...');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();

  try {
    // Paginate to avoid loading all dates into memory at once
    let skip = 0;
    let allDates = [];
    while (true) {
      const batch = await prisma.importantDate.findMany({
        include: { contact: { include: { user: true } } },
        skip,
        take: BATCH_SIZE,
      });
      allDates = allDates.concat(batch);
      if (batch.length < BATCH_SIZE) break;
      skip += BATCH_SIZE;
    }

    for (const d of allDates) {
      let targetDate = new Date(currentYear, d.month - 1, d.day);
      const today = new Date(currentYear, currentMonth - 1, currentDay);

      if (targetDate < today) {
        targetDate = new Date(currentYear + 1, d.month - 1, d.day);
      }

      const diffMs = targetDate - today;
      const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

      for (const leadDays of LEAD_DAYS) {
        if (daysUntil === leadDays) {
          const existing = await prisma.notification.findFirst({
            where: {
              userId: d.contact.userId,
              dateId: d.id,
              leadDays,
              type: 'reminder',
              sentAt: { gte: new Date(currentYear, 0, 1) },
            },
          });

          if (!existing) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            await sendReminderEmail({
              to: d.contact.user.email,
              contactName: d.contact.name,
              eventLabel: d.label,
              daysUntil: leadDays,
              dashboardUrl: `${frontendUrl}/cards?contactId=${d.contactId}&dateId=${d.id}`,
            });

            await prisma.notification.create({
              data: {
                userId: d.contact.userId,
                dateId: d.id,
                leadDays,
                type: 'reminder',
              },
            });

            console.log(`[Cron] Sent ${leadDays}-day reminder for ${d.contact.name}'s ${d.label}`);
          }
        }
      }
    }

    console.log('[Cron] Event reminder check complete.');
  } catch (err) {
    console.error('[Cron] Error checking dates:', err);
  }
}

// ─── 2. Purchase nudges (3 days after card selection) ──────

async function checkPurchaseNudges() {
  console.log('[Cron] Checking for purchase nudges...');
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find pending orders that are 3+ days old
    const pendingOrders = await prisma.cardOrder.findMany({
      where: {
        status: 'pending',
        orderedAt: { lte: threeDaysAgo },
      },
      include: {
        user: true,
        contact: true,
        date: true,
      },
    });

    for (const order of pendingOrders) {
      // Check if we already sent a nudge for this order
      const existing = await prisma.notification.findFirst({
        where: {
          userId: order.userId,
          orderId: order.id,
          type: 'purchase_nudge',
        },
      });

      if (!existing) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        await sendPurchaseNudgeEmail({
          to: order.user.email,
          contactName: order.contact.name,
          eventLabel: order.date.label,
          cardTitle: order.cardTitle,
          confirmUrl: `${frontendUrl}/orders`,
        });

        await prisma.notification.create({
          data: {
            userId: order.userId,
            dateId: order.dateId,
            orderId: order.id,
            leadDays: 3,
            type: 'purchase_nudge',
          },
        });

        console.log(`[Cron] Sent purchase nudge for "${order.cardTitle}" to ${order.user.email}`);
      }
    }

    console.log('[Cron] Purchase nudge check complete.');
  } catch (err) {
    console.error('[Cron] Error checking purchase nudges:', err);
  }
}

// ─── 3. Mail-by reminders (5 and 2 days before mailByDate) ─

async function checkMailByReminders() {
  console.log('[Cron] Checking for mail-by reminders...');
  try {
    const orderedCards = await prisma.cardOrder.findMany({
      where: {
        status: 'ordered',
        mailByDate: { not: null },
      },
      include: {
        user: true,
        contact: true,
        date: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const order of orderedCards) {
      const mailBy = new Date(order.mailByDate);
      mailBy.setHours(0, 0, 0, 0);
      const diffMs = mailBy - today;
      const daysUntilMailBy = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Send reminders at 5 days and 2 days before mail-by date
      for (const lead of [5, 2]) {
        if (daysUntilMailBy === lead) {
          const existing = await prisma.notification.findFirst({
            where: {
              userId: order.userId,
              orderId: order.id,
              type: 'mail_by',
              leadDays: lead,
            },
          });

          if (!existing) {
            await sendMailByEmail({
              to: order.user.email,
              contactName: order.contact.name,
              eventLabel: order.date.label,
              cardTitle: order.cardTitle,
              mailByDate: order.mailByDate,
              daysUntilMailBy: lead,
            });

            await prisma.notification.create({
              data: {
                userId: order.userId,
                dateId: order.dateId,
                orderId: order.id,
                leadDays: lead,
                type: 'mail_by',
              },
            });

            console.log(`[Cron] Sent ${lead}-day mail-by reminder for "${order.cardTitle}"`);
          }
        }
      }
    }

    console.log('[Cron] Mail-by reminder check complete.');
  } catch (err) {
    console.error('[Cron] Error checking mail-by reminders:', err);
  }
}

// ─── 4. Yearly suggestions (~30 days before event) ─────────

async function checkYearlySuggestions() {
  console.log('[Cron] Checking for yearly suggestions...');
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    let skip2 = 0;
    let allDatesForSuggestions = [];
    while (true) {
      const batch = await prisma.importantDate.findMany({
        include: { contact: { include: { user: true } } },
        skip: skip2,
        take: BATCH_SIZE,
      });
      allDatesForSuggestions = allDatesForSuggestions.concat(batch);
      if (batch.length < BATCH_SIZE) break;
      skip2 += BATCH_SIZE;
    }

    for (const d of allDatesForSuggestions) {
      let targetDate = new Date(currentYear, d.month - 1, d.day);
      const today = new Date(currentYear, currentMonth - 1, currentDay);
      if (targetDate < today) {
        targetDate = new Date(currentYear + 1, d.month - 1, d.day);
      }

      const diffMs = targetDate - today;
      const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (daysUntil === 30) {
        // Check if there's a delivered/ordered card from last year for this date
        const lastYearOrder = await prisma.cardOrder.findFirst({
          where: {
            userId: d.contact.userId,
            dateId: d.id,
            status: { in: ['delivered', 'ordered', 'shipped'] },
            orderedAt: {
              gte: new Date(currentYear - 1, 0, 1),
              lt: new Date(currentYear, 0, 1),
            },
          },
          orderBy: { orderedAt: 'desc' },
        });

        if (!lastYearOrder) continue;

        // Check if there's already an order for this year
        const thisYearOrder = await prisma.cardOrder.findFirst({
          where: {
            userId: d.contact.userId,
            dateId: d.id,
            status: { not: 'cancelled' },
            orderedAt: { gte: new Date(currentYear, 0, 1) },
          },
        });

        if (thisYearOrder) continue;

        // Check if we already sent this suggestion
        const existing = await prisma.notification.findFirst({
          where: {
            userId: d.contact.userId,
            dateId: d.id,
            type: 'yearly_suggestion',
            sentAt: { gte: new Date(currentYear, 0, 1) },
          },
        });

        if (!existing) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          await sendYearlySuggestionEmail({
            to: d.contact.user.email,
            contactName: d.contact.name,
            eventLabel: d.label,
            lastCardTitle: lastYearOrder.cardTitle,
            browseUrl: `${frontendUrl}/cards?contactId=${d.contactId}&dateId=${d.id}`,
          });

          await prisma.notification.create({
            data: {
              userId: d.contact.userId,
              dateId: d.id,
              leadDays: 30,
              type: 'yearly_suggestion',
            },
          });

          console.log(`[Cron] Sent yearly suggestion for ${d.contact.name}'s ${d.label}`);
        }
      }
    }

    console.log('[Cron] Yearly suggestion check complete.');
  } catch (err) {
    console.error('[Cron] Error checking yearly suggestions:', err);
  }
}

// ─── Main runner ────────────────────────────────────────────

async function runAllChecks() {
  await checkUpcomingDates();
  await checkPurchaseNudges();
  await checkMailByReminders();
  await checkYearlySuggestions();
}

function startNotificationCron() {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    runAllChecks();
  });

  console.log('[Cron] Notification scheduler started (runs daily at 8:00 AM)');

  // Also run once on server start (delayed 5s) for easier development/testing
  setTimeout(() => {
    console.log('[Cron] Running initial check...');
    runAllChecks();
  }, 5000);
}

module.exports = { startNotificationCron, checkUpcomingDates, runAllChecks };
