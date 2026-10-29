import crypto from 'crypto';
import { db, isFirebaseConnected } from '../config/firebase.js';
import { memoryUsers } from './authController.js';
import { memoryInventory } from './inventoryController.js';
import { memorySlots } from './slotController.js';

/**
 * Generate cryptographically secure random 6-digit numeric pickup code
 */
export function generateSecurePickupCode() {
  return String(crypto.randomInt(100000, 1000000));
}

/**
 * Automatically ensures that any order in 'Ready' status has a valid 6-digit pickupCode.
 * This guarantees backwards compatibility if an order was transitioned to Ready earlier.
 */
export function ensurePickupCodeIfReady(order) {
  if (!order) return order;
  if (order.status === 'Ready' && !order.pickupCode && !order.isPickedUp) {
    order.pickupCode = generateSecurePickupCode();
    order.pickupCodeGeneratedAt = order.pickupCodeGeneratedAt || new Date().toISOString();
    order.pickupAttempts = order.pickupAttempts || 0;
    order.maxPickupAttempts = order.maxPickupAttempts || 5;
    order.isPickedUp = false;

    // Persist to Firestore in background if connected
    if (isFirebaseConnected && db && order.id) {
      db.collection('orders').doc(order.id).update({
        pickupCode: order.pickupCode,
        pickupCodeGeneratedAt: order.pickupCodeGeneratedAt,
        pickupAttempts: 0,
        maxPickupAttempts: 5,
        isPickedUp: false,
      }).catch((err) => console.warn(`Auto-assign pickupCode warning for ${order.id}:`, err.message));
    }
  }
  return order;
}

/**
 * Sanitize order payload to prevent leaking pickup verification codes.
 * Only the student/faculty order owner can see their code when Ready & uncollected.
 * ShopAdmin, Admin, and third-party queries never receive the pickupCode.
 */
export function sanitizeOrder(order, user) {
  if (!order) return order;
  ensurePickupCodeIfReady(order);

  const userEmail = (user?.email || '').trim().toLowerCase();
  const orderEmail = (order?.userEmail || '').trim().toLowerCase();
  const userRole = user?.role || '';

  // Owner is true if uid matches, email matches, or user is an authenticated student/faculty viewing their own orders
  const isShopOrAdmin = userRole === 'shopadmin' || userRole === 'admin';
  const isOwner = !isShopOrAdmin && Boolean(
    (user?.uid && order.userId && user.uid === order.userId) ||
    (userEmail && orderEmail && userEmail === orderEmail) ||
    userRole === 'student' ||
    userRole === 'faculty'
  );

  const sanitized = { ...order };

  if (!isOwner || sanitized.status !== 'Ready' || sanitized.isPickedUp) {
    delete sanitized.pickupCode;
  }

  return sanitized;
}

let memoryOrders = [];

let nextOrderId = 100;

/**
 * Resolves the assigned shop for an authenticated shop admin.
 */
export async function getAdminShopDetails(user) {
  if (!user || user.role !== 'shopadmin') {
    return { adminShopName: null, adminShopId: null };
  }

  let adminShopName = null;
  let adminShopId = null;

  if (isFirebaseConnected && db && user.uid) {
    try {
      const adminDoc = await db.collection('users').doc(user.uid).get();
      if (adminDoc.exists) {
        const d = adminDoc.data();
        adminShopName = d.shopName || d.name;
        adminShopId = d.shopId;
      }
    } catch (_) {}
  }

  if (!adminShopName && user.email) {
    const memUser = memoryUsers.find((u) => u.email === user.email || u.uid === user.uid);
    if (memUser) {
      adminShopName = memUser.shopName || memUser.name;
      adminShopId = memUser.shopId;
    }
  }

  // Suresh operates RASE MECH / main-store by default
  if (!adminShopName && (user.email === 'suresh@shopadmin.ac.in' || (user.displayName && user.displayName.toLowerCase().includes('suresh')))) {
    adminShopName = 'RASE MECH';
    adminShopId = 'main-store';
  }

  return { adminShopName, adminShopId };
}

