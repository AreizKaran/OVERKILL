import { Router } from 'express';
import {
  listFeedback,
  submitFeedback,
  updateFeedbackStatus,
  getFeedbackAnalytics,
} from '../controllers/feedback.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/').get(listFeedback).post(authorize('student', 'faculty'), submitFeedback);
router.get('/analytics', authorize('admin'), getFeedbackAnalytics);
router.patch('/:id/status', authorize('admin'), updateFeedbackStatus);

export default router;
