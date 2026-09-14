/** Static academic reference data used by the seeder. */

export const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering', block: 'Academic Block A', establishedYear: 1997, description: 'Software systems, AI/ML, data engineering and cyber security.' },
  { code: 'ECE', name: 'Electronics & Communication Engineering', block: 'Academic Block B', establishedYear: 1997, description: 'VLSI, embedded systems, signal processing and communication networks.' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', block: 'Academic Block B', establishedYear: 1998, description: 'Power systems, control engineering and renewable energy.' },
  { code: 'ME', name: 'Mechanical Engineering', block: 'Academic Block C', establishedYear: 1997, description: 'Thermal, design, manufacturing and robotics.' },
  { code: 'CE', name: 'Civil Engineering', block: 'Academic Block C', establishedYear: 1999, description: 'Structures, geotechnical, transportation and environmental engineering.' },
  { code: 'IT', name: 'Information Technology', block: 'Academic Block A', establishedYear: 2001, description: 'Networks, cloud computing, information systems and analytics.' },
];

export const COURSES = [
  { code: 'BTECH-CSE', name: 'B.Tech in Computer Science & Engineering', dept: 'CSE', intake: 180, totalCredits: 164 },
  { code: 'BTECH-ECE', name: 'B.Tech in Electronics & Communication Engineering', dept: 'ECE', intake: 120, totalCredits: 162 },
  { code: 'BTECH-EEE', name: 'B.Tech in Electrical & Electronics Engineering', dept: 'EEE', intake: 90, totalCredits: 162 },
  { code: 'BTECH-ME', name: 'B.Tech in Mechanical Engineering', dept: 'ME', intake: 90, totalCredits: 160 },
  { code: 'BTECH-CE', name: 'B.Tech in Civil Engineering', dept: 'CE', intake: 60, totalCredits: 160 },
  { code: 'BTECH-IT', name: 'B.Tech in Information Technology', dept: 'IT', intake: 60, totalCredits: 164 },
  { code: 'MTECH-CSE', name: 'M.Tech in Computer Science & Engineering', dept: 'CSE', level: 'PG', durationYears: 2, totalSemesters: 4, intake: 24, totalCredits: 72 },
];

export const SUBJECTS = [
  // CSE — Semester 5
  { code: 'CS1501', name: 'Design & Analysis of Algorithms', dept: 'CSE', semester: 5, credits: 4, type: 'Core' },
  { code: 'CS1502', name: 'Database Management Systems', dept: 'CSE', semester: 5, credits: 4, type: 'Core' },
  { code: 'CS1503', name: 'Computer Networks', dept: 'CSE', semester: 5, credits: 3, type: 'Core' },
  { code: 'CS1504', name: 'Software Engineering', dept: 'CSE', semester: 5, credits: 3, type: 'Core' },
  { code: 'CS1505', name: 'Machine Learning Foundations', dept: 'CSE', semester: 5, credits: 3, type: 'Elective' },
  { code: 'CS1506', name: 'DBMS Laboratory', dept: 'CSE', semester: 5, credits: 2, type: 'Lab' },
  // CSE — Semester 3
  { code: 'CS1301', name: 'Data Structures', dept: 'CSE', semester: 3, credits: 4, type: 'Core' },
  { code: 'CS1302', name: 'Object Oriented Programming', dept: 'CSE', semester: 3, credits: 3, type: 'Core' },
  { code: 'CS1303', name: 'Digital Logic Design', dept: 'CSE', semester: 3, credits: 3, type: 'Core' },
  { code: 'CS1304', name: 'Discrete Mathematics', dept: 'CSE', semester: 3, credits: 3, type: 'Core' },
  // ECE — Semester 5
  { code: 'EC1501', name: 'Digital Signal Processing', dept: 'ECE', semester: 5, credits: 4, type: 'Core' },
  { code: 'EC1502', name: 'VLSI Design', dept: 'ECE', semester: 5, credits: 3, type: 'Core' },
  { code: 'EC1503', name: 'Microcontrollers & Embedded Systems', dept: 'ECE', semester: 5, credits: 4, type: 'Core' },
  // EEE / ME / CE / IT
  { code: 'EE1501', name: 'Power Systems Analysis', dept: 'EEE', semester: 5, credits: 4, type: 'Core' },
  { code: 'EE1502', name: 'Control Systems', dept: 'EEE', semester: 5, credits: 3, type: 'Core' },
  { code: 'ME1501', name: 'Heat & Mass Transfer', dept: 'ME', semester: 5, credits: 4, type: 'Core' },
  { code: 'ME1502', name: 'Machine Design', dept: 'ME', semester: 5, credits: 3, type: 'Core' },
  { code: 'CE1501', name: 'Structural Analysis II', dept: 'CE', semester: 5, credits: 4, type: 'Core' },
  { code: 'IT1501', name: 'Cloud Computing', dept: 'IT', semester: 5, credits: 3, type: 'Core' },
  { code: 'IT1502', name: 'Information Security', dept: 'IT', semester: 5, credits: 3, type: 'Core' },
];

