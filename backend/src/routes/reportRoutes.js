import { Router } from 'express';
import { getDepartmentReports, getAuditLogs } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Department billing summaries (shopadmin & admin)
router.get('/department', authenticate, requireRole(['shopadmin', 'admin']), getDepartmentReports);

// Governance audit log (campus admin)
router.get('/audit-log', authenticate, requireRole(['admin']), getAuditLogs);

export default router;
