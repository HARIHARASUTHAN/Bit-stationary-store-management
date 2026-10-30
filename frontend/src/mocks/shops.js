export const campusShops = [
  {
    id: 'main-store',
    name: 'RASE MECH',
    tagline: 'Main Academic Block (Ground Floor)',
    badge: 'Central Depot',
    description: 'Complete stock of official BIT engineering record notebooks, drafting kits, calculators, and daily study essentials.',
    operatingHours: '8:30 AM – 6:00 PM',
    categories: ['Writing Instruments', 'Notebooks & Paper', 'Geometry & Drafting', 'Lab Supplies', 'Office Supplies'],
    color: 'bg-[#065f46]',
    textColor: 'text-white',
    accentColor: '#065f46',
    counter: 'Main Store',
  },
  {
    id: 'sis-bit',
    name: 'SIS BIT',
    tagline: 'Stationery Store Desk (Near Admin Block)',
    badge: 'Stationery Desk',
    description: 'Student stationery services, record sheets, paper bundles, and exam stationery supplies.',
    operatingHours: '9:00 AM – 5:00 PM',
    categories: ['Writing Instruments', 'Notebooks & Paper', 'Office Supplies', 'Files & Folders', 'Adhesives & Tapes', 'Geometry & Drafting', 'Lab Supplies'],
    color: 'bg-[#1e3a5f]',
    textColor: 'text-white',
    accentColor: '#1e3a5f',
    counter: 'SIS Desk',
  },
];

// Helper to get active shops created by admin in Shop Admin Account Governance
export function getActiveCampusShops(customShopsOrName) {
  let shops = [];
  if (Array.isArray(customShopsOrName) && customShopsOrName.length > 0) {
    shops = customShopsOrName;
  } else if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('bsp_live_campus_shops');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          shops = parsed;
        }
      }
    } catch (_) {}
  }

  if (shops.length === 0) {
    const customShopName = typeof customShopsOrName === 'string' ? customShopsOrName : null;
    shops = campusShops.map((shop) => {
      if (shop.id === 'main-store' && customShopName && customShopName.trim()) {
        return { ...shop, name: customShopName.trim() };
      }
      return shop;
    });
  }

  // Ensure unique IDs across all shops
  const seenIds = new Set();
  return shops.map((shop, idx) => {
    let id = shop.id || `shop-${idx + 1}`;
    if (seenIds.has(id)) {
      id = `${id}-${idx + 1}`;
    }
    seenIds.add(id);
    return { ...shop, id };
  });
}

/**
 * Check if a product is stocked and available at a given campus shop
 */
export function isItemAvailableAtShop(item, shopId, customShopName) {
  if (!item) return false;
  if (!shopId || shopId === 'all') return true;

  const shops = getActiveCampusShops(customShopName);
  const cleanQuery = String(shopId).toLowerCase().trim();
  const targetShop = shops.find(
    (s) =>
      s.id.toLowerCase() === cleanQuery ||
      s.name.toLowerCase() === cleanQuery ||
      s.name.toLowerCase().includes(cleanQuery) ||
      cleanQuery.includes(s.name.toLowerCase()) ||
      cleanQuery.includes(s.id.toLowerCase())
  );
  if (!targetShop) return true;

  const targetId = targetShop.id.toLowerCase().trim();
  const targetName = targetShop.name.toLowerCase().trim();

  const itemShopId = (item.shopId || '').toLowerCase().trim();
  const itemShopName = (item.shopName || '').toLowerCase().trim();

  // 1. If item has explicit shop assignment (by id or name)
  if (itemShopId || itemShopName) {
    const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normTargetId = norm(targetId);
    const normItemId = norm(itemShopId);
    const normTargetName = norm(targetName);
    const normItemName = norm(itemShopName);

    const idMatch = Boolean(normItemId && normTargetId && (normItemId === normTargetId));
    const nameMatch = Boolean(
      normItemName &&
        normTargetName &&
        (normItemName === normTargetName ||
          (normItemName.includes('rasemech') && normTargetName.includes('rasemech')) ||
          (normItemName.includes('sisbit') && normTargetName.includes('sisbit')))
    );

    if (idMatch || nameMatch) {
      return true;
    }
    return false;
  }

  // 2. If item has explicit shops list array
  if (Array.isArray(item.shops) && item.shops.length > 0) {
    const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normTargetId = norm(targetId);
    return item.shops.some((s) => norm(s) === normTargetId);
  }

  // All admin-created campus shops stock standard unassigned stationery inventory
  return true;
}

