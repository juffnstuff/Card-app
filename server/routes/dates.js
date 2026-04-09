const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// POST /api/dates
router.post('/', async (req, res, next) => {
  try {
    const { contactId, type, label, month, day, year } = req.body;

    if (!contactId || !type || !label || !month || !day) {
      return res.status(400).json({ error: 'contactId, type, label, month, and day are required' });
    }

    // Verify the contact belongs to this user
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId: req.userId },
    });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const date = await prisma.importantDate.create({
      data: { contactId, type, label, month, day, year: year || null },
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
