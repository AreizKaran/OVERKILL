import { Router } from 'express';
import {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  evaluateSubmission,
} from '../controllers/assignment.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(protect);

router.route('/').get(listAssignments).post(authorize('faculty', 'admin'), upload.array('attachments', 5), createAssignment);
router
  .route('/:id')
  .get(getAssignment)
  .patch(authorize('faculty', 'admin'), updateAssignment)
  .delete(authorize('faculty', 'admin'), deleteAssignment);

router.post('/:id/submit', authorize('student'), upload.array('files', 5), submitAssignment);
router.patch('/submissions/:submissionId/evaluate', authorize('faculty', 'admin'), evaluateSubmission);

export default router;
