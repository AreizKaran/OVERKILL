import { Router } from 'express';
import {
  listFaculty,
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from '../controllers/faculty.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', listFaculty); // directory is readable by every signed-in role
router.post('/', authorize('admin'), createFaculty);
router.get('/:id', getFaculty);
router.patch('/:id', authorize('admin', 'faculty'), updateFaculty);
router.delete('/:id', authorize('admin'), deleteFaculty);

export default router;
