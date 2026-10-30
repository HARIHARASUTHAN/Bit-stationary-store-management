import { db, isFirebaseConnected } from '../config/firebase.js';
import {
  filterFutureSlots,
  isSlotExpired,
  generateUpcomingSlots,
} from '../utils/slotTimeUtils.js';

export let memorySlots = [];

/**
 * GET /api/slots
 * Supports query params:
 *   ?futureOnly=true (or ?upcoming=true) - returns only non-expired future slots
 */
export async function getSlots(req, res, next) {
  try {
    const futureOnly = req.query.futureOnly === 'true' || req.query.upcoming === 'true';
    let allSlots = [];

    if (isFirebaseConnected && db) {
      const snapshot = await db.collection('slots').get();
      if (!snapshot.empty) {
        allSlots = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
    } else {
      allSlots = [...memorySlots];
    }

    const now = new Date();

    // Attach dynamic isExpired boolean for all consumers
    allSlots = allSlots.map((slot) => ({
      ...slot,
      isExpired: isSlotExpired(slot, now),
    }));

    if (futureOnly) {
      let activeSlots = filterFutureSlots(allSlots, now);

      // If no future slots exist in DB (e.g. at night after store hours),
      // dynamically provision upcoming slots for tomorrow & next business days
      if (activeSlots.length === 0) {
        const generated = generateUpcomingSlots(now, 2);

        if (isFirebaseConnected && db) {
          for (const s of generated) {
            try {
              await db.collection('slots').doc(s.id).set(s);
            } catch (_) {}
          }
        } else {
          memorySlots.push(...generated);
        }

        activeSlots = generated.map((s) => ({ ...s, isExpired: false }));
      }

      return res.json(activeSlots);
    }

    res.json(allSlots);
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

    const now = new Date();
    if (isSlotExpired({ date, time }, now)) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Cannot create a pickup slot in the past. Date and time must be in the future.',
      });
    }

    const slotData = {
      date,
      time,
      capacity: Number(capacity) || 20,
      booked: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    if (isFirebaseConnected && db) {
      const docRef = await db.collection('slots').add(slotData);
      return res.status(201).json({ id: docRef.id, ...slotData, isExpired: false });
    }

    const newSlot = { id: `s${Date.now()}`, ...slotData, isExpired: false };
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

    if (updates.date && updates.time && isSlotExpired({ date: updates.date, time: updates.time }, new Date())) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Cannot update a pickup slot to an expired date and time in the past.',
      });
    }

    updates.updatedAt = new Date().toISOString();

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
