/**
 * Demo Mode back end.
 *
 * Implements the same routes and response shapes as the Express API against an
 * in-browser dataset, so every page is written once and works unchanged whether
 * the portal is pointed at a live server or running self-contained.
 */
import { buildDataset } from './buildDataset.js';

const db = buildDataset();
const DEMO_PASSWORD = 'Portal@123';
const PRESENT = new Set(['present', 'late']);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */
const byId = (collection, id) => db[collection].find((item) => item.id === id) || null;
const dept = (id) => {
  const d = byId('departments', id);
  return d ? { _id: d.id, code: d.code, name: d.name } : null;
};
const courseRef = (id) => {
  const c = db.courses.find((x) => x.id === id);
  return c ? { _id: c.id, code: c.code, name: c.name } : null;
};

const facultyDTO = (id, { full = false } = {}) => {
  const f = byId('faculty', id);
  if (!f) return null;
  const base = {
    _id: f.id,
    employeeId: f.employeeId,
    designation: f.designation,
    cabin: f.cabin,
    block: f.block,
    officialEmail: f.officialEmail,
    officeHours: f.officeHours,
    contact: f.contact,
    department: dept(f.department),
    user: { _id: f.id, name: f.name, email: f.email, avatar: '', phone: f.contact, role: 'faculty' },
    initials: f.initials,
  };
  if (!full) return base;
  return {
    ...base,
    qualification: f.qualification,
    specialization: f.specialization,
    experienceYears: f.experienceYears,
    joiningDate: f.joiningDate,
    bio: f.bio,
    status: f.status,
    subjects: db.subjects.filter((s) => s.faculty === f.id).map((s) => subjectDTO(s.id)),
  };
};

const subjectDTO = (id, { withFaculty = false } = {}) => {
  const s = byId('subjects', id);
  if (!s) return null;
  return {
    _id: s.id,
    code: s.code,
    name: s.name,
    semester: s.semester,
    credits: s.credits,
    type: s.type,
    schedule: s.schedule,
    description: s.description,
    department: dept(s.department),
    ...(withFaculty ? { faculty: facultyDTO(s.faculty) } : { faculty: s.faculty }),
  };
};

const studentDTO = (id, { full = false } = {}) => {
  const s = byId('students', id);
  if (!s) return null;
  const base = {
    _id: s.id,
    registrationNo: s.registrationNo,
    rollNo: s.rollNo,
    semester: s.semester,
    section: s.section,
    batch: s.batch,
    cgpa: s.cgpa,
    status: s.status,
    department: dept(s.department),
    course: courseRef(s.course),
    user: { _id: s.id, name: s.name, email: s.email, avatar: '', phone: s.phone, role: 'student' },
    initials: s.initials,
  };
  if (!full) return base;
  return {
    ...base,
    admissionYear: s.admissionYear,
    dateOfBirth: s.dateOfBirth,
    gender: s.gender,
    bloodGroup: s.bloodGroup,
    category: s.category,
    hostel: s.hostel,
    address: s.address,
    guardian: s.guardian,
    mentor: facultyDTO(s.mentor),
  };
};

const accountFor = (id) => byId('students', id) || byId('faculty', id) || byId('admins', id);

const userDTO = (account) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  role: account.role,
  phone: account.phone || account.contact || '',
  avatar: '',
  isActive: true,
});

const profileFor = (account) => {
  if (account.role === 'student') return studentDTO(account.id, { full: true });
  if (account.role === 'faculty') return facultyDTO(account.id, { full: true });
  return null;
};

/* ------------------------------------------------------------------ */
/* Derived academic calculations                                       */
/* ------------------------------------------------------------------ */
function attendanceForStudent(studentId) {
  const bySubject = new Map();
  const timeline = [];

  db.attendance.forEach((session) => {
    const record = session.records.find((r) => r.student === studentId);
    if (!record) return;
    if (!bySubject.has(session.subject)) {
      bySubject.set(session.subject, { subject: subjectDTO(session.subject), total: 0, attended: 0, absent: 0, late: 0 });
    }
    const entry = bySubject.get(session.subject);
    entry.total += 1;
    if (PRESENT.has(record.status)) entry.attended += 1;
    else entry.absent += 1;
    if (record.status === 'late') entry.late += 1;

    timeline.push({
      date: session.date,
      subject: entry.subject.code,
      subjectName: entry.subject.name,
      status: record.status,
      topic: session.topic,
    });
  });

  const subjects = [...bySubject.values()].map((entry) => ({
    ...entry,
    percentage: entry.total ? Number(((entry.attended / entry.total) * 100).toFixed(1)) : 0,
  }));
  const total = subjects.reduce((sum, s) => sum + s.total, 0);
  const attended = subjects.reduce((sum, s) => sum + s.attended, 0);

  return {
    overall: {
      total,
      attended,
      percentage: total ? Number(((attended / total) * 100).toFixed(1)) : 0,
      shortage: total ? attended / total < 0.75 : false,
    },
    subjects,
    timeline: timeline.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 60),
  };
}

