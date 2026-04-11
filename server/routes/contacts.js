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
      include: {
        importantDates: true,
        spouse: { select: { id: true, name: true } },
        spouseOf: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
      },
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
      include: {
        importantDates: true,
        cardOrders: true,
        spouse: { select: { id: true, name: true } },
        spouseOf: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
      },
    });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    // Compute linkedSpouse (whichever side of the relation is non-null)
    contact.linkedSpouse = contact.spouse || contact.spouseOf || null;

    res.json({ contact });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts
router.post('/', async (req, res, next) => {
  try {
    const { name, relationship, tonePreference, photoUrl, mailingAddress, isMother, isFather } = req.body;

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
        mailingAddress,
        isMother: isMother || false,
        isFather: isFather || false,
      },
      include: { importantDates: true },
    });

    // Auto-add Valentine's Day for Wife/Husband
    if (['Wife', 'Husband'].includes(relationship)) {
      const existingVDay = await prisma.importantDate.findFirst({
        where: { contactId: contact.id, month: 2, day: 14 },
      });
      if (!existingVDay) {
        await prisma.importantDate.create({
          data: { contactId: contact.id, type: 'holiday', label: "Valentine's Day", month: 2, day: 14 },
        });
        // Re-fetch to include the new date
        contact.importantDates = await prisma.importantDate.findMany({ where: { contactId: contact.id } });
      }
    }

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
      include: { spouse: true, spouseOf: true },
    });
    if (!existing) return res.status(404).json({ error: 'Contact not found' });

    const { name, relationship, tonePreference, photoUrl, mailingAddress, isMother, isFather, spouseId, parentId } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (relationship !== undefined) data.relationship = relationship;
    if (tonePreference !== undefined) data.tonePreference = tonePreference;
    if (photoUrl !== undefined) data.photoUrl = photoUrl;
    if (mailingAddress !== undefined) data.mailingAddress = mailingAddress;
    if (isMother !== undefined) data.isMother = isMother;
    if (isFather !== undefined) data.isFather = isFather;
    if (parentId !== undefined) data.parentId = parentId;

    // Handle spouse linking with bidirectional sync
    if (spouseId !== undefined) {
      const currentSpouseId = existing.spouseId || existing.spouseOf?.id || null;

      if (spouseId !== currentSpouseId) {
        // Clear old spouse link (both directions)
        if (existing.spouseId) {
          await prisma.contact.update({
            where: { id: existing.spouseId },
            data: { spouseId: null },
          });
        }
        if (existing.spouseOf) {
          await prisma.contact.update({
            where: { id: existing.spouseOf.id },
            data: { spouseId: null },
          });
        }
        // Clear this contact's spouseId first
        await prisma.contact.update({
          where: { id: req.params.id },
          data: { spouseId: null },
        });

        // Set new spouse link
        if (spouseId) {
          // Verify the target contact belongs to the same user
          const target = await prisma.contact.findFirst({
            where: { id: spouseId, userId: req.userId },
          });
          if (!target) return res.status(400).json({ error: 'Spouse contact not found' });

          // Clear target's existing spouse links
          if (target.spouseId) {
            await prisma.contact.update({
              where: { id: target.spouseId },
              data: { spouseId: null },
            });
          }
          await prisma.contact.update({
            where: { id: spouseId },
            data: { spouseId: null },
          });

          // Set bidirectional: this contact points to spouse
          data.spouseId = spouseId;
        } else {
          data.spouseId = null;
        }
      }
    }

    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data,
      include: {
        importantDates: true,
        spouse: { select: { id: true, name: true } },
        spouseOf: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    // Auto-add Valentine's Day when relationship changes to Wife/Husband
    if (relationship !== undefined && ['Wife', 'Husband'].includes(relationship)) {
      const existingVDay = await prisma.importantDate.findFirst({
        where: { contactId: contact.id, month: 2, day: 14 },
      });
      if (!existingVDay) {
        await prisma.importantDate.create({
          data: { contactId: contact.id, type: 'holiday', label: "Valentine's Day", month: 2, day: 14 },
        });
        contact.importantDates = await prisma.importantDate.findMany({ where: { contactId: contact.id } });
      }
    }

    contact.linkedSpouse = contact.spouse || contact.spouseOf || null;
    res.json({ contact });
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/:id/link-child — Link a child contact to this parent
router.put('/:id/link-child', async (req, res, next) => {
  try {
    const parent = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!parent) return res.status(404).json({ error: 'Parent contact not found' });

    const { childId } = req.body;
    const child = await prisma.contact.findFirst({
      where: { id: childId, userId: req.userId },
    });
    if (!child) return res.status(400).json({ error: 'Child contact not found' });

    await prisma.contact.update({
      where: { id: childId },
      data: { parentId: req.params.id },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/:id/unlink-child — Unlink a child from this parent
router.put('/:id/unlink-child', async (req, res, next) => {
  try {
    const { childId } = req.body;
    const child = await prisma.contact.findFirst({
      where: { id: childId, userId: req.userId, parentId: req.params.id },
    });
    if (!child) return res.status(400).json({ error: 'Child link not found' });

    await prisma.contact.update({
      where: { id: childId },
      data: { parentId: null },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts/:id/create-family — Create a new contact and link as spouse or child
router.post('/:id/create-family', async (req, res, next) => {
  try {
    const parent = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { spouse: true, spouseOf: true },
    });
    if (!parent) return res.status(404).json({ error: 'Contact not found' });

    const { name, relationship, tonePreference, linkType } = req.body;
    if (!name || !relationship || !linkType) {
      return res.status(400).json({ error: 'name, relationship, and linkType are required' });
    }

    // Create the new contact
    const newContact = await prisma.contact.create({
      data: {
        userId: req.userId,
        name,
        relationship,
        tonePreference: tonePreference || 'Sentimental',
      },
      include: { importantDates: true },
    });

    // Link based on linkType
    if (linkType === 'spouse') {
      // Clear existing spouse links on parent (both directions)
      if (parent.spouseId) {
        await prisma.contact.update({ where: { id: parent.spouseId }, data: { spouseId: null } });
      }
      if (parent.spouseOf) {
        await prisma.contact.update({ where: { id: parent.spouseOf.id }, data: { spouseId: null } });
      }
      await prisma.contact.update({ where: { id: req.params.id }, data: { spouseId: null } });

      // Set bidirectional spouse link: parent → newContact
      await prisma.contact.update({
        where: { id: req.params.id },
        data: { spouseId: newContact.id },
      });
    } else if (linkType === 'child') {
      // Set new contact's parentId to this contact
      await prisma.contact.update({
        where: { id: newContact.id },
        data: { parentId: req.params.id },
      });
    }

    // Auto-add Valentine's Day for Wife/Husband
    if (['Wife', 'Husband'].includes(relationship)) {
      await prisma.importantDate.create({
        data: { contactId: newContact.id, type: 'holiday', label: "Valentine's Day", month: 2, day: 14 },
      });
    }

    // Re-fetch full contact with relations
    const fullContact = await prisma.contact.findFirst({
      where: { id: newContact.id },
      include: {
        importantDates: true,
        spouse: { select: { id: true, name: true } },
        spouseOf: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ contact: fullContact });
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
