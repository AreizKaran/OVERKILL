import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, refresh, changePassword, updateProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many sign-in attempts. Please try again in a few minutes.' },
});

router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.get('/me', protect, me);
router.patch('/me', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;