function resultsForStudent(studentId) {
  const rows = db.results.filter((r) => r.student === studentId);
  const semesters = [...new Set(rows.map((r) => r.semester))].sort().map((semester) => {
    const list = rows.filter((r) => r.semester === semester).map((r) => ({ ...r, subject: subjectDTO(r.subject) }));
    const graded = list.filter((r) => r.status !== 'pending');
    const credits = graded.reduce((sum, r) => sum + r.credits, 0);
    const points = graded.reduce((sum, r) => sum + r.gradePoint * r.credits, 0);
    return {
      semester,
      results: list,
      credits,
      sgpa: credits ? Number((points / credits).toFixed(2)) : 0,
      backlogs: list.filter((r) => r.status === 'fail').length,
      published: graded.length > 0,
    };
  });

  const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
  const cgpa = totalCredits
    ? Number((semesters.reduce((sum, s) => sum + s.sgpa * s.credits, 0) / totalCredits).toFixed(2))
    : 0;

  return { semesters, cgpa, totalCredits, backlogs: semesters.reduce((s, x) => s + x.backlogs, 0) };
}

function assignmentsForStudent(student) {
  const subjectIds = db.subjects
    .filter((s) => s.department === student.department && s.semester === student.semester)
    .map((s) => s.id);

  return db.assignments
    .filter((a) => subjectIds.includes(a.subject))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map((a) => ({
      ...a,
      _id: a.id,
      subject: subjectDTO(a.subject),
      createdBy: facultyDTO(a.createdBy),
      submission: db.submissions.find((s) => s.assignment === a.id && s.student === student.id) || null,
    }));
}

function assignmentsForFaculty(facultyId) {
  return db.assignments
    .filter((a) => a.createdBy === facultyId)
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
    .map((a) => {
      const subs = db.submissions.filter((s) => s.assignment === a.id);
      return {
        ...a,
        _id: a.id,
        subject: subjectDTO(a.subject),
        createdBy: facultyDTO(a.createdBy),
        submitted: subs.length,
        evaluated: subs.filter((s) => s.status === 'evaluated').length,
        classSize: db.students.filter(
          (s) => s.department === byId('subjects', a.subject).department && s.semester === a.semester
        ).length,
      };
    });
}

function announcementsFor(role) {
  return db.announcements
    .filter((a) => role === 'admin' || a.audience.includes(role) || a.audience.includes('all'))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.publishAt) - new Date(a.publishAt))
    .map((a) => ({ ...a, _id: a.id, postedBy: { name: a.postedByName, role: 'admin' } }));
}

