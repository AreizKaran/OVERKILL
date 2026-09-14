/** Routes Demo Mode requests against the in-browser dataset. */
import {
  db,
  DEMO_PASSWORD,
  byId,
  studentDTO,
  facultyDTO,
  subjectDTO,
  attendanceForStudent,
  resultsForStudent,
  assignmentsForStudent,
  assignmentsForFaculty,
  announcementsFor,
  studentDashboard,
  facultyDashboard,
  adminDashboard,
  accountFor,
  userDTO,
  profileFor,
} from './demoServer.js';

const PRESENT = new Set(['present', 'late']);

class DemoError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const ok = (data, meta) => ({ success: true, data, ...(meta ? { meta } : {}) });
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
const tokenFor = (account) => `demo.${account.id}`;

const accountFromToken = (token) => {
  if (!token?.startsWith('demo.')) throw new DemoError(401, 'Session expired — please sign in again');
  const account = accountFor(token.slice(5));
  if (!account) throw new DemoError(401, 'Account no longer exists');
  return account;
};

/** Every route: [method, pattern, handler]. Patterns use :params. */
const routes = [];
const route = (method, pattern, handler) => routes.push({ method, pattern, handler });

const match = (pattern, path) => {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i += 1) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
};

/* ------------------------------ auth ------------------------------ */
route('POST', '/auth/login', ({ body }) => {
  const email = String(body.email || '').toLowerCase().trim();
  const account = [...db.students, ...db.faculty, ...db.admins].find((a) => a.email.toLowerCase() === email);
  if (!account || body.password !== DEMO_PASSWORD) throw new DemoError(401, 'Invalid email or password');
  if (body.role && account.role !== body.role) {
    throw new DemoError(403, `This account is not registered as ${body.role}`);
  }
  return ok({
    user: { ...userDTO(account), lastLogin: new Date().toISOString() },
    profile: profileFor(account),
    accessToken: tokenFor(account),
    refreshToken: tokenFor(account),
  });
});

route('GET', '/auth/me', ({ account }) => ok({ user: userDTO(account), profile: profileFor(account) }));

route('PATCH', '/auth/me', ({ account, body }) => {
  if (body.name) account.name = body.name;
  if (body.phone !== undefined) {
    if (account.role === 'faculty') account.contact = body.phone;
    else account.phone = body.phone;
  }
  ['cabin', 'officeHours', 'bio'].forEach((key) => {
    if (body[key] !== undefined && account.role === 'faculty') account[key] = body[key];
  });
  if (body.address && account.role === 'student') account.address = { ...account.address, ...body.address };
  if (body.guardian && account.role === 'student') account.guardian = { ...account.guardian, ...body.guardian };
  return ok({ user: userDTO(account), profile: profileFor(account) });
});

route('POST', '/auth/change-password', ({ body }) => {
  if (body.currentPassword !== DEMO_PASSWORD) throw new DemoError(401, 'Current password is incorrect');
  if (!body.newPassword || body.newPassword.length < 8) {
    throw new DemoError(400, 'New password must be at least 8 characters');
  }
  return { success: true, message: 'Password updated. Demo Mode resets it on reload.' };
});

/* ---------------------------- dashboard --------------------------- */
route('GET', '/dashboard', ({ account }) => {
  if (account.role === 'student') return ok(studentDashboard(account));
  if (account.role === 'faculty') return ok(facultyDashboard(account));
  return ok(adminDashboard());
});

/* ----------------------------- people ----------------------------- */
route('GET', '/students', ({ account, query }) => {
  if (account.role === 'student') throw new DemoError(403, 'You do not have permission to view the student directory');
  let list = db.students;
  if (query.department) list = list.filter((s) => s.department === query.department);
  if (query.semester) list = list.filter((s) => s.semester === Number(query.semester));
  if (query.section) list = list.filter((s) => s.section === query.section);
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.registrationNo.toLowerCase().includes(q) ||
        s.rollNo.includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }
  return ok(list.map((s) => studentDTO(s.id)), { total: list.length });
});

route('GET', '/students/:id', ({ account, params }) => {
  if (account.role === 'student' && account.id !== params.id) throw new DemoError(403, 'Access denied');
  const student = studentDTO(params.id, { full: true });
  if (!student) throw new DemoError(404, 'Student not found');
  const attendance = attendanceForStudent(params.id);
  return ok({
    student,
    attendance,
    results: resultsForStudent(params.id),
    fee: db.fees.find((f) => f.student === params.id) || null,
  });
});

