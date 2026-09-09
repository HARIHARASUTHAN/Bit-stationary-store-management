import { db, isFirebaseConnected } from '../config/firebase.js';

let memoryAuditLogs = [
  { id: 'a1', action: 'ORDER_STATUS_UPDATE', actor: 'Suresh Kumar', actorEmail: 'suresh@shopadmin.ac.in', targetId: 'ord-002', description: 'Order #ord-002 status changed to Approved', timestamp: '2026-09-05T14:30:00.000Z' },
  { id: 'a2', action: 'ITEM_STOCK_UPDATE', actor: 'Suresh Kumar', actorEmail: 'suresh@shopadmin.ac.in', targetId: 'i18', description: 'Lab Record Book stock updated from 12 to 8', timestamp: '2026-09-05T13:00:00.000Z' },
  { id: 'a3', action: 'ORDER_STATUS_UPDATE', actor: 'Suresh Kumar', actorEmail: 'suresh@shopadmin.ac.in', targetId: 'ord-003', description: 'Order #ord-003 status changed to Ready', timestamp: '2026-09-05T09:00:00.000Z' },
  { id: 'a4', action: 'ITEM_ADDED', actor: 'Suresh Kumar', actorEmail: 'suresh@shopadmin.ac.in', targetId: 'i30', description: 'New item added: USB Flash Drive (16GB)', timestamp: '2026-09-04T10:00:00.000Z' },
];

/**
 * GET /api/reports/department
 */
export async function getDepartmentReports(req, res, next) {
  try {
    let orders = [];

    if (isFirebaseConnected && db) {
      const snap = await db.collection('orders').get();
      orders = snap.docs.map((d) => d.data());
    } else {
      // Fallback
      orders = [
        { userDepartment: 'Computer Science', total: 6455, isBulkOrder: true },
        { userDepartment: 'Electronics', total: 1245, isBulkOrder: false },
        { userDepartment: 'Mathematics', total: 2380, isBulkOrder: true },
        { userDepartment: 'Mechanical Engg', total: 349, isBulkOrder: false },
        { userDepartment: 'Biotechnology', total: 375, isBulkOrder: false },
      ];
    }

    const deptMap = {};
    orders.forEach((o) => {
      const dept = o.userDepartment || 'General';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, count: 0, revenue: 0, bulkCount: 0 };
      }
      deptMap[dept].count += 1;
      deptMap[dept].revenue += o.total || 0;
      if (o.isBulkOrder) deptMap[dept].bulkCount += 1;
    });

    res.json(Object.values(deptMap));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/audit-log
 */
export async function getAuditLogs(req, res, next) {
  try {
    if (isFirebaseConnected && db) {
      const snap = await db.collection('audit_logs').orderBy('timestamp', 'desc').limit(50).get();
      if (!snap.empty) {
        return res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    }
    res.json(memoryAuditLogs);
  } catch (error) {
    next(error);
  }
}
