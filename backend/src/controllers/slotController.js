import { db, isFirebaseConnected } from '../config/firebase.js';

export let memorySlots = [];

/**
 * GET /api/slots
 */
export async function getSlots(req, res, next) {
  try {
    if (isFirebaseConnected && db) {
      const snapshot = await db.collection('slots').get();
      if (!snapshot.empty) {
        const slots = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return res.json(slots);
      }
    }
    res.json(memorySlots);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/slots
 */
export async function addSlot(req, res, next) {
  try {
    const { date, time, capacity } = req.body;
    if (!date || !time) {
      return res.status(400).json({ error: 'BadRequest', message: 'Date and time are required for slot.' });
    }

    const slotData = {
      date,
      time,
      capacity: Number(capacity) || 20,
      booked: 0,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConnected && db) {
      const docRef = await db.collection('slots').add(slotData);
      return res.status(201).json({ id: docRef.id, ...slotData });
    }

    const newSlot = { id: `s${Date.now()}`, ...slotData };
    memorySlots.push(newSlot);
    res.status(201).json(newSlot);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/slots/:id
 */
export async function updateSlot(req, res, next) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    if (updates.capacity !== undefined) {
      updates.capacity = Number(updates.capacity);
    }

    if (isFirebaseConnected && db) {
      const ref = db.collection('slots').doc(id);
      await ref.update(updates);
      const updated = await ref.get();
      return res.json({ id: updated.id, ...updated.data() });
    }

    const idx = memorySlots.findIndex((s) => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'NotFound', message: `Slot #${id} not found.` });
    }
    memorySlots[idx] = { ...memorySlots[idx], ...updates };
    res.json(memorySlots[idx]);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/slots/:id
 */
export async function deleteSlot(req, res, next) {
  try {
    const { id } = req.params;

    if (isFirebaseConnected && db) {
      await db.collection('slots').doc(id).delete();
      return res.json({ success: true, message: `Slot #${id} deleted successfully.` });
    }

    const idx = memorySlots.findIndex((s) => s.id === id);
    if (idx !== -1) {
      memorySlots.splice(idx, 1);
    }
    res.json({ success: true, message: `Slot #${id} deleted successfully.` });
  } catch (error) {
    next(error);
  }
}

