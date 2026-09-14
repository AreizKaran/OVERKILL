import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notify } from '../utils/notify.js';

export const listAnnouncements = asyncHandler(async (req, res) => {
  const { category, priority, limit = 50 } = req.query;
  const filter = {
    publishAt: { $lte: new Date() },
    $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }] }],
  };
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  // Everyone sees their own audience plus college-wide notices.
  if (req.user.role !== 'admin') filter.audience = { $in: [req.user.role, 'all'] };

  const announcements = await Announcement.find(filter)
    .populate('postedBy', 'name role avatar')
    .populate('department', 'code name')
    .sort({ pinned: -1, publishAt: -1 })
    .limit(Number(limit));

  res.json({
    success: true,
    data: announcements.map((a) => ({
      ...a.toObject(),
      readBy: undefined,
      isRead: a.readBy.some((id) => String(id) === String(req.user._id)),
    })),
  });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, postedBy: req.user._id });

  const audience = announcement.audience.includes('all') ? ['student', 'faculty', 'admin'] : announcement.audience;
  const recipients = await User.find({ role: { $in: audience }, isActive: true }).select('_id');
  await notify(recipients.map((u) => u._id), {
    title: announcement.title,
    message: announcement.body.slice(0, 140),
    type: 'announcement',
    link: '/app/announcements',
  });

  res.status(201).json({ success: true, data: announcement });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw ApiError.notFound('Announcement not found');
  if (req.user.role !== 'admin' && String(announcement.postedBy) !== String(req.user._id)) throw ApiError.forbidden();
  Object.assign(announcement, req.body);
  await announcement.save();
  res.json({ success: true, data: announcement });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw ApiError.notFound('Announcement not found');
  if (req.user.role !== 'admin' && String(announcement.postedBy) !== String(req.user._id)) throw ApiError.forbidden();
  await announcement.deleteOne();
  res.json({ success: true, message: 'Announcement deleted' });
});

export const markRead = asyncHandler(async (req, res) => {
  await Announcement.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
  res.json({ success: true, message: 'Marked as read' });
});
