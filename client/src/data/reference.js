/** Static academic reference data for the self-contained Demo Mode dataset. */

export const INSTITUTE = {
  name: 'Sikkim Manipal Institute of Technology',
  short: 'SMIT',
  university: 'Sikkim Manipal University',
  campus: 'Majitar, Rangpo, East Sikkim — 737136',
  academicYear: '2025–26',
  term: 'Odd Semester',
};

export const DEPARTMENTS = [
  { id: 'dep-cse', code: 'CSE', name: 'Computer Science & Engineering', block: 'Academic Block A', established: 1997, description: 'Software systems, artificial intelligence, data engineering and cyber security.' },
  { id: 'dep-ece', code: 'ECE', name: 'Electronics & Communication Engineering', block: 'Academic Block B', established: 1997, description: 'VLSI, embedded systems, signal processing and communication networks.' },
  { id: 'dep-eee', code: 'EEE', name: 'Electrical & Electronics Engineering', block: 'Academic Block B', established: 1998, description: 'Power systems, control engineering and renewable energy.' },
  { id: 'dep-me', code: 'ME', name: 'Mechanical Engineering', block: 'Academic Block C', established: 1997, description: 'Thermal engineering, design, manufacturing and robotics.' },
  { id: 'dep-ce', code: 'CE', name: 'Civil Engineering', block: 'Academic Block C', established: 1999, description: 'Structural, geotechnical, transportation and environmental engineering.' },
  { id: 'dep-it', code: 'IT', name: 'Information Technology', block: 'Academic Block A', established: 2001, description: 'Networks, cloud computing, information systems and analytics.' },
];

export const COURSES = [
  { id: 'crs-1', code: 'BTECH-CSE', name: 'B.Tech in Computer Science & Engineering', department: 'dep-cse', level: 'UG', durationYears: 4, totalSemesters: 8, totalCredits: 164, intake: 180 },
  { id: 'crs-2', code: 'BTECH-ECE', name: 'B.Tech in Electronics & Communication Engineering', department: 'dep-ece', level: 'UG', durationYears: 4, totalSemesters: 8, totalCredits: 162, intake: 120 },
  { id: 'crs-3', code: 'BTECH-EEE', name: 'B.Tech in Electrical & Electronics Engineering', department: 'dep-eee', level: 'UG', durationYears: 4, totalSemesters: 8, totalCredits: 162, intake: 90 },
  { id: 'crs-4', code: 'BTECH-ME', name: 'B.Tech in Mechanical Engineering', department: 'dep-me', level: 'UG', durationYears: 4, totalSemesters: 8, totalCredits: 160, intake: 90 },
  { id: 'crs-5', code: 'BTECH-CE', name: 'B.Tech in Civil Engineering', department: 'dep-ce', level: 'UG', durationYears: 4, totalSemesters: 8, totalCredits: 160, intake: 60 },
  { id: 'crs-6', code: 'BTECH-IT', name: 'B.Tech in Information Technology', department: 'dep-it', level: 'UG', durationYears: 4, totalSemesters: 8, totalCredits: 164, intake: 60 },
  { id: 'crs-7', code: 'MTECH-CSE', name: 'M.Tech in Computer Science & Engineering', department: 'dep-cse', level: 'PG', durationYears: 2, totalSemesters: 4, totalCredits: 72, intake: 24 },
];

