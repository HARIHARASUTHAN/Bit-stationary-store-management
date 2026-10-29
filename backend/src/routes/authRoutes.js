import { Router } from 'express';
import {
  syncUserRole,
  getProfile,
  updateProfile,
  changePassword,
  getShopInfo,
  getAccounts,
  createAccount,
  toggleAccountStatus,
  deleteAccount,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Set/Sync custom role claim based on email domain
router.post('/sync-role', syncUserRole);

// Get current authenticated user profile
router.get('/me', authenticate, getProfile);

// Update user profile (name, shopName, phone, etc.)
router.put('/profile', authenticate, updateProfile);

// Update user login password
router.post('/change-password', authenticate, changePassword);

// Public / student accessible campus shop info
router.get('/shop-info', getShopInfo);

// Get store/admin accounts (restricted to campus admin)
router.get('/accounts', authenticate, requireRole(['admin']), getAccounts);

// Create shop admin account (restricted to campus admin)
router.post('/accounts', authenticate, requireRole(['admin']), createAccount);

// Toggle or update account status (restricted to campus admin)
router.patch('/accounts/:id/status', authenticate, requireRole(['admin']), toggleAccountStatus);

// Delete shop admin account (restricted to campus admin)
router.delete('/accounts/:id', authenticate, requireRole(['admin']), deleteAccount);

export default router;
