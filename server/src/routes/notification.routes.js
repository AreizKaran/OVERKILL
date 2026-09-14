import { Router } from 'express';
import {
  listNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', listNotifications);
router.post('/read-all', markAllRead);
router.patch('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

export default router;
