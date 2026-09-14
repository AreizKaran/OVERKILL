import { Router } from 'express';
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markRead,
} from '../controllers/announcement.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/').get(listAnnouncements).post(authorize('faculty', 'admin'), createAnnouncement);
router.route('/:id').patch(authorize('faculty', 'admin'), updateAnnouncement).delete(authorize('faculty', 'admin'), deleteAnnouncement);
router.post('/:id/read', markRead);

export default router;
