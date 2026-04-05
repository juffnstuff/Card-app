const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/contacts
router.get('/', async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.userId },
      include: { importantDates: true },
      orderBy: { name: 'asc' },
    });
    res.json({ contacts });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { importantDates: true, cardOrders: true },
    });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ contact });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts
router.post('/', async (req, res, next) => {
  try {
    const { name, relationship, tonePreference, photoUrl } = req.body;

    if (!name || !relationship) {
      return res.status(400).json({ error: 'Name and relationship are required' });
    }

    const contact = await prisma.contact.create({
      data: {
        userId: req.userId,
        name,
        relationship,
        tonePreference: tonePreference || 'Sentimental',
        photoUrl,
      },
      include: { importantDates: true },
    });
    res.status(201).json({ contact });
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/:id
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Contact not found' });

    const { name, relationship, tonePreference, photoUrl } = req.body;
    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { name, relationship, tonePreference, photoUrl },
      include: { importantDates: true },
    });
    res.json({ contact });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Contact not found' });

    await prisma.contact.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
