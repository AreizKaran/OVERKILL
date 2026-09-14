import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Announcement from '../models/Announcement.js';
import Feedback from '../models/Feedback.js';
import Fee from '../models/Fee.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const PRESENT = new Set(['present', 'late']);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getDashboard = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') return res.json({ success: true, data: await studentDashboard(req) });
  if (req.user.role === 'faculty') return res.json({ success: true, data: await facultyDashboard(req) });
  return res.json({ success: true, data: await adminDashboard() });
});

async function studentDashboard(req) {
  const student = req.profile;
  if (!student) throw ApiError.notFound('Student profile not found');

  const subjects = await Subject.find({ department: student.department, semester: student.semester });
  const subjectIds = subjects.map((s) => s._id);

  const [sessions, assignments, submissions, exams, results, announcements, fee] = await Promise.all([
    Attendance.find({ 'records.student': student._id }).populate('subject', 'code name'),
    Assignment.find({ subject: { $in: subjectIds }, status: 'published' }).populate('subject', 'code name').sort({ dueDate: 1 }),
    Submission.find({ student: student._id }),
    Exam.find({ department: student.department, semester: student.semester, date: { $gte: new Date() } })
      .populate('subject', 'code name')
      .sort({ date: 1 })
      .limit(5),
    Result.find({ student: student._id }).populate('subject', 'code name credits'),
    Announcement.find({ audience: { $in: ['student', 'all'] }, publishAt: { $lte: new Date() } })
      .populate('postedBy', 'name role')
      .sort({ pinned: -1, publishAt: -1 })
      .limit(5),
    Fee.findOne({ student: student._id }).sort({ semester: -1 }),
  ]);

  const attendanceBySubject = subjects.map((subject) => {
    const subjectSessions = sessions.filter((s) => String(s.subject?._id) === String(subject._id));
    const total = subjectSessions.length;
    const attended = subjectSessions.filter((s) =>
      PRESENT.has(s.records.find((r) => String(r.student) === String(student._id))?.status)
    ).length;
    return {
      code: subject.code,
      name: subject.name,
      total,
      attended,
      percentage: total ? Number(((attended / total) * 100).toFixed(1)) : 0,
    };
  });

  const totalSessions = attendanceBySubject.reduce((s, x) => s + x.total, 0);
  const totalAttended = attendanceBySubject.reduce((s, x) => s + x.attended, 0);
  const submittedIds = new Set(submissions.map((s) => String(s.assignment)));

  const credits = results.reduce((sum, r) => sum + (r.subject?.credits || 0), 0);
  const points = results.reduce((sum, r) => sum + r.gradePoint * (r.subject?.credits || 0), 0);

  return {
    role: 'student',
    attendance: {
      percentage: totalSessions ? Number(((totalAttended / totalSessions) * 100).toFixed(1)) : 0,
      attended: totalAttended,
      total: totalSessions,
      bySubject: attendanceBySubject,
      shortageSubjects: attendanceBySubject.filter((s) => s.total > 0 && s.percentage < 75).map((s) => s.code),
    },
    assignments: {
      pending: assignments.filter((a) => !submittedIds.has(String(a._id)) && new Date(a.dueDate) >= new Date()).length,
      overdue: assignments.filter((a) => !submittedIds.has(String(a._id)) && new Date(a.dueDate) < new Date()).length,
      submitted: submissions.length,
      upcoming: assignments
        .filter((a) => new Date(a.dueDate) >= new Date())
        .slice(0, 5)
        .map((a) => ({
          id: a._id,
          title: a.title,
          subject: a.subject?.code,
          dueDate: a.dueDate,
          maxMarks: a.maxMarks,
          submitted: submittedIds.has(String(a._id)),
        })),
    },
    performance: {
      cgpa: credits ? Number((points / credits).toFixed(2)) : 0,
      credits,
      backlogs: results.filter((r) => r.status === 'fail').length,
      bySubject: results.map((r) => ({
        code: r.subject?.code,
        percentage: r.percentage,
        grade: r.grade,
        total: r.totalMarks,
      })),
    },
    exams,
    announcements,
    fee: fee
      ? {
          semester: fee.semester,
          totalAmount: fee.totalAmount,
          paidAmount: fee.paidAmount,
          outstanding: Math.max(fee.totalAmount - fee.paidAmount, 0),
          dueDate: fee.dueDate,
          status: fee.status,
        }
      : null,
  };
}

