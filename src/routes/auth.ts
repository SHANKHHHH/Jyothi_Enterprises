import { Router } from 'express';
import {
  signupValidation,
  loginValidation,
  signup,
  login,
  getProfile,
  getAllUsers,
  updateUserRole,
} from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

// Admin routes
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.patch('/users/:userId/role', authenticateToken, requireAdmin, updateUserRole);

export default router; 