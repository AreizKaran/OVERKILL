import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Lock,
  Megaphone,
  MessageSquareQuote,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { Logo } from '../components/layout/Logo.jsx';
import { Button, Badge } from '../components/ui/index.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Moon, Sun } from 'lucide-react';
import { INSTITUTE } from '../data/reference.js';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

const ROLES = [
  {
    role: 'Student',
    icon: GraduationCap,
    tagline: 'Everything about your semester, in one place.',
    points: ['Attendance with the 75% rule tracked live', 'Assignments, deadlines and submissions', 'Marks, grades, SGPA and CGPA', 'Fee status and payment receipts'],
  },
  {
    role: 'Faculty',
    icon: Users,
    tagline: 'Teach, evaluate and communicate without the paperwork.',
    points: ['Mark attendance for a class in seconds', 'Create assignments and grade submissions', 'Publish marks and monitor performance', 'Read structured student feedback'],
  },
  {
    role: 'Administrator',
    icon: BarChart3,
    tagline: 'Institutional oversight with real numbers behind it.',
    points: ['Departments, courses and subject structure', 'Attendance and performance analytics', 'Fee collection and outstanding dues', 'User roles, permissions and access'],
  },
];

const MODULES = [
  { icon: BookOpen, title: 'Courses & Subjects', copy: 'Departments, programmes, semesters, credits and the faculty behind every subject.' },
  { icon: CalendarCheck, title: 'Attendance', copy: 'Subject-wise percentages, shortage advisories and a one-screen roster for faculty.' },
  { icon: ClipboardList, title: 'Assignments', copy: 'Creation, deadlines, submission tracking and evaluation with written feedback.' },
  { icon: GraduationCap, title: 'Examinations & Results', copy: 'Schedules, internal and external marks, grades, SGPA and CGPA computed on publish.' },
  { icon: Megaphone, title: 'Announcements', copy: 'Official notices targeted by audience, department and priority — pinned when urgent.' },
  { icon: MessageSquareQuote, title: 'Feedback', copy: 'Anonymous student-to-faculty ratings and a faculty channel to the administration.' },
  { icon: Wallet, title: 'Fees & Finance', copy: 'Demand notes, outstanding amounts, payment history and instant digital receipts.' },
  { icon: Bell, title: 'Notifications', copy: 'Academic and administrative alerts delivered the moment something changes.' },
];

const SECURITY = [
  { icon: Lock, title: 'JWT authentication', copy: 'Signed, expiring access tokens with a separate refresh secret.' },
  { icon: ShieldCheck, title: 'Role-based access', copy: 'Every route is gated by role; records are scoped to their owner.' },
  { icon: CheckCircle2, title: 'bcrypt password hashing', copy: 'Passwords are salted and hashed — never stored or logged in the clear.' },
  { icon: Smartphone, title: 'Responsive by default', copy: 'Dashboards stack, tables scroll and navigation collapses on small screens.' },
];

