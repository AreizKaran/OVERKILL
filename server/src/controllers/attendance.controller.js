import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notify } from '../utils/notify.js';

const PRESENT = new Set(['present', 'late']);

/** Per-subject attendance summary for one student. */
export const getStudentAttendance = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.profile?._id;
  if (!studentId) throw ApiError.badRequest('Student could not be resolved');
  if (req.user.role === 'student' && String(studentId) !== String(req.profile?._id)) throw ApiError.forbidden();

  const sessions = await Attendance.find({ 'records.student': studentId })
    .populate('subject', 'code name credits semester')
    .sort({ date: -1 });

  const bySubject = new Map();
  const timeline = [];

  for (const session of sessions) {
    const record = session.records.find((r) => String(r.student) === String(studentId));
    if (!record || !session.subject) continue;

    const key = String(session.subject._id);
    if (!bySubject.has(key)) {
      bySubject.set(key, { subject: session.subject, total: 0, attended: 0, absent: 0, late: 0 });
    }
    const entry = bySubject.get(key);
    entry.total += 1;
    if (PRESENT.has(record.status)) entry.attended += 1;
    else entry.absent += 1;
    if (record.status === 'late') entry.late += 1;

    timeline.push({
      date: session.date,
      subject: session.subject.code,
      subjectName: session.subject.name,
      status: record.status,
      topic: session.topic,
    });
  }

  const subjects = [...bySubject.values()].map((entry) => ({
    ...entry,
    percentage: entry.total ? Number(((entry.attended / entry.total) * 100).toFixed(1)) : 0,
  }));
  const total = subjects.reduce((sum, s) => sum + s.total, 0);
  const attended = subjects.reduce((sum, s) => sum + s.attended, 0);

  res.json({
    success: true,
    data: {
      overall: {
        total,
        attended,
        percentage: total ? Number(((attended / total) * 100).toFixed(1)) : 0,
        shortage: total ? attended / total < 0.75 : false,
      },
      subjects,
      timeline: timeline.slice(0, 60),
    },
  });
});

/** Roster + any already-saved attendance for a subject on a date. */
export const getSessionRoster = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const { date = new Date().toISOString().slice(0, 10), period = 1 } = req.query;

  const subject = await Subject.findById(subjectId);
  if (!subject) throw ApiError.notFound('Subject not found');

  const students = await Student.find({ department: subject.department, semester: subject.semester, status: 'Active' })
    .populate('user', 'name email avatar')
    .sort({ rollNo: 1 });

  const existing = await Attendance.findOne({
    subject: subjectId,
    period: Number(period),
    date: { $gte: new Date(`${date}T00:00:00.000Z`), $lte: new Date(`${date}T23:59:59.999Z`) },
  });

  res.json({ success: true, data: { subject, students, existing } });
});

/** Create or update one attendance session (faculty/admin). */
export const markAttendance = asyncHandler(async (req, res) => {
  const { subject, date, period = 1, topic, records } = req.body;
  if (!subject || !date || !Array.isArray(records)) {
    throw ApiError.badRequest('subject, date and records[] are required');
  }

  const subjectDoc = await Subject.findById(subject);
  if (!subjectDoc) throw ApiError.notFound('Subject not found');
  if (req.user.role === 'faculty' && String(subjectDoc.faculty) !== String(req.profile?._id)) {
    throw ApiError.forbidden('You can only mark attendance for subjects assigned to you');
  }

  const sessionDate = new Date(date);
  const filter = {
    subject,
    period: Number(period),
    date: {
      $gte: new Date(sessionDate.setUTCHours(0, 0, 0, 0)),
      $lte: new Date(new Date(date).setUTCHours(23, 59, 59, 999)),
    },
  };

  const payload = {
    subject,
    date: new Date(date),
    period: Number(period),
    semester: subjectDoc.semester,
    topic,
    markedBy: req.profile?._id,
    records,
  };

  const existing = await Attendance.findOne(filter);
  const session = existing
    ? await Attendance.findByIdAndUpdate(existing._id, payload, { new: true })
    : await Attendance.create(payload);

  // Nudge students who were marked absent.
  const absentees = records.filter((r) => r.status === 'absent').map((r) => r.student);
  if (absentees.length) {
    const students = await Student.find({ _id: { $in: absentees } }).select('user');
    await notify(
      students.map((s) => s.user),
      {
        title: `Marked absent — ${subjectDoc.code}`,
        message: `You were marked absent for ${subjectDoc.name} on ${new Date(date).toDateString()}.`,
        type: 'attendance',
        link: '/app/attendance',
      }
    );
  }

  res.status(existing ? 200 : 201).json({ success: true, data: session });
});

/** Subject-wise class report for faculty/admin. */
export const getSubjectAttendanceReport = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const sessions = await Attendance.find({ subject: subjectId }).sort({ date: 1 });
  const students = await Student.find({ _id: { $in: sessions.flatMap((s) => s.records.map((r) => r.student)) } })
    .populate('user', 'name')
    .select('rollNo registrationNo user');

  const summary = students.map((student) => {
    let total = 0;
    let attended = 0;
    sessions.forEach((session) => {
      const record = session.records.find((r) => String(r.student) === String(student._id));
      if (!record) return;
      total += 1;
      if (PRESENT.has(record.status)) attended += 1;
    });
    return {
      student: { id: student._id, rollNo: student.rollNo, registrationNo: student.registrationNo, name: student.user?.name },
      total,
      attended,
      percentage: total ? Number(((attended / total) * 100).toFixed(1)) : 0,
    };
  });

  res.json({
    success: true,
    data: {
      sessionCount: sessions.length,
      summary: summary.sort((a, b) => a.percentage - b.percentage),
      belowThreshold: summary.filter((s) => s.percentage < 75).length,
    },
  });
});