export const SUBJECTS = [
  { id: 'sub-cs1501', code: 'CS1501', name: 'Design & Analysis of Algorithms', department: 'dep-cse', semester: 5, credits: 4, type: 'Core', faculty: 'fac-101' },
  { id: 'sub-cs1502', code: 'CS1502', name: 'Database Management Systems', department: 'dep-cse', semester: 5, credits: 4, type: 'Core', faculty: 'fac-102' },
  { id: 'sub-cs1503', code: 'CS1503', name: 'Computer Networks', department: 'dep-cse', semester: 5, credits: 3, type: 'Core', faculty: 'fac-103' },
  { id: 'sub-cs1504', code: 'CS1504', name: 'Software Engineering', department: 'dep-cse', semester: 5, credits: 3, type: 'Core', faculty: 'fac-104' },
  { id: 'sub-cs1505', code: 'CS1505', name: 'Machine Learning Foundations', department: 'dep-cse', semester: 5, credits: 3, type: 'Elective', faculty: 'fac-105' },
  { id: 'sub-cs1506', code: 'CS1506', name: 'DBMS Laboratory', department: 'dep-cse', semester: 5, credits: 2, type: 'Lab', faculty: 'fac-102' },
  { id: 'sub-cs1301', code: 'CS1301', name: 'Data Structures', department: 'dep-cse', semester: 3, credits: 4, type: 'Core', faculty: 'fac-106' },
  { id: 'sub-cs1302', code: 'CS1302', name: 'Object Oriented Programming', department: 'dep-cse', semester: 3, credits: 3, type: 'Core', faculty: 'fac-106' },
  { id: 'sub-cs1303', code: 'CS1303', name: 'Digital Logic Design', department: 'dep-cse', semester: 3, credits: 3, type: 'Core', faculty: 'fac-107' },
  { id: 'sub-cs1304', code: 'CS1304', name: 'Discrete Mathematics', department: 'dep-cse', semester: 3, credits: 3, type: 'Core', faculty: 'fac-107' },
  { id: 'sub-ec1501', code: 'EC1501', name: 'Digital Signal Processing', department: 'dep-ece', semester: 5, credits: 4, type: 'Core', faculty: 'fac-201' },
  { id: 'sub-ec1502', code: 'EC1502', name: 'VLSI Design', department: 'dep-ece', semester: 5, credits: 3, type: 'Core', faculty: 'fac-202' },
  { id: 'sub-ec1503', code: 'EC1503', name: 'Microcontrollers & Embedded Systems', department: 'dep-ece', semester: 5, credits: 4, type: 'Core', faculty: 'fac-202' },
  { id: 'sub-ee1501', code: 'EE1501', name: 'Power Systems Analysis', department: 'dep-eee', semester: 5, credits: 4, type: 'Core', faculty: 'fac-301' },
  { id: 'sub-ee1502', code: 'EE1502', name: 'Control Systems', department: 'dep-eee', semester: 5, credits: 3, type: 'Core', faculty: 'fac-301' },
  { id: 'sub-me1501', code: 'ME1501', name: 'Heat & Mass Transfer', department: 'dep-me', semester: 5, credits: 4, type: 'Core', faculty: 'fac-401' },
  { id: 'sub-me1502', code: 'ME1502', name: 'Machine Design', department: 'dep-me', semester: 5, credits: 3, type: 'Core', faculty: 'fac-401' },
  { id: 'sub-ce1501', code: 'CE1501', name: 'Structural Analysis II', department: 'dep-ce', semester: 5, credits: 4, type: 'Core', faculty: 'fac-501' },
  { id: 'sub-it1501', code: 'IT1501', name: 'Cloud Computing', department: 'dep-it', semester: 5, credits: 3, type: 'Core', faculty: 'fac-601' },
  { id: 'sub-it1502', code: 'IT1502', name: 'Information Security', department: 'dep-it', semester: 5, credits: 3, type: 'Core', faculty: 'fac-601' },
];

