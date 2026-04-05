const nodemailer = require('nodemailer');

// DECISION: Email is fully stubbed. In dev, logs to console. In production, swap with SendGrid or real SMTP.
// To use SendGrid: set SMTP_HOST=smtp.sendgrid.net, SMTP_USER=apikey, SMTP_PASS=<your-sendgrid-key>

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendReminderEmail({ to, contactName, eventLabel, daysUntil, dashboardUrl }) {
  const subject = `${contactName}'s ${eventLabel} is in ${daysUntil} days — time to pick a card!`;
  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #FDF6EE; border-radius: 12px;">
      <h1 style="color: #2D2926; font-size: 24px; margin-bottom: 8px;">Don't forget! 💌</h1>
      <p style="color: #4A4543; font-size: 16px; line-height: 1.6;">
        <strong>${contactName}'s ${eventLabel}</strong> is coming up in <strong>${daysUntil} days</strong>.
      </p>
      <p style="color: #4A4543; font-size: 16px; line-height: 1.6;">
        Head to CardKeeper to browse and order the perfect card — we'll ship it right to your door so you can add your personal touch.
      </p>
      <a href="${dashboardUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #D4956A; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Choose a Card →
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        — CardKeeper, your greeting card concierge
      </p>
    </div>
  `;

  const mailer = getTransporter();
  if (mailer) {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || 'reminders@cardkeeper.app',
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent reminder to ${to}: "${subject}"`);
  } else {
    // Stub mode — just log
    console.log(`[Email Stub] Would send to ${to}:`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Dashboard: ${dashboardUrl}`);
  }
}

module.exports = { sendReminderEmail };