route('GET', '/faculty', ({ query }) => {
  let list = db.faculty;
  if (query.department) list = list.filter((f) => f.department === query.department);
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter(
      (f) => f.name.toLowerCase().includes(q) || f.employeeId.toLowerCase().includes(q) || f.specialization.join(' ').toLowerCase().includes(q)
    );
  }
  return ok(list.map((f) => facultyDTO(f.id, { full: true })), { total: list.length });
});

route('GET', '/faculty/:id', ({ params }) => {
  const faculty = facultyDTO(params.id, { full: true });
  if (!faculty) throw new DemoError(404, 'Faculty member not found');
  const received = db.feedback.filter((f) => f.faculty === params.id);
  return ok({
    faculty,
    feedbackCount: received.length,
    averageRating: received.length
      ? Number((received.reduce((s, f) => s + f.averageRating, 0) / received.length).toFixed(2))
      : null,
  });
});

/* ---------------------------- academics --------------------------- */
route('GET', '/academics/departments', () =>
  ok(
    db.departments.map((d) => ({
      _id: d.id,
      code: d.code,
      name: d.name,
      block: d.block,
      description: d.description,
      establishedYear: d.established,
      email: d.email,
      phone: d.phone,
      hod: d.hod ? facultyDTO(d.hod) : null,
      studentCount: db.students.filter((s) => s.department === d.id).length,
      facultyCount: db.faculty.filter((f) => f.department === d.id).length,
      subjectCount: db.subjects.filter((s) => s.department === d.id).length,
      courses: db.courses.filter((c) => c.department === d.id).map((c) => ({ _id: c.id, code: c.code, name: c.name, level: c.level, intake: c.intake })),
    }))
  )
);

route('GET', '/academics/courses', () =>
  ok(db.courses.map((c) => ({ ...c, _id: c.id, department: byId('departments', c.department) })))
);

