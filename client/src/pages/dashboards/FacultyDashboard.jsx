import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Clock,
  DoorOpen,
  Mail,
  MessageSquareQuote,
  Star,
  Users,
} from 'lucide-react';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Progress } from '../../components/ui/index.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { BarSeriesChart } from '../../components/charts/index.jsx';
import { formatDate, relativeTime, toneForPercentage } from '../../lib/format.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function FacultyDashboard({ data }) {
  const { user } = useAuth();
  const { profile, stats, todayClasses, subjects, classStrength, attendanceTrend, assignments, recentSubmissions, feedback } = data;

  return (
    <>
      <PageHeader
        eyebrow={`${profile.designation} · ${profile.employeeId}`}
        title={`Welcome, ${user.name}`}
        description={`Cabin ${profile.cabin} · ${profile.block ?? 'Academic Block'} · Office hours ${profile.officeHours ?? '—'}`}
        actions={
          <>
            <Link to="/app/attendance">
              <Button variant="secondary" size="sm" icon={CalendarCheck}>Mark attendance</Button>
            </Link>
            <Link to="/app/assignments">
              <Button size="sm" icon={ClipboardList}>New assignment</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Subjects assigned" value={stats.subjects} sub="This semester" icon={BookOpen} tone="brand" />
        <StatCard index={1} label="Students taught" value={stats.students} sub="Across all sections" icon={Users} tone="emerald" />
        <StatCard
          index={2}
          label="Pending evaluations"
          value={stats.pendingEvaluations}
          sub="Submissions awaiting marks"
          icon={ClipboardList}
          tone={stats.pendingEvaluations > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          index={3}
          label="Student rating"
          value={stats.averageRating ? `${stats.averageRating.toFixed(2)} / 5` : '—'}
          sub="Average across feedback received"
          icon={Star}
          tone="gold"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Today's classes" subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} icon={Clock} />
          {todayClasses?.length ? (
            <ul className="space-y-2.5">
              {todayClasses.map((session, index) => (
                <li key={`${session.subject}-${index}`} className="surface-muted flex items-center gap-3 p-3.5">
                  <span className="w-14 shrink-0 text-center">
                    <span className="block font-display text-sm font-bold">{session.startTime}</span>
                    <span className="block text-[0.6875rem] text-ink-400">{session.endTime}</span>
                  </span>
                  <span className="min-w-0 flex-1 border-l border-ink-200 pl-3 dark:border-white/10">
                    <span className="block truncate text-[0.875rem] font-medium">{session.subject} · {session.name}</span>
                    <span className="block truncate text-xs text-ink-500 dark:text-ink-400">
                      Semester {session.semester} · Room {session.room}
                    </span>
                  </span>
                  <Link to="/app/attendance" className="shrink-0">
                    <Button size="sm" variant="secondary">Mark</Button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Clock} title="No classes scheduled today" description="Your next session will appear here on its scheduled day." />
          )}
        </Card>

        <Card className="flex flex-col lg:col-span-2">
          <CardHeader
            title="Class attendance by subject"
            subtitle="Average across every session you have marked"
            icon={CalendarCheck}
            action={<Link to="/app/attendance" className="text-[0.8125rem] font-medium text-brand-600 hover:underline dark:text-brand-300">Reports</Link>}
          />
          {attendanceTrend?.length ? (
            <BarSeriesChart
              data={attendanceTrend}
              xKey="subject"
              yKey="percentage"
              name="Class attendance"
              suffix="%"
              domain={[0, 100]}
              threshold={75}
              grow
              colorBy={(entry, tokens) => (entry.percentage < 75 ? tokens.status.warning : tokens.series1)}
            />
          ) : (
            <EmptyState icon={CalendarCheck} title="No attendance marked yet" />
          )}
        </Card>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent submissions" subtitle="Newest first" icon={ClipboardList} />
          {recentSubmissions?.length ? (
            <ul className="divide-y divide-ink-100 dark:divide-white/5">
              {recentSubmissions.map((submission) => (
                <li key={submission._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar name={submission.student?.user?.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.875rem] font-medium">{submission.student?.user?.name}</span>
                    <span className="block truncate text-xs text-ink-500 dark:text-ink-400">
                      {submission.assignment?.title} · {relativeTime(submission.submittedAt)}
                    </span>
                  </span>
                  {submission.status === 'evaluated' ? (
                    <Badge tone="emerald">{submission.marks}/{submission.assignment?.maxMarks}</Badge>
                  ) : (
                    <Badge tone={submission.status === 'late' ? 'amber' : 'brand'}>
                      {submission.status === 'late' ? 'Late' : 'To evaluate'}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={ClipboardList} title="No submissions yet" />
          )}
        </Card>

        <Card>
          <CardHeader title="Faculty profile" icon={DoorOpen} action={<Link to="/app/profile" className="text-[0.8125rem] font-medium text-brand-600 hover:underline dark:text-brand-300">Edit</Link>} />
          <dl className="space-y-3 text-sm">
            {[
              ['Employee ID', profile.employeeId],
              ['Designation', profile.designation],
              ['Cabin', `${profile.cabin} · ${profile.block ?? '—'}`],
              ['Office hours', profile.officeHours ?? '—'],
              ['Contact', profile.contact ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-500 dark:text-ink-400">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink-500 dark:text-ink-400">Institutional email</dt>
              <dd className="min-w-0 text-right">
                <a href={`mailto:${profile.officialEmail}`} className="inline-flex items-center gap-1.5 truncate font-medium text-brand-600 hover:underline dark:text-brand-300">
                  <Mail size={13} aria-hidden="true" />
                  <span className="truncate">{profile.officialEmail}</span>
                </a>
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Class strength" subtitle="Students enrolled per subject" icon={Users} />
          <ul className="space-y-4">
            {classStrength?.map((item) => (
              <li key={item.subject}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[0.8125rem]">
                  <span className="truncate">
                    <span className="font-semibold">{item.subject}</span>{' '}
                    <span className="text-ink-500 dark:text-ink-400">{item.name}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{item.students}</span>
                </div>
                <Progress
                  value={(item.students / Math.max(...classStrength.map((c) => c.students), 1)) * 100}
                  tone="brand"
                  size="sm"
                />
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Recent student feedback"
            icon={MessageSquareQuote}
            action={<Link to="/app/feedback" className="text-[0.8125rem] font-medium text-brand-600 hover:underline dark:text-brand-300">All feedback</Link>}
          />
          {feedback?.length ? (
            <ul className="space-y-3">
              {feedback.map((item) => (
                <li key={item._id} className="surface-muted p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold">
                      <Star size={13} className="text-gold-500" aria-hidden="true" />
                      {item.averageRating.toFixed(1)} / 5
                    </span>
                    <span className="text-xs text-ink-400">{item.subject?.code} · {relativeTime(item.createdAt)}</span>
                  </div>
                  {item.comment && <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">“{item.comment}”</p>}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={MessageSquareQuote} title="No feedback received yet" />
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Your assignments" subtitle="Submission progress per assignment" icon={ClipboardList} />
        {assignments?.length ? (
          <ul className="space-y-4">
            {assignments.map((assignment) => {
              const rate = assignment.classSize ? (assignment.submitted / assignment.classSize) * 100 : 0;
              const closed = new Date(assignment.dueDate) < new Date();
              return (
                <li key={assignment._id}>
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="min-w-0 text-[0.875rem] font-medium">
                      {assignment.title}{' '}
                      <span className="text-ink-500 dark:text-ink-400">· {assignment.subject?.code}</span>
                    </span>
                    <span className="text-xs text-ink-500 dark:text-ink-400">
                      {assignment.submitted}/{assignment.classSize} submitted · due {formatDate(assignment.dueDate)}
                    </span>
                  </div>
                  <Progress value={rate} tone={closed ? toneForPercentage(rate) : 'brand'} size="sm" />
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={ClipboardList} title="No assignments created yet" />
        )}
      </Card>
    </>
  );
}
