import { Router } from 'express';
import {
  getInventory,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
} from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Public / Authenticated catalog browse
router.get('/', getInventory);
router.get('/:id', getItemById);

// Store Operator / Admin mutation endpoints
router.post('/', authenticate, requireRole(['shopadmin', 'admin']), addItem);
router.put('/:id', authenticate, requireRole(['shopadmin', 'admin']), updateItem);
router.delete('/:id', authenticate, requireRole(['shopadmin', 'admin']), deleteItem);

export default router;
