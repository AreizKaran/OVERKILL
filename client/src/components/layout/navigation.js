import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileBadge,
  Megaphone,
  MessageSquareQuote,
  Wallet,
  Bell,
  UserCog,
  Building2,
} from 'lucide-react';

/** One navigation table for all three roles — `roles` gates each entry. */
export const NAVIGATION = [
  {
    section: 'Overview',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'faculty', 'admin'], end: true },
    ],
  },
  {
    section: 'Academics',
    items: [
      { to: '/app/courses', label: 'Courses & Subjects', icon: BookOpen, roles: ['student', 'faculty', 'admin'] },
      { to: '/app/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['student', 'faculty', 'admin'] },
      { to: '/app/assignments', label: 'Assignments', icon: ClipboardList, roles: ['student', 'faculty', 'admin'] },
      { to: '/app/examinations', label: 'Examinations', icon: FileBadge, roles: ['student', 'faculty', 'admin'] },
      { to: '/app/results', label: 'Results', icon: GraduationCap, roles: ['student', 'admin'] },
    ],
  },
  {
    section: 'People',
    items: [
      { to: '/app/students', label: 'Students', icon: Users, roles: ['faculty', 'admin'] },
      { to: '/app/faculty', label: 'Faculty', icon: Building2, roles: ['student', 'faculty', 'admin'] },
    ],
  },
  {
    section: 'Campus',
    items: [
      { to: '/app/announcements', label: 'Announcements', icon: Megaphone, roles: ['student', 'faculty', 'admin'] },
      { to: '/app/feedback', label: 'Feedback', icon: MessageSquareQuote, roles: ['student', 'faculty', 'admin'] },
      { to: '/app/fees', label: 'Fees & Finance', icon: Wallet, roles: ['student', 'admin'] },
      { to: '/app/notifications', label: 'Notifications', icon: Bell, roles: ['student', 'faculty', 'admin'] },
    ],
  },
  {
    section: 'Administration',
    items: [{ to: '/app/users', label: 'Users & Roles', icon: UserCog, roles: ['admin'] }],
  },
];

export const navigationForRole = (role) =>
  NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);

export const ROLE_LABELS = {
  student: 'Student',
  faculty: 'Faculty',
  admin: 'Administrator',
};
