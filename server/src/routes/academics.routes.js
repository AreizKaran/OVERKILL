import { Router } from 'express';
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  listSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/academics.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/departments').get(listDepartments).post(authorize('admin'), createDepartment);
router.route('/departments/:id').patch(authorize('admin'), updateDepartment).delete(authorize('admin'), deleteDepartment);

router.route('/courses').get(listCourses).post(authorize('admin'), createCourse);
router.route('/courses/:id').patch(authorize('admin'), updateCourse).delete(authorize('admin'), deleteCourse);

router.route('/subjects').get(listSubjects).post(authorize('admin'), createSubject);
router
  .route('/subjects/:id')
  .get(getSubject)
  .patch(authorize('admin', 'faculty'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

export default router;
