import { db, isFirebaseConnected } from '../config/firebase.js';
import { memoryUsers } from './authController.js';

// Default in-memory stationery catalog fallback
export let memoryInventory = [];

/**
 * Resolve dedicated campus shop info for an authenticated shopadmin
 */
export async function resolveAdminShop(user) {
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
 * GET /api/inventory
 * Query params: category, search, shopId
 */
export async function getInventory(req, res, next) {
  try {
    const { category, search, shopId } = req.query;

    if (isFirebaseConnected && db) {
      let query = db.collection('inventory');
      if (category) {
        query = query.where('category', '==', category);
      }
      const snapshot = await query.get();
      let items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (shopId) {
        const cleanShopId = String(shopId).toLowerCase().trim();
        items = items.filter((i) => {
          if (!i.shopId && !i.shopName) return true;
          const iShopId = (i.shopId || '').toLowerCase().trim();
          return iShopId === cleanShopId || iShopId.includes(cleanShopId) || cleanShopId.includes(iShopId);
        });
      }

      if (search) {
        const q = search.toLowerCase();
        items = items.filter(
          (i) =>
            i.name?.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q) ||
            i.sku?.toLowerCase().includes(q)
        );
      }
      return res.json(items);
    }

    // In-memory fallback
    let result = [...memoryInventory];
    if (category) result = result.filter((i) => i.category === category);
    if (shopId) {
      const cleanShopId = String(shopId).toLowerCase().trim();
      result = result.filter((i) => {
        if (!i.shopId && !i.shopName) return true;
        const iShopId = (i.shopId || '').toLowerCase().trim();
        return iShopId === cleanShopId || iShopId.includes(cleanShopId) || cleanShopId.includes(iShopId);
      });
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.sku?.toLowerCase().includes(q)
      );
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory/:id
 */
export async function getItemById(req, res, next) {
  try {
    const { id } = req.params;

    if (isFirebaseConnected && db) {
      const doc = await db.collection('inventory').doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'NotFound', message: `Item #${id} not found.` });
      }
      return res.json({ id: doc.id, ...doc.data() });
    }

    const item = memoryInventory.find((i) => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'NotFound', message: `Item #${id} not found.` });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/inventory
 * Requires shopadmin or admin role
 */
export async function addItem(req, res, next) {
  try {
    const {
      name,
      category,
      price,
      stock,
      lowStockThreshold,
      sku,
      description,
      image,
      shopId,
      shopName,
      shopStocks,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'BadRequest', message: 'Item name and price are required.' });
    }

    let targetShopId = shopId ? String(shopId).trim() : null;
    let targetShopName = shopName ? String(shopName).trim() : null;

    // If shop details are omitted from body, auto-bind to the authenticated operator's designated shop
    if ((!targetShopId || !targetShopName) && req.user?.role === 'shopadmin') {
      const details = await resolveAdminShop(req.user);
      targetShopId = targetShopId || details.adminShopId;
      targetShopName = targetShopName || details.adminShopName;
    }

    const numStock = Number(stock) || 0;
    const targetShopStocks =
      shopStocks && typeof shopStocks === 'object'
        ? { ...shopStocks }
        : targetShopId
        ? { [targetShopId]: numStock }
        : {};

    if (targetShopId && typeof targetShopStocks[targetShopId] !== 'number') {
      targetShopStocks[targetShopId] = numStock;
    }

    const itemData = {
      name,
      category: category || 'General Stationery',
      price: Number(price),
      stock: numStock,
      lowStockThreshold: Number(lowStockThreshold) || 10,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      shopId: targetShopId || null,
      shopName: targetShopName || null,
      shopStocks: targetShopStocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConnected && db) {
      const docRef = await db.collection('inventory').add(itemData);
      return res.status(201).json({ id: docRef.id, ...itemData });
    }

    const newItem = { id: `i${Date.now()}`, ...itemData };
    memoryInventory.push(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/inventory/:id
 */
export async function updateItem(req, res, next) {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    delete updates.id;

    if (isFirebaseConnected && db) {
      const docRef = db.collection('inventory').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'NotFound', message: `Item #${id} not found.` });
      }
      await docRef.update(updates);
      const updated = await docRef.get();
      return res.json({ id: updated.id, ...updated.data() });
    }

    const index = memoryInventory.findIndex((i) => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'NotFound', message: `Item #${id} not found.` });
    }
    memoryInventory[index] = { ...memoryInventory[index], ...updates };
    res.json(memoryInventory[index]);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/inventory/:id
 */
export async function deleteItem(req, res, next) {
  try {
    const { id } = req.params;

    if (isFirebaseConnected && db) {
      const docRef = db.collection('inventory').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'NotFound', message: `Item #${id} not found.` });
      }
      await docRef.delete();
      return res.json({ success: true, message: `Item #${id} deleted.` });
    }

    memoryInventory = memoryInventory.filter((i) => i.id !== id);
    res.json({ success: true, message: `Item #${id} deleted.` });
  } catch (error) {
    next(error);
  }
}
