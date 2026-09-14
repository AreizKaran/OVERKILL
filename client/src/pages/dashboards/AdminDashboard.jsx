import { Link } from 'react-router-dom';
import {
  Activity,
  Building2,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  MessageSquareQuote,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { Badge, Button, Card, CardHeader, EmptyState, Table, Td, Th } from '../../components/ui/index.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { BarSeriesChart, GroupedBarChart, TrendChart, SplitBar } from '../../components/charts/index.jsx';
import { inr, inrCompact, percent, relativeTime, toneForPercentage } from '../../lib/format.js';
import { INSTITUTE } from '../../data/reference.js';

const ACTIVITY_TONE = {
  assignment: 'brand',
  fee: 'emerald',
  announcement: 'gold',
  attendance: 'slate',
};

export default function AdminDashboard({ data }) {
  const { stats, byDepartment, gradeDistribution, attendanceTrend, finance, semesterDistribution, recentActivity, announcements } = data;
  const collectionRate = finance.billed ? (finance.collected / finance.billed) * 100 : 0;

  return (
    <>
      <PageHeader
        eyebrow={`${INSTITUTE.short} · ${INSTITUTE.term} ${INSTITUTE.academicYear}`}
        title="Institution overview"
        description="Enrolment, academic performance, attendance health and fee collection across every department."
        actions={
          <>
            <Link to="/app/announcements">
              <Button variant="secondary" size="sm" icon={Megaphone}>Publish notice</Button>
            </Link>
            <Link to="/app/users">
              <Button size="sm" icon={Users}>Manage users</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total students" value={stats.students} sub={`${stats.hostelResidents ?? 0} in hostel`} icon={Users} tone="brand" />
        <StatCard index={1} label="Total faculty" value={stats.faculty} sub={`${stats.departments} departments`} icon={Building2} tone="emerald" />
        <StatCard
          index={2}
          label="Institute attendance"
          value={percent(stats.attendancePercentage)}
          sub="All marked sessions"
          icon={CalendarCheck}
          tone={toneForPercentage(stats.attendancePercentage)}
        />
        <StatCard index={3} label="Average CGPA" value={stats.averageCgpa.toFixed(2)} sub={`${percent(stats.passRate)} pass rate`} icon={GraduationCap} tone="gold" />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Students and faculty by department" subtitle="Head count across the institute" icon={Building2} />
          <GroupedBarChart
            data={byDepartment}
            xKey="code"
            series={[
              { key: 'students', label: 'Students' },
              { key: 'faculty', label: 'Faculty' },
            ]}
            height={272}
          />
        </Card>

        <Card>
          <CardHeader title="Fee collection" subtitle={`${percent(collectionRate)} of the semester demand`} icon={Wallet} />
          <p className="font-display text-2xl font-bold">{inrCompact(finance.collected)}</p>
          <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">collected of {inrCompact(finance.billed)} billed</p>
          <div className="mt-5">
            <SplitBar
              total={finance.billed}
              segments={[
                { label: 'Collected', value: finance.collected },
                { label: 'Outstanding', value: finance.outstanding },
              ]}
              formatValue={inr}
            />
          </div>
          {finance.overdueCount > 0 && (
            <p className="mt-4 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              {finance.overdueCount} demand note(s) past their due date.
            </p>
          )}
          <Link to="/app/fees" className="mt-4 inline-block text-[0.8125rem] font-medium text-brand-600 hover:underline dark:text-brand-300">
            Open Fees & Finance →
          </Link>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Grade distribution" subtitle="Published results across the institute" icon={GraduationCap} />
          <BarSeriesChart data={gradeDistribution} xKey="grade" yKey="count" name="Results" height={228} />
        </Card>

        <Card>
          <CardHeader title="Attendance trend" subtitle="Weekly average, oldest week first" icon={TrendingUp} />
          {attendanceTrend?.length > 1 ? (
            <TrendChart data={attendanceTrend} xKey="label" yKey="percentage" name="Attendance" suffix="%" domain={[60, 100]} height={228} />
          ) : (
            <EmptyState icon={TrendingUp} title="Not enough sessions yet" />
          )}
        </Card>

        <Card>
          <CardHeader title="Enrolment by semester" icon={Users} />
          <BarSeriesChart data={semesterDistribution} xKey="semester" yKey="students" name="Students" height={228} />
        </Card>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Department performance" subtitle="Average CGPA and staffing ratio" icon={Building2} />
          <Table>
            <thead>
              <tr>
                <Th>Department</Th>
                <Th align="right">Students</Th>
                <Th align="right">Faculty</Th>
                <Th align="right">Ratio</Th>
                <Th align="right">Avg CGPA</Th>
              </tr>
            </thead>
            <tbody>
              {byDepartment.map((row) => (
                <tr key={row.code}>
                  <Td>
                    <span className="font-semibold">{row.code}</span>
                    <span className="block truncate text-xs text-ink-500 dark:text-ink-400">{row.name}</span>
                  </Td>
                  <Td align="right" className="tabular-nums">{row.students}</Td>
                  <Td align="right" className="tabular-nums">{row.faculty}</Td>
                  <Td align="right" className="tabular-nums">
                    {row.faculty ? `1:${Math.round(row.students / row.faculty)}` : '—'}
                  </Td>
                  <Td align="right">
                    <Badge tone={row.avgCgpa >= 8 ? 'emerald' : row.avgCgpa >= 7 ? 'brand' : 'amber'}>
                      {row.avgCgpa.toFixed(2)}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Recent activity" subtitle="Across every module" icon={Activity} />
          {recentActivity?.length ? (
            <ul className="space-y-3">
              {recentActivity.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.8125rem] leading-snug text-ink-700 dark:text-ink-200">{item.title}</span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <Badge tone={ACTIVITY_TONE[item.type] ?? 'slate'} className="px-1.5 py-0 text-[0.625rem] capitalize">
                        {item.type}
                      </Badge>
                      <span className="text-[0.6875rem] text-ink-400">{relativeTime(item.at)}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Activity} title="No recent activity" />
          )}
        </Card>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Feedback analytics"
            subtitle={`${stats.feedbackCount} responses · ${stats.averageFeedback.toFixed(2)} average rating`}
            icon={MessageSquareQuote}
            action={<Link to="/app/feedback" className="text-[0.8125rem] font-medium text-brand-600 hover:underline dark:text-brand-300">Details</Link>}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="surface-muted p-4">
              <p className="text-xs text-ink-500 dark:text-ink-400">Average rating</p>
              <p className="mt-1 font-display text-2xl font-bold">{stats.averageFeedback.toFixed(2)}<span className="text-base font-medium text-ink-400"> / 5</span></p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-xs text-ink-500 dark:text-ink-400">Responses collected</p>
              <p className="mt-1 font-display text-2xl font-bold">{stats.feedbackCount}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-500 dark:text-ink-400">
            Student-to-faculty feedback is collected anonymously and aggregated per faculty member before it is shown.
          </p>
        </Card>

        <Card>
          <CardHeader
            title="Latest announcements"
            icon={Megaphone}
            action={<Link to="/app/announcements" className="text-[0.8125rem] font-medium text-brand-600 hover:underline dark:text-brand-300">Manage</Link>}
          />
          {announcements?.length ? (
            <ul className="divide-y divide-ink-100 dark:divide-white/5">
              {announcements.map((item) => (
                <li key={item._id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <Badge tone={item.priority === 'urgent' ? 'rose' : item.priority === 'important' ? 'amber' : 'brand'} className="mt-0.5">
                    {item.category}
                  </Badge>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.875rem] font-medium">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-ink-400">{relativeTime(item.publishAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Megaphone} title="No announcements published" />
          )}
        </Card>
      </div>
    </>
  );
}