export default function Landing() {
  const heroRef = useRef(null);
  const { isDark, toggle } = useTheme();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <div className="min-h-dvh bg-white dark:bg-ink-950">
      {/* ---------------------------------------------------------- Nav */}
      <header className="glass sticky top-0 z-50 border-b border-ink-200/60 dark:border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-600 md:flex dark:text-ink-300">
            <a href="#platform" className="transition hover:text-brand-600 dark:hover:text-brand-300">Platform</a>
            <a href="#roles" className="transition hover:text-brand-600 dark:hover:text-brand-300">Roles</a>
            <a href="#modules" className="transition hover:text-brand-600 dark:hover:text-brand-300">Modules</a>
            <a href="#security" className="transition hover:text-brand-600 dark:hover:text-brand-300">Security</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="rounded-xl p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login">
              <Button size="sm" icon={ArrowRight}>Login to Portal</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------- Hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-brand-500/20 blur-3xl dark:bg-brand-600/20" aria-hidden="true" />
        <div className="pointer-events-none absolute top-40 -left-40 size-[28rem] rounded-full bg-gold-400/20 blur-3xl dark:bg-gold-500/10" aria-hidden="true" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <Badge tone="gold" icon={Sparkles}>{INSTITUTE.short} · {INSTITUTE.academicYear}</Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={1}
                className="mt-5 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]"
              >
                One Campus. One Platform.{' '}
                <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent dark:from-brand-300 dark:to-gold-300">
                  Everything Connected.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={2}
                className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-pretty text-ink-600 dark:text-ink-300"
              >
                The eCampus ELO Portal is the centralised academic management system for{' '}
                {INSTITUTE.name}. Attendance, assignments, results, notices, feedback and fees —
                for students, faculty and administration — in one secure digital ecosystem.
              </motion.p>

              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/login">
                  <Button size="lg" icon={ArrowRight}>Login to Portal</Button>
                </Link>
                <a href="#roles">
                  <Button size="lg" variant="secondary">Explore the roles</Button>
                </a>
              </motion.div>

              <motion.dl
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={4}
                className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-ink-200 pt-6 dark:border-white/10"
              >
                {[
                  { value: '6', label: 'Departments' },
                  { value: '11', label: 'Connected modules' },
                  { value: '3', label: 'Secure roles' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-2xl font-bold text-ink-900 dark:text-white">{stat.value}</dt>
                    <dd className="mt-0.5 text-[0.8125rem] text-ink-500 dark:text-ink-400">{stat.label}</dd>
                  </div>
                ))}
              </motion.dl>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
              style={{ perspective: 1200 }}
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ----------------------------------------------------- Platform */}
      <Section id="platform" eyebrow="The platform" title="More than a learning management system" description="A complete digital ecosystem that connects academic activity, student records, faculty interaction and administrative services behind a single sign-in.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, title: 'Centralised records', copy: 'Academic and personal records held once and reused across every module.' },
            { icon: BarChart3, title: 'Decisions with data', copy: 'Attendance, performance and finance analytics rendered as readable charts.' },
            { icon: Megaphone, title: 'Clear communication', copy: 'Notices, alerts and structured feedback replace scattered notice boards.' },
            { icon: ShieldCheck, title: 'Secure by design', copy: 'Role-based access keeps sensitive records visible only to those who own them.' },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              custom={index}
              className="surface p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">
                <item.icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{item.copy}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- Roles */}
      <Section id="roles" eyebrow="Built around people" title="Three roles, one shared source of truth" description="Each role signs in to a workspace shaped around what that person actually does — with permissions enforced on the server, not just hidden in the interface." muted>
        <div className="grid gap-6 lg:grid-cols-3">
          {ROLES.map((item, index) => (
            <motion.article
              key={item.role}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              custom={index}
              className="surface flex flex-col p-7"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-glow">
                <item.icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold">{item.role}</h3>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{item.tagline}</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand-500" aria-hidden="true" />
                    <span className="text-ink-600 dark:text-ink-300">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------ Modules */}
      <Section id="modules" eyebrow="Modules" title="Eleven connected modules" description="Every module reads from the same records, so a marked attendance session, a graded assignment and a published result all show up wherever they matter.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((item, index) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              custom={index % 4}
              className="surface-muted p-5 transition hover:border-brand-400/40 hover:bg-white dark:hover:bg-white/5"
            >
              <item.icon size={20} className="text-brand-600 dark:text-brand-300" aria-hidden="true" />
              <h3 className="mt-3.5 text-[0.9375rem] font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-500 dark:text-ink-400">{item.copy}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------- Security */}
      <Section id="security" eyebrow="Architecture" title="Secure, scalable and ready to deploy" description="A React front end over a REST API, with MongoDB for persistence and token-based authentication protecting every route." muted>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {SECURITY.map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={index}
                className="surface p-5"
              >
                <item.icon size={19} className="text-brand-600 dark:text-brand-300" aria-hidden="true" />
                <h3 className="mt-3 text-[0.9375rem] font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] text-ink-500 dark:text-ink-400">{item.copy}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="surface overflow-hidden p-0">
            <div className="border-b border-ink-100 px-6 py-4 dark:border-white/10">
              <p className="eyebrow">Technology stack</p>
            </div>
            <dl className="divide-y divide-ink-100 text-sm dark:divide-white/10">
              {[
                ['Front end', 'React · Vite · Tailwind CSS · Framer Motion · Recharts'],
                ['Back end', 'Node.js · Express · REST API'],
                ['Database', 'MongoDB · Mongoose'],
                ['Authentication', 'JWT · role-based access control · bcrypt'],
                ['Extras', 'File uploads · protected routes · environment configuration'],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:gap-6">
                  <dt className="w-32 shrink-0 font-medium text-ink-500 dark:text-ink-400">{label}</dt>
                  <dd className="font-medium text-ink-800 dark:text-ink-100">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 px-6 py-14 text-center sm:px-12 sm:py-20"
        >
          <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-balance text-white sm:text-4xl">
              Ready to sign in to your campus?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-brand-100/90">
              Students, faculty and administrators each get a workspace shaped around their day —
              and a single, secure record of the academic year behind it.
            </p>
            <Link to="/login" className="mt-8 inline-block">
              <Button size="lg" variant="gold" icon={ArrowRight}>Login to Portal</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-ink-200 px-4 py-10 sm:px-6 lg:px-8 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Logo />
            <p className="mt-3 max-w-md text-[0.8125rem] text-ink-500 dark:text-ink-400">
              {INSTITUTE.name} · {INSTITUTE.campus}
            </p>
          </div>
          <p className="text-[0.8125rem] text-ink-400">
            Academic Management System · {INSTITUTE.academicYear}
          </p>
        </div>
      </footer>
    </div>
  );
}

function Section({ id, eyebrow, title, description, children, muted = false }) {
  return (
    <section id={id} className={muted ? 'bg-ink-50 px-4 py-20 sm:px-6 lg:px-8 dark:bg-white/[0.02]' : 'px-4 py-20 sm:px-6 lg:px-8'}>
      <div className="mx-auto max-w-7xl">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="mb-12 max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-balance sm:text-[2.125rem]">{title}</h2>
          {description && <p className="mt-3.5 text-[1.0625rem] leading-relaxed text-pretty text-ink-500 dark:text-ink-400">{description}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
}

/** Decorative, non-interactive preview of the student dashboard. */
function DashboardPreview() {
  const bars = [88, 72, 94, 66, 81, 90];
  return (
    <div className="surface relative overflow-hidden p-0 shadow-lift" aria-hidden="true">
      <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <span className="size-2.5 rounded-full bg-rose-400" />
        <span className="size-2.5 rounded-full bg-gold-300" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 truncate text-[0.6875rem] text-ink-400">ecampus-elo.smit.smu.edu.in/app</span>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-sm font-bold">Good morning, Aarav</p>
            <p className="text-[0.6875rem] text-ink-400">B.Tech CSE · Semester 5 · 2023CSE0101</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[0.6875rem] font-semibold text-emerald-600 dark:text-emerald-400">
            86.4% attendance
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'CGPA', value: '8.24' },
            { label: 'Pending', value: '3' },
            { label: 'Credits', value: '78' },
          ].map((stat) => (
            <div key={stat.label} className="surface-muted p-3">
              <p className="text-[0.625rem] text-ink-400 uppercase">{stat.label}</p>
              <p className="mt-1 font-display text-lg font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="surface-muted p-4">
          <p className="mb-3 text-[0.6875rem] font-semibold text-ink-500">Attendance by subject</p>
          <div className="flex h-24 items-end gap-2">
            {bars.map((height, index) => (
              <motion.span
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.9, delay: 0.5 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 rounded-t-[4px] bg-brand-500/85"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {[
            ['Normalisation Case Study', 'due in 3 days'],
            ['Socket Programming Lab Report', 'submitted'],
          ].map(([title, meta]) => (
            <div key={title} className="flex items-center gap-3 rounded-xl border border-ink-100 px-3 py-2.5 dark:border-white/5">
              <ClipboardList size={15} className="shrink-0 text-brand-500" />
              <span className="min-w-0 flex-1 truncate text-[0.75rem] font-medium">{title}</span>
              <span className="shrink-0 text-[0.625rem] text-ink-400">{meta}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute -right-6 -bottom-8 size-40 rounded-full bg-gold-400/20 blur-2xl" />
    </div>
  );
}
