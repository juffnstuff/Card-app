const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

const VALID_DATE_TYPES = ['birthday', 'anniversary', 'graduation', 'holiday', 'custom'];

// POST /api/dates
router.post('/', async (req, res, next) => {
  try {
    const { contactId, type, label, month, day, year } = req.body;

    if (!contactId || !type || !label || !month || !day) {
      return res.status(400).json({ error: 'contactId, type, label, month, and day are required' });
    }

    if (!VALID_DATE_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid date type' });
    }
    const m = parseInt(month);
    const d = parseInt(day);
    if (m < 1 || m > 12 || d < 1 || d > 31) {
      return res.status(400).json({ error: 'Invalid month or day value' });
    }
    if (typeof label !== 'string' || label.length > 200) {
      return res.status(400).json({ error: 'Label is required and must be under 200 characters' });
    }

    // Verify the contact belongs to this user
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId: req.userId },
    });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const date = await prisma.importantDate.create({
      data: { contactId, type, label: label.trim(), month: m, day: d, year: year ? parseInt(year) : null },
    });
    res.status(201).json({ date });
  } catch (err) {
    next(err);
  }
});

// PUT /api/dates/:id
router.put('/:id', async (req, res, next) => {
  try {
    const date = await prisma.importantDate.findUnique({
      where: { id: req.params.id },
      include: { contact: true },
    });
    if (!date || date.contact.userId !== req.userId) {
      return res.status(404).json({ error: 'Date not found' });
    }

    const { type, label, month, day, year } = req.body;
    const updated = await prisma.importantDate.update({
      where: { id: req.params.id },
      data: { type, label, month, day, year: year || null },
    });
    res.json({ date: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/dates/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const date = await prisma.importantDate.findUnique({
      where: { id: req.params.id },
      include: { contact: true },
    });
    if (!date || date.contact.userId !== req.userId) {
      return res.status(404).json({ error: 'Date not found' });
    }

    await prisma.importantDate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