/* ------------------------------------------------------------------ */
/* Dashboards                                                          */
/* ------------------------------------------------------------------ */
function studentDashboard(student) {
  const attendance = attendanceForStudent(student.id);
  const assignments = assignmentsForStudent(student);
  const now = new Date();
  const perf = resultsForStudent(student.id);
  const fee = db.fees.find((f) => f.student === student.id);

  return {
    role: 'student',
    attendance: {
      percentage: attendance.overall.percentage,
      attended: attendance.overall.attended,
      total: attendance.overall.total,
      bySubject: attendance.subjects.map((s) => ({
        code: s.subject.code,
        name: s.subject.name,
        total: s.total,
        attended: s.attended,
        percentage: s.percentage,
      })),
      shortageSubjects: attendance.subjects.filter((s) => s.percentage < 75).map((s) => s.subject.code),
    },
    assignments: {
      pending: assignments.filter((a) => !a.submission && new Date(a.dueDate) >= now).length,
      overdue: assignments.filter((a) => !a.submission && new Date(a.dueDate) < now).length,
      submitted: assignments.filter((a) => a.submission).length,
      upcoming: assignments
        .filter((a) => new Date(a.dueDate) >= now)
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          title: a.title,
          subject: a.subject.code,
          dueDate: a.dueDate,
          maxMarks: a.maxMarks,
          submitted: Boolean(a.submission),
        })),
    },
    performance: {
      cgpa: perf.cgpa,
      credits: perf.totalCredits,
      backlogs: perf.backlogs,
      semesters: perf.semesters.filter((s) => s.published).map((s) => ({ semester: s.semester, sgpa: s.sgpa })),
      bySubject: db.results
        .filter((r) => r.student === student.id && r.semester === student.semester)
        .map((r) => ({
          code: subjectDTO(r.subject).code,
          percentage: Number((((r.internal.sessional1 + r.internal.assignment + r.internal.attendance) / 25) * 100).toFixed(1)),
          grade: r.grade,
          total: r.totalMarks,
        })),
    },
    exams: db.exams
      .filter((e) => e.department === student.department && e.semester === student.semester && new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
      .map((e) => ({ ...e, _id: e.id, subject: subjectDTO(e.subject) })),
    announcements: announcementsFor('student').slice(0, 5),
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

function facultyDashboard(member) {
  const subjects = db.subjects.filter((s) => s.faculty === member.id);
  const today = DAYS[new Date().getDay()];
  const assignments = assignmentsForFaculty(member.id);
  const received = db.feedback.filter((f) => f.faculty === member.id);

  const classStrength = subjects.map((subject) => ({
    subject: subject.code,
    name: subject.name,
    semester: subject.semester,
    students: db.students.filter((s) => s.department === subject.department && s.semester === subject.semester).length,
  }));

  const attendanceTrend = subjects.map((subject) => {
    const sessions = db.attendance.filter((a) => a.subject === subject.id);
    const marks = sessions.flatMap((s) => s.records);
    const present = marks.filter((r) => PRESENT.has(r.status)).length;
    return {
      subject: subject.code,
      sessions: sessions.length,
      percentage: marks.length ? Number(((present / marks.length) * 100).toFixed(1)) : 0,
    };
  });

  const recentSubmissions = db.submissions
    .filter((s) => assignments.some((a) => a.id === s.assignment))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 8)
    .map((s) => ({
      ...s,
      _id: s.id,
      student: studentDTO(s.student),
      assignment: { title: byId('assignments', s.assignment)?.title, maxMarks: byId('assignments', s.assignment)?.maxMarks },
    }));

  return {
    role: 'faculty',
    profile: {
      employeeId: member.employeeId,
      designation: member.designation,
      cabin: member.cabin,
      block: member.block,
      officialEmail: member.officialEmail,
      officeHours: member.officeHours,
      contact: member.contact,
    },
    stats: {
      subjects: subjects.length,
      students: new Set(
        subjects.flatMap((subject) =>
          db.students
            .filter((s) => s.department === subject.department && s.semester === subject.semester)
            .map((s) => s.id)
        )
      ).size,
      pendingEvaluations: db.submissions.filter(
        (s) => assignments.some((a) => a.id === s.assignment) && s.status !== 'evaluated'
      ).length,
      averageRating: received.length
        ? Number((received.reduce((sum, f) => sum + f.averageRating, 0) / received.length).toFixed(2))
        : null,
    },
    todayClasses: subjects
      .flatMap((subject) =>
        subject.schedule
          .filter((slot) => slot.day === today)
          .map((slot) => ({
            subject: subject.code,
            subjectId: subject.id,
            name: subject.name,
            semester: subject.semester,
            startTime: slot.startTime,
            endTime: slot.endTime,
            room: slot.room,
          }))
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    subjects: subjects.map((s) => subjectDTO(s.id)),
    classStrength,
    attendanceTrend,
    assignments: assignments.slice(0, 5),
    recentSubmissions,
    feedback: received
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((f) => ({ ...f, _id: f.id, subject: subjectDTO(f.subject) })),
    announcements: announcementsFor('faculty').slice(0, 4),
  };
}

function adminDashboard() {
  const marks = db.attendance.flatMap((s) => s.records);
  const present = marks.filter((r) => PRESENT.has(r.status)).length;
  const graded = db.results.filter((r) => r.status !== 'pending');

  const byDepartment = db.departments.map((d) => {
    const list = db.students.filter((s) => s.department === d.id);
    return {
      code: d.code,
      name: d.name,
      students: list.length,
      faculty: db.faculty.filter((f) => f.department === d.id).length,
      avgCgpa: list.length ? Number((list.reduce((sum, s) => sum + s.cgpa, 0) / list.length).toFixed(2)) : 0,
    };
  });

  const finance = db.fees.reduce(
    (acc, fee) => {
      acc.billed += fee.totalAmount;
      acc.collected += fee.paidAmount;
      acc.outstanding += Math.max(fee.totalAmount - fee.paidAmount, 0);
      if (fee.status === 'overdue') acc.overdueCount += 1;
      return acc;
    },
    { billed: 0, collected: 0, outstanding: 0, overdueCount: 0 }
  );

  const studentFeedback = db.feedback.filter((f) => f.type === 'student-to-faculty');

  // Attendance by week, oldest first — powers the trend chart.
  const weeks = [...Array(8)].map((_, i) => {
    const end = Date.now() - i * 7 * 86400000;
    const start = end - 7 * 86400000;
    const sessions = db.attendance.filter((s) => {
      const t = new Date(s.date).getTime();
      return t > start && t <= end;
    });
    const records = sessions.flatMap((s) => s.records);
    const attended = records.filter((r) => PRESENT.has(r.status)).length;
    return {
      label: `W-${i}`,
      percentage: records.length ? Number(((attended / records.length) * 100).toFixed(1)) : null,
    };
  });

  return {
    role: 'admin',
    stats: {
      students: db.students.length,
      faculty: db.faculty.length,
      departments: db.departments.length,
      subjects: db.subjects.length,
      courses: db.courses.length,
      attendancePercentage: marks.length ? Number(((present / marks.length) * 100).toFixed(1)) : 0,
      averageCgpa: Number((db.students.reduce((s, x) => s + x.cgpa, 0) / db.students.length).toFixed(2)),
      passRate: graded.length
        ? Number(((graded.filter((r) => r.status === 'pass').length / graded.length) * 100).toFixed(1))
        : 0,
      feedbackCount: studentFeedback.length,
      averageFeedback: studentFeedback.length
        ? Number((studentFeedback.reduce((s, f) => s + f.averageRating, 0) / studentFeedback.length).toFixed(2))
        : 0,
      hostelResidents: db.students.filter((s) => s.hostel?.resident).length,
    },
    byDepartment,
    gradeDistribution: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'].map((grade) => ({
      grade,
      count: graded.filter((r) => r.grade === grade).length,
    })),
    attendanceTrend: weeks.filter((w) => w.percentage !== null).reverse(),
    finance,
    semesterDistribution: [...Array(8)].map((_, i) => ({
      semester: `Sem ${i + 1}`,
      students: db.students.filter((s) => s.semester === i + 1).length,
    })).filter((s) => s.students > 0),
    recentActivity: buildActivityFeed(),
    announcements: announcementsFor('admin').slice(0, 5),
  };
}

