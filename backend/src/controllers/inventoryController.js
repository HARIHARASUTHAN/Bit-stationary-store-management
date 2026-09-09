import { db, isFirebaseConnected } from '../config/firebase.js';

// Default in-memory stationery catalog for instant local dev & fallback
let memoryInventory = [
  {
    id: 'i1',
    name: 'Classmate Spiral Notebook',
    category: 'Notebooks & Paper',
    price: 65,
    stock: 120,
    lowStockThreshold: 20,
    description: '200 pages, A4 size, single line ruled. Spiral bound for smooth page turning. Ideal for engineering lecture notes.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    sku: 'NB-001',
  },
  {
    id: 'i2',
    name: 'Reynolds Pen (Blue)',
    category: 'Writing Instruments',
    price: 12,
    stock: 350,
    lowStockThreshold: 50,
    description: 'Smooth-writing ballpoint pen, blue ink. Comfortable grip for exams and daily note-taking. Pack of 1.',
    image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&auto=format&fit=crop&q=80',
    sku: 'WI-001',
  },
  {
    id: 'i3',
    name: 'Reynolds Pen (Black)',
    category: 'Writing Instruments',
    price: 12,
    stock: 280,
    lowStockThreshold: 50,
    description: 'Smooth-writing ballpoint pen, black ink. Dark waterproof ink ideal for official records and diagrams.',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    sku: 'WI-002',
  },
  {
    id: 'i4',
    name: 'Apsara Pencil (HB)',
    category: 'Writing Instruments',
    price: 8,
    stock: 500,
    lowStockThreshold: 100,
    description: 'HB grade pencil for technical engineering drawing, drafting, and general campus note-taking.',
    image: 'https://images.unsplash.com/photo-1595584354232-f07d525d87c1?w=600&auto=format&fit=crop&q=80',
    sku: 'WI-003',
  },
];

/**
 * GET /api/inventory
 * Query params: category, search
 */
export async function getInventory(req, res, next) {
  try {
    const { category, search } = req.query;

    if (isFirebaseConnected && db) {
      let query = db.collection('inventory');
      if (category) {
        query = query.where('category', '==', category);
      }
      const snapshot = await query.get();
      let items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
    const { name, category, price, stock, lowStockThreshold, sku, description, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'BadRequest', message: 'Item name and price are required.' });
    }

    const itemData = {
      name,
      category: category || 'General Stationery',
      price: Number(price),
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 10,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
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
