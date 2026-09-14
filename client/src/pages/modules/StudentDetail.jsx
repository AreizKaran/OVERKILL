import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, GraduationCap, Home, Mail, Phone, User, Wallet } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Progress, SkeletonCard, Table, Td, Th } from '../../components/ui/index.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { BarSeriesChart } from '../../components/charts/index.jsx';
import { formatDate, gradeTone, inr, percent, toneForPercentage } from '../../lib/format.js';

export default function StudentDetail() {
  const { id } = useParams();
  const { data, loading, error } = useApi(`/students/${id}`);

  if (loading) return <SkeletonCard lines={10} />;
  if (error || !data) {
    return <EmptyState icon={User} title="Student not found" description={error?.message} action={<Link to="/app/students"><Button variant="secondary">Back to students</Button></Link>} />;
  }

  const { student, attendance, results, fee } = data;

  return (
    <>
      <Link to="/app/students" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300">
        <ArrowLeft size={15} aria-hidden="true" /> Back to students
      </Link>

      <PageHeader
        eyebrow={`${student.department?.code} · ${student.course?.name ?? ''}`}
        title={student.user?.name}
        description={`${student.registrationNo} · Roll ${student.rollNo} · Semester ${student.semester}, Section ${student.section} · Batch ${student.batch}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Attendance" value={percent(attendance?.overall?.percentage ?? 0)} sub={`${attendance?.overall?.attended ?? 0} of ${attendance?.overall?.total ?? 0}`} icon={CalendarCheck} tone={toneForPercentage(attendance?.overall?.percentage ?? 0)} />
        <StatCard index={1} label="CGPA" value={results?.cgpa ? results.cgpa.toFixed(2) : '—'} sub={`${results?.totalCredits ?? 0} credits`} icon={GraduationCap} tone="brand" />
        <StatCard index={2} label="Backlogs" value={results?.backlogs ?? 0} sub={results?.backlogs ? 'Needs attention' : 'All clear'} icon={GraduationCap} tone={results?.backlogs ? 'rose' : 'emerald'} />
        <StatCard index={3} label="Fee status" value={fee ? (fee.totalAmount - fee.paidAmount > 0 ? inr(fee.totalAmount - fee.paidAmount) : 'Cleared') : '—'} sub={fee ? `Semester ${fee.semester}` : 'No demand'} icon={Wallet} tone={fee && fee.totalAmount - fee.paidAmount > 0 ? 'amber' : 'emerald'} />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex flex-col items-center text-center">
            <Avatar name={student.user?.name} size="xl" ring />
            <h2 className="mt-4 font-display text-lg font-bold">{student.user?.name}</h2>
            <p className="text-sm text-ink-500 dark:text-ink-400">{student.registrationNo}</p>
            <Badge tone={student.status === 'Active' ? 'emerald' : 'amber'} className="mt-3">{student.status}</Badge>
          </div>

          <dl className="mt-6 space-y-3 border-t border-ink-100 pt-5 text-sm dark:border-white/5">
            <Row icon={Mail} label="Email" value={student.user?.email} href={`mailto:${student.user?.email}`} />
            <Row icon={Phone} label="Phone" value={student.user?.phone} />
            <Row icon={User} label="Date of birth" value={formatDate(student.dateOfBirth)} />
            <Row icon={User} label="Gender · Blood group" value={`${student.gender ?? '—'} · ${student.bloodGroup ?? '—'}`} />
            <Row icon={Home} label="Residence" value={student.hostel?.resident ? `${student.hostel.block} hostel · Room ${student.hostel.roomNo}` : 'Day scholar'} />
            {student.address && (
              <Row icon={Home} label="Address" value={`${student.address.line1}, ${student.address.city}, ${student.address.state} ${student.address.pincode}`} />
            )}
          </dl>

          {student.guardian?.name && (
            <div className="mt-5 border-t border-ink-100 pt-5 dark:border-white/5">
              <p className="eyebrow mb-2">Guardian</p>
              <p className="text-sm font-medium">{student.guardian.name} <span className="font-normal text-ink-500 dark:text-ink-400">({student.guardian.relation})</span></p>
              <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{student.guardian.phone} · {student.guardian.occupation}</p>
            </div>
          )}

          {student.mentor?.user && (
            <div className="mt-5 border-t border-ink-100 pt-5 dark:border-white/5">
              <p className="eyebrow mb-2">Faculty mentor</p>
              <p className="text-sm font-medium">{student.mentor.user.name}</p>
              <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">Cabin {student.mentor.cabin} · {student.mentor.user.email}</p>
            </div>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Attendance by subject" subtitle="Dashed line marks the 75% threshold" icon={CalendarCheck} />
            {attendance?.subjects?.length ? (
              <BarSeriesChart
                data={attendance.subjects.map((s) => ({ code: s.subject.code, percentage: s.percentage }))}
                xKey="code"
                yKey="percentage"
                name="Attendance"
                suffix="%"
                domain={[0, 100]}
                threshold={75}
                colorBy={(entry, tokens) => (entry.percentage < 75 ? tokens.status.warning : tokens.series1)}
              />
            ) : (
              <EmptyState icon={CalendarCheck} title="No attendance recorded" />
            )}
          </Card>

          {results?.semesters?.map((sem) => (
            <Card key={sem.semester}>
              <CardHeader
                title={`Semester ${sem.semester} results`}
                subtitle={sem.published ? `SGPA ${sem.sgpa.toFixed(2)} · ${sem.credits} credits` : 'Internal assessment in progress'}
                icon={GraduationCap}
              />
              <Table>
                <thead>
                  <tr>
                    <Th>Subject</Th>
                    <Th align="center">Total</Th>
                    <Th align="right">Grade</Th>
                  </tr>
                </thead>
                <tbody>
                  {sem.results.map((row) => (
                    <tr key={row.id ?? row._id}>
                      <Td>
                        <span className="font-semibold">{row.subject?.code}</span>
                        <span className="block truncate text-xs text-ink-500 dark:text-ink-400">{row.subject?.name}</span>
                      </Td>
                      <Td align="center" className="tabular-nums">{row.status === 'pending' ? '—' : `${row.totalMarks} / 100`}</Td>
                      <Td align="right">
                        {row.grade ? <Badge tone={gradeTone(row.grade)}>{row.grade}</Badge> : <Badge tone="slate">Awaited</Badge>}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ))}

          {fee && (
            <Card>
              <CardHeader title={`Fee record — Semester ${fee.semester}`} subtitle={`${fee.academicYear} · due ${formatDate(fee.dueDate)}`} icon={Wallet} />
              <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <p><span className="text-sm text-ink-500 dark:text-ink-400">Billed </span><span className="font-display text-lg font-bold">{inr(fee.totalAmount)}</span></p>
                <p><span className="text-sm text-ink-500 dark:text-ink-400">Paid </span><span className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400">{inr(fee.paidAmount)}</span></p>
                <Badge tone={fee.status === 'paid' ? 'emerald' : fee.status === 'overdue' ? 'rose' : 'amber'} className="capitalize">{fee.status}</Badge>
              </div>
              <Progress value={(fee.paidAmount / fee.totalAmount) * 100} tone={fee.status === 'paid' ? 'emerald' : 'amber'} showValue label="Collected" />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} className="mt-0.5 shrink-0 text-ink-400" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-ink-400">{label}</dt>
        <dd className="mt-0.5 text-[0.8125rem] font-medium break-words">
          {href ? <a href={href} className="text-brand-600 hover:underline dark:text-brand-300">{value}</a> : (value || '—')}
        </dd>
      </div>
    </div>
  );
}
