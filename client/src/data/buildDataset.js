/**
 * Builds the complete in-browser academic dataset that powers Demo Mode.
 * Everything is derived from a deterministic PRNG so the portal looks identical
 * on every reload while still containing a realistic, messy academic year.
 */
import {
  DEPARTMENTS,
  COURSES,
  SUBJECTS,
  FACULTY,
  STUDENT_NAMES,
  ANNOUNCEMENTS,
  ASSIGNMENT_TEMPLATES,
  FEE_HEADS,
  HOSTEL_FEE,
  FEEDBACK_COMMENTS,
  DAYS,
  SLOTS,
} from './reference.js';

const DAY = 86400000;
export const ACADEMIC_YEAR = '2025-26';

const makeRandom = (seed) => () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

export function buildDataset() {
  const rand = makeRandom(20260914);
  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = (arr) => arr[randInt(0, arr.length - 1)];
  const chance = (p) => rand() < p;

  const now = Date.now();
  const daysAgo = (n) => new Date(now - n * DAY).toISOString();
  const daysAhead = (n) => new Date(now + n * DAY).toISOString();
  const slug = (name) => name.toLowerCase().replace(/^(dr|prof)\.?\s+/, '').replace(/[^a-z]+/g, '.');

  /* ---------------- Faculty ---------------- */
  const faculty = FACULTY.map((member) => {
    const department = DEPARTMENTS.find((d) => d.id === member.department);
    const email = `${slug(member.name)}@smit.smu.edu.in`;
    return {
      ...member,
      role: 'faculty',
      email,
      officialEmail: email,
      block: department.block,
      contact: `+91 3592 24${randInt(1000, 9999)}`,
      officeHours: 'Mon–Fri · 15:00–17:00',
      joiningDate: daysAgo(member.experienceYears * 365),
      isMentor: true,
      status: 'Active',
      bio: `${member.name} teaches at the Department of ${department.name}, SMIT, with research interests in ${member.specialization.join(', ').toLowerCase()}.`,
      initials: member.name.replace(/^(Dr|Prof)\.?\s+/, '').split(' ').map((w) => w[0]).join('').slice(0, 2),
    };
  });

  const departments = DEPARTMENTS.map((dept) => ({
    ...dept,
    hod: faculty.find((f) => f.department === dept.id && f.designation === 'HOD')?.id ?? null,
    email: `hod.${dept.code.toLowerCase()}@smit.smu.edu.in`,
    phone: `+91 3592 24${randInt(1000, 9999)}`,
  }));

  /* ---------------- Subjects & timetable ---------------- */
  const subjects = SUBJECTS.map((subject, index) => {
    const sessionsPerWeek = subject.type === 'Lab' ? 1 : Math.min(subject.credits, 3);
    const schedule = [];
    for (let i = 0; i < sessionsPerWeek; i += 1) {
      const [startTime, endTime] = SLOTS[(index * 2 + i) % SLOTS.length];
      schedule.push({
        day: DAYS[(index + i * 2) % DAYS.length],
        startTime,
        endTime,
        room: subject.type === 'Lab' ? `Lab ${randInt(1, 6)}` : `${DEPARTMENTS.find((d) => d.id === subject.department).code}-${randInt(101, 310)}`,
      });
    }
    return { ...subject, schedule, syllabusUrl: '#' };
  });

  /* ---------------- Students ---------------- */
  const cseFaculty = faculty.filter((f) => f.department === 'dep-cse');
  const students = STUDENT_NAMES.map((name, index) => {
    const inCohort = index < 24; // the CSE semester-5 demo cohort
    const department = inCohort ? 'dep-cse' : DEPARTMENTS[index % DEPARTMENTS.length].id;
    const deptCode = DEPARTMENTS.find((d) => d.id === department).code;
    const semester = inCohort ? 5 : pick([3, 5]);
    const admissionYear = 2023;
    const resident = index % 3 === 0;

    return {
      id: `stu-${index + 1}`,
      role: 'student',
      name,
      email: `${slug(name)}${admissionYear}@smit.smu.edu.in`,
      phone: `+91 8${randInt(100000000, 999999999)}`,
      registrationNo: `${admissionYear}${deptCode}${String(index + 101).padStart(4, '0')}`,
      rollNo: String(index + 1).padStart(3, '0'),
      department,
      course: COURSES.find((c) => c.department === department && c.level === 'UG').id,
      semester,
      section: index % 2 === 0 ? 'A' : 'B',
      batch: `${admissionYear}–${admissionYear + 4}`,
      admissionYear,
      dateOfBirth: new Date(2005, index % 12, (index % 27) + 1).toISOString(),
      gender: index % 3 === 0 ? 'Female' : 'Male',
      bloodGroup: pick(['A+', 'B+', 'O+', 'AB+', 'O-']),
      category: pick(['General', 'OBC', 'SC', 'ST']),
      hostel: resident
        ? { resident: true, block: pick(['Kanchenjunga', 'Teesta', 'Rangit']), roomNo: `${randInt(1, 4)}0${randInt(1, 9)}` }
        : { resident: false },
      address: {
        line1: `House ${randInt(1, 200)}, ${pick(['MG Marg', 'Tadong', 'Ranipool', 'Development Area'])}`,
        city: pick(['Gangtok', 'Namchi', 'Siliguri', 'Kalimpong', 'Darjeeling']),
        state: pick(['Sikkim', 'West Bengal', 'Assam']),
        pincode: `73${randInt(7101, 7139)}`,
        country: 'India',
      },
      guardian: {
        name: `${name.split(' ')[1] || 'Kumar'} ${pick(['Pradhan', 'Rai', 'Sharma', 'Bhutia'])}`,
        relation: index % 2 ? 'Father' : 'Mother',
        phone: `+91 9${randInt(100000000, 999999999)}`,
        email: `guardian.${slug(name)}@example.com`,
        occupation: pick(['Government Service', 'Business', 'Teacher', 'Agriculture', 'Engineer']),
      },
      mentor: cseFaculty[index % cseFaculty.length].id,
      status: 'Active',
      ability: 0.5 + rand() * 0.4, // hidden baseline used to generate coherent marks
      cgpa: 0,
      initials: name.split(' ').map((w) => w[0]).join('').slice(0, 2),
    };
  });

  const cohort = students.filter((s) => s.department === 'dep-cse' && s.semester === 5);
  const cohortIds = new Set(cohort.map((s) => s.id));
  const cseSem5 = subjects.filter((s) => s.department === 'dep-cse' && s.semester === 5);
  const cseSem3 = subjects.filter((s) => s.department === 'dep-cse' && s.semester === 3);

  /* ---------------- Attendance (last 9 weeks) ---------------- */
  const attendance = [];
  let sessionId = 0;
  for (const subject of cseSem5) {
    for (let week = 9; week >= 1; week -= 1) {
      for (const slot of subject.schedule) {
        sessionId += 1;
        const offset = week * 7 - DAYS.indexOf(slot.day);
        if (offset < 0) continue;
        attendance.push({
          id: `att-${sessionId}`,
          subject: subject.id,
          date: daysAgo(offset),
          period: SLOTS.findIndex(([start]) => start === slot.startTime) + 1,
          semester: subject.semester,
          topic: `Unit ${randInt(1, 5)} — lecture ${randInt(1, 12)}`,
          markedBy: subject.faculty,
          records: cohort.map((student) => {
            const base = Number(student.rollNo) % 7 === 0 ? 0.6 : 0.9;
            return {
              student: student.id,
              status: chance(base) ? 'present' : pick(['absent', 'absent', 'late', 'excused']),
            };
          }),
        });
      }
    }
  }

  /* ---------------- Assignments & submissions ---------------- */
  const assignments = [];
  const submissions = [];
  let submissionId = 0;

  cseSem5.forEach((subject, index) => {
    const template = ASSIGNMENT_TEMPLATES[index % ASSIGNMENT_TEMPLATES.length];
    const past = {
      id: `asg-${index}-past`,
      ...template,
      subject: subject.id,
      semester: subject.semester,
      createdBy: subject.faculty,
      assignedOn: daysAgo(24),
      dueDate: daysAgo(6),
      weightage: 10,
      allowLateSubmission: false,
      status: 'published',
      attachments: [{ name: `${subject.code}_problem_set.pdf`, url: '#', size: 248000 }],
    };
    const upcoming = {
      id: `asg-${index}-live`,
      title: `${subject.code} — Unit ${randInt(3, 5)} Practice Set`,
      description: 'Attempt every question from the practice set circulated in class. Show intermediate steps; answers without working will not be credited.',
      subject: subject.id,
      semester: subject.semester,
      createdBy: subject.faculty,
      assignedOn: daysAgo(3),
      dueDate: daysAhead(randInt(2, 12)),
      maxMarks: 20,
      weightage: 10,
      allowLateSubmission: index % 2 === 0,
      status: 'published',
      attachments: [],
    };
    assignments.push(past, upcoming);

    cohort.forEach((student) => {
      if (chance(0.88)) {
        submissionId += 1;
        const marks = Math.max(
          Math.round(past.maxMarks * 0.4),
          Math.round(past.maxMarks * student.ability * (0.85 + rand() * 0.25))
        );
        submissions.push({
          id: `sbm-${submissionId}`,
          assignment: past.id,
          student: student.id,
          submittedAt: daysAgo(randInt(7, 12)),
          note: 'Submitted through the eCampus ELO Portal.',
          files: [{ name: `${student.rollNo}_${subject.code}.pdf`, url: '#', size: randInt(80000, 900000) }],
          status: 'evaluated',
          marks: Math.min(marks, past.maxMarks),
          feedback: marks / past.maxMarks > 0.8
            ? 'Excellent work — the reasoning is clear throughout.'
            : 'Good attempt. Revisit the complexity analysis section.',
          evaluatedBy: subject.faculty,
          evaluatedAt: daysAgo(randInt(1, 5)),
        });
      }
      if (chance(0.34)) {
        submissionId += 1;
        submissions.push({
          id: `sbm-${submissionId}`,
          assignment: upcoming.id,
          student: student.id,
          submittedAt: daysAgo(0.15 + rand() * 2),
          note: 'Early submission.',
          files: [{ name: `${student.rollNo}_practice.pdf`, url: '#', size: randInt(60000, 500000) }],
          status: 'submitted',
        });
      }
    });
  });

  /* ---------------- Examinations ---------------- */
  const exams = [];
  cseSem5.forEach((subject, index) => {
    exams.push(
      {
        id: `exm-${index}-s1`,
        name: `Sessional Examination I — ${subject.code}`,
        type: 'Sessional I',
        subject: subject.id,
        department: subject.department,
        semester: subject.semester,
        date: daysAgo(35 - index),
        startTime: '10:00',
        durationMinutes: 90,
        room: `Exam Hall ${randInt(1, 4)}`,
        maxMarks: 30,
        status: 'completed',
      },
      {
        id: `exm-${index}-s2`,
        name: `Sessional Examination II — ${subject.code}`,
        type: 'Sessional II',
        subject: subject.id,
        department: subject.department,
        semester: subject.semester,
        date: daysAhead(6 + index * 2),
        startTime: index % 2 ? '14:00' : '10:00',
        durationMinutes: 90,
        room: `Exam Hall ${randInt(1, 4)}`,
        maxMarks: 30,
        instructions: 'Answer all questions. Non-programmable calculators are permitted.',
        status: 'scheduled',
      },
      {
        id: `exm-${index}-end`,
        name: `End Semester Examination — ${subject.code}`,
        type: 'End Semester',
        subject: subject.id,
        department: subject.department,
        semester: subject.semester,
        date: daysAhead(45 + index * 2),
        startTime: '10:00',
        durationMinutes: 180,
        room: `Exam Hall ${randInt(1, 6)}`,
        maxMarks: 60,
        status: 'scheduled',
      }
    );
  });

  /* ---------------- Results ---------------- */
  const GRADE_POINTS = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, P: 4, F: 0 };
  const deriveGrade = (pct) => {
    if (pct >= 90) return 'O';
    if (pct >= 80) return 'A+';
    if (pct >= 70) return 'A';
    if (pct >= 60) return 'B+';
    if (pct >= 50) return 'B';
    if (pct >= 45) return 'C';
    if (pct >= 40) return 'P';
    return 'F';
  };

  const results = [];
  let resultId = 0;
  const makeResult = (student, subject, semester, { complete }) => {
    resultId += 1;
    const jitter = 0.82 + rand() * 0.26;
    const internal = {
      sessional1: Math.min(15, Math.round(15 * student.ability * jitter)),
      sessional2: complete ? Math.min(15, Math.round(15 * student.ability * jitter)) : 0,
      assignment: Math.min(5, Math.round(5 * student.ability)),
      attendance: randInt(3, 5),
    };
    const externalMarks = complete ? Math.min(60, Math.round(60 * student.ability * jitter)) : 0;
    const totalMarks = internal.sessional1 + internal.sessional2 + internal.assignment + internal.attendance + externalMarks;
    const percentage = Number(((totalMarks / 100) * 100).toFixed(2));
    const grade = deriveGrade(percentage);

    return {
      id: `res-${resultId}`,
      student: student.id,
      subject: subject.id,
      semester,
      academicYear: semester === 5 ? ACADEMIC_YEAR : '2024-25',
      internal,
      externalMarks,
      maxInternal: 40,
      maxExternal: 60,
      totalMarks,
      percentage,
      grade: complete ? grade : null,
      gradePoint: complete ? GRADE_POINTS[grade] : 0,
      credits: subject.credits,
      status: complete ? (grade === 'F' ? 'fail' : 'pass') : 'pending',
      publishedAt: complete ? daysAgo(200) : daysAgo(20),
    };
  };

  cohort.forEach((student) => {
    cseSem3.forEach((subject) => results.push(makeResult(student, subject, 3, { complete: true })));
    cseSem5.forEach((subject) => results.push(makeResult(student, subject, 5, { complete: false })));

    const published = results.filter((r) => r.student === student.id && r.status !== 'pending');
    const credits = published.reduce((sum, r) => sum + r.credits, 0);
    const points = published.reduce((sum, r) => sum + r.gradePoint * r.credits, 0);
    student.cgpa = credits ? Number((points / credits).toFixed(2)) : 0;
  });

  // Students outside the demo cohort still need a believable CGPA for analytics.
  students.filter((s) => !cohortIds.has(s.id)).forEach((s) => {
    s.cgpa = Number((5.4 + s.ability * 4.2).toFixed(2));
  });

  /* ---------------- Administrators ---------------- */
  const admins = [
    { id: 'adm-1', role: 'admin', name: 'Dr. Rajesh Kumar Verma', email: 'registrar@smit.smu.edu.in', phone: '+91 3592 246220', designation: 'Registrar', initials: 'RV' },
    { id: 'adm-2', role: 'admin', name: 'Sunita Rai', email: 'academics.office@smit.smu.edu.in', phone: '+91 3592 246221', designation: 'Academic Section Officer', initials: 'SR' },
  ];

  /* ---------------- Announcements ---------------- */
  const announcements = ANNOUNCEMENTS.map((item, index) => ({
    id: `ann-${index + 1}`,
    ...item,
    postedBy: admins[index % 2].id,
    postedByName: admins[index % 2].name,
    publishAt: daysAgo(item.daysAgo),
    expiresAt: daysAhead(60),
    readBy: [],
  }));

  /* ---------------- Feedback ---------------- */
  const feedback = [];
  let feedbackId = 0;
  cseSem5.forEach((subject) => {
    cohort.forEach((student) => {
      if (!chance(0.68)) return;
      feedbackId += 1;
      const base = randInt(3, 5);
      const clamp = (v) => Math.min(5, Math.max(1, v));
      const ratings = {
        teachingQuality: clamp(base + randInt(-1, 0)),
        clarity: clamp(base + randInt(-1, 0)),
        punctuality: clamp(base + randInt(0, 1)),
        supportiveness: clamp(base + randInt(-1, 1)),
        courseContent: clamp(base + randInt(-1, 0)),
      };
      const values = Object.values(ratings);
      feedback.push({
        id: `fbk-${feedbackId}`,
        type: 'student-to-faculty',
        submittedBy: student.id,
        faculty: subject.faculty,
        subject: subject.id,
        department: subject.department,
        semester: 5,
        academicYear: ACADEMIC_YEAR,
        ratings,
        averageRating: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
        comment: chance(0.55) ? pick(FEEDBACK_COMMENTS) : '',
        anonymous: true,
        status: 'open',
        createdAt: daysAgo(randInt(1, 40)),
      });
    });
  });

  [
    'Request additional projector maintenance in the department seminar room.',
    'The laboratory workstations need an operating system upgrade before the next cycle.',
    'Please consider extending the library subscription to IEEE Xplore.',
    'Timetable clashes between elective slots need to be resolved for semester 5.',
  ].forEach((comment, index) => {
    feedbackId += 1;
    feedback.push({
      id: `fbk-${feedbackId}`,
      type: 'faculty-to-admin',
      submittedBy: faculty[index].id,
      department: faculty[index].department,
      academicYear: ACADEMIC_YEAR,
      ratings: {},
      averageRating: 0,
      comment,
      anonymous: false,
      status: index === 0 ? 'reviewed' : 'open',
      createdAt: daysAgo(randInt(3, 30)),
    });
  });

  /* ---------------- Fees ---------------- */
  const fees = students.map((student, index) => {
    const items = student.hostel?.resident ? [...FEE_HEADS, HOSTEL_FEE] : [...FEE_HEADS];
    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
    const roll = rand();
    const transactions = [];

    if (roll < 0.62) {
      transactions.push({
        transactionId: `TXN${randInt(10000000, 99999999)}`,
        receiptNo: `SMIT/2025/${randInt(10000, 99999)}`,
        amount: totalAmount,
        mode: pick(['Net Banking', 'UPI', 'Card']),
        paidAt: daysAgo(randInt(5, 60)),
      });
    } else if (roll < 0.82) {
      transactions.push({
        transactionId: `TXN${randInt(10000000, 99999999)}`,
        receiptNo: `SMIT/2025/${randInt(10000, 99999)}`,
        amount: Math.round(totalAmount * 0.5),
        mode: 'NEFT',
        paidAt: daysAgo(randInt(5, 40)),
      });
    }

    const paidAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const dueDate = daysAhead(randInt(-10, 30));
    let status = 'pending';
    if (paidAmount >= totalAmount) status = 'paid';
    else if (paidAmount > 0) status = 'partial';
    else if (new Date(dueDate) < new Date()) status = 'overdue';

    return {
      id: `fee-${index + 1}`,
      student: student.id,
      academicYear: ACADEMIC_YEAR,
      semester: student.semester,
      items,
      totalAmount,
      paidAmount,
      dueDate,
      status,
      transactions,
    };
  });

  /* ---------------- Notifications ---------------- */
  const notifications = [
    { id: 'ntf-1', user: cohort[0].id, title: 'Sessional II timetable published', message: 'Your examination schedule is available in the Examinations module.', type: 'exam', link: '/app/examinations', read: false, createdAt: daysAgo(0.2) },
    { id: 'ntf-2', user: cohort[0].id, title: 'Assignment evaluated — CS1502', message: 'Normalisation Case Study has been graded by Dr. Prasanta Rai.', type: 'assignment', link: '/app/assignments', read: false, createdAt: daysAgo(1) },
    { id: 'ntf-3', user: cohort[0].id, title: 'Attendance advisory — CS1503', message: 'Your attendance is approaching the 75% threshold.', type: 'attendance', link: '/app/attendance', read: false, createdAt: daysAgo(2) },
    { id: 'ntf-4', user: cohort[0].id, title: 'Semester fee reminder', message: 'Clear your outstanding dues before the last date to avoid a late fee.', type: 'fee', link: '/app/fees', read: true, createdAt: daysAgo(5) },
    { id: 'ntf-5', user: 'fac-102', title: '14 submissions awaiting evaluation', message: 'Normalisation Case Study — CS1502.', type: 'assignment', link: '/app/assignments', read: false, createdAt: daysAgo(0.5) },
    { id: 'ntf-6', user: 'fac-102', title: 'New student feedback received', message: 'Three new responses for Database Management Systems.', type: 'feedback', link: '/app/feedback', read: false, createdAt: daysAgo(3) },
    { id: 'ntf-7', user: 'adm-1', title: 'Fee collection at 71% for the semester', message: 'Review outstanding dues in the Fees & Finance module.', type: 'fee', link: '/app/fees', read: false, createdAt: daysAgo(1) },
    { id: 'ntf-8', user: 'adm-1', title: '4 faculty feedback items awaiting review', message: 'Infrastructure and timetable requests from department heads.', type: 'feedback', link: '/app/feedback', read: false, createdAt: daysAgo(4) },
  ];

  return {
    academicYear: ACADEMIC_YEAR,
    departments,
    courses: COURSES,
    subjects,
    faculty,
    students,
    admins,
    attendance,
    assignments,
    submissions,
    exams,
    results,
    announcements,
    feedback,
    fees,
    notifications,
    gradePoints: GRADE_POINTS,
  };
}
