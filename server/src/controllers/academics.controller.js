import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/* ---------------- Departments ---------------- */
export const listDepartments = asyncHandler(async (_req, res) => {
  const departments = await Department.find()
    .populate({ path: 'hod', select: 'employeeId designation', populate: { path: 'user', select: 'name email' } })
    .sort({ code: 1 });

  const withCounts = await Promise.all(
    departments.map(async (d) => ({
      ...d.toObject(),
      studentCount: await Student.countDocuments({ department: d._id, status: 'Active' }),
      facultyCount: await Faculty.countDocuments({ department: d._id, status: 'Active' }),
      subjectCount: await Subject.countDocuments({ department: d._id }),
    }))
  );
  res.json({ success: true, data: withCounts });
});

export const createDepartment = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await Department.create(req.body) });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!department) throw ApiError.notFound('Department not found');
  res.json({ success: true, data: department });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const inUse = await Student.countDocuments({ department: req.params.id });
  if (inUse) throw ApiError.badRequest('Cannot delete a department that still has enrolled students');
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) throw ApiError.notFound('Department not found');
  res.json({ success: true, message: 'Department deleted' });
});

/* ---------------- Courses ---------------- */
export const listCourses = asyncHandler(async (req, res) => {
  const filter = req.query.department ? { department: req.query.department } : {};
  res.json({ success: true, data: await Course.find(filter).populate('department', 'code name').sort({ code: 1 }) });
});

export const createCourse = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await Course.create(req.body) });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) throw ApiError.notFound('Course not found');
  res.json({ success: true, data: course });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  res.json({ success: true, message: 'Course deleted' });
});

/* ---------------- Subjects ---------------- */
export const listSubjects = asyncHandler(async (req, res) => {
  const { department, semester, faculty, type, search } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (semester) filter.semester = Number(semester);
  if (faculty) filter.faculty = faculty;
  if (type) filter.type = type;
  if (search) filter.$or = [{ code: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }];

  // Students see their own semester's subjects; faculty default to what they teach.
  if (req.user.role === 'student' && req.profile) {
    filter.department = req.profile.department;
    filter.semester = req.profile.semester;
  }
  if (req.user.role === 'faculty' && req.profile && !department && !semester) {
    filter.faculty = req.profile._id;
  }

  const subjects = await Subject.find(filter)
    .populate('department', 'code name')
    .populate({ path: 'faculty', select: 'employeeId cabin officialEmail', populate: { path: 'user', select: 'name email' } })
    .sort({ semester: 1, code: 1 });
  res.json({ success: true, data: subjects });
});

export const getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id)
    .populate('department', 'code name')
    .populate({ path: 'faculty', select: 'employeeId cabin officialEmail officeHours', populate: { path: 'user', select: 'name email' } });
  if (!subject) throw ApiError.notFound('Subject not found');
  res.json({ success: true, data: subject });
});

export const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  if (subject.faculty) await Faculty.findByIdAndUpdate(subject.faculty, { $addToSet: { subjects: subject._id } });
  res.status(201).json({ success: true, data: subject });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) throw ApiError.notFound('Subject not found');
  const previousFaculty = subject.faculty;
  Object.assign(subject, req.body);
  await subject.save();

  if (String(previousFaculty) !== String(subject.faculty)) {
    if (previousFaculty) await Faculty.findByIdAndUpdate(previousFaculty, { $pull: { subjects: subject._id } });
    if (subject.faculty) await Faculty.findByIdAndUpdate(subject.faculty, { $addToSet: { subjects: subject._id } });
  }
  res.json({ success: true, data: subject });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) throw ApiError.notFound('Subject not found');
  await Faculty.updateMany({ subjects: subject._id }, { $pull: { subjects: subject._id } });
  res.json({ success: true, message: 'Subject deleted' });
});
