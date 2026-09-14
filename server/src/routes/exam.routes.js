import { Router } from 'express';
import {
  listExams,
  createExam,
  updateExam,
  deleteExam,
  getStudentResults,
  upsertResult,
  bulkUpsertResults,
} from '../controllers/exam.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/').get(listExams).post(authorize('admin', 'faculty'), createExam);
router.route('/:id').patch(authorize('admin', 'faculty'), updateExam).delete(authorize('admin'), deleteExam);

router.get('/results/me', authorize('student'), getStudentResults);
router.get('/results/student/:studentId', getStudentResults);
router.post('/results', authorize('faculty', 'admin'), upsertResult);
router.post('/results/bulk', authorize('faculty', 'admin'), bulkUpsertResults);

export default router;