export function getShopForItem(item, customShopNameOrTargetShop) {
  const shops = getActiveCampusShops();
  if (!item) return shops[0];

  if (item.shopId) {
    const found = shops.find((s) => s.id === item.shopId || s.name.toLowerCase().includes(item.shopId.toLowerCase()));
    if (found) return found;
  }

  // If a preferred/selected shop is passed, assign to that shop
  if (customShopNameOrTargetShop) {
    const target = shops.find(
      (s) => s.id === customShopNameOrTargetShop || s.name.toLowerCase().includes(String(customShopNameOrTargetShop).toLowerCase())
    );
    if (target) {
      return target;
    }
  }

  return shops[0]; // Primary shop
}

/**
 * Determine the dedicated shop entity for a logged-in shop admin
 */
export function getShopForUser(user) {
  const shops = getActiveCampusShops();
  if (!user) return shops[0];

  const userEmail = (user.email || '').toLowerCase().trim();

  // 1. Suresh operates RASE MECH (strictly Main Store / Main Academic Block)
  if (userEmail === 'suresh@shopadmin.ac.in') {
    return {
      ...shops[0],
      name: user.shopName || 'RASE MECH',
      counter: 'Main Store',
    };
  }

  // 2. SIS operates SIS BIT (strictly SIS Desk)
  if (userEmail.includes('sis')) {
    const sisShop = shops.find((s) => s.id === 'sis-bit' || s.name.toLowerCase().includes('sis'));
    if (sisShop) return sisShop;
    return {
      id: 'sis-bit',
      name: user.shopName || 'SIS BIT',
      counter: user.department || 'SIS Desk',
      tagline: 'Stationery Store Desk',
      badge: 'Stationery Desk',
      operatingHours: '9:00 AM – 5:00 PM',
      color: 'bg-[#1e3a5f]',
      textColor: 'text-white',
      accentColor: '#1e3a5f',
    };
  }

  // 3. Direct match on user.shopId
  if (user.shopId) {
    const found = shops.find((s) => s.id === user.shopId);
    if (found) return found;
  }

  // 4. Match on user.shopName
  const userShopName = (user.shopName || '').trim();
  if (userShopName) {
    const lower = userShopName.toLowerCase();
    const found = shops.find(
      (s) => s.name.toLowerCase() === lower || s.name.toLowerCase().includes(lower) || lower.includes(s.name.toLowerCase())
    );
    if (found) return { ...found, name: userShopName };

    return {
      id: user.shopId || `shop-${userShopName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: userShopName,
      counter: user.department || 'Main Desk',
      tagline: user.department || 'Dedicated Campus Store',
      badge: 'Store Desk',
      operatingHours: '8:30 AM – 6:00 PM',
      color: 'bg-[#1e3a5f]',
      textColor: 'text-white',
      accentColor: '#1e3a5f',
    };
  }

  return shops[0];
}

/**
 * Strictly check if an order was placed for a specific shop
 */
export function doesOrderMatchShop(order, targetShop) {
  if (!order || !targetShop) return false;

  const targetId = (typeof targetShop === 'string' ? targetShop : targetShop.id || '').toLowerCase().trim();
  const targetName = (typeof targetShop === 'string' ? targetShop : targetShop.name || '').toLowerCase().trim();

  const oShopId = (order.shopId || '').toLowerCase().trim();
  const oShopName = (order.shopName || '').toLowerCase().trim();

  const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normTarget = norm(targetName);
  const normOrder = norm(oShopName);

  // 1. Direct shopId match
  if (targetId && oShopId && targetId === oShopId) return true;

  // 2. Exact or normalized shopName match
  if (normTarget && normOrder && normTarget === normOrder) return true;
  if (targetName && oShopName && (oShopName === targetName || oShopName.includes(targetName) || targetName.includes(oShopName))) return true;

  // 3. RASE MECH match (explicitly exclude sis bit orders)
  const isTargetRase = normTarget.includes('rasemech') || normTarget.includes('rase') || targetId === 'main-store';
  const isOrderRase = normOrder.includes('rasemech') || normOrder.includes('rase') || (oShopId === 'main-store' && !normOrder.includes('sis'));
  if (isTargetRase && isOrderRase) {
    return true;
  }

  // 4. SIS BIT match
  const isTargetSis = normTarget.includes('sis');
  const isOrderSis = normOrder.includes('sis') || oShopId === 'sis-bit';
  if (isTargetSis && isOrderSis) {
    return true;
  }

  return false;
}

export default campusShops;