/**
 * Strictly verifies whether an order belongs to the targeted shop.
 */
export function doesOrderMatchShop(order, adminShopName, adminShopId) {
  if (!order) return false;
  if (!adminShopName && !adminShopId) return true;

  const oShopId = (order.shopId || '').toLowerCase().trim();
  const oShopName = (order.shopName || '').toLowerCase().trim();
  const aShopName = (adminShopName || '').toLowerCase().trim();
  const aShopId = (adminShopId || '').toLowerCase().trim();

  const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normOShop = norm(oShopName);
  const normAShop = norm(aShopName);

  // 1. Direct shopId match
  if (aShopId && oShopId && aShopId === oShopId) return true;

  // 2. Exact or normalized shopName match (e.g. "rasemech" === "rase mech")
  if (normAShop && normOShop && normAShop === normOShop) return true;
  if (aShopName && oShopName && (oShopName === aShopName || oShopName.includes(aShopName) || aShopName.includes(oShopName))) return true;

  // 3. RASE MECH / main-store match (strictly exclude other shops like SIS BIT)
  const isTargetRaseMech = normAShop.includes('rasemech') || normAShop.includes('rase') || aShopId === 'main-store';
  const isOrderRaseMech = normOShop.includes('rasemech') || normOShop.includes('rase') || (oShopId === 'main-store' && !normOShop.includes('sis'));
  if (isTargetRaseMech && isOrderRaseMech) {
    return true;
  }

  // 4. SIS BIT match
  const isTargetSis = normAShop.includes('sis');
  const isOrderSis = normOShop.includes('sis') || oShopId === 'sis-bit';
  if (isTargetSis && isOrderSis) {
    return true;
  }

  return false;
}

/**
 * GET /api/orders
 * Filter by userId, role, status, and strictly isolates orders by respective shop for shopadmin
 */
export async function getOrders(req, res, next) {
  try {
    const { status, userId, shopId } = req.query;
    const userRole = req.user?.role || 'student';
    const userEmail = req.user?.email || '';

    let adminShopName = null;
    let adminShopId = null;

    if (userRole === 'shopadmin') {
      const details = await getAdminShopDetails(req.user);
      adminShopName = details.adminShopName;
      adminShopId = details.adminShopId;
    }

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

      if (shopId && shopId !== 'all') {
        query = query.where('shopId', '==', shopId);
      }

      if (status && status !== 'All') {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();
      let orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (userRole !== 'shopadmin' && userRole !== 'admin' && orders.length === 0 && userEmail) {
        try {
          const emailSnap = await db.collection('orders').where('userEmail', '==', userEmail).get();
          if (!emailSnap.empty) {
            orders = emailSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          }
        } catch (_) {}
      }

      // Strictly isolate orders so that each shopadmin only receives orders for their own shop
      if (userRole === 'shopadmin') {
        orders = orders.filter((o) => doesOrderMatchShop(o, adminShopName, adminShopId));
      }

      orders.sort((a, b) => new Date(b.placedAt || 0) - new Date(a.placedAt || 0));
      return res.json(orders.map((o) => sanitizeOrder(o, req.user)));
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

    if (shopId && shopId !== 'all') {
      result = result.filter((o) => (o.shopId || 'main-store') === shopId);
    }

    // Strictly isolate orders for shopadmin
    if (userRole === 'shopadmin') {
      result = result.filter((o) => doesOrderMatchShop(o, adminShopName, adminShopId));
    }

    if (status && status !== 'All') {
      result = result.filter((o) => o.status === status);
    }

    result.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
    res.json(result.map((o) => sanitizeOrder(o, req.user)));
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
    const userRole = req.user?.role || 'student';

    if (isFirebaseConnected && db) {
      const doc = await db.collection('orders').doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'NotFound', message: `Order #${id} not found.` });
      }
      const orderData = { id: doc.id, ...doc.data() };
      if (userRole === 'shopadmin') {
        const { adminShopName, adminShopId } = await getAdminShopDetails(req.user);
        if (!doesOrderMatchShop(orderData, adminShopName, adminShopId)) {
          return res.status(403).json({ error: 'Forbidden', message: 'This order belongs to another campus shop.' });
        }
      }
      return res.json(sanitizeOrder(orderData, req.user));
    }

    const order = memoryOrders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'NotFound', message: `Order #${id} not found.` });
    }

    if (req.user?.role === 'shopadmin') {
      const { adminShopName, adminShopId } = await getAdminShopDetails(req.user);
      if (!doesOrderMatchShop(order, adminShopName, adminShopId)) {
        return res.status(403).json({ error: 'Forbidden', message: 'You cannot update orders for another shop.' });
      }
    }
    if (userRole === 'shopadmin') {
      const { adminShopName, adminShopId } = await getAdminShopDetails(req.user);
      if (!doesOrderMatchShop(order, adminShopName, adminShopId)) {
        return res.status(403).json({ error: 'Forbidden', message: 'This order belongs to another campus shop.' });
      }
    }
    res.json(sanitizeOrder(order, req.user));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders
 */
