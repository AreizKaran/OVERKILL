import Feedback from '../models/Feedback.js';
import Faculty from '../models/Faculty.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listFeedback = asyncHandler(async (req, res) => {
  const { type, faculty, status } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (faculty) filter.faculty = faculty;
  if (status) filter.status = status;

  // Faculty see feedback about themselves; students see only what they submitted.
  if (req.user.role === 'faculty') {
    filter.type = 'student-to-faculty';
    filter.faculty = req.profile?._id;
  }
  if (req.user.role === 'student') filter.submittedBy = req.user._id;

  const items = await Feedback.find(filter)
    .populate({ path: 'faculty', select: 'employeeId', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'code name')
    .populate('department', 'code name')
    .sort({ createdAt: -1 });

  // Strip the author from anonymous entries before anyone but the author sees it.
  const data = items.map((item) => {
    const obj = item.toObject();
    if (obj.anonymous && String(obj.submittedBy) !== String(req.user._id)) obj.submittedBy = null;
    return obj;
  });

  res.json({ success: true, data });
});

export const submitFeedback = asyncHandler(async (req, res) => {
  const type = req.user.role === 'student' ? 'student-to-faculty' : 'faculty-to-admin';
  if (type === 'student-to-faculty' && !req.body.faculty) throw ApiError.badRequest('Please select a faculty member');

  const feedback = await Feedback.create({
    ...req.body,
    type,
    submittedBy: req.user._id,
    department: req.body.department || req.profile?.department,
    semester: req.body.semester || req.profile?.semester,
  });
  res.status(201).json({ success: true, data: feedback });
});

export const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, adminNote: req.body.adminNote },
    { new: true }
  );
  if (!feedback) throw ApiError.notFound('Feedback not found');
  res.json({ success: true, data: feedback });
});

/** Aggregated ratings per faculty member — admin analytics. */
export const getFeedbackAnalytics = asyncHandler(async (_req, res) => {
  const rows = await Feedback.aggregate([
    { $match: { type: 'student-to-faculty' } },
    {
      $group: {
        _id: '$faculty',
        count: { $sum: 1 },
        averageRating: { $avg: '$averageRating' },
        teachingQuality: { $avg: '$ratings.teachingQuality' },
        clarity: { $avg: '$ratings.clarity' },
        punctuality: { $avg: '$ratings.punctuality' },
        supportiveness: { $avg: '$ratings.supportiveness' },
        courseContent: { $avg: '$ratings.courseContent' },
      },
    },
    { $sort: { averageRating: -1 } },
  ]);

  const faculty = await Faculty.find({ _id: { $in: rows.map((r) => r._id) } })
    .populate('user', 'name')
    .populate('department', 'code')
    .select('employeeId user department');
  const byId = new Map(faculty.map((f) => [String(f._id), f]));

  res.json({
    success: true,
    data: rows.map((row) => ({
      faculty: byId.get(String(row._id)) || null,
      count: row.count,
      averageRating: Number((row.averageRating || 0).toFixed(2)),
      breakdown: {
        teachingQuality: Number((row.teachingQuality || 0).toFixed(2)),
        clarity: Number((row.clarity || 0).toFixed(2)),
        punctuality: Number((row.punctuality || 0).toFixed(2)),
        supportiveness: Number((row.supportiveness || 0).toFixed(2)),
        courseContent: Number((row.courseContent || 0).toFixed(2)),
      },
    })),
  });
});
