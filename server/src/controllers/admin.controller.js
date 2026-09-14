import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: items.map((u) => u.toSafeJSON()), meta: { total, page: Number(page) } });
});

export const setUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['student', 'faculty', 'admin'].includes(role)) throw ApiError.badRequest('Invalid role');
  if (String(req.params.id) === String(req.user._id)) throw ApiError.badRequest('You cannot change your own role');

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: user.toSafeJSON() });
});

export const setUserActive = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw ApiError.badRequest('You cannot deactivate your own account');
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(req.body.isActive) }, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: user.toSafeJSON() });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) throw ApiError.badRequest('Password must be at least 8 characters');
  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw ApiError.notFound('User not found');
  user.password = newPassword;
  user.mustChangePassword = true;
  await user.save();
  res.json({ success: true, message: 'Password reset. The user must change it at next sign-in.' });
});
