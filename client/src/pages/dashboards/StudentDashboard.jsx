import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  FileBadge,
  GraduationCap,
  Megaphone,
  Wallet,
} from 'lucide-react';
import { Badge, Button, Card, CardHeader, EmptyState, Progress } from '../../components/ui/index.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { BarSeriesChart, TrendChart, SplitBar } from '../../components/charts/index.jsx';
import { formatDate, inr, percent, relativeTime, toneForPercentage, daysUntil } from '../../lib/format.js';
import { useAuth } from '../../context/AuthContext.jsx';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function StudentDashboard({ data }) {
  const { user, profile } = useAuth();
  const { attendance, assignments, performance, exams, announcements, fee } = data;
  const attendanceTone = toneForPercentage(attendance.percentage);

  return (
    <>
      <PageHeader
        eyebrow={`${profile?.course?.name ?? 'B.Tech'} · Semester ${profile?.semester ?? '—'}`}
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description={`Registration ${profile?.registrationNo ?? '—'} · Section ${profile?.section ?? 'A'} · Batch ${profile?.batch ?? '—'}`}
        actions={
          <>
            <Link to="/app/assignments">
              <Button variant="secondary" size="sm" icon={ClipboardList}>Assignments</Button>
            </Link>
            <Link to="/app/results">
              <Button size="sm" icon={GraduationCap}>View results</Button>
            </Link>
          </>
        }
      />

      {/* Shortage advisory is the one thing a student must not miss. */}
      {attendance.shortageSubjects.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3.5">
          <AlertTriangle size={19} className="shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm text-amber-900 dark:text-amber-200">
            <span className="font-semibold">Attendance shortage.</span> You are below the mandatory 75% in{' '}
            {attendance.shortageSubjects.join(', ')}. Meet your mentor before the eligibility cut-off.
          </p>
          <Link to="/app/attendance" className="shrink-0">
            <Button size="sm" variant="secondary">Review</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Overall attendance"
          value={percent(attendance.percentage)}
          sub={`${attendance.attended} of ${attendance.total} classes`}
          icon={CalendarCheck}
          tone={attendanceTone}
        />
        <StatCard
          index={1}
          label="Cumulative CGPA"
          value={performance.cgpa ? performance.cgpa.toFixed(2) : '—'}
          sub={`${performance.credits} credits earned`}
          icon={GraduationCap}
          tone="brand"
        />
        <StatCard
          index={2}
          label="Pending assignments"
          value={assignments.pending}
          sub={assignments.overdue ? `${assignments.overdue} overdue` : `${assignments.submitted} submitted`}
          icon={ClipboardList}
          tone={assignments.overdue ? 'rose' : 'emerald'}
        />
        <StatCard
          index={3}
          label="Fee status"
          value={fee ? (fee.outstanding > 0 ? inr(fee.outstanding) : 'Cleared') : '—'}
          sub={fee ? (fee.outstanding > 0 ? `Due ${formatDate(fee.dueDate)}` : `Semester ${fee.semester} paid in full`) : 'No demand raised'}
          icon={Wallet}
          tone={fee?.outstanding > 0 ? 'amber' : 'emerald'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader
            title="Attendance by subject"
            subtitle="The dashed line marks the 75% eligibility threshold"
            icon={CalendarCheck}
            action={
              <Link to="/app/attendance" className="text-[0.8125rem] font-medium text-brand-600 hover:underline dark:text-brand-300">
                Details
              </Link>
            }
          />
          {attendance.bySubject.length ? (
            <BarSeriesChart
              data={attendance.bySubject}
              xKey="code"
              yKey="percentage"
              name="Attendance"
              suffix="%"
              domain={[0, 100]}
              threshold={75}
              grow
              colorBy={(entry, tokens) => (entry.percentage < 75 ? tokens.status.warning : tokens.series1)}
            />
          ) : (
            <EmptyState title="No attendance recorded yet" description="Sessions will appear here once your faculty start marking attendance." />
          )}
        </Card>

        <Card>
          <CardHeader title="Upcoming deadlines" icon={ClipboardList} />
          {assignments.upcoming.length ? (
            <ul className="space-y-3">
              {assignments.upcoming.map((item) => {
                const days = daysUntil(item.dueDate);
                return (
                  <li key={item.id} className="surface-muted p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 text-[0.875rem] font-medium">{item.title}</p>
                      <Badge tone={item.submitted ? 'emerald' : days <= 2 ? 'rose' : 'amber'}>
                        {item.submitted ? 'Submitted' : days <= 0 ? 'Due today' : `${days}d left`}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                      {item.subject} · {item.maxMarks} marks · due {formatDate(item.dueDate)}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={ClipboardList} title="Nothing due" description="You have no open assignment deadlines." />
          )}
        </Card>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Semester performance" subtitle="SGPA across published semesters" icon={GraduationCap} />
          {performance.semesters?.length > 1 ? (
            <TrendChart
              data={performance.semesters.map((s) => ({ label: `Sem ${s.semester}`, sgpa: s.sgpa }))}
              xKey="label"
              yKey="sgpa"
              name="SGPA"
              domain={[0, 10]}
              height={200}
            />
          ) : (
            <div className="py-3">
              <p className="font-display text-4xl font-bold">{performance.cgpa ? performance.cgpa.toFixed(2) : '—'}</p>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                Cumulative grade point average across {performance.credits} credits
              </p>
              <Progress className="mt-4" value={(performance.cgpa / 10) * 100} tone="brand" label="Out of 10.0" showValue={false} />
              {performance.backlogs > 0 && (
                <Badge tone="rose" className="mt-4">{performance.backlogs} backlog(s) to clear</Badge>
              )}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Upcoming examinations" icon={FileBadge} />
          {exams?.length ? (
            <ul className="divide-y divide-ink-100 dark:divide-white/5">
              {exams.map((exam) => (
                <li key={exam._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-center leading-none">
                    <span className="block text-[0.6875rem] font-semibold text-brand-700 dark:text-brand-300">
                      {new Date(exam.date).toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                    <span className="mt-0.5 block font-display text-sm font-bold">{new Date(exam.date).getDate()}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.875rem] font-medium">{exam.subject?.code} · {exam.type}</span>
                    <span className="block truncate text-xs text-ink-500 dark:text-ink-400">
                      {exam.startTime} · {exam.room} · {exam.maxMarks} marks
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FileBadge} title="No examinations scheduled" />
          )}
        </Card>

        <Card>
          <CardHeader title="Fee summary" icon={Wallet} action={<Link to="/app/fees" className="text-[0.8125rem] font-medium text-brand-600 hover:underline dark:text-brand-300">Manage</Link>} />
          {fee ? (
            <>
              <p className="font-display text-2xl font-bold">{inr(fee.totalAmount)}</p>
              <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">Semester {fee.semester} demand</p>
              <div className="mt-5">
                <SplitBar
                  total={fee.totalAmount}
                  segments={[
                    { label: 'Paid', value: fee.paidAmount },
                    { label: 'Outstanding', value: Math.max(fee.totalAmount - fee.paidAmount, 0) },
                  ]}
                  formatValue={inr}
                />
              </div>
              <p className="mt-4 text-xs text-ink-500 dark:text-ink-400">
                Due {formatDate(fee.dueDate)} · {relativeTime(fee.dueDate)}
              </p>
            </>
          ) : (
            <EmptyState icon={Wallet} title="No fee demand raised" />
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Recent announcements"
          icon={Megaphone}
          action={
            <Link to="/app/announcements">
              <Button size="sm" variant="ghost" icon={ArrowRight}>All notices</Button>
            </Link>
          }
        />
        {announcements?.length ? (
          <ul className="divide-y divide-ink-100 dark:divide-white/5">
            {announcements.map((item) => (
              <li key={item._id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <Badge tone={item.priority === 'urgent' ? 'rose' : item.priority === 'important' ? 'amber' : 'brand'}>
                    {item.category}
                  </Badge>
                  <span className="ml-auto text-xs whitespace-nowrap text-ink-400">{relativeTime(item.publishAt)}</span>
                </div>
                <p className="mt-2 text-[0.9375rem] font-medium">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{item.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Megaphone} title="No announcements yet" />
        )}
      </Card>
    </>
  );
}
