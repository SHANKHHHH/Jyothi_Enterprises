import { Router } from 'express';
import {
  signupValidation,
  loginValidation,
  signup,
  login,
  getProfile,
  testDatabase,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/test-db', testDatabase);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router; 