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

function emailWrapper(style) {
  return `<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #FDF6EE; border-radius: 12px;">${style}<p style="color: #999; font-size: 12px; margin-top: 24px;">— CardKeeper, your greeting card concierge</p></div>`;
}

function ctaButton(url, text) {
  return `<a href="${url}" style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #D4956A; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">${text}</a>`;
}

async function sendEmail(to, subject, html) {
  const mailer = getTransporter();
  if (mailer) {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || 'reminders@cardkeeper.app',
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: "${subject}"`);
  } else {
    console.log(`[Email Stub] Would send to ${to}:`);
    console.log(`  Subject: ${subject}`);
  }
}

// ─── Existing: Event reminder (14/7 days before) ───────────

async function sendReminderEmail({ to, contactName, eventLabel, daysUntil, dashboardUrl }) {
  const subject = `${contactName}'s ${eventLabel} is in ${daysUntil} days — time to pick a card!`;
  const html = emailWrapper(`
    <h1 style="color: #2D2926; font-size: 24px; margin-bottom: 8px;">Don't forget! 💌</h1>
    <p style="color: #4A4543; font-size: 16px; line-height: 1.6;">
      <strong>${contactName}'s ${eventLabel}</strong> is coming up in <strong>${daysUntil} days</strong>.
    </p>
    <p style="color: #4A4543; font-size: 16px; line-height: 1.6;">
      Head to CardKeeper to browse and order the perfect card — we'll ship it right to your door so you can add your personal touch.
    </p>
    ${ctaButton(dashboardUrl, 'Choose a Card →')}
  `);
  await sendEmail(to, subject, html);
}

// ─── New: Purchase nudge (did you buy the card?) ───────────

async function sendPurchaseNudgeEmail({ to, contactName, eventLabel, cardTitle, confirmUrl }) {
  const subject = `Did you buy "${cardTitle}" for ${contactName}?`;
  const html = emailWrapper(`
    <h1 style="color: #2D2926; font-size: 24px; margin-bottom: 8px;">Quick check-in 🛒</h1>
    <p style="color: #4A4543; font-size: 16px; line-height: 1.6;">
      You selected <strong>"${cardTitle}"</strong> for <strong>${contactName}'s ${eventLabel}</strong> a few days ago. Did you complete the purchase on Amazon?
    </p>
    <p style="color: #4A4543; font-size: 16px; line-height: 1.6;">
      Once you confirm, we'll calculate exactly when you need to mail it so it arrives right on time.
    </p>
    ${ctaButton(confirmUrl, 'Confirm Purchase →')}
  `);
  await sendEmail(to, subject, html);
}

// ─── New: Mail-by reminder ─────────────────────────────────

async function sendMailByEmail({ to, contactName, eventLabel, cardTitle, mailByDate, daysUntilMailBy }) {
  const formatted = new Date(mailByDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const urgency = daysUntilMailBy <= 2 ? 'Time is running out!' : 'Heads up!';
  const subject = `Mail "${cardTitle}" by ${formatted} for ${contactName}'s ${eventLabel}`;
  const html = emailWrapper(`
    <h1 style="color: #2D2926; font-size: 24px; margin-bottom: 8px;">${urgency} 📬</h1>
    <p style="color: #4A4543; font-size: 16px; line-height: 1.6;">
      To make sure <strong>"${cardTitle}"</strong> arrives in time for <strong>${contactName}'s ${eventLabel}</strong>, you need to mail it by <strong>${formatted}</strong> (${daysUntilMailBy} day${daysUntilMailBy !== 1 ? 's' : ''} from now).
    </p>
    <p style="color: #4A4543; font-size: 16px; line-height: 1.6;">
      Add your personal touch, stamp it, and drop it in the mail! 💌
    </p>
  `);
  await sendEmail(to, subject, html);
}

// ─── New: Yearly suggestion ────────────────────────────────

async function sendYearlySuggestionEmail({ to, contactName, eventLabel, lastCardTitle, browseUrl }) {
  const subject = `${contactName}'s ${eventLabel} is coming up — time to pick this year's card!`;
  const html = emailWrapper(`
    <h1 style="color: #2D2926; font-size: 24px; margin-bottom: 8px;">It's that time again! 🎉</h1>
    <p style="color: #4A4543; font-size: 16px; line-height: 1.6;">
      <strong>${contactName}'s ${eventLabel}</strong> is about a month away. Last year you sent them <strong>"${lastCardTitle}"</strong>.
    </p>
    <p style="color: #4A4543; font-size: 16px; line-height: 1.6;">
      Ready to pick something new this year?
    </p>
    ${ctaButton(browseUrl, 'Browse Cards →')}
  `);
  await sendEmail(to, subject, html);
}

module.exports = {
  sendReminderEmail,
  sendPurchaseNudgeEmail,
  sendMailByEmail,
  sendYearlySuggestionEmail,
};