route('GET', '/academics/subjects', ({ account, query }) => {
  let list = db.subjects;
  if (account.role === 'student') {
    list = list.filter((s) => s.department === account.department && s.semester === account.semester);
  } else if (account.role === 'faculty' && !query.department && !query.semester) {
    list = list.filter((s) => s.faculty === account.id);
  }
  if (query.department) list = list.filter((s) => s.department === query.department);
  if (query.semester) list = list.filter((s) => s.semester === Number(query.semester));
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter((s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }
  return ok(list.map((s) => subjectDTO(s.id, { withFaculty: true })));
});

route('GET', '/academics/subjects/:id', ({ params }) => {
  const subject = subjectDTO(params.id, { withFaculty: true });
  if (!subject) throw new DemoError(404, 'Subject not found');
  return ok(subject);
});

/* ---------------------------- attendance -------------------------- */
route('GET', '/attendance/me', ({ account }) => ok(attendanceForStudent(account.id)));
route('GET', '/attendance/student/:studentId', ({ account, params }) => {
  if (account.role === 'student' && account.id !== params.studentId) throw new DemoError(403, 'Access denied');
  return ok(attendanceForStudent(params.studentId));
});

route('GET', '/attendance/roster/:subjectId', ({ params, query }) => {
  const subject = byId('subjects', params.subjectId);
  if (!subject) throw new DemoError(404, 'Subject not found');
  const date = query.date || new Date().toISOString().slice(0, 10);
  const existing = db.attendance.find(
    (a) => a.subject === subject.id && a.date.slice(0, 10) === date && a.period === Number(query.period || 1)
  );
  return ok({
    subject: subjectDTO(subject.id, { withFaculty: true }),
    students: db.students
      .filter((s) => s.department === subject.department && s.semester === subject.semester)
      .map((s) => studentDTO(s.id)),
    existing: existing || null,
  });
});

route('GET', '/attendance/report/:subjectId', ({ params }) => {
  const sessions = db.attendance.filter((a) => a.subject === params.subjectId);
  const studentIds = [...new Set(sessions.flatMap((s) => s.records.map((r) => r.student)))];
  const summary = studentIds
    .map((id) => {
      let total = 0;
      let attended = 0;
      sessions.forEach((session) => {
        const record = session.records.find((r) => r.student === id);
        if (!record) return;
        total += 1;
        if (PRESENT.has(record.status)) attended += 1;
      });
      return {
        student: studentDTO(id),
        total,
        attended,
        percentage: total ? Number(((attended / total) * 100).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => a.percentage - b.percentage);

  return ok({
    subject: subjectDTO(params.subjectId, { withFaculty: true }),
    sessionCount: sessions.length,
    summary,
    belowThreshold: summary.filter((s) => s.percentage < 75).length,
    sessions: sessions
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12)
      .map((s) => ({
        id: s.id,
        date: s.date,
        topic: s.topic,
        present: s.records.filter((r) => PRESENT.has(r.status)).length,
        total: s.records.length,
      })),
  });
});

route('POST', '/attendance', ({ account, body }) => {
  const subject = byId('subjects', body.subject);
  if (!subject) throw new DemoError(404, 'Subject not found');
  if (account.role === 'faculty' && subject.faculty !== account.id) {
    throw new DemoError(403, 'You can only mark attendance for subjects assigned to you');
  }
  const date = new Date(body.date).toISOString();
  const period = Number(body.period || 1);
  const existing = db.attendance.find(
    (a) => a.subject === subject.id && a.date.slice(0, 10) === date.slice(0, 10) && a.period === period
  );
  const payload = {
    subject: subject.id,
    date,
    period,
    semester: subject.semester,
    topic: body.topic || '',
    markedBy: account.id,
    records: body.records || [],
  };

  if (existing) Object.assign(existing, payload);
  else db.attendance.push({ id: uid('att'), ...payload });

  return ok({ ...payload, saved: true });
});

/* --------------------------- assignments -------------------------- */
route('GET', '/assignments', ({ account }) => {
  if (account.role === 'student') return ok(assignmentsForStudent(account));
  if (account.role === 'faculty') return ok(assignmentsForFaculty(account.id));
  return ok(
    db.assignments.map((a) => ({
      ...a,
      _id: a.id,
      subject: subjectDTO(a.subject),
      createdBy: facultyDTO(a.createdBy),
      submitted: db.submissions.filter((s) => s.assignment === a.id).length,
      evaluated: db.submissions.filter((s) => s.assignment === a.id && s.status === 'evaluated').length,
    }))
  );
});

route('GET', '/assignments/:id', ({ account, params }) => {
  const assignment = byId('assignments', params.id);
  if (!assignment) throw new DemoError(404, 'Assignment not found');
  const all = db.submissions.filter((s) => s.assignment === assignment.id);
  const visible = account.role === 'student' ? all.filter((s) => s.student === account.id) : all;
  return ok({
    assignment: { ...assignment, _id: assignment.id, subject: subjectDTO(assignment.subject), createdBy: facultyDTO(assignment.createdBy) },
    submissions: visible.map((s) => ({ ...s, _id: s.id, student: studentDTO(s.student) })),
    classSize: db.students.filter(
      (s) => s.department === byId('subjects', assignment.subject).department && s.semester === assignment.semester
    ).length,
  });
});

route('POST', '/assignments', ({ account, body }) => {
  const subject = byId('subjects', body.subject);
  if (!subject) throw new DemoError(400, 'Please choose a subject');
  if (account.role === 'faculty' && subject.faculty !== account.id) {
    throw new DemoError(403, 'You can only create assignments for subjects assigned to you');
  }
  const assignment = {
    id: uid('asg'),
    title: body.title,
    description: body.description || '',
    subject: subject.id,
    semester: subject.semester,
    createdBy: account.role === 'faculty' ? account.id : subject.faculty,
    assignedOn: new Date().toISOString(),
    dueDate: new Date(body.dueDate).toISOString(),
    maxMarks: Number(body.maxMarks || 20),
    weightage: Number(body.weightage || 0),
    allowLateSubmission: Boolean(body.allowLateSubmission),
    status: body.status || 'published',
    attachments: [],
  };
  db.assignments.push(assignment);
  return ok(assignment);
});

route('POST', '/assignments/:id/submit', ({ account, body, params }) => {
  const assignment = byId('assignments', params.id);
  if (!assignment) throw new DemoError(404, 'Assignment not found');
  const late = new Date() > new Date(assignment.dueDate);
  if (late && !assignment.allowLateSubmission) throw new DemoError(400, 'The deadline for this assignment has passed');

  const existing = db.submissions.find((s) => s.assignment === assignment.id && s.student === account.id);
  const payload = {
    assignment: assignment.id,
    student: account.id,
    submittedAt: new Date().toISOString(),
    note: body.note || '',
    files: body.fileName ? [{ name: body.fileName, url: '#', size: body.fileSize || 0 }] : existing?.files || [],
    status: late ? 'late' : 'submitted',
  };
  if (existing) Object.assign(existing, payload);
  else db.submissions.push({ id: uid('sbm'), ...payload });

  return ok({ ...payload, _id: existing?.id });
});

route('PATCH', '/assignments/submissions/:submissionId/evaluate', ({ account, body, params }) => {
  const submission = byId('submissions', params.submissionId);
  if (!submission) throw new DemoError(404, 'Submission not found');
  const assignment = byId('assignments', submission.assignment);
  if (Number(body.marks) > assignment.maxMarks) {
    throw new DemoError(400, `Marks cannot exceed the maximum of ${assignment.maxMarks}`);
  }
  Object.assign(submission, {
    marks: Number(body.marks),
    feedback: body.feedback || '',
    status: 'evaluated',
    evaluatedBy: account.id,
    evaluatedAt: new Date().toISOString(),
  });
  return ok({ ...submission, _id: submission.id });
});

/* ------------------------ exams and results ----------------------- */
route('GET', '/exams', ({ account, query }) => {
  let list = db.exams;
  if (account.role === 'student') {
    list = list.filter((e) => e.department === account.department && e.semester === account.semester);
  } else if (account.role === 'faculty') {
    const mine = db.subjects.filter((s) => s.faculty === account.id).map((s) => s.id);
    list = list.filter((e) => mine.includes(e.subject));
  }
  if (query.type) list = list.filter((e) => e.type === query.type);
  if (query.upcoming === 'true') list = list.filter((e) => new Date(e.date) >= new Date());
  return ok(
    list
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((e) => ({ ...e, _id: e.id, subject: subjectDTO(e.subject), department: byId('departments', e.department) }))
  );
});

route('POST', '/exams', ({ body }) => {
  const subject = byId('subjects', body.subject);
  if (!subject) throw new DemoError(400, 'Please choose a subject');
  const exam = {
    id: uid('exm'),
    name: body.name,
    type: body.type || 'Sessional I',
    subject: subject.id,
    department: subject.department,
    semester: subject.semester,
    date: new Date(body.date).toISOString(),
    startTime: body.startTime || '10:00',
    durationMinutes: Number(body.durationMinutes || 90),
    room: body.room || 'TBA',
    maxMarks: Number(body.maxMarks || 30),
    instructions: body.instructions || '',
    status: 'scheduled',
  };
  db.exams.push(exam);
  return ok(exam);
});

route('GET', '/exams/results/me', ({ account }) => ok(resultsForStudent(account.id)));
route('GET', '/exams/results/student/:studentId', ({ account, params }) => {
  if (account.role === 'student' && account.id !== params.studentId) throw new DemoError(403, 'Access denied');
  return ok(resultsForStudent(params.studentId));
});

route('POST', '/exams/results', ({ body }) => {
  const existing = db.results.find(
    (r) => r.student === body.student && r.subject === body.subject && r.semester === Number(body.semester)
  );
  const internal = { ...(existing?.internal || {}), ...(body.internal || {}) };
  const totalMarks =
    (internal.sessional1 || 0) + (internal.sessional2 || 0) + (internal.assignment || 0) + (internal.attendance || 0) + Number(body.externalMarks || 0);
  const percentage = Number(((totalMarks / 100) * 100).toFixed(2));
  const grade = percentage >= 90 ? 'O' : percentage >= 80 ? 'A+' : percentage >= 70 ? 'A' : percentage >= 60 ? 'B+' : percentage >= 50 ? 'B' : percentage >= 45 ? 'C' : percentage >= 40 ? 'P' : 'F';
  const payload = {
    student: body.student,
    subject: body.subject,
    semester: Number(body.semester),
    internal,
    externalMarks: Number(body.externalMarks || 0),
    maxInternal: 40,
    maxExternal: 60,
    totalMarks,
    percentage,
    grade,
    gradePoint: db.gradePoints[grade],
    credits: byId('subjects', body.subject)?.credits || 3,
    status: grade === 'F' ? 'fail' : 'pass',
    publishedAt: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, payload);
  else db.results.push({ id: uid('res'), ...payload });
  return ok(payload);
});

/* -------------------------- announcements ------------------------- */
route('GET', '/announcements', ({ account }) => ok(announcementsFor(account.role)));

route('POST', '/announcements', ({ account, body }) => {
  const announcement = {
    id: uid('ann'),
    title: body.title,
    body: body.body,
    category: body.category || 'Academic',
    priority: body.priority || 'normal',
    audience: body.audience?.length ? body.audience : ['all'],
    pinned: Boolean(body.pinned),
    postedBy: account.id,
    postedByName: account.name,
    publishAt: new Date().toISOString(),
    expiresAt: null,
    readBy: [],
  };
  db.announcements.unshift(announcement);
  return ok({ ...announcement, _id: announcement.id, postedBy: { name: account.name, role: account.role } });
});

route('POST', '/announcements/:id/read', ({ account, params }) => {
  const announcement = byId('announcements', params.id);
  if (announcement && !announcement.readBy.includes(account.id)) announcement.readBy.push(account.id);
  return { success: true, message: 'Marked as read' };
});

/* ----------------------------- feedback --------------------------- */
route('GET', '/feedback', ({ account, query }) => {
  let list = db.feedback;
  if (account.role === 'faculty') list = list.filter((f) => f.faculty === account.id);
  else if (account.role === 'student') list = list.filter((f) => f.submittedBy === account.id);
  if (query.type) list = list.filter((f) => f.type === query.type);

  return ok(
    list
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((f) => ({
        ...f,
        _id: f.id,
        faculty: f.faculty ? facultyDTO(f.faculty) : null,
        subject: f.subject ? subjectDTO(f.subject) : null,
        department: f.department ? byId('departments', f.department) : null,
        submittedByName: f.anonymous && f.submittedBy !== account.id ? null : accountFor(f.submittedBy)?.name,
      }))
  );
});

route('POST', '/feedback', ({ account, body }) => {
  const ratings = body.ratings || {};
  const values = Object.values(ratings).filter((v) => typeof v === 'number');
  const entry = {
    id: uid('fbk'),
    type: account.role === 'student' ? 'student-to-faculty' : 'faculty-to-admin',
    submittedBy: account.id,
    faculty: body.faculty || null,
    subject: body.subject || null,
    department: account.department || null,
    semester: account.semester || null,
    academicYear: db.academicYear,
    ratings,
    averageRating: values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0,
    comment: body.comment || '',
    anonymous: body.anonymous !== false,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  db.feedback.unshift(entry);
  return ok({ ...entry, _id: entry.id });
});

route('PATCH', '/feedback/:id/status', ({ params, body }) => {
  const entry = byId('feedback', params.id);
  if (!entry) throw new DemoError(404, 'Feedback not found');
  entry.status = body.status;
  entry.adminNote = body.adminNote || entry.adminNote;
  return ok({ ...entry, _id: entry.id });
});

route('GET', '/feedback/analytics', () => {
  const grouped = new Map();
  db.feedback
    .filter((f) => f.type === 'student-to-faculty')
    .forEach((f) => {
      if (!grouped.has(f.faculty)) grouped.set(f.faculty, []);
      grouped.get(f.faculty).push(f);
    });

  const avg = (list, key) =>
    Number((list.reduce((sum, f) => sum + (f.ratings[key] || 0), 0) / list.length).toFixed(2));

  return ok(
    [...grouped.entries()]
      .map(([facultyId, list]) => ({
        faculty: facultyDTO(facultyId),
        count: list.length,
        averageRating: Number((list.reduce((sum, f) => sum + f.averageRating, 0) / list.length).toFixed(2)),
        breakdown: {
          teachingQuality: avg(list, 'teachingQuality'),
          clarity: avg(list, 'clarity'),
          punctuality: avg(list, 'punctuality'),
          supportiveness: avg(list, 'supportiveness'),
          courseContent: avg(list, 'courseContent'),
        },
        comments: list.filter((f) => f.comment).slice(0, 4).map((f) => f.comment),
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
  );
});

/* ------------------------------- fees ----------------------------- */
route('GET', '/fees', ({ account, query }) => {
  let list = db.fees;
  if (account.role === 'student') list = list.filter((f) => f.student === account.id);
  else if (query.student) list = list.filter((f) => f.student === query.student);
  if (query.status) list = list.filter((f) => f.status === query.status);

  const meta = list.reduce(
    (acc, fee) => {
      acc.billed += fee.totalAmount;
      acc.collected += fee.paidAmount;
      acc.outstanding += Math.max(fee.totalAmount - fee.paidAmount, 0);
      return acc;
    },
    { billed: 0, collected: 0, outstanding: 0 }
  );

  return ok(
    list.map((f) => ({ ...f, _id: f.id, student: studentDTO(f.student) })),
    { ...meta, count: list.length }
  );
});

route('POST', '/fees/:id/payments', ({ params, body }) => {
  const fee = byId('fees', params.id);
  if (!fee) throw new DemoError(404, 'Fee record not found');
  const amount = Number(body.amount);
  if (!amount || amount <= 0) throw new DemoError(400, 'Enter a valid payment amount');
  if (fee.paidAmount + amount > fee.totalAmount) throw new DemoError(400, 'Payment exceeds the outstanding amount');

  fee.transactions.push({
    transactionId: `TXN${Date.now()}`,
    receiptNo: `SMIT/2025/${Math.floor(Math.random() * 90000 + 10000)}`,
    amount,
    mode: body.mode || 'Net Banking',
    paidAt: new Date().toISOString(),
  });
  fee.paidAmount += amount;
  fee.status = fee.paidAmount >= fee.totalAmount ? 'paid' : 'partial';
  return ok({ ...fee, _id: fee.id, student: studentDTO(fee.student) });
});

/* -------------------------- notifications ------------------------- */
route('GET', '/notifications', ({ account }) => {
  const list = db.notifications
    .filter((n) => n.user === account.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((n) => ({ ...n, _id: n.id }));
  return ok(list, { unread: list.filter((n) => !n.read).length });
});

route('PATCH', '/notifications/:id/read', ({ params }) => {
  const item = byId('notifications', params.id);
  if (item) item.read = true;
  return ok(item ? { ...item, _id: item.id } : null);
});

route('POST', '/notifications/read-all', ({ account }) => {
  db.notifications.filter((n) => n.user === account.id).forEach((n) => { n.read = true; });
  return { success: true, message: 'All notifications marked as read' };
});

route('DELETE', '/notifications/:id', ({ params }) => {
  const index = db.notifications.findIndex((n) => n.id === params.id);
  if (index >= 0) db.notifications.splice(index, 1);
  return { success: true, message: 'Notification removed' };
});

/* ------------------------ user administration --------------------- */
route('GET', '/admin/users', ({ query }) => {
  let list = [...db.admins, ...db.faculty, ...db.students].map((a) => ({
    ...userDTO(a),
    _id: a.id,
    detail: a.role === 'student' ? a.registrationNo : a.role === 'faculty' ? a.employeeId : a.designation,
    department: a.department ? byId('departments', a.department)?.code : '—',
  }));
  if (query.role) list = list.filter((u) => u.role === query.role);
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  return ok(list, { total: list.length });
});

route('PATCH', '/admin/users/:id/status', ({ params, body }) => {
  const account = accountFor(params.id);
  if (!account) throw new DemoError(404, 'User not found');
  account.isActive = Boolean(body.isActive);
  return ok({ ...userDTO(account), isActive: account.isActive });
});

/* ------------------------------------------------------------------ */
export async function demoRequest(path, { method = 'GET', body, token } = {}) {
  const [rawPath, search = ''] = path.split('?');
  const query = Object.fromEntries(new URLSearchParams(search));

  for (const entry of routes) {
    if (entry.method !== method) continue;
    const params = match(entry.pattern, rawPath);
    if (!params) continue;

    const isPublic = rawPath === '/auth/login';
    const account = isPublic ? null : accountFromToken(token);
    return entry.handler({ account, params, query, body: body || {} });
  }

  throw new DemoError(404, `Demo Mode does not implement ${method} ${rawPath}`);
}

export { DemoError };