async function facultyDashboard(req) {
  const faculty = req.profile;
  if (!faculty) throw ApiError.notFound('Faculty profile not found');

  const subjects = await Subject.find({ faculty: faculty._id }).populate('department', 'code name');
  const subjectIds = subjects.map((s) => s._id);
  const today = DAYS[new Date().getDay()];

  const [assignments, sessions, feedback, announcements] = await Promise.all([
    Assignment.find({ createdBy: faculty._id }).populate('subject', 'code name').sort({ dueDate: 1 }),
    Attendance.find({ subject: { $in: subjectIds } }).sort({ date: -1 }).limit(200),
    Feedback.find({ faculty: faculty._id, type: 'student-to-faculty' }).sort({ createdAt: -1 }),
    Announcement.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).limit(5),
  ]);

  const submissions = await Submission.find({ assignment: { $in: assignments.map((a) => a._id) } })
    .populate({ path: 'student', select: 'rollNo', populate: { path: 'user', select: 'name avatar' } })
    .populate('assignment', 'title maxMarks')
    .sort({ submittedAt: -1 })
    .limit(8);

  const classStrength = await Promise.all(
    subjects.map(async (subject) => ({
      subject: subject.code,
      name: subject.name,
      semester: subject.semester,
      students: await Student.countDocuments({ department: subject.department, semester: subject.semester, status: 'Active' }),
    }))
  );

  // A student enrolled in two of this faculty's subjects is one student, not two.
  const distinctStudents = await Student.countDocuments({
    status: 'Active',
    $or: subjects.length
      ? subjects.map((s) => ({ department: s.department, semester: s.semester }))
      : [{ _id: null }],
  });

  const attendanceTrend = subjects.map((subject) => {
    const subjectSessions = sessions.filter((s) => String(s.subject) === String(subject._id));
    const marks = subjectSessions.flatMap((s) => s.records);
    const present = marks.filter((r) => PRESENT.has(r.status)).length;
    return {
      subject: subject.code,
      sessions: subjectSessions.length,
      percentage: marks.length ? Number(((present / marks.length) * 100).toFixed(1)) : 0,
    };
  });

  return {
    role: 'faculty',
    profile: {
      employeeId: faculty.employeeId,
      designation: faculty.designation,
      cabin: faculty.cabin,
      officialEmail: faculty.officialEmail,
      officeHours: faculty.officeHours,
    },
    stats: {
      subjects: subjects.length,
      students: distinctStudents,
      pendingEvaluations: await Submission.countDocuments({
        assignment: { $in: assignments.map((a) => a._id) },
        status: { $in: ['submitted', 'late'] },
      }),
      averageRating: feedback.length
        ? Number((feedback.reduce((s, f) => s + f.averageRating, 0) / feedback.length).toFixed(2))
        : null,
    },
    todayClasses: subjects.flatMap((subject) =>
      (subject.schedule || [])
        .filter((slot) => slot.day === today)
        .map((slot) => ({
          subject: subject.code,
          name: subject.name,
          semester: subject.semester,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room,
        }))
        .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
    ),
    subjects,
    classStrength,
    attendanceTrend,
    assignments: assignments.slice(0, 5),
    recentSubmissions: submissions,
    feedback: feedback.slice(0, 5),
    announcements,
  };
}

async function adminDashboard() {
  const [students, faculty, departments, subjects, sessions, results, fees, feedback, announcements] =
    await Promise.all([
      Student.find({ status: 'Active' }).populate('department', 'code name'),
      Faculty.find({ status: 'Active' }).populate('department', 'code name'),
      Department.find(),
      Subject.countDocuments(),
      Attendance.find().sort({ date: -1 }).limit(500),
      Result.find(),
      Fee.find(),
      Feedback.find({ type: 'student-to-faculty' }),
      Announcement.find().populate('postedBy', 'name role').sort({ createdAt: -1 }).limit(6),
    ]);

  const allMarks = sessions.flatMap((s) => s.records);
  const presentMarks = allMarks.filter((r) => PRESENT.has(r.status)).length;

  const byDepartment = departments.map((dept) => {
    const deptStudents = students.filter((s) => String(s.department?._id) === String(dept._id));
    const avgCgpa = deptStudents.length
      ? Number((deptStudents.reduce((sum, s) => sum + (s.cgpa || 0), 0) / deptStudents.length).toFixed(2))
      : 0;
    return {
      code: dept.code,
      name: dept.name,
      students: deptStudents.length,
      faculty: faculty.filter((f) => String(f.department?._id) === String(dept._id)).length,
      avgCgpa,
    };
  });

  const gradeDistribution = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'].map((grade) => ({
    grade,
    count: results.filter((r) => r.grade === grade).length,
  }));

  const finance = fees.reduce(
    (acc, fee) => {
      acc.billed += fee.totalAmount;
      acc.collected += fee.paidAmount;
      acc.outstanding += Math.max(fee.totalAmount - fee.paidAmount, 0);
      if (fee.status === 'overdue') acc.overdueCount += 1;
      return acc;
    },
    { billed: 0, collected: 0, outstanding: 0, overdueCount: 0 }
  );

  return {
    role: 'admin',
    stats: {
      students: students.length,
      faculty: faculty.length,
      departments: departments.length,
      subjects,
      attendancePercentage: allMarks.length ? Number(((presentMarks / allMarks.length) * 100).toFixed(1)) : 0,
      averageCgpa: students.length
        ? Number((students.reduce((s, x) => s + (x.cgpa || 0), 0) / students.length).toFixed(2))
        : 0,
      passRate: results.length
        ? Number(((results.filter((r) => r.status === 'pass').length / results.length) * 100).toFixed(1))
        : 0,
      feedbackCount: feedback.length,
      averageFeedback: feedback.length
        ? Number((feedback.reduce((s, f) => s + f.averageRating, 0) / feedback.length).toFixed(2))
        : 0,
    },
    byDepartment,
    gradeDistribution,
    finance,
    semesterDistribution: [...Array(8)].map((_, i) => ({
      semester: i + 1,
      students: students.filter((s) => s.semester === i + 1).length,
    })),
    announcements,
  };
}