function buildActivityFeed() {
  const items = [];
  db.submissions
    .slice()
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 4)
    .forEach((s) =>
      items.push({
        id: `act-sub-${s.id}`,
        type: 'assignment',
        title: `${byId('students', s.student)?.name} submitted "${byId('assignments', s.assignment)?.title}"`,
        at: s.submittedAt,
      })
    );
  db.fees
    .flatMap((f) => f.transactions.map((t) => ({ ...t, student: f.student })))
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
    .slice(0, 3)
    .forEach((t) =>
      items.push({
        id: `act-fee-${t.transactionId}`,
        type: 'fee',
        title: `Fee payment of ₹${t.amount.toLocaleString('en-IN')} received from ${byId('students', t.student)?.name}`,
        at: t.paidAt,
      })
    );
  db.announcements.slice(0, 3).forEach((a) =>
    items.push({ id: `act-ann-${a.id}`, type: 'announcement', title: `Notice published — ${a.title}`, at: a.publishAt })
  );
  db.attendance
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
    .forEach((s) =>
      items.push({
        id: `act-att-${s.id}`,
        type: 'attendance',
        title: `Attendance marked for ${subjectDTO(s.subject)?.code} by ${byId('faculty', s.markedBy)?.name}`,
        at: s.date,
      })
    );

  return items.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 10);
}

export { db, DEMO_PASSWORD, byId, studentDTO, facultyDTO, subjectDTO, attendanceForStudent, resultsForStudent, assignmentsForStudent, assignmentsForFaculty, announcementsFor, studentDashboard, facultyDashboard, adminDashboard, accountFor, userDTO, profileFor, dept };
