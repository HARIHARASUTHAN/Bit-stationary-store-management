import { Router } from 'express';
import { syncUserRole, getProfile, getAccounts } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Set/Sync custom role claim based on email domain
router.post('/sync-role', syncUserRole);

// Get current authenticated user profile
router.get('/me', authenticate, getProfile);

// Get store/admin accounts (restricted to campus admin)
router.get('/accounts', authenticate, requireRole(['admin']), getAccounts);

export default router;