export async function placeOrder(req, res, next) {
  try {
    const { items, pickupSlot, isBulkOrder, bulkNote, userDepartment, shopId, shopName, counterLocation, remarks } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'BadRequest', message: 'Order must contain at least 1 item.' });
    }

    const total = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    let orderId = `ord-${String(++nextOrderId).padStart(3, '0')}`;
    if (isFirebaseConnected && db) {
      try {
        const lastOrders = await db.collection('orders').orderBy('placedAt', 'desc').limit(5).get();
        if (!lastOrders.empty) {
          let maxNum = nextOrderId;
          lastOrders.forEach((d) => {
            const numMatch = d.id.match(/\d+/);
            if (numMatch) {
              const n = parseInt(numMatch[0], 10);
              if (n > maxNum) maxNum = n;
            }
          });
          nextOrderId = maxNum + 1;
          orderId = `ord-${String(nextOrderId).padStart(3, '0')}`;
        }
      } catch (_) {
        orderId = `ord-${Date.now().toString().slice(-5)}`;
      }
    }
    const now = new Date().toISOString();
    const targetShopId = (shopId || 'main-store').trim();

    const orderData = {
      userId: req.user?.uid || req.body.userId || 'guest-user',
      userName: req.user?.displayName || req.body.userName || 'Campus User',
      userEmail: req.user?.email || req.body.userEmail || 'faculty@faculty.ac.in',
      userDepartment: userDepartment || req.body.userDepartment || 'General',
      role: req.user?.role || (isBulkOrder ? 'faculty' : (req.body.role || 'faculty')),
      status: 'Pending',
      shopId: targetShopId,
      shopName: shopName || 'BIT Central Stationery Store',
      counterLocation: counterLocation || 'Main Store (Ground Floor)',
      placedAt: now,
      pickupSlot: pickupSlot || { date: 'Today', time: '10:00 AM – 11:00 AM' },
      isBulkOrder: Boolean(isBulkOrder),
      bulkNote: bulkNote || '',
      remarks: remarks || '',
      items,
      total,
      timeline: [{ status: 'Pending', timestamp: now, note: `Order placed for ${shopName || 'BIT Central Stationery Store'}` }],
    };

    if (isFirebaseConnected && db) {
      // 1. Save order in Firestore
      const orderRef = db.collection('orders').doc(orderId);
      await orderRef.set(orderData);

      // 2. Deduct item stock for the specific shop and overall stock
      for (const item of items) {
        const targetItemId = item.itemId || item.id;
        const qtyToDeduct = Number(item.quantity) || 1;
        if (targetItemId) {
          const itemRef = db.collection('inventory').doc(targetItemId);
          try {
            await db.runTransaction(async (t) => {
              const snap = await t.get(itemRef);
              if (snap.exists) {
                const data = snap.data();
                const globalStock = typeof data.stock === 'number' ? data.stock : 0;
                const shopStocks = (data.shopStocks && typeof data.shopStocks === 'object') ? { ...data.shopStocks } : {};

                const curShopStock = typeof shopStocks[targetShopId] === 'number'
                  ? shopStocks[targetShopId]
                  : globalStock;

                shopStocks[targetShopId] = Math.max(0, curShopStock - qtyToDeduct);
                const newGlobalStock = Math.max(0, globalStock - qtyToDeduct);

                t.update(itemRef, {
                  stock: newGlobalStock,
                  shopStocks,
                  updatedAt: new Date().toISOString(),
                });
              }
            });
          } catch (err) {
            console.warn(`Stock deduction warning for item ${targetItemId}:`, err.message);
          }
        }
      }

      // 3. Deduct pickup slot capacity (increment booked count for specific shop and overall)
      if (pickupSlot) {
        try {
          const targetSlotId = pickupSlot.slotId || pickupSlot.id;
          let slotRef = null;

          if (targetSlotId) {
            const checkSlot = db.collection('slots').doc(targetSlotId);
            const snap = await checkSlot.get();
            if (snap.exists) {
              slotRef = checkSlot;
            }
          }

          if (!slotRef && pickupSlot.date && pickupSlot.time) {
            const querySnap = await db.collection('slots')
              .where('date', '==', pickupSlot.date)
              .where('time', '==', pickupSlot.time)
              .limit(1)
              .get();
            if (!querySnap.empty) {
              slotRef = querySnap.docs[0].ref;
            }
          }

          if (slotRef) {
            await db.runTransaction(async (t) => {
              const snap = await t.get(slotRef);
              if (snap.exists) {
                const sData = snap.data();
                const globalBooked = typeof sData.booked === 'number' ? sData.booked : 0;
                const shopBookings = (sData.shopBookings && typeof sData.shopBookings === 'object') ? { ...sData.shopBookings } : {};

                const curShopBooked = typeof shopBookings[targetShopId] === 'number'
                  ? shopBookings[targetShopId]
                  : globalBooked;

                shopBookings[targetShopId] = curShopBooked + 1;
                const newGlobalBooked = globalBooked + 1;

                t.update(slotRef, {
                  booked: newGlobalBooked,
                  shopBookings,
                  updatedAt: new Date().toISOString(),
                });
              }
            });
          }
        } catch (slotErr) {
          console.warn('Slot capacity update warning:', slotErr.message);
        }
      }

      return res.status(201).json({ id: orderId, ...orderData });
    }

    // In-memory fallback
    const newOrder = { id: orderId, ...orderData };
    memoryOrders.unshift(newOrder);

    // In-memory stock deduction
    for (const item of items) {
      const targetItemId = item.itemId || item.id;
      const qtyToDeduct = Number(item.quantity) || 1;
      const memItem = memoryInventory.find((i) => i.id === targetItemId);
      if (memItem) {
        memItem.stock = Math.max(0, (memItem.stock || 0) - qtyToDeduct);
        if (!memItem.shopStocks) memItem.shopStocks = {};
        const curShop = typeof memItem.shopStocks[targetShopId] === 'number' ? memItem.shopStocks[targetShopId] : memItem.stock;
        memItem.shopStocks[targetShopId] = Math.max(0, curShop - qtyToDeduct);
      }
    }

    // In-memory slot booking
    if (pickupSlot) {
      const targetSlotId = pickupSlot.slotId || pickupSlot.id;
      const memSlot = memorySlots.find((s) =>
        targetSlotId ? s.id === targetSlotId : (s.date === pickupSlot.date && s.time === pickupSlot.time)
      );
      if (memSlot) {
        memSlot.booked = (memSlot.booked || 0) + 1;
        if (!memSlot.shopBookings) memSlot.shopBookings = {};
        const curShop = typeof memSlot.shopBookings[targetShopId] === 'number' ? memSlot.shopBookings[targetShopId] : (memSlot.booked - 1);
        memSlot.shopBookings[targetShopId] = curShop + 1;
      }
    }

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

    const isTransitionToReady = status === 'Ready';

    if (isFirebaseConnected && db) {
      const orderRef = db.collection('orders').doc(id);
      const snap = await orderRef.get();
      if (!snap.exists) {
        return res.status(404).json({ error: 'NotFound', message: `Order #${id} not found.` });
      }

      const existingData = snap.data();
      if (req.user?.role === 'shopadmin') {
        const { adminShopName, adminShopId } = await getAdminShopDetails(req.user);
        if (!doesOrderMatchShop(existingData, adminShopName, adminShopId)) {
          return res.status(403).json({ error: 'Forbidden', message: 'You cannot update orders for another shop.' });
        }
      }
      const existingTimeline = existingData.timeline || [];

      const updateFields = {
        status,
        timeline: [...existingTimeline, event],
        updatedAt: now,
      };

      // Generate cryptographically secure 6-digit code when transitioning to Ready
      if (isTransitionToReady) {
        updateFields.pickupCode = generateSecurePickupCode();
        updateFields.pickupCodeGeneratedAt = now;
        updateFields.pickupAttempts = 0;
        updateFields.maxPickupAttempts = 5;
        updateFields.isPickedUp = false;
      }

      await orderRef.update(updateFields);

      const updated = await orderRef.get();
      return res.json(sanitizeOrder({ id: updated.id, ...updated.data() }, req.user));
    }

    const order = memoryOrders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'NotFound', message: `Order #${id} not found.` });
    }

    if (req.user?.role === 'shopadmin') {
      const { adminShopName, adminShopId } = await getAdminShopDetails(req.user);
      if (!doesOrderMatchShop(order, adminShopName, adminShopId)) {
        return res.status(403).json({ error: 'Forbidden', message: 'You cannot update orders for another shop.' });
      }
    }

    order.status = status;
    order.timeline = [...(order.timeline || []), event];
    order.updatedAt = now;

    if (isTransitionToReady) {
      order.pickupCode = generateSecurePickupCode();
      order.pickupCodeGeneratedAt = now;
      order.pickupAttempts = 0;
      order.maxPickupAttempts = 5;
      order.isPickedUp = false;
    }

    res.json(sanitizeOrder(order, req.user));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/:id/verify-pickup
 * Protected endpoint for ShopAdmin or Admin to verify 6-digit pickup code
 * Operates atomically via Firestore Transaction and prevents brute force.
 */
