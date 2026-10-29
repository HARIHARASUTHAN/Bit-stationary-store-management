import mockItems from './items';
import mockOrders from './orders';
import mockSlots from './slots';
import mockAuditLog from './auditLog';

// Simulate network delay
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

let items = [...mockItems];
let orders = [...mockOrders];
let slots = [...mockSlots];
let nextItemId = 100;
let nextOrderId = 100;

// ---------- Item/Inventory Mock API ----------

export async function mockGetItems({ category, search } = {}) {
  await delay();
  let result = [...items];
  if (category) result = result.filter((i) => i.category === category);
  if (search) result = result.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  return result;
}

export async function mockAddItem(data) {
  await delay();
  const newItem = { ...data, id: `i${++nextItemId}`, stock: data.stock || 0 };
  items.push(newItem);
  return newItem;
}

export async function mockUpdateItem(id, data) {
  await delay();
  items = items.map((i) => (i.id === id ? { ...i, ...data } : i));
  return items.find((i) => i.id === id);
}

export async function mockDeleteItem(id) {
  await delay();
  items = items.filter((i) => i.id !== id);
}

// ---------- Order Mock API ----------

export async function mockGetOrders({ userId, role, status, shopId, email } = {}) {
  await delay();
  let result = [...orders];
  if (userId && role !== 'shopadmin' && role !== 'admin') {
    result = result.filter((o) => o.userId === userId || (email && o.userEmail === email));
  }
  if (shopId && shopId !== 'all') {
    result = result.filter((o) => (o.shopId || 'main-store') === shopId);
  }
  if (status && status !== 'All') {
    result = result.filter((o) => o.status === status);
  }
  return result.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
}

export async function mockGetOrderById(id) {
  await delay(300);
  return orders.find((o) => o.id === id) || null;
}

export async function mockPlaceOrder(data) {
  await delay(600);
  const targetShopId = (data.shopId || 'main-store').trim();
  const newOrder = {
    ...data,
    id: `ord-${String(++nextOrderId).padStart(3, '0')}`,
    status: 'Pending',
    shopId: targetShopId,
    shopName: data.shopName || 'BIT Central Stationery Store',
    counterLocation: data.counterLocation || 'Main Store',
    placedAt: new Date().toISOString(),
    timeline: [
      {
        status: 'Pending',
        timestamp: new Date().toISOString(),
        note: `Order placed for ${data.shopName || 'BIT Central Stationery Store'}`,
      },
    ],
  };
  orders.unshift(newOrder);

  // Deduct stock per shop and globally
  if (data.items) {
    data.items.forEach(({ itemId, id, quantity }) => {
      const targetId = itemId || id;
      const qty = Number(quantity) || 1;
      items = items.map((i) => {
        if (i.id === targetId) {
          const shopStocks = { ...(i.shopStocks || {}) };
          const curShop = typeof shopStocks[targetShopId] === 'number' ? shopStocks[targetShopId] : i.stock;
          shopStocks[targetShopId] = Math.max(0, curShop - qty);
          return {
            ...i,
            stock: Math.max(0, i.stock - qty),
            shopStocks,
          };
        }
        return i;
      });
    });
  }

  // Deduct slot capacity per shop and globally
  if (data.pickupSlot) {
    const slotId = data.pickupSlot.slotId || data.pickupSlot.id;
    slots = slots.map((s) => {
      const match = slotId
        ? s.id === slotId
        : (s.date === data.pickupSlot.date && s.time === data.pickupSlot.time);
      if (match) {
        const shopBookings = { ...(s.shopBookings || {}) };
        const curShop = typeof shopBookings[targetShopId] === 'number' ? shopBookings[targetShopId] : (s.booked || 0);
        shopBookings[targetShopId] = curShop + 1;
        return {
          ...s,
          booked: (s.booked || 0) + 1,
          shopBookings,
        };
      }
      return s;
    });
  }

  return newOrder;
}

export async function mockUpdateOrderStatus(id, status) {
  await delay(500);
  orders = orders.map((o) =>
    o.id === id
      ? {
        ...o,
        status,
        timeline: [
          ...o.timeline,
          { status, timestamp: new Date().toISOString(), note: `Status updated to ${status}` },
        ],
      }
      : o
  );
  return orders.find((o) => o.id === id);
}

// ---------- Slots Mock API ----------
export async function mockGetSlots() {
  await delay(400);
  return [...slots];
}

export async function mockDeleteSlot(id) {
  await delay(300);
  slots = slots.filter((s) => s.id !== id);
  return { success: true };
}

// ---------- Audit Log ----------
export async function mockGetAuditLog() {
  await delay(500);
  return [...mockAuditLog];
}
