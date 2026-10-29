import { db, isFirebaseConnected } from '../config/firebase.js';

let memoryAuditLogs = [];

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
      orders = [];
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
