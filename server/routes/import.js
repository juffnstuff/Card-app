const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

router.use(authenticate);

// ─── Google OAuth ────────────────────────────────────────────

function getGoogleOAuthClient() {
  const { google } = require('googleapis');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret) return null;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// GET /api/import/google/url — get the Google OAuth consent URL
router.get('/google/url', (req, res) => {
  const oauth2Client = getGoogleOAuthClient();
  if (!oauth2Client) {
    return res.status(503).json({ error: 'Google OAuth not configured.' });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/contacts.readonly'],
    state: req.userId, // pass userId through OAuth flow
    prompt: 'consent',
  });

  res.json({ url });
});

// GET /api/import/google/callback — handle Google OAuth callback
router.get('/google/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Missing authorization code' });

    const oauth2Client = getGoogleOAuthClient();
    if (!oauth2Client) return res.status(503).json({ error: 'Google OAuth not configured.' });

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { google } = require('googleapis');
    const people = google.people({ version: 'v1', auth: oauth2Client });

    // Fetch contacts with names and birthdays
    let allContacts = [];
    let nextPageToken = undefined;

    do {
      const resp = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 200,
        personFields: 'names,birthdays,emailAddresses,relations',
        pageToken: nextPageToken,
      });

      const connections = resp.data.connections || [];
      for (const person of connections) {
        const name = person.names?.[0]?.displayName;
        if (!name) continue;

        const birthday = person.birthdays?.[0]?.date;
        const relation = person.relations?.[0]?.person || '';

        allContacts.push({
          name,
          birthday: birthday ? { month: birthday.month, day: birthday.day, year: birthday.year } : null,
          relationship: guessRelationship(relation),
        });
      }

      nextPageToken = resp.data.nextPageToken;
    } while (nextPageToken);

    // Sort: contacts with birthdays first, then alphabetical
    allContacts.sort((a, b) => {
      if (a.birthday && !b.birthday) return -1;
      if (!a.birthday && b.birthday) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({ contacts: allContacts, total: allContacts.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/import/google/save — save selected Google contacts
router.post('/google/save', async (req, res, next) => {
  try {
    const { contacts } = req.body; // array of { name, relationship, tonePreference, birthday }
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'No contacts to import' });
    }

    // Check contact limit for free users
    const { PLANS } = require('./subscription');
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { plan: true } });
    const planInfo = PLANS[user.plan] || PLANS.free;
    const currentCount = await prisma.contact.count({ where: { userId: req.userId } });

    let importLimit = contacts.length;
    if (planInfo.contactLimit !== Infinity) {
      const remaining = planInfo.contactLimit - currentCount;
      if (remaining <= 0) {
        return res.status(403).json({
          error: `Free plan limit reached. Upgrade to Plus for unlimited contacts.`,
          code: 'CONTACT_LIMIT',
        });
      }
      importLimit = Math.min(contacts.length, remaining);
    }

    const toImport = contacts.slice(0, importLimit);
    const created = [];

    for (const c of toImport) {
      const contact = await prisma.contact.create({
        data: {
          userId: req.userId,
          name: c.name,
          relationship: c.relationship || 'Friend',
          tonePreference: c.tonePreference || 'Sentimental',
          importantDates: c.birthday ? {
            create: [{
              type: 'birthday',
              label: 'Birthday',
              month: c.birthday.month,
              day: c.birthday.day,
              year: c.birthday.year || null,
            }],
          } : undefined,
        },
        include: { importantDates: true },
      });
      created.push(contact);
    }

    res.json({
      imported: created.length,
      skipped: contacts.length - created.length,
      contacts: created,
    });
  } catch (err) {
    next(err);
  }
});

// ─── CSV Import ──────────────────────────────────────────────

// POST /api/import/csv — parse and preview CSV contacts
router.post('/csv', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const content = req.file.buffer.toString('utf-8');
    const contacts = parseCSV(content);

    res.json({ contacts, total: contacts.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/import/csv/save — save selected CSV contacts (reuses same logic)
router.post('/csv/save', async (req, res, next) => {
  // Delegate to the same save logic
  req.url = '/google/save';
  router.handle(req, res, next);
});

// ─── Helpers ─────────────────────────────────────────────────

function guessRelationship(relation) {
  if (!relation) return 'Friend';
  const r = relation.toLowerCase();
  if (r.includes('mother') || r.includes('mom')) return 'Mother';
  if (r.includes('father') || r.includes('dad')) return 'Father';
  if (r.includes('spouse') || r.includes('wife') || r.includes('husband') || r.includes('partner')) return 'Spouse';
  if (r.includes('brother') || r.includes('sister') || r.includes('sibling')) return 'Sibling';
  if (r.includes('son') || r.includes('daughter') || r.includes('child')) return 'Child';
  if (r.includes('grand')) return 'Grandparent';
  if (r.includes('friend') || r.includes('best')) return 'Friend';
  if (r.includes('coworker') || r.includes('colleague') || r.includes('work')) return 'Coworker';
  return 'Friend';
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

  // Find column indices — flexible matching
  const nameIdx = headers.findIndex((h) => h.includes('name') && !h.includes('last') && !h.includes('middle'));
  const firstIdx = headers.findIndex((h) => h.includes('first'));
  const lastIdx = headers.findIndex((h) => h.includes('last'));
  const birthdayIdx = headers.findIndex((h) => h.includes('birthday') || h.includes('birth') || h.includes('dob'));
  const relationIdx = headers.findIndex((h) => h.includes('relation'));

  const contacts = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);

    // Build name
    let name = '';
    if (nameIdx >= 0) {
      name = cols[nameIdx]?.trim();
    } else if (firstIdx >= 0) {
      name = [cols[firstIdx], cols[lastIdx]]
        .filter(Boolean)
        .map((s) => s.trim())
        .join(' ');
    }
    if (!name) continue;

    // Parse birthday
    let birthday = null;
    if (birthdayIdx >= 0 && cols[birthdayIdx]) {
      birthday = parseBirthdayString(cols[birthdayIdx].trim());
    }

    const relationship = relationIdx >= 0
      ? guessRelationship(cols[relationIdx]?.trim())
      : 'Friend';

    contacts.push({ name, birthday, relationship });
  }

  // Sort: birthday contacts first
  contacts.sort((a, b) => {
    if (a.birthday && !b.birthday) return -1;
    if (!a.birthday && b.birthday) return 1;
    return a.name.localeCompare(b.name);
  });

  return contacts;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseBirthdayString(str) {
  // Try common formats: MM/DD/YYYY, YYYY-MM-DD, Month DD YYYY, etc.
  str = str.replace(/['"]/g, '');

  // YYYY-MM-DD
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return { year: parseInt(m[1]), month: parseInt(m[2]), day: parseInt(m[3]) };

  // MM/DD/YYYY or MM-DD-YYYY
  m = str.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
  if (m) return { year: parseInt(m[3]), month: parseInt(m[1]), day: parseInt(m[2]) };

  // MM/DD (no year)
  m = str.match(/^(\d{1,2})[/\-](\d{1,2})$/);
  if (m) return { month: parseInt(m[1]), day: parseInt(m[2]), year: null };

  // "March 15, 1990" etc
  const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  m = str.match(/^([a-z]+)\s+(\d{1,2}),?\s*(\d{4})?$/i);
  if (m) {
    const mo = months[m[1].slice(0, 3).toLowerCase()];
    if (mo) return { month: mo, day: parseInt(m[2]), year: m[3] ? parseInt(m[3]) : null };
  }

  return null;
}

module.exports = router;
