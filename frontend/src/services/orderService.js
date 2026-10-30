import api from './api';
import { mockGetOrders, mockGetOrderById, mockPlaceOrder, mockUpdateOrderStatus } from '@/mocks/mockApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function getOrders(params = {}) {
  if (USE_MOCK) return mockGetOrders(params);
  const res = await api.get('/orders', { params });
  return res.data;
}

export async function getOrderById(id) {
  if (USE_MOCK) return mockGetOrderById(id);
  const res = await api.get(`/orders/${id}`);
  return res.data;
}

export async function placeOrder(orderData) {
  if (USE_MOCK) return mockPlaceOrder(orderData);
  const res = await api.post('/orders', orderData);
  return res.data;
}

export async function cancelOrder(id, reason = '') {
  if (USE_MOCK) return mockUpdateOrderStatus(id, 'Cancelled');
  const res = await api.patch(`/orders/${id}/cancel`, { reason });
  return res.data;
}

export async function updateOrderStatus(id, status) {
  if (USE_MOCK) return mockUpdateOrderStatus(id, status);
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data;
}

export async function verifyPickupCode(id, code) {
  if (USE_MOCK) {
    return { success: true, message: 'Pickup verified (Mock Mode)' };
  }
  const res = await api.post(`/orders/${id}/verify-pickup`, { code: String(code).trim() });
  return res.data;
}
