import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notify } from '../utils/notify.js';

export const listExams = asyncHandler(async (req, res) => {
  const { department, semester, type, upcoming } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (semester) filter.semester = Number(semester);
  if (type) filter.type = type;
  if (upcoming === 'true') filter.date = { $gte: new Date() };

  if (req.user.role === 'student' && req.profile) {
    filter.department = req.profile.department;
    filter.semester = req.profile.semester;
  }

  const exams = await Exam.find(filter)
    .populate('subject', 'code name')
    .populate('department', 'code name')
    .sort({ date: 1 });
  res.json({ success: true, data: exams });
});

export const createExam = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.body.subject);
  if (!subject) throw ApiError.notFound('Subject not found');

  const exam = await Exam.create({ ...req.body, department: subject.department, semester: subject.semester });
  const students = await Student.find({ department: subject.department, semester: subject.semester, status: 'Active' }).select('user');
  await notify(students.map((s) => s.user), {
    title: `${exam.type} scheduled — ${subject.code}`,
    message: `${new Date(exam.date).toDateString()} at ${exam.startTime} · Room ${exam.room || 'TBA'}`,
    type: 'exam',
    link: '/app/examinations',
  });

  res.status(201).json({ success: true, data: exam });
});

export const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!exam) throw ApiError.notFound('Exam not found');
  res.json({ success: true, data: exam });
});

export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);
  if (!exam) throw ApiError.notFound('Exam not found');
  res.json({ success: true, message: 'Exam deleted' });
});

/** Results for one student, grouped by semester, with SGPA/CGPA. */
export const getStudentResults = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.profile?._id;
  if (!studentId) throw ApiError.badRequest('Student could not be resolved');
  if (req.user.role === 'student' && String(studentId) !== String(req.profile?._id)) throw ApiError.forbidden();

  const results = await Result.find({ student: studentId }).populate('subject', 'code name credits').sort({ semester: 1 });

  const semesters = [...new Set(results.map((r) => r.semester))].map((semester) => {
    const rows = results.filter((r) => r.semester === semester);
    const credits = rows.reduce((sum, r) => sum + (r.subject?.credits || r.credits || 0), 0);
    const points = rows.reduce((sum, r) => sum + r.gradePoint * (r.subject?.credits || r.credits || 0), 0);
    return {
      semester,
      results: rows,
      credits,
      sgpa: credits ? Number((points / credits).toFixed(2)) : 0,
      backlogs: rows.filter((r) => r.status === 'fail').length,
    };
  });

  const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
  const cgpa = totalCredits
    ? Number((semesters.reduce((sum, s) => sum + s.sgpa * s.credits, 0) / totalCredits).toFixed(2))
    : 0;

  res.json({ success: true, data: { semesters, cgpa, totalCredits, backlogs: semesters.reduce((s, x) => s + x.backlogs, 0) } });
});

/** Create/replace a result row (faculty for own subjects, admin for any). */
export const upsertResult = asyncHandler(async (req, res) => {
  const { student, subject, semester } = req.body;
  if (!student || !subject || !semester) throw ApiError.badRequest('student, subject and semester are required');

  const subjectDoc = await Subject.findById(subject);
  if (!subjectDoc) throw ApiError.notFound('Subject not found');
  if (req.user.role === 'faculty' && String(subjectDoc.faculty) !== String(req.profile?._id)) {
    throw ApiError.forbidden('You can only publish marks for subjects assigned to you');
  }

  // Fetch-then-save so the pre-save hook recomputes totals, grade and status.
  const existing = await Result.findOne({ student, subject, semester });
  const doc = existing || new Result({ student, subject, semester });
  Object.assign(doc, req.body, { credits: subjectDoc.credits, publishedBy: req.user._id, publishedAt: new Date() });
  await doc.save();

  await recomputeCgpa(student);

  const studentDoc = await Student.findById(student).select('user');
  await notify(studentDoc?.user, {
    title: `Marks published — ${subjectDoc.code}`,
    message: `You scored ${doc.totalMarks}/${doc.maxInternal + doc.maxExternal} (grade ${doc.grade}).`,
    type: 'result',
    link: '/app/results',
  });

  res.status(existing ? 200 : 201).json({ success: true, data: doc });
});

export const bulkUpsertResults = asyncHandler(async (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || !rows.length) throw ApiError.badRequest('rows[] is required');

  const saved = [];
  for (const row of rows) {
    const existing = await Result.findOne({ student: row.student, subject: row.subject, semester: row.semester });
    const doc = existing || new Result(row);
    Object.assign(doc, row, { publishedBy: req.user._id, publishedAt: new Date() });
    await doc.save();
    saved.push(doc);
  }
  await Promise.all([...new Set(rows.map((r) => String(r.student)))].map(recomputeCgpa));
  res.json({ success: true, data: saved, meta: { count: saved.length } });
});

async function recomputeCgpa(studentId) {
  const results = await Result.find({ student: studentId }).populate('subject', 'credits');
  const credits = results.reduce((sum, r) => sum + (r.subject?.credits || r.credits || 0), 0);
  const points = results.reduce((sum, r) => sum + r.gradePoint * (r.subject?.credits || r.credits || 0), 0);
  await Student.findByIdAndUpdate(studentId, { cgpa: credits ? Number((points / credits).toFixed(2)) : 0 });
}
