import { Router } from 'express';
import {
  getStudentAttendance,
  getSessionRoster,
  markAttendance,
  getSubjectAttendanceReport,
} from '../controllers/attendance.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/me', authorize('student'), getStudentAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.get('/roster/:subjectId', authorize('faculty', 'admin'), getSessionRoster);
router.get('/report/:subjectId', authorize('faculty', 'admin'), getSubjectAttendanceReport);
router.post('/', authorize('faculty', 'admin'), markAttendance);

export default router;