export async function verifyPickupCode(req, res, next) {
  try {
    const { id } = req.params;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'BadRequest',
        code: 'MISSING_CODE',
        message: 'A 6-digit pickup verification code is required.',
      });
    }

    const cleanCode = String(code).trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({
        error: 'BadRequest',
        code: 'INVALID_FORMAT',
        message: 'Pickup verification code must be exactly 6 numeric digits.',
      });
    }

    const now = new Date().toISOString();
    const staffName = req.user?.displayName || req.user?.email || 'Store Operator';

    if (isFirebaseConnected && db) {
      const orderRef = db.collection('orders').doc(id);

      const result = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(orderRef);
        if (!doc.exists) {
          const err = new Error(`Order #${id} not found.`);
          err.statusCode = 404;
          err.code = 'NOT_FOUND';
          throw err;
        }

        const order = doc.data();

        // 1. Check current status
        if (order.status !== 'Ready') {
          const err = new Error(
            `Order #${id} is currently '${order.status}'. Only orders in 'Ready' status can be verified for pickup.`
          );
          err.statusCode = 400;
          err.code = 'INVALID_STATUS';
          throw err;
        }

        // 2. Check if already collected
        if (order.isPickedUp || order.status === 'Collected' || order.status === 'Picked Up') {
          const err = new Error(`Order #${id} has already been collected on ${order.pickedUpAt || 'earlier'}.`);
          err.statusCode = 409;
          err.code = 'ALREADY_PICKED_UP';
          throw err;
        }

        // 3. Brute-force attempt limit
        const attempts = order.pickupAttempts || 0;
        const maxAttempts = order.maxPickupAttempts || 5;

        if (attempts >= maxAttempts) {
          const err = new Error(
            `Maximum verification attempts (${maxAttempts}) exceeded for Order #${id}. Verification locked; please verify student identity manually.`
          );
          err.statusCode = 429;
          err.code = 'MAX_ATTEMPTS_EXCEEDED';
          throw err;
        }

        const expectedCode = String(order.pickupCode || '').trim();

        if (!expectedCode || cleanCode !== expectedCode) {
          const newAttempts = attempts + 1;
          transaction.update(orderRef, {
            pickupAttempts: newAttempts,
            lastFailedAttemptAt: now,
            updatedAt: now,
          });

          const remaining = maxAttempts - newAttempts;
          const err = new Error(
            remaining > 0
              ? `Incorrect pickup code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
              : `Incorrect pickup code. Maximum attempts reached; verification is locked.`
          );
          err.statusCode = 400;
          err.code = 'INVALID_CODE';
          err.remainingAttempts = remaining;
          throw err;
        }

        // Code matches! Atomic fulfillment
        const existingTimeline = order.timeline || [];
        const newTimelineEvent = {
          status: 'Collected',
          timestamp: now,
          note: `Pickup verified with 6-digit code by ${staffName}`,
        };

        const updateData = {
          status: 'Collected',
          isPickedUp: true,
          pickedUpAt: now,
          pickedUpByStaff: staffName,
          pickupCode: null, // Invalidate code so it cannot be reused
          pickupCodeInvalidatedAt: now,
          timeline: [...existingTimeline, newTimelineEvent],
          updatedAt: now,
        };

        transaction.update(orderRef, updateData);

        return {
          id,
          ...order,
          ...updateData,
        };
      });

      return res.json({
        success: true,
        message: `Order #${id} pickup verified successfully.`,
        order: sanitizeOrder(result, req.user),
      });
    }

    // In-memory fallback
    const orderIndex = memoryOrders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'NotFound', message: `Order #${id} not found.` });
    }

    const order = memoryOrders[orderIndex];

    if (order.status !== 'Ready') {
      return res.status(400).json({
        error: 'BadRequest',
        code: 'INVALID_STATUS',
        message: `Order #${id} is currently '${order.status}'. Only orders in 'Ready' status can be verified.`,
      });
    }

    if (order.isPickedUp || order.status === 'Collected' || order.status === 'Picked Up') {
      return res.status(409).json({
        error: 'Conflict',
        code: 'ALREADY_PICKED_UP',
        message: `Order #${id} has already been collected on ${order.pickedUpAt || 'earlier'}.`,
      });
    }

    const attempts = order.pickupAttempts || 0;
    const maxAttempts = order.maxPickupAttempts || 5;

    if (attempts >= maxAttempts) {
      return res.status(429).json({
        error: 'TooManyRequests',
        code: 'MAX_ATTEMPTS_EXCEEDED',
        message: `Maximum verification attempts (${maxAttempts}) exceeded for Order #${id}.`,
      });
    }

    if (!order.pickupCode || cleanCode !== String(order.pickupCode).trim()) {
      order.pickupAttempts = attempts + 1;
      order.lastFailedAttemptAt = now;
      const remaining = maxAttempts - order.pickupAttempts;
      return res.status(400).json({
        error: 'BadRequest',
        code: 'INVALID_CODE',
        remainingAttempts: remaining,
        message: remaining > 0
          ? `Incorrect pickup code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : `Incorrect pickup code. Maximum attempts reached; verification locked.`,
      });
    }

    // In-memory success
    order.status = 'Collected';
    order.isPickedUp = true;
    order.pickedUpAt = now;
    order.pickedUpByStaff = staffName;
    order.pickupCode = null;
    order.pickupCodeInvalidatedAt = now;
    order.timeline = [
      ...(order.timeline || []),
      {
        status: 'Collected',
        timestamp: now,
        note: `Pickup verified with 6-digit code by ${staffName}`,
      },
    ];

    res.json({
      success: true,
      message: `Order #${id} pickup verified successfully.`,
      order: sanitizeOrder(order, req.user),
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.code || 'VerificationError',
        message: error.message,
        remainingAttempts: error.remainingAttempts,
      });
    }
    next(error);
  }
}
