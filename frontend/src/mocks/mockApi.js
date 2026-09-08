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

export async function mockGetOrders({ userId, role, status } = {}) {
  await delay();
  let result = [...orders];
  if (userId && role !== 'shopadmin' && role !== 'admin') {
    result = result.filter((o) => o.userId === userId);
  }
  if (status) result = result.filter((o) => o.status === status);
  return result.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
}

export async function mockGetOrderById(id) {
  await delay(300);
  return orders.find((o) => o.id === id) || null;
}

export async function mockPlaceOrder(data) {
  await delay(1000);
  const newOrder = {
    ...data,
    id: `ord-${String(++nextOrderId).padStart(3, '0')}`,
    status: 'Pending',
    placedAt: new Date().toISOString(),
    timeline: [{ status: 'Pending', timestamp: new Date().toISOString(), note: 'Order placed successfully' }],
  };
  orders.unshift(newOrder);
  // Deduct stock
  if (data.items) {
    data.items.forEach(({ itemId, quantity }) => {
      items = items.map((i) => i.id === itemId ? { ...i, stock: Math.max(0, i.stock - quantity) } : i);
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

// ---------- Audit Log ----------
export async function mockGetAuditLog() {
  await delay(500);
  return [...mockAuditLog];
}