export const FACULTY = [
  { id: 'fac-101', employeeId: 'SMIT-F101', name: 'Dr. Anindita Chettri', department: 'dep-cse', designation: 'HOD', cabin: 'A-214', qualification: 'Ph.D. (IIT Kharagpur)', specialization: ['Algorithms', 'Graph Theory'], experienceYears: 18 },
  { id: 'fac-102', employeeId: 'SMIT-F102', name: 'Dr. Prasanta Rai', department: 'dep-cse', designation: 'Associate Professor', cabin: 'A-216', qualification: 'Ph.D. (NIT Silchar)', specialization: ['Databases', 'Data Engineering'], experienceYears: 12 },
  { id: 'fac-103', employeeId: 'SMIT-F103', name: 'Dr. Sonam Bhutia', department: 'dep-cse', designation: 'Assistant Professor', cabin: 'A-219', qualification: 'Ph.D. (NIT Sikkim)', specialization: ['Computer Networks', 'IoT'], experienceYears: 9 },
  { id: 'fac-104', employeeId: 'SMIT-F104', name: 'Prof. Ritesh Pradhan', department: 'dep-cse', designation: 'Assistant Professor', cabin: 'A-221', qualification: 'M.Tech (IIIT Bangalore)', specialization: ['Software Engineering', 'DevOps'], experienceYears: 7 },
  { id: 'fac-105', employeeId: 'SMIT-F105', name: 'Dr. Tashi Lepcha', department: 'dep-cse', designation: 'Associate Professor', cabin: 'A-223', qualification: 'Ph.D. (IISc Bangalore)', specialization: ['Machine Learning', 'Computer Vision'], experienceYears: 11 },
  { id: 'fac-106', employeeId: 'SMIT-F106', name: 'Dr. Meera Subba', department: 'dep-cse', designation: 'Assistant Professor', cabin: 'A-225', qualification: 'Ph.D. (Jadavpur University)', specialization: ['Data Structures', 'Compilers'], experienceYears: 8 },
  { id: 'fac-107', employeeId: 'SMIT-F107', name: 'Prof. Nabin Gurung', department: 'dep-cse', designation: 'Lecturer', cabin: 'A-227', qualification: 'M.Tech (SMIT)', specialization: ['Digital Logic', 'Computer Architecture'], experienceYears: 5 },
  { id: 'fac-201', employeeId: 'SMIT-F201', name: 'Dr. Bikash Sharma', department: 'dep-ece', designation: 'HOD', cabin: 'B-118', qualification: 'Ph.D. (IIT Guwahati)', specialization: ['Signal Processing'], experienceYears: 20 },
  { id: 'fac-202', employeeId: 'SMIT-F202', name: 'Dr. Karma Tamang', department: 'dep-ece', designation: 'Associate Professor', cabin: 'B-121', qualification: 'Ph.D. (NIT Durgapur)', specialization: ['VLSI', 'Embedded Systems'], experienceYears: 13 },
  { id: 'fac-301', employeeId: 'SMIT-F301', name: 'Dr. Rupa Chettri', department: 'dep-eee', designation: 'HOD', cabin: 'B-205', qualification: 'Ph.D. (IIT Roorkee)', specialization: ['Power Systems'], experienceYears: 17 },
  { id: 'fac-401', employeeId: 'SMIT-F401', name: 'Dr. Sujay Ghosh', department: 'dep-me', designation: 'HOD', cabin: 'C-109', qualification: 'Ph.D. (IIT Kanpur)', specialization: ['Thermal Engineering'], experienceYears: 19 },
  { id: 'fac-501', employeeId: 'SMIT-F501', name: 'Dr. Pema Dorjee', department: 'dep-ce', designation: 'HOD', cabin: 'C-214', qualification: 'Ph.D. (NIT Rourkela)', specialization: ['Structural Engineering'], experienceYears: 14 },
  { id: 'fac-601', employeeId: 'SMIT-F601', name: 'Dr. Ayesha Rahman', department: 'dep-it', designation: 'HOD', cabin: 'A-308', qualification: 'Ph.D. (Jamia Millia Islamia)', specialization: ['Cloud Computing', 'Information Security'], experienceYears: 12 },
];

export const STUDENT_NAMES = [
  'Aarav Pradhan', 'Tenzing Bhutia', 'Ishita Rai', 'Nima Lepcha', 'Rohan Chettri',
  'Sneha Gurung', 'Pemba Sherpa', 'Ankit Subba', 'Diksha Tamang', 'Sagar Limbu',
  'Priya Sharma', 'Karma Wangchuk', 'Anushka Das', 'Bibek Thapa', 'Riya Mukhia',
  'Sonam Dolma', 'Arjun Basnet', 'Tashi Namgyal', 'Megha Agarwal', 'Suraj Rai',
  'Nikita Chhetri', 'Dorjee Sherpa', 'Aditya Bose', 'Yangchen Bhutia', 'Rahul Newar',
  'Pooja Bhandari', 'Sandeep Mangar', 'Tsering Doma', 'Vivek Kumar', 'Sristi Kharel',
  'Manish Rai', 'Lhamu Sherpa', 'Ayush Gupta', 'Dechen Wangmo', 'Kiran Subedi',
  'Sonia Rizal', 'Prakash Dahal', 'Rinchen Ongmu', 'Harsh Vardhan', 'Shreya Ghimire',
];

