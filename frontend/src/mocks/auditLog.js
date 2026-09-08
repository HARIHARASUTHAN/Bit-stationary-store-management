export const mockAuditLog = [
  { id: 'a1', action: 'ORDER_STATUS_UPDATE', actor: 'Suresh Kumar', actorEmail: 'suresh@shopadmin.ac.in', targetId: 'ord-002', description: 'Order #ord-002 status changed to Approved', timestamp: '2026-09-05T14:30:00.000Z' },
  { id: 'a2', action: 'ITEM_STOCK_UPDATE', actor: 'Suresh Kumar', actorEmail: 'suresh@shopadmin.ac.in', targetId: 'i18', description: 'Lab Record Book stock updated from 12 to 8', timestamp: '2026-09-05T13:00:00.000Z' },
  { id: 'a3', action: 'ORDER_STATUS_UPDATE', actor: 'Suresh Kumar', actorEmail: 'suresh@shopadmin.ac.in', targetId: 'ord-003', description: 'Order #ord-003 status changed to Ready', timestamp: '2026-09-05T09:00:00.000Z' },
  { id: 'a4', action: 'ITEM_ADDED', actor: 'Suresh Kumar', actorEmail: 'suresh@shopadmin.ac.in', targetId: 'i30', description: 'New item added: USB Flash Drive (16GB)', timestamp: '2026-09-04T10:00:00.000Z' },
  { id: 'a5', action: 'ORDER_CANCELLED', actor: 'System', actorEmail: 'system', targetId: 'ord-005', description: 'Order #ord-005 cancelled — item out of stock', timestamp: '2026-09-02T16:00:00.000Z' },
  { id: 'a6', action: 'ACCOUNT_CREATED', actor: 'Principal Admin', actorEmail: 'admin@admin.ac.in', targetId: 'u5', description: 'Shop admin account created for Suresh Kumar', timestamp: '2026-08-01T10:00:00.000Z' },
  { id: 'a7', action: 'ITEM_DELETED', actor: 'Suresh Kumar', actorEmail: 'suresh@shopadmin.ac.in', targetId: 'i99', description: 'Item deleted: Correction Pen (old model)', timestamp: '2026-08-15T11:30:00.000Z' },
  { id: 'a8', action: 'SLOT_ADDED', actor: 'Suresh Kumar', actorEmail: 'suresh@shopadmin.ac.in', targetId: 's6', description: 'New pickup slot added: Sep 10, 9:00 AM – 10:00 AM', timestamp: '2026-09-06T09:00:00.000Z' },
];

export default mockAuditLog;
