import { db, isFirebaseConnected } from '../config/firebase.js';

let memorySlots = [
  { id: 's1', date: '2026-09-09', time: '9:00 AM – 10:00 AM', capacity: 20, booked: 5 },
  { id: 's2', date: '2026-09-09', time: '10:00 AM – 11:00 AM', capacity: 20, booked: 12 },
  { id: 's3', date: '2026-09-09', time: '11:00 AM – 12:00 PM', capacity: 20, booked: 8 },
  { id: 's4', date: '2026-09-09', time: '2:00 PM – 3:00 PM', capacity: 15, booked: 15 },
  { id: 's5', date: '2026-09-09', time: '3:00 PM – 4:00 PM', capacity: 15, booked: 3 },
  { id: 's6', date: '2026-09-10', time: '9:00 AM – 10:00 AM', capacity: 20, booked: 2 },
  { id: 's7', date: '2026-09-10', time: '10:00 AM – 11:00 AM', capacity: 20, booked: 0 },
  { id: 's8', date: '2026-09-10', time: '11:00 AM – 12:00 PM', capacity: 20, booked: 6 },
  { id: 's9', date: '2026-09-10', time: '2:00 PM – 3:00 PM', capacity: 15, booked: 9 },
  { id: 's10', date: '2026-09-10', time: '3:00 PM – 4:00 PM', capacity: 15, booked: 1 },
];

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
