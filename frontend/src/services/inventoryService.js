import api from './api';
import {
  mockGetItems,
  mockAddItem,
  mockUpdateItem,
  mockDeleteItem,
} from '@/mocks/mockApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function getItems(params = {}) {
  if (USE_MOCK) return mockGetItems(params);
  const res = await api.get('/inventory', { params });
  return res.data;
}

export async function addItem(itemData) {
  if (USE_MOCK) return mockAddItem(itemData);
  const res = await api.post('/inventory', itemData);
  return res.data;
}

export async function updateItem(id, itemData) {
  if (USE_MOCK) return mockUpdateItem(id, itemData);
  const res = await api.put(`/inventory/${id}`, itemData);
  return res.data;
}

export async function deleteItem(id) {
  if (USE_MOCK) return mockDeleteItem(id);
  await api.delete(`/inventory/${id}`);
}
