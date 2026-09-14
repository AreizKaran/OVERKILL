/**
 * Seeds a complete, realistic academic year for the eCampus ELO Portal.
 * Usage:  npm run seed          (wipes the configured database first)
 */
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Announcement from '../models/Announcement.js';
import Feedback from '../models/Feedback.js';
import Fee from '../models/Fee.js';
import Notification from '../models/Notification.js';
import { DEPARTMENTS, COURSES, SUBJECTS, FACULTY, STUDENT_NAMES, ANNOUNCEMENTS, ASSIGNMENT_TEMPLATES, FEE_HEADS } from './data.js';

const ACADEMIC_YEAR = '2025-26';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOTS = [
  ['09:00', '09:55'],
  ['10:00', '10:55'],
  ['11:10', '12:05'],
  ['12:10', '13:05'],
  ['14:00', '14:55'],
  ['15:00', '15:55'],
];

// Deterministic pseudo-random so repeated seeds produce comparable data.
let seedState = 42;
const rand = () => {
  seedState = (seedState * 1103515245 + 12345) % 2147483648;
  return seedState / 2147483648;
};
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const slug = (name) => name.toLowerCase().replace(/^(dr|prof)\.?\s+/, '').replace(/[^a-z]+/g, '.');
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysAhead = (n) => new Date(Date.now() + n * 86400000);

async function wipe() {
  const models = [User, Department, Course, Subject, Student, Faculty, Attendance, Assignment, Submission, Exam, Result, Announcement, Feedback, Fee, Notification];
  await Promise.all(models.map((m) => m.deleteMany({})));
  console.log('[seed] cleared existing collections');
}

