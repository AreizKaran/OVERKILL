import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Result from '../models/Result.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const POPULATE = [
  { path: 'user', select: 'name email phone avatar isActive lastLogin' },
  { path: 'department', select: 'code name' },
  { path: 'course', select: 'code name' },
  { path: 'mentor', select: 'employeeId cabin', populate: { path: 'user', select: 'name email' } },
];

export const listStudents = asyncHandler(async (req, res) => {
  const { department, semester, section, status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (semester) filter.semester = Number(semester);
  if (section) filter.section = section;
  if (status) filter.status = status;

  if (search) {
    const users = await User.find({ name: new RegExp(search, 'i'), role: 'student' }).select('_id');
    filter.$or = [
      { registrationNo: new RegExp(search, 'i') },
      { rollNo: new RegExp(search, 'i') },
      { user: { $in: users.map((u) => u._id) } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Student.find(filter).populate(POPULATE).sort({ rollNo: 1 }).skip(skip).limit(Number(limit)),
    Student.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: { total, page: Number(page), limit: Number(limit) } });
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate(POPULATE);
  if (!student) throw ApiError.notFound('Student not found');
  // Students may only read their own record.
  if (req.user.role === 'student' && String(student._id) !== String(req.profile?._id)) throw ApiError.forbidden();

  const [attendance, results] = await Promise.all([
    Attendance.find({ 'records.student': student._id }).populate('subject', 'code name'),
    Result.find({ student: student._id }).populate('subject', 'code name credits'),
  ]);

  res.json({ success: true, data: { student, attendanceSessions: attendance.length, results } });
});

export const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, ...rest } = req.body;
  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const user = await User.create({ name, email, password, role: 'student', mustChangePassword: true });
  try {
    const student = await Student.create({ ...rest, user: user._id });
    res.status(201).json({ success: true, data: await student.populate(POPULATE) });
  } catch (err) {
    await User.findByIdAndDelete(user._id); // keep users and profiles consistent
    throw err;
  }
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');

  const { name, email, phone, ...rest } = req.body;
  Object.assign(student, rest);
  await student.save();

  if (name || email || phone) {
    await User.findByIdAndUpdate(student.user, {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
    });
  }
  res.json({ success: true, data: await student.populate(POPULATE) });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');
  await User.findByIdAndUpdate(student.user, { isActive: false }); // soft-disable, keep academic history
  student.status = 'Suspended';
  await student.save();
  res.json({ success: true, message: 'Student account deactivated' });
});
