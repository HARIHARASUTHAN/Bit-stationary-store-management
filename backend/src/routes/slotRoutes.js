import { Router } from 'express';
import { getSlots, addSlot, updateSlot } from '../controllers/slotController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Pickup slot windows
router.get('/', getSlots);

// Manage slots (shopadmin & admin)
router.post('/', authenticate, requireRole(['shopadmin', 'admin']), addSlot);
router.put('/:id', authenticate, requireRole(['shopadmin', 'admin']), updateSlot);

export default router;
