import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notify } from '../utils/notify.js';

export const listAssignments = asyncHandler(async (req, res) => {
  const { subject, status, upcoming } = req.query;
  const filter = {};
  if (subject) filter.subject = subject;
  if (status) filter.status = status;
  if (upcoming === 'true') filter.dueDate = { $gte: new Date() };

  if (req.user.role === 'student' && req.profile) {
    const subjects = await Subject.find({ department: req.profile.department, semester: req.profile.semester }).select('_id');
    filter.subject = { $in: subjects.map((s) => s._id) };
    filter.status = 'published';
  }
  if (req.user.role === 'faculty' && req.profile && !subject) {
    const subjects = await Subject.find({ faculty: req.profile._id }).select('_id');
    filter.subject = { $in: subjects.map((s) => s._id) };
  }

  const assignments = await Assignment.find(filter)
    .populate('subject', 'code name semester')
    .populate({ path: 'createdBy', select: 'employeeId', populate: { path: 'user', select: 'name' } })
    .sort({ dueDate: 1 });

  // Attach the caller's own submission state so the UI can render status chips.
  if (req.user.role === 'student' && req.profile) {
    const submissions = await Submission.find({
      student: req.profile._id,
      assignment: { $in: assignments.map((a) => a._id) },
    });
    const byAssignment = new Map(submissions.map((s) => [String(s.assignment), s]));
    return res.json({
      success: true,
      data: assignments.map((a) => ({ ...a.toObject(), submission: byAssignment.get(String(a._id)) || null })),
    });
  }

  const counts = await Submission.aggregate([
    { $match: { assignment: { $in: assignments.map((a) => a._id) } } },
    { $group: { _id: '$assignment', submitted: { $sum: 1 }, evaluated: { $sum: { $cond: [{ $eq: ['$status', 'evaluated'] }, 1, 0] } } } },
  ]);
  const byAssignment = new Map(counts.map((c) => [String(c._id), c]));
  res.json({
    success: true,
    data: assignments.map((a) => ({
      ...a.toObject(),
      submitted: byAssignment.get(String(a._id))?.submitted || 0,
      evaluated: byAssignment.get(String(a._id))?.evaluated || 0,
    })),
  });
});

export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('subject', 'code name semester department')
    .populate({ path: 'createdBy', select: 'employeeId cabin', populate: { path: 'user', select: 'name email' } });
  if (!assignment) throw ApiError.notFound('Assignment not found');

  const submissionFilter = { assignment: assignment._id };
  if (req.user.role === 'student') submissionFilter.student = req.profile?._id;

  const submissions = await Submission.find(submissionFilter).populate({
    path: 'student',
    select: 'rollNo registrationNo',
    populate: { path: 'user', select: 'name email avatar' },
  });

  res.json({ success: true, data: { assignment, submissions } });
});

export const createAssignment = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.body.subject);
  if (!subject) throw ApiError.notFound('Subject not found');
  if (req.user.role === 'faculty' && String(subject.faculty) !== String(req.profile?._id)) {
    throw ApiError.forbidden('You can only create assignments for subjects assigned to you');
  }

  const assignment = await Assignment.create({
    ...req.body,
    semester: subject.semester,
    createdBy: req.profile?._id,
  });

  if (assignment.status === 'published') {
    const students = await Student.find({ department: subject.department, semester: subject.semester, status: 'Active' }).select('user');
    await notify(students.map((s) => s.user), {
      title: `New assignment — ${subject.code}`,
      message: `${assignment.title} · due ${new Date(assignment.dueDate).toDateString()}`,
      type: 'assignment',
      link: '/app/assignments',
    });
  }

  res.status(201).json({ success: true, data: assignment });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw ApiError.notFound('Assignment not found');
  if (req.user.role === 'faculty' && String(assignment.createdBy) !== String(req.profile?._id)) throw ApiError.forbidden();
  Object.assign(assignment, req.body);
  await assignment.save();
  res.json({ success: true, data: assignment });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw ApiError.notFound('Assignment not found');
  if (req.user.role === 'faculty' && String(assignment.createdBy) !== String(req.profile?._id)) throw ApiError.forbidden();
  await Submission.deleteMany({ assignment: assignment._id });
  await assignment.deleteOne();
  res.json({ success: true, message: 'Assignment deleted' });
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('subject', 'code name');
  if (!assignment) throw ApiError.notFound('Assignment not found');
  if (!req.profile) throw ApiError.forbidden('Only students can submit assignments');

  const isLate = new Date() > new Date(assignment.dueDate);
  if (isLate && !assignment.allowLateSubmission) throw ApiError.badRequest('The deadline for this assignment has passed');

  const files = (req.files || []).map((f) => ({ name: f.originalname, url: `/uploads/${f.filename}`, size: f.size }));
  const submission = await Submission.findOneAndUpdate(
    { assignment: assignment._id, student: req.profile._id },
    {
      assignment: assignment._id,
      student: req.profile._id,
      note: req.body.note,
      submittedAt: new Date(),
      status: isLate ? 'late' : 'submitted',
      ...(files.length ? { files } : {}),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: submission });
});

export const evaluateSubmission = asyncHandler(async (req, res) => {
  const { marks, feedback } = req.body;
  const submission = await Submission.findById(req.params.submissionId).populate('assignment', 'maxMarks title subject');
  if (!submission) throw ApiError.notFound('Submission not found');
  if (marks > submission.assignment.maxMarks) {
    throw ApiError.badRequest(`Marks cannot exceed the maximum of ${submission.assignment.maxMarks}`);
  }

  submission.marks = marks;
  submission.feedback = feedback;
  submission.status = 'evaluated';
  submission.evaluatedBy = req.profile?._id;
  submission.evaluatedAt = new Date();
  await submission.save();

  const student = await Student.findById(submission.student).select('user');
  await notify(student?.user, {
    title: 'Assignment evaluated',
    message: `"${submission.assignment.title}" scored ${marks}/${submission.assignment.maxMarks}.`,
    type: 'assignment',
    link: '/app/assignments',
  });

  res.json({ success: true, data: submission });
});