export const ANNOUNCEMENTS = [
  { title: 'Sessional Examination II — Timetable Published', category: 'Examination', priority: 'important', audience: ['student', 'faculty'], pinned: true, daysAgo: 1, body: 'The timetable for Sessional Examination II (Odd Semester 2025–26) is now available in the Examinations module. Examinations commence next week across all departments. Students must carry their institute identity card to the examination hall and report 15 minutes before the scheduled start time.' },
  { title: 'Attendance Shortage Advisory — the 75% Rule', category: 'Academic', priority: 'urgent', audience: ['student', 'faculty'], pinned: true, daysAgo: 2, body: 'As per institute regulations a minimum of 75% attendance is mandatory in every subject to be eligible for the End Semester Examination. Students falling below the threshold have been notified individually through the portal. Mentors are requested to counsel the concerned students before the cut-off date.' },
  { title: 'Campus Placement Drive — Infosys & TCS', category: 'Placement', priority: 'important', audience: ['student'], daysAgo: 4, body: 'Infosys and TCS will conduct on-campus recruitment for the 2026 graduating batch. Eligible students (CGPA 6.5 and above with no active backlogs) should register through the Training & Placement cell before the deadline. Pre-placement talks will be held in the central auditorium.' },
  { title: 'Semester Fee Payment — Last Date Reminder', category: 'Administrative', priority: 'normal', audience: ['student'], daysAgo: 6, body: 'Students are reminded to clear semester tuition and hostel dues through the Fees & Finance module. A late fee is applicable after the due date. Receipts are generated instantly in the portal after a successful transaction.' },
  { title: 'Techno-Cultural Fest "Manipal Utsav" — Call for Participation', category: 'Event', priority: 'normal', audience: ['all'], daysAgo: 8, body: 'Registrations are open for the annual techno-cultural festival. Events span coding contests, robotics, cultural performances and sports. Departments may nominate coordinators through their respective Heads of Department.' },
  { title: 'Faculty Development Programme on Outcome Based Education', category: 'Academic', priority: 'important', audience: ['faculty'], daysAgo: 9, body: 'A five-day Faculty Development Programme on Outcome Based Education and NBA accreditation processes will be conducted in the seminar hall. Attendance is mandatory for all teaching staff. Certificates will be issued on completion.' },
  { title: 'Library Extended Hours During Examinations', category: 'Administrative', priority: 'normal', audience: ['all'], daysAgo: 12, body: 'The central library will remain open until 22:00 hrs on all working days during the examination period. Reading hall seats can be reserved through the portal up to 24 hours in advance.' },
  { title: 'Institute Holiday — Losar Festival', category: 'Holiday', priority: 'normal', audience: ['all'], daysAgo: 15, body: 'The institute will remain closed on account of Losar. Classes scheduled for the day will be compensated as notified by the respective departments.' },
];

export const ASSIGNMENT_TEMPLATES = [
  { title: 'Dynamic Programming Problem Set', description: 'Solve the ten assigned problems on optimal substructure and memoisation. Submit well-commented source code along with a complexity analysis for each solution.', maxMarks: 20 },
  { title: 'Normalisation Case Study', description: 'Given the supplied university schema, identify all functional dependencies and normalise up to BCNF. Justify every decomposition step and present the final relational schema.', maxMarks: 15 },
  { title: 'Socket Programming Lab Report', description: 'Implement a concurrent TCP chat server and client. Include screenshots, packet captures and a short note on the concurrency model you used.', maxMarks: 25 },
  { title: 'SRS Document for a Campus Application', description: 'Prepare a complete IEEE 830 style Software Requirements Specification for a campus utility application of your choice.', maxMarks: 20 },
  { title: 'Linear Regression from Scratch', description: 'Implement gradient descent without using machine learning libraries and report the loss curve on the provided dataset.', maxMarks: 20 },
  { title: 'ER Modelling Exercise', description: 'Model the supplied case study as an entity-relationship diagram, then map it to a relational schema with all constraints stated.', maxMarks: 15 },
];

export const FEE_HEADS = [
  { head: 'Tuition Fee', amount: 92000 },
  { head: 'Examination Fee', amount: 4500 },
  { head: 'Laboratory & Library Fee', amount: 7500 },
  { head: 'Student Activity Fee', amount: 2500 },
];

export const HOSTEL_FEE = { head: 'Hostel & Mess Charges', amount: 68000 };

export const FEEDBACK_COMMENTS = [
  'Concepts are explained with good real-world examples.',
  'Would appreciate more solved numerical problems during lectures.',
  'Lab sessions are well organised and doubts are cleared patiently.',
  'Please share the slides before the lecture so we can follow along.',
  'The pace is slightly fast for the later units.',
  'Very approachable during office hours — thank you.',
  'More frequent quizzes would help us keep up with the syllabus.',
];

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const SLOTS = [
  ['09:00', '09:55'],
  ['10:00', '10:55'],
  ['11:10', '12:05'],
  ['12:10', '13:05'],
  ['14:00', '14:55'],
  ['15:00', '15:55'],
];