async function run() {
  await connectDB();
  await wipe();

  /* -------- Departments & courses -------- */
  const departments = {};
  for (const dept of DEPARTMENTS) {
    departments[dept.code] = await Department.create({
      ...dept,
      email: `hod.${dept.code.toLowerCase()}@smit.smu.edu.in`,
      phone: `+91 3592 24${randInt(1000, 9999)}`,
    });
  }

  const courses = {};
  for (const course of COURSES) {
    courses[course.code] = await Course.create({
      code: course.code,
      name: course.name,
      level: course.level || 'UG',
      department: departments[course.dept]._id,
      durationYears: course.durationYears || 4,
      totalSemesters: course.totalSemesters || 8,
      totalCredits: course.totalCredits,
      intake: course.intake,
      description: `${course.name} offered by the Department of ${departments[course.dept].name}.`,
    });
  }
  console.log(`[seed] ${Object.keys(departments).length} departments, ${Object.keys(courses).length} courses`);

  /* -------- Subjects -------- */
  const subjects = {};
  for (const subject of SUBJECTS) {
    subjects[subject.code] = await Subject.create({
      code: subject.code,
      name: subject.name,
      department: departments[subject.dept]._id,
      course: courses[`BTECH-${subject.dept}`]?._id,
      semester: subject.semester,
      credits: subject.credits,
      type: subject.type,
      description: `${subject.name} — ${subject.type} course for semester ${subject.semester}.`,
    });
  }

  /* -------- Faculty -------- */
  const facultyByEmployeeId = {};
  for (const member of FACULTY) {
    const email = `${slug(member.name)}@smit.smu.edu.in`;
    const user = await User.create({
      name: member.name,
      email,
      password: env.seedPassword,
      role: 'faculty',
      phone: `+91 9${randInt(100000000, 999999999)}`,
    });

    const faculty = await Faculty.create({
      user: user._id,
      employeeId: member.employeeId,
      department: departments[member.dept]._id,
      designation: member.isHod ? 'HOD' : member.designation,
      officialEmail: email,
      cabin: member.cabin,
      block: departments[member.dept].block,
      contact: `+91 3592 24${randInt(1000, 9999)}`,
      qualification: member.qualification,
      specialization: member.specialization,
      experienceYears: member.experienceYears,
      joiningDate: daysAgo(member.experienceYears * 365),
      officeHours: 'Mon–Fri · 15:00–17:00',
      isMentor: true,
      bio: `${member.name} teaches at the Department of ${departments[member.dept].name}, SMIT, with research interests in ${member.specialization.join(', ').toLowerCase()}.`,
      subjects: member.subjects.map((code) => subjects[code]._id),
    });

    facultyByEmployeeId[member.employeeId] = faculty;
    if (member.isHod) await Department.findByIdAndUpdate(departments[member.dept]._id, { hod: faculty._id });

    // Assign the subject owner and a weekly timetable.
    for (const [index, code] of member.subjects.entries()) {
      const schedule = [];
      const subject = subjects[code];
      const sessionsPerWeek = subject.type === 'Lab' ? 1 : Math.min(subject.credits, 4);
      for (let i = 0; i < sessionsPerWeek; i += 1) {
        const [startTime, endTime] = SLOTS[(index * 2 + i) % SLOTS.length];
        schedule.push({
          day: DAYS[(index * 3 + i) % DAYS.length],
          startTime,
          endTime,
          room: subject.type === 'Lab' ? `Lab ${randInt(1, 6)}` : `${member.dept}-${randInt(101, 310)}`,
        });
      }
      await Subject.findByIdAndUpdate(subject._id, { faculty: faculty._id, schedule });
      subjects[code] = await Subject.findById(subject._id);
    }
  }
  console.log(`[seed] ${FACULTY.length} faculty members with timetables`);

  /* -------- Administrators -------- */
  const admin = await User.create({
    name: 'Dr. Rajesh Kumar Verma',
    email: 'registrar@smit.smu.edu.in',
    password: env.seedPassword,
    role: 'admin',
    phone: '+91 3592 246220',
  });
  await User.create({
    name: 'Sunita Rai',
    email: 'academics.office@smit.smu.edu.in',
    password: env.seedPassword,
    role: 'admin',
    phone: '+91 3592 246221',
  });

  /* -------- Students -------- */
  const cseFaculty = FACULTY.filter((f) => f.dept === 'CSE').map((f) => facultyByEmployeeId[f.employeeId]);
  const students = [];

  for (const [index, name] of STUDENT_NAMES.entries()) {
    // 24 students in CSE semester 5 (the demo cohort), the rest spread across departments.
    const inDemoCohort = index < 24;
    const deptCode = inDemoCohort ? 'CSE' : DEPARTMENTS[index % DEPARTMENTS.length].code;
    const semester = inDemoCohort ? 5 : pick([3, 5]);
    const rollNo = `${String(index + 1).padStart(3, '0')}`;
    const admissionYear = 2023;

    const user = await User.create({
      name,
      email: `${slug(name)}${admissionYear}@smit.smu.edu.in`,
      password: env.seedPassword,
      role: 'student',
      phone: `+91 8${randInt(100000000, 999999999)}`,
    });

    const student = await Student.create({
      user: user._id,
      registrationNo: `${admissionYear}${deptCode}${String(index + 101).padStart(4, '0')}`,
      rollNo,
      department: departments[deptCode]._id,
      course: courses[`BTECH-${deptCode}`]._id,
      semester,
      section: index % 2 === 0 ? 'A' : 'B',
      batch: `${admissionYear}–${admissionYear + 4}`,
      admissionYear,
      dateOfBirth: new Date(2005, index % 12, (index % 27) + 1),
      gender: index % 3 === 0 ? 'Female' : 'Male',
      bloodGroup: pick(['A+', 'B+', 'O+', 'AB+', 'O-']),
      category: pick(['General', 'OBC', 'SC', 'ST']),
      hostel: index % 3 === 0 ? { resident: true, block: pick(['Kanchenjunga', 'Teesta', 'Rangit']), roomNo: `${randInt(1, 4)}0${randInt(1, 9)}` } : { resident: false },
      address: {
        line1: `House ${randInt(1, 200)}, ${pick(['MG Marg', 'Tadong', 'Ranipool', 'Development Area'])}`,
        city: pick(['Gangtok', 'Namchi', 'Siliguri', 'Kalimpong', 'Darjeeling']),
        state: pick(['Sikkim', 'West Bengal', 'Assam']),
        pincode: `7${randInt(37101, 737139)}`.slice(0, 6),
      },
      guardian: {
        name: `${name.split(' ')[1] || 'Kumar'} Senior`,
        relation: index % 2 ? 'Father' : 'Mother',
        phone: `+91 9${randInt(100000000, 999999999)}`,
        email: `guardian.${slug(name)}@example.com`,
        occupation: pick(['Government Service', 'Business', 'Teacher', 'Agriculture', 'Engineer']),
      },
      mentor: pick(cseFaculty)._id,
      cgpa: 0,
    });
    students.push(student);
  }
  console.log(`[seed] ${students.length} students enrolled`);

  /* -------- Attendance (last 8 weeks) -------- */
  const cseSem5Subjects = Object.values(subjects).filter(
    (s) => String(s.department) === String(departments.CSE._id) && s.semester === 5
  );
  const cohort = students.filter((s) => String(s.department) === String(departments.CSE._id) && s.semester === 5);

  let sessionCount = 0;
  for (const subject of cseSem5Subjects) {
    for (let week = 8; week >= 1; week -= 1) {
      for (const slot of subject.schedule) {
        const date = daysAgo(week * 7 + DAYS.indexOf(slot.day));
        date.setUTCHours(0, 0, 0, 0);
        await Attendance.create({
          subject: subject._id,
          date,
          period: SLOTS.findIndex(([start]) => start === slot.startTime) + 1,
          semester: subject.semester,
          section: 'A',
          topic: `Unit ${randInt(1, 5)} — lecture ${randInt(1, 12)}`,
          markedBy: subject.faculty,
          records: cohort.map((student) => ({
            student: student._id,
            // ~86% attendance overall, with a few chronically short students.
            status: rand() < (Number(student.rollNo) % 7 === 0 ? 0.6 : 0.9) ? 'present' : pick(['absent', 'absent', 'late', 'excused']),
          })),
        });
        sessionCount += 1;
      }
    }
  }
  console.log(`[seed] ${sessionCount} attendance sessions recorded`);

  /* -------- Assignments & submissions -------- */
  let submissionCount = 0;
  for (const [index, subject] of cseSem5Subjects.entries()) {
    const template = ASSIGNMENT_TEMPLATES[index % ASSIGNMENT_TEMPLATES.length];
    const past = await Assignment.create({
      ...template,
      subject: subject._id,
      semester: subject.semester,
      createdBy: subject.faculty,
      assignedOn: daysAgo(24),
      dueDate: daysAgo(6),
      status: 'published',
    });
    const upcoming = await Assignment.create({
      title: `${subject.code} — Unit ${randInt(3, 5)} Practice Set`,
      description: `Attempt every question from the practice set circulated in class. Late submissions attract a penalty unless prior approval is obtained.`,
      subject: subject._id,
      semester: subject.semester,
      createdBy: subject.faculty,
      assignedOn: daysAgo(3),
      dueDate: daysAhead(randInt(2, 12)),
      maxMarks: 20,
      allowLateSubmission: index % 2 === 0,
      status: 'published',
    });

    for (const student of cohort) {
      if (rand() < 0.88) {
        const marks = randInt(Math.floor(past.maxMarks * 0.5), past.maxMarks);
        await Submission.create({
          assignment: past._id,
          student: student._id,
          submittedAt: daysAgo(randInt(7, 12)),
          note: 'Submitted via the eCampus ELO Portal.',
          files: [{ name: `${student.rollNo}_${past.title.split(' ')[0]}.pdf`, url: '/uploads/sample-submission.pdf', size: randInt(80000, 900000) }],
          status: 'evaluated',
          marks,
          feedback: marks / past.maxMarks > 0.8 ? 'Excellent work — clear reasoning throughout.' : 'Good attempt. Revisit the complexity analysis section.',
          evaluatedBy: subject.faculty,
          evaluatedAt: daysAgo(randInt(1, 5)),
        });
        submissionCount += 1;
      }
      if (rand() < 0.35) {
        await Submission.create({
          assignment: upcoming._id,
          student: student._id,
          submittedAt: daysAgo(randInt(0, 2)),
          note: 'Early submission.',
          files: [{ name: `${student.rollNo}_practice.pdf`, url: '/uploads/sample-submission.pdf', size: randInt(60000, 500000) }],
          status: 'submitted',
        });
        submissionCount += 1;
      }
    }
  }
  console.log(`[seed] assignments created with ${submissionCount} submissions`);

  /* -------- Exams -------- */
  for (const [index, subject] of cseSem5Subjects.entries()) {
    await Exam.create({
      name: `Sessional Examination I — ${subject.code}`,
      type: 'Sessional I',
      subject: subject._id,
      department: subject.department,
      semester: subject.semester,
      date: daysAgo(35 - index),
      startTime: '10:00',
      durationMinutes: 90,
      room: `Exam Hall ${randInt(1, 4)}`,
      maxMarks: 30,
      status: 'completed',
    });
    await Exam.create({
      name: `Sessional Examination II — ${subject.code}`,
      type: 'Sessional II',
      subject: subject._id,
      department: subject.department,
      semester: subject.semester,
      date: daysAhead(6 + index),
      startTime: index % 2 ? '14:00' : '10:00',
      durationMinutes: 90,
      room: `Exam Hall ${randInt(1, 4)}`,
      maxMarks: 30,
      instructions: 'Answer all questions. Non-programmable calculators are permitted.',
      status: 'scheduled',
    });
    await Exam.create({
      name: `End Semester Examination — ${subject.code}`,
      type: 'End Semester',
      subject: subject._id,
      department: subject.department,
      semester: subject.semester,
      date: daysAhead(45 + index * 2),
      startTime: '10:00',
      durationMinutes: 180,
      room: `Exam Hall ${randInt(1, 6)}`,
      maxMarks: 60,
      status: 'scheduled',
    });
  }

  /* -------- Results (semesters 1–4 complete, 5 in progress) -------- */
  const sem3Subjects = Object.values(subjects).filter(
    (s) => String(s.department) === String(departments.CSE._id) && s.semester === 3
  );

  for (const student of cohort) {
    const ability = 0.55 + rand() * 0.42; // per-student baseline performance

    for (const subject of sem3Subjects) {
      const internal = {
        sessional1: Math.round(Math.min(30, 30 * ability * (0.9 + rand() * 0.2)) * 0.4),
        sessional2: Math.round(Math.min(30, 30 * ability * (0.9 + rand() * 0.2)) * 0.4),
        assignment: Math.round(10 * ability),
        attendance: randInt(3, 5),
      };
      const doc = new Result({
        student: student._id,
        subject: subject._id,
        semester: 3,
        academicYear: '2024-25',
        internal,
        externalMarks: Math.round(60 * ability * (0.9 + rand() * 0.18)),
        credits: subject.credits,
        publishedBy: admin._id,
        publishedAt: daysAgo(200),
      });
      await doc.save();
    }

    for (const subject of cseSem5Subjects) {
      const doc = new Result({
        student: student._id,
        subject: subject._id,
        semester: 5,
        academicYear: ACADEMIC_YEAR,
        internal: {
          sessional1: Math.round(Math.min(30, 30 * ability * (0.9 + rand() * 0.2)) * 0.4),
          sessional2: 0,
          assignment: Math.round(10 * ability),
          attendance: randInt(3, 5),
        },
        externalMarks: 0,
        maxInternal: 40,
        maxExternal: 60,
        credits: subject.credits,
        publishedBy: admin._id,
        publishedAt: daysAgo(20),
      });
      doc.status = 'pending';
      await doc.save();
    }

    // Recompute CGPA from published semester results only.
    const published = await Result.find({ student: student._id, semester: 3 }).populate('subject', 'credits');
    const credits = published.reduce((sum, r) => sum + (r.subject?.credits || 0), 0);
    const points = published.reduce((sum, r) => sum + r.gradePoint * (r.subject?.credits || 0), 0);
    student.cgpa = credits ? Number((points / credits).toFixed(2)) : 0;
    await student.save();
  }
  console.log('[seed] results published and CGPA computed');

  /* -------- Announcements -------- */
  for (const [index, announcement] of ANNOUNCEMENTS.entries()) {
    await Announcement.create({
      ...announcement,
      postedBy: admin._id,
      publishAt: daysAgo(index * 2),
      expiresAt: daysAhead(60),
    });
  }

  /* -------- Feedback -------- */
  for (const subject of cseSem5Subjects) {
    for (const student of cohort) {
      if (rand() > 0.7) continue;
      const base = randInt(3, 5);
      const feedback = new Feedback({
        type: 'student-to-faculty',
        submittedBy: student.user,
        faculty: subject.faculty,
        subject: subject._id,
        department: subject.department,
        semester: 5,
        academicYear: ACADEMIC_YEAR,
        ratings: {
          teachingQuality: Math.min(5, Math.max(1, base + randInt(-1, 0))),
          clarity: Math.min(5, Math.max(1, base + randInt(-1, 0))),
          punctuality: Math.min(5, Math.max(1, base + randInt(0, 1))),
          supportiveness: Math.min(5, Math.max(1, base + randInt(-1, 1))),
          courseContent: Math.min(5, Math.max(1, base + randInt(-1, 0))),
        },
        comment: pick([
          'Concepts are explained with good real-world examples.',
          'Would appreciate more solved numerical problems in class.',
          'Lab sessions are well organised and the doubts are cleared patiently.',
          'Please share the slides before the lecture.',
          'The pace is slightly fast for the later units.',
          '',
        ]),
        anonymous: true,
      });
      await feedback.save();
    }
  }

  for (const member of Object.values(facultyByEmployeeId).slice(0, 5)) {
    const faculty = await Faculty.findById(member._id).populate('user', '_id');
    const feedback = new Feedback({
      type: 'faculty-to-admin',
      submittedBy: faculty.user._id,
      department: faculty.department,
      academicYear: ACADEMIC_YEAR,
      comment: pick([
        'Request additional projector maintenance in the department seminar room.',
        'The laboratory workstations need an operating system upgrade before the next cycle.',
        'Please consider increasing the library subscription to IEEE Xplore.',
        'Timetable clashes between elective slots need to be resolved.',
      ]),
      anonymous: false,
      status: 'open',
    });
    await feedback.save();
  }
  console.log('[seed] feedback recorded');

  /* -------- Fees -------- */
  for (const student of students) {
    const items = FEE_HEADS.filter((head) => head.head.includes('Hostel') ? student.hostel?.resident : true);
    const fee = new Fee({
      student: student._id,
      academicYear: ACADEMIC_YEAR,
      semester: student.semester,
      items,
      dueDate: daysAhead(randInt(-10, 30)),
    });
    const total = items.reduce((sum, i) => sum + i.amount, 0);
    const roll = rand();
    if (roll < 0.62) {
      fee.transactions = [{ transactionId: `TXN${randInt(10000000, 99999999)}`, amount: total, mode: pick(['Net Banking', 'UPI', 'Card']), paidAt: daysAgo(randInt(5, 60)), receiptNo: `SMIT/2025/${randInt(10000, 99999)}` }];
    } else if (roll < 0.82) {
      fee.transactions = [{ transactionId: `TXN${randInt(10000000, 99999999)}`, amount: Math.round(total * 0.5), mode: 'NEFT', paidAt: daysAgo(randInt(5, 40)), receiptNo: `SMIT/2025/${randInt(10000, 99999)}` }];
    }
    await fee.save();
  }
  console.log('[seed] fee demands generated');

  /* -------- Notifications -------- */
  const sampleStudent = cohort[0];
  const sampleFaculty = facultyByEmployeeId['SMIT-F102'];
  await Notification.insertMany([
    { user: sampleStudent.user, title: 'Sessional II timetable published', message: 'Check the Examinations module for your schedule.', type: 'exam', link: '/app/examinations' },
    { user: sampleStudent.user, title: 'Assignment evaluated — CS1502', message: 'Normalisation Case Study has been graded.', type: 'assignment', link: '/app/assignments' },
    { user: sampleStudent.user, title: 'Attendance below 75% in CS1503', message: 'Please meet your mentor this week.', type: 'attendance', link: '/app/attendance', read: true },
    { user: (await Faculty.findById(sampleFaculty._id).populate('user', '_id')).user._id, title: '14 submissions awaiting evaluation', message: 'Normalisation Case Study — CS1502.', type: 'assignment', link: '/app/assignments' },
    { user: admin._id, title: 'Fee collection at 71% for the semester', message: 'Review outstanding dues in the Fees & Finance module.', type: 'fee', link: '/app/fees' },
  ]);

  console.log('\n[seed] ✓ Database seeded successfully');
  console.log('\n  Demo accounts (password for all: %s)', env.seedPassword);
  console.log('  ─────────────────────────────────────────────────────────────');
  console.log('  Student  %s', (await User.findById(cohort[0].user)).email);
  console.log('  Faculty  prasanta.rai@smit.smu.edu.in');
  console.log('  Admin    registrar@smit.smu.edu.in\n');

  await disconnectDB();
  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error('[seed] failed:', err);
  await disconnectDB();
  process.exit(1);
});
