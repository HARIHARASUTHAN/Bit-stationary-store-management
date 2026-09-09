import api from './api';
import { mockGetSlots } from '@/mocks/mockApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function getSlots() {
  if (USE_MOCK) return mockGetSlots();
  const res = await api.get('/slots');
  return res.data;
}

export async function addSlot(slotData) {
  if (USE_MOCK) return { id: `s${Date.now()}`, ...slotData };
  const res = await api.post('/slots', slotData);
  return res.data;
}

export async function updateSlot(id, slotData) {
  if (USE_MOCK) return { id, ...slotData };
  const res = await api.put(`/slots/${id}`, slotData);
  return res.data;
}
