import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import facultyRoutes from './faculty.routes.js';
import academicsRoutes from './academics.routes.js';
import attendanceRoutes from './attendance.routes.js';
import assignmentRoutes from './assignment.routes.js';
import examRoutes from './exam.routes.js';
import announcementRoutes from './announcement.routes.js';
import feedbackRoutes from './feedback.routes.js';
import feeRoutes from './fee.routes.js';
import notificationRoutes from './notification.routes.js';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { listUsers, setUserRole, setUserActive, resetUserPassword } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, status: 'ok', uptime: process.uptime() }));

router.use('/auth', authRoutes);
router.get('/dashboard', protect, getDashboard);

router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/academics', academicsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/exams', examRoutes);
router.use('/announcements', announcementRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/fees', feeRoutes);
router.use('/notifications', notificationRoutes);

// User & permission administration
router.get('/admin/users', protect, authorize('admin'), listUsers);
router.patch('/admin/users/:id/role', protect, authorize('admin'), setUserRole);
router.patch('/admin/users/:id/status', protect, authorize('admin'), setUserActive);
router.post('/admin/users/:id/reset-password', protect, authorize('admin'), resetUserPassword);

export default router;
