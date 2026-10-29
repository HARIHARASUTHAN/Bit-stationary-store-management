import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  placeOrder,
  updateOrderStatus,
  verifyPickupCode,
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Order listing (automatically scoped by user role)
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);

// Place pre-order (students & faculty)
router.post('/', authenticate, placeOrder);

// Update order status progression (shopadmin & admin)
router.patch('/:id/status', authenticate, requireRole(['shopadmin', 'admin']), updateOrderStatus);

// Secure 6-digit counter pickup verification (shopadmin & admin)
router.post('/:id/verify-pickup', authenticate, requireRole(['shopadmin', 'admin']), verifyPickupCode);

export default router;
