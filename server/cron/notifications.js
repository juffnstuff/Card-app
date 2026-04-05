const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { sendReminderEmail } = require('../services/email');

const prisma = new PrismaClient();

// DECISION: Check at 8am daily. Lead times are 14 and 7 days before events.
// Only sends one notification per (user, date, leadDays) combo to avoid duplicates.
const LEAD_DAYS = [14, 7];

async function checkUpcomingDates() {
  console.log('[Cron] Checking for upcoming dates...');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();

  try {
    // Get all important dates with their contacts and users
    const allDates = await prisma.importantDate.findMany({
      include: { contact: { include: { user: true } } },
    });

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
          // Check if we already sent this notification
          const existing = await prisma.notification.findFirst({
            where: {
              userId: d.contact.userId,
              dateId: d.id,
              leadDays,
              sentAt: { gte: new Date(currentYear, 0, 1) }, // This calendar year
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
              },
            });

            console.log(`[Cron] Sent ${leadDays}-day reminder for ${d.contact.name}'s ${d.label}`);
          }
        }
      }
    }

    console.log('[Cron] Check complete.');
  } catch (err) {
    console.error('[Cron] Error checking dates:', err);
  }
}

function startNotificationCron() {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    checkUpcomingDates();
  });

  console.log('[Cron] Notification scheduler started (runs daily at 8:00 AM)');

  // DECISION: Also run once on server start (delayed 5s) for easier development/testing
  setTimeout(() => {
    console.log('[Cron] Running initial check...');
    checkUpcomingDates();
  }, 5000);
}

module.exports = { startNotificationCron, checkUpcomingDates };
