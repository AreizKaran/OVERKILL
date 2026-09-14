import Faculty from '../models/Faculty.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Feedback from '../models/Feedback.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const POPULATE = [
  { path: 'user', select: 'name email phone avatar isActive lastLogin' },
  { path: 'department', select: 'code name' },
  { path: 'subjects', select: 'code name semester credits' },
];

export const listFaculty = asyncHandler(async (req, res) => {
  const { department, designation, search, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (designation) filter.designation = designation;
  if (search) {
    const users = await User.find({ name: new RegExp(search, 'i'), role: 'faculty' }).select('_id');
    filter.$or = [{ employeeId: new RegExp(search, 'i') }, { user: { $in: users.map((u) => u._id) } }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Faculty.find(filter).populate(POPULATE).sort({ employeeId: 1 }).skip(skip).limit(Number(limit)),
    Faculty.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: { total, page: Number(page), limit: Number(limit) } });
});

export const getFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).populate(POPULATE);
  if (!faculty) throw ApiError.notFound('Faculty member not found');

  const feedback = await Feedback.find({ faculty: faculty._id, type: 'student-to-faculty' }).select('averageRating');
  const averageRating = feedback.length
    ? Number((feedback.reduce((a, f) => a + f.averageRating, 0) / feedback.length).toFixed(2))
    : null;

  res.json({ success: true, data: { faculty, feedbackCount: feedback.length, averageRating } });
});

export const createFaculty = asyncHandler(async (req, res) => {
  const { name, email, password, ...rest } = req.body;
  if (await User.findOne({ email: String(email).toLowerCase() })) {
    throw ApiError.conflict('A user with this email already exists');
  }
  const user = await User.create({ name, email, password, role: 'faculty', mustChangePassword: true });
  try {
    const faculty = await Faculty.create({ ...rest, user: user._id });
    res.status(201).json({ success: true, data: await faculty.populate(POPULATE) });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    throw err;
  }
});

export const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) throw ApiError.notFound('Faculty member not found');
  if (req.user.role === 'faculty' && String(faculty._id) !== String(req.profile?._id)) throw ApiError.forbidden();

  const { name, email, phone, ...rest } = req.body;
  Object.assign(faculty, rest);
  await faculty.save();
  if (name || email || phone) {
    await User.findByIdAndUpdate(faculty.user, {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
    });
  }
  res.json({ success: true, data: await faculty.populate(POPULATE) });
});

export const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) throw ApiError.notFound('Faculty member not found');
  await User.findByIdAndUpdate(faculty.user, { isActive: false });
  faculty.status = 'Retired';
  await faculty.save();
  await Subject.updateMany({ faculty: faculty._id }, { $unset: { faculty: '' } });
  res.json({ success: true, message: 'Faculty account deactivated' });
});