export const FACULTY = [
  { employeeId: 'SMIT-F101', name: 'Dr. Anindita Chettri', dept: 'CSE', designation: 'Professor', cabin: 'A-214', qualification: 'Ph.D. (IIT Kharagpur)', specialization: ['Algorithms', 'Graph Theory'], experienceYears: 18, isHod: true, subjects: ['CS1501'] },
  { employeeId: 'SMIT-F102', name: 'Dr. Prasanta Rai', dept: 'CSE', designation: 'Associate Professor', cabin: 'A-216', qualification: 'Ph.D. (NIT Silchar)', specialization: ['Databases', 'Data Engineering'], experienceYears: 12, subjects: ['CS1502', 'CS1506'] },
  { employeeId: 'SMIT-F103', name: 'Dr. Sonam Bhutia', dept: 'CSE', designation: 'Assistant Professor', cabin: 'A-219', qualification: 'Ph.D. (NIT Sikkim)', specialization: ['Computer Networks', 'IoT'], experienceYears: 9, subjects: ['CS1503'] },
  { employeeId: 'SMIT-F104', name: 'Prof. Ritesh Pradhan', dept: 'CSE', designation: 'Assistant Professor', cabin: 'A-221', qualification: 'M.Tech (IIIT Bangalore)', specialization: ['Software Engineering', 'DevOps'], experienceYears: 7, subjects: ['CS1504'] },
  { employeeId: 'SMIT-F105', name: 'Dr. Tashi Lepcha', dept: 'CSE', designation: 'Associate Professor', cabin: 'A-223', qualification: 'Ph.D. (IISc Bangalore)', specialization: ['Machine Learning', 'Computer Vision'], experienceYears: 11, subjects: ['CS1505'] },
  { employeeId: 'SMIT-F106', name: 'Dr. Meera Subba', dept: 'CSE', designation: 'Assistant Professor', cabin: 'A-225', qualification: 'Ph.D. (Jadavpur University)', specialization: ['Data Structures', 'Compilers'], experienceYears: 8, subjects: ['CS1301', 'CS1302'] },
  { employeeId: 'SMIT-F107', name: 'Prof. Nabin Gurung', dept: 'CSE', designation: 'Lecturer', cabin: 'A-227', qualification: 'M.Tech (SMIT)', specialization: ['Digital Logic', 'Architecture'], experienceYears: 5, subjects: ['CS1303', 'CS1304'] },
  { employeeId: 'SMIT-F201', name: 'Dr. Bikash Sharma', dept: 'ECE', designation: 'Professor', cabin: 'B-118', qualification: 'Ph.D. (IIT Guwahati)', specialization: ['Signal Processing'], experienceYears: 20, isHod: true, subjects: ['EC1501'] },
  { employeeId: 'SMIT-F202', name: 'Dr. Karma Tamang', dept: 'ECE', designation: 'Associate Professor', cabin: 'B-121', qualification: 'Ph.D. (NIT Durgapur)', specialization: ['VLSI', 'Embedded Systems'], experienceYears: 13, subjects: ['EC1502', 'EC1503'] },
  { employeeId: 'SMIT-F301', name: 'Dr. Rupa Chettri', dept: 'EEE', designation: 'Professor', cabin: 'B-205', qualification: 'Ph.D. (IIT Roorkee)', specialization: ['Power Systems'], experienceYears: 17, isHod: true, subjects: ['EE1501', 'EE1502'] },
  { employeeId: 'SMIT-F401', name: 'Dr. Sujay Ghosh', dept: 'ME', designation: 'Professor', cabin: 'C-109', qualification: 'Ph.D. (IIT Kanpur)', specialization: ['Thermal Engineering'], experienceYears: 19, isHod: true, subjects: ['ME1501', 'ME1502'] },
  { employeeId: 'SMIT-F501', name: 'Dr. Pema Dorjee', dept: 'CE', designation: 'Associate Professor', cabin: 'C-214', qualification: 'Ph.D. (NIT Rourkela)', specialization: ['Structural Engineering'], experienceYears: 14, isHod: true, subjects: ['CE1501'] },
  { employeeId: 'SMIT-F601', name: 'Dr. Ayesha Rahman', dept: 'IT', designation: 'Associate Professor', cabin: 'A-308', qualification: 'Ph.D. (Jamia Millia Islamia)', specialization: ['Cloud Computing', 'Security'], experienceYears: 12, isHod: true, subjects: ['IT1501', 'IT1502'] },
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
  { title: 'Sessional Examination II — Timetable Published', body: 'The timetable for Sessional Examination II (Odd Semester 2025-26) is now available on the portal. Examinations commence from the first week of next month across all departments. Students must carry their institute identity card to the examination hall. Reporting time is 15 minutes before the scheduled start.', category: 'Examination', priority: 'important', audience: ['student', 'faculty'], pinned: true },
  { title: 'Attendance Shortage Advisory — 75% Rule', body: 'As per institute regulations, a minimum of 75% attendance is mandatory in every subject to be eligible for the End Semester Examination. Students falling below the threshold have been notified individually. Mentors are requested to counsel the concerned students before the cut-off date.', category: 'Academic', priority: 'urgent', audience: ['student', 'faculty'], pinned: true },
  { title: 'Campus Placement Drive — Infosys & TCS', body: 'Infosys and TCS will conduct on-campus recruitment for the 2026 graduating batch. Eligible students (CGPA 6.5 and above, no active backlogs) should register through the Training & Placement cell portal before the deadline.', category: 'Placement', priority: 'important', audience: ['student'] },
  { title: 'Semester Fee Payment — Last Date Reminder', body: 'Students are reminded to clear the semester tuition and hostel dues through the Fees & Finance module. A late fee is applicable after the due date. Receipts are generated instantly in the portal after a successful transaction.', category: 'Administrative', priority: 'normal', audience: ['student'] },
  { title: 'Techno-Cultural Fest "Manipal Utsav" — Call for Participation', body: 'Registrations are open for the annual techno-cultural festival. Events span coding contests, robotics, cultural performances and sports. Departments may nominate coordinators through their respective HODs.', category: 'Event', priority: 'normal', audience: ['all'] },
  { title: 'Faculty Development Programme on Outcome Based Education', body: 'A five-day Faculty Development Programme on Outcome Based Education and NBA accreditation processes will be conducted in the seminar hall. Attendance is mandatory for all teaching staff.', category: 'Academic', priority: 'important', audience: ['faculty'] },
  { title: 'Library Extended Hours During Examinations', body: 'The central library will remain open until 22:00 hrs on all working days during the examination period. Reading hall seats can be reserved through the portal.', category: 'Administrative', priority: 'normal', audience: ['all'] },
  { title: 'Institute Holiday — Losar Festival', body: 'The institute will remain closed on account of Losar. Classes scheduled for the day will be compensated as notified by the respective departments.', category: 'Holiday', priority: 'normal', audience: ['all'] },
];

