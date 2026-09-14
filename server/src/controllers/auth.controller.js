import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';

const loadProfile = async (user) => {
  if (user.role === 'student') {
    return Student.findOne({ user: user._id })
      .populate('department', 'code name')
      .populate('course', 'code name')
      .populate({ path: 'mentor', select: 'employeeId cabin', populate: { path: 'user', select: 'name email' } });
  }
  if (user.role === 'faculty') {
    return Faculty.findOne({ user: user._id })
      .populate('department', 'code name')
      .populate('subjects', 'code name semester');
  }
  return null;
};

export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) throw ApiError.badRequest('Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  // Same message for unknown email and wrong password — do not leak which accounts exist.
  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated. Contact the administrator.');
  if (role && user.role !== role) throw ApiError.forbidden(`This account is not registered as ${role}`);

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      user: user.toSafeJSON(),
      profile: await loadProfile(user),
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeJSON(), profile: await loadProfile(req.user) } });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw ApiError.badRequest('Refresh token is required');
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Refresh token expired — please sign in again');
  }
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('Account is inactive');
  res.json({ success: true, data: { accessToken: signAccessToken(user) } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw ApiError.badRequest('Both current and new passwords are required');
  if (String(newPassword).length < 8) throw ApiError.badRequest('New password must be at least 8 characters');

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) throw ApiError.unauthorized('Current password is incorrect');

  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();

  // Role-owned profile fields students/faculty may edit themselves.
  if (req.user.role === 'faculty') {
    const editable = ['cabin', 'block', 'contact', 'officeHours', 'bio', 'specialization'];
    const faculty = await Faculty.findOne({ user: user._id });
    if (faculty) {
      editable.forEach((f) => req.body[f] !== undefined && (faculty[f] = req.body[f]));
      await faculty.save();
    }
  }
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: user._id });
    if (student) {
      if (req.body.address) student.address = { ...student.address?.toObject?.(), ...req.body.address };
      if (req.body.guardian) student.guardian = { ...student.guardian?.toObject?.(), ...req.body.guardian };
      await student.save();
    }
  }

  res.json({ success: true, data: { user: user.toSafeJSON(), profile: await loadProfile(user) } });
});
