import api from './api';
import mockAuditLog from '@/mocks/auditLog';
import mockUsers from '@/mocks/users';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function getDepartmentReports() {
  if (USE_MOCK) {
    return [
      { department: 'Computer Science', count: 12, revenue: 6455, bulkCount: 2 },
      { department: 'Electronics', count: 8, revenue: 1245, bulkCount: 0 },
      { department: 'Mathematics', count: 5, revenue: 2380, bulkCount: 1 },
      { department: 'Mechanical Engg', count: 3, revenue: 349, bulkCount: 0 },
      { department: 'Biotechnology', count: 2, revenue: 375, bulkCount: 0 },
    ];
  }
  const res = await api.get('/reports/department');
  return res.data;
}

export async function getAuditLogs() {
  if (USE_MOCK) return mockAuditLog;
  const res = await api.get('/reports/audit-log');
  return res.data;
}

export async function getAccounts() {
  if (USE_MOCK) return mockUsers;
  const res = await api.get('/auth/accounts');
  return res.data;
}

export async function createShopAdminAccount(accountData) {
  if (USE_MOCK) {
    const newAcc = {
      ...accountData,
      id: accountData.id || `u-${Date.now()}`,
      active: true,
      role: 'shopadmin',
    };
    mockUsers.unshift(newAcc);
    return newAcc;
  }
  const res = await api.post('/auth/accounts', accountData);
  return res.data.account || res.data;
}

export async function toggleAccountStatus(accountId, active) {
  if (USE_MOCK) {
    const user = mockUsers.find((u) => u.id === accountId);
    if (user) user.active = active;
    return { success: true, id: accountId, active };
  }
  const res = await api.patch(`/auth/accounts/${accountId}/status`, { active });
  return res.data;
}

export async function deleteAccount(accountId) {
  if (USE_MOCK) {
    const idx = mockUsers.findIndex((u) => u.id === accountId);
    if (idx !== -1) mockUsers.splice(idx, 1);
    return { success: true, id: accountId };
  }
  const res = await api.delete(`/auth/accounts/${accountId}`);
  return res.data;
}