export const ASSIGNMENT_TEMPLATES = [
  { title: 'Dynamic Programming Problem Set', description: 'Solve the ten assigned problems on optimal substructure and memoisation. Submit well-commented source code along with a complexity analysis for each solution.', maxMarks: 20 },
  { title: 'Normalisation Case Study', description: 'Given the supplied university schema, identify functional dependencies and normalise up to BCNF. Justify every decomposition step and show the final relational schema.', maxMarks: 15 },
  { title: 'Socket Programming Lab Report', description: 'Implement a concurrent TCP chat server and client. Include screenshots, packet captures and a short note on the concurrency model used.', maxMarks: 25 },
  { title: 'SRS Document for a Campus App', description: 'Prepare a complete IEEE 830 style Software Requirements Specification for a campus utility application of your choice.', maxMarks: 20 },
  { title: 'Linear Regression from Scratch', description: 'Implement gradient descent without using machine learning libraries and report the loss curve on the provided dataset.', maxMarks: 20 },
];

export const FEE_HEADS = [
  { head: 'Tuition Fee', amount: 92000 },
  { head: 'Examination Fee', amount: 4500 },
  { head: 'Laboratory & Library Fee', amount: 7500 },
  { head: 'Student Activity Fee', amount: 2500 },
  { head: 'Hostel & Mess (optional)', amount: 68000 },
];
