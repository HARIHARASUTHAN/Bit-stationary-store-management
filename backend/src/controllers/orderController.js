import { db, isFirebaseConnected } from '../config/firebase.js';

let memoryOrders = [
  {
    id: 'ord-001',
    userId: 'u1',
    userName: 'Arjun Sharma',
    userEmail: 'arjun@student.ac.in',
    userDepartment: 'Computer Science',
    role: 'student',
    status: 'Pending',
    placedAt: '2026-09-07T09:30:00.000Z',
    pickupSlot: { date: '2026-09-10', time: '10:00 AM – 11:00 AM' },
    isBulkOrder: false,
    items: [
      { itemId: 'i1', name: 'Classmate Spiral Notebook', quantity: 2, price: 65 },
      { itemId: 'i2', name: 'Reynolds Pen (Blue)', quantity: 5, price: 12 },
    ],
    total: 190,
    timeline: [
      { status: 'Pending', timestamp: '2026-09-07T09:30:00.000Z', note: 'Order placed successfully' },
    ],
  },
  {
    id: 'ord-002',
    userId: 'u3',
    userName: 'Dr. Kavitha Menon',
    userEmail: 'kavitha@faculty.ac.in',
    userDepartment: 'Computer Science',
    role: 'faculty',
    status: 'Collected',
    placedAt: '2026-09-01T10:00:00.000Z',
    pickupSlot: { date: '2026-09-03', time: '9:00 AM – 10:00 AM' },
    isBulkOrder: true,
    bulkNote: 'For 1st year CS batch orientation',
    items: [
      { itemId: 'i1', name: 'Classmate Spiral Notebook', quantity: 60, price: 65 },
      { itemId: 'i2', name: 'Reynolds Pen (Blue)', quantity: 120, price: 12 },
    ],
    total: 5340,
    timeline: [
      { status: 'Pending', timestamp: '2026-09-01T10:00:00.000Z', note: 'Bulk order placed' },
      { status: 'Approved', timestamp: '2026-09-01T12:00:00.000Z', note: 'Approved' },
      { status: 'Ready', timestamp: '2026-09-02T16:00:00.000Z', note: 'Ready for pickup' },
      { status: 'Collected', timestamp: '2026-09-03T09:45:00.000Z', note: 'Collected by faculty' },
    ],
  },
];

let nextOrderId = 100;

/**
 * GET /api/orders
 * Filter by userId, role, status
 */
export async function getOrders(req, res, next) {
  try {
    const { status, userId } = req.query;
    const userRole = req.user?.role || 'student';
    const userEmail = req.user?.email || '';

    if (isFirebaseConnected && db) {
      let query = db.collection('orders');

      // Regular students and faculty only see their own orders
      if (userRole !== 'shopadmin' && userRole !== 'admin') {
        if (req.user?.uid) {
          query = query.where('userId', '==', req.user.uid);
        } else if (userEmail) {
          query = query.where('userEmail', '==', userEmail);
        }
      } else if (userId) {
        query = query.where('userId', '==', userId);
      }

      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();
      let orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      orders.sort((a, b) => new Date(b.placedAt || 0) - new Date(a.placedAt || 0));
      return res.json(orders);
    }

    // In-memory fallback
    let result = [...memoryOrders];
    if (userRole !== 'shopadmin' && userRole !== 'admin') {
      result = result.filter(
        (o) => o.userEmail === userEmail || o.userId === req.user?.uid
      );
    } else if (userId) {
      result = result.filter((o) => o.userId === userId);
    }

    if (status && status !== 'All') {
      result = result.filter((o) => o.status === status);
    }

    result.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:id
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    if (isFirebaseConnected && db) {
      const doc = await db.collection('orders').doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'NotFound', message: `Order #${id} not found.` });
      }
      return res.json({ id: doc.id, ...doc.data() });
    }

    const order = memoryOrders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'NotFound', message: `Order #${id} not found.` });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders
 */
export async function placeOrder(req, res, next) {
  try {
    const { items, pickupSlot, isBulkOrder, bulkNote, userDepartment } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'BadRequest', message: 'Order must contain at least 1 item.' });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const orderId = `ord-${String(++nextOrderId).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const orderData = {
      userId: req.user?.uid || 'guest-user',
      userName: req.user?.displayName || req.body.userName || 'Campus User',
      userEmail: req.user?.email || req.body.userEmail || 'student@student.ac.in',
      userDepartment: userDepartment || req.body.userDepartment || 'General',
      role: req.user?.role || (isBulkOrder ? 'faculty' : 'student'),
      status: 'Pending',
      placedAt: now,
      pickupSlot: pickupSlot || { date: 'Today', time: '10:00 AM – 11:00 AM' },
      isBulkOrder: Boolean(isBulkOrder),
      bulkNote: bulkNote || '',
      items,
      total,
      timeline: [{ status: 'Pending', timestamp: now, note: 'Order placed successfully' }],
    };

    if (isFirebaseConnected && db) {
      // Save order in Firestore & deduct inventory
      const orderRef = db.collection('orders').doc(orderId);
      await orderRef.set(orderData);

      // Stock deduction in background
      for (const item of items) {
        if (item.itemId) {
          const itemRef = db.collection('inventory').doc(item.itemId);
          db.runTransaction(async (t) => {
            const snap = await t.get(itemRef);
            if (snap.exists) {
              const currentStock = snap.data().stock || 0;
              t.update(itemRef, { stock: Math.max(0, currentStock - item.quantity) });
            }
          }).catch((err) => console.warn(`Stock deduction warning for ${item.itemId}:`, err.message));
        }
      }

      return res.status(201).json({ id: orderId, ...orderData });
    }

    const newOrder = { id: orderId, ...orderData };
    memoryOrders.unshift(newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/orders/:id/status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'BadRequest', message: 'New status is required.' });
    }

    const now = new Date().toISOString();
    const event = {
      status,
      timestamp: now,
      note: note || `Status updated to ${status} by ${req.user?.displayName || 'Store Staff'}`,
    };

    if (isFirebaseConnected && db) {
      const orderRef = db.collection('orders').doc(id);
      const snap = await orderRef.get();
      if (!snap.exists) {
        return res.status(404).json({ error: 'NotFound', message: `Order #${id} not found.` });
      }

      const existingTimeline = snap.data().timeline || [];
      await orderRef.update({
        status,
        timeline: [...existingTimeline, event],
        updatedAt: now,
      });

      const updated = await orderRef.get();
      return res.json({ id: updated.id, ...updated.data() });
    }

    const order = memoryOrders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'NotFound', message: `Order #${id} not found.` });
    }

    order.status = status;
    order.timeline = [...(order.timeline || []), event];
    res.json(order);
  } catch (error) {
    next(error);
  }
}
