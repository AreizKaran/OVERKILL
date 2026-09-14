import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock3,
  Save,
  UserX,
} from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Progress,
  Select,
  SkeletonCard,
  Table,
  Td,
  Th,
  cx,
} from '../../components/ui/index.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { BarSeriesChart } from '../../components/charts/index.jsx';
import { formatDate, percent, toneForPercentage } from '../../lib/format.js';

export default function Attendance() {
  const { user } = useAuth();
  return user.role === 'student' ? <StudentAttendance /> : <FacultyAttendance />;
}

/* ------------------------------------------------------------------ */
/* Student view                                                        */
/* ------------------------------------------------------------------ */
const STATUS_TONE = { present: 'emerald', late: 'amber', absent: 'rose', excused: 'slate' };

function StudentAttendance() {
  const { data, loading } = useApi('/attendance/me');

  if (loading) return <SkeletonCard lines={8} />;
  if (!data) return <EmptyState icon={CalendarCheck} title="No attendance records yet" />;

  const { overall, subjects, timeline } = data;

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="My attendance"
        description="Subject-wise attendance for the current semester. A minimum of 75% is required in every subject to be eligible for the End Semester Examination."
      />

      {overall.shortage && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3.5">
          <AlertTriangle size={19} className="shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          <p className="text-sm text-rose-900 dark:text-rose-200">
            Your overall attendance is below the mandatory 75%. Contact your mentor at the earliest.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Overall attendance" value={percent(overall.percentage)} sub={`${overall.attended} of ${overall.total} classes`} icon={CalendarCheck} tone={toneForPercentage(overall.percentage)} />
        <StatCard index={1} label="Classes attended" value={overall.attended} sub="Present or late" icon={CheckCircle2} tone="emerald" />
        <StatCard index={2} label="Classes missed" value={overall.total - overall.attended} sub="Absent or excused" icon={UserX} tone={overall.total - overall.attended > 0 ? 'amber' : 'slate'} />
      </div>

      <Card className="mt-6">
        <CardHeader title="Attendance by subject" subtitle="The dashed line marks the 75% eligibility threshold" icon={CalendarCheck} />
        <BarSeriesChart
          data={subjects.map((s) => ({ code: s.subject.code, percentage: s.percentage }))}
          xKey="code"
          yKey="percentage"
          name="Attendance"
          suffix="%"
          domain={[0, 100]}
          threshold={75}
          colorBy={(entry, tokens) => (entry.percentage < 75 ? tokens.status.warning : tokens.series1)}
        />
      </Card>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Subject breakdown" icon={CalendarCheck} />
          <Table>
            <thead>
              <tr>
                <Th>Subject</Th>
                <Th align="center">Held</Th>
                <Th align="center">Attended</Th>
                <Th align="right">Percentage</Th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((row) => (
                <tr key={row.subject._id}>
                  <Td>
                    <span className="font-semibold">{row.subject.code}</span>
                    <span className="block truncate text-xs text-ink-500 dark:text-ink-400">{row.subject.name}</span>
                  </Td>
                  <Td align="center" className="tabular-nums">{row.total}</Td>
                  <Td align="center" className="tabular-nums">{row.attended}</Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-3">
                      <Progress value={row.percentage} tone={toneForPercentage(row.percentage)} size="sm" className="w-20" />
                      <span className={cx('w-14 text-right font-semibold tabular-nums', row.percentage < 75 && 'text-rose-600 dark:text-rose-400')}>
                        {row.percentage}%
                      </span>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Recent sessions" subtitle="Your last 20 marked classes" icon={Clock3} />
          <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {timeline.slice(0, 20).map((entry, index) => (
              <li key={`${entry.date}-${index}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-ink-50 dark:hover:bg-white/5">
                <span className="w-16 shrink-0 text-xs text-ink-500 dark:text-ink-400">{formatDate(entry.date, { year: undefined })}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-medium">{entry.subject}</span>
                  {entry.topic && <span className="block truncate text-[0.6875rem] text-ink-400">{entry.topic}</span>}
                </span>
                <Badge tone={STATUS_TONE[entry.status]} className="capitalize">{entry.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Faculty / admin view                                                */
/* ------------------------------------------------------------------ */
const STATUS_CYCLE = ['present', 'absent', 'late', 'excused'];

function FacultyAttendance() {
  const toast = useToast();
  const { data: subjects, loading: loadingSubjects } = useApi('/academics/subjects');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState({});
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!subjectId && subjects?.length) setSubjectId(subjects[0]._id);
  }, [subjects, subjectId]);

  const rosterPath = subjectId ? `/attendance/roster/${subjectId}?date=${date}` : null;
  const { data: roster, loading: loadingRoster, reload } = useApi(rosterPath, { enabled: Boolean(rosterPath) });
  const { data: report } = useApi(subjectId ? `/attendance/report/${subjectId}` : null, { enabled: Boolean(subjectId) });

  // Seed the roster from a previously saved session, or default everyone to present.
  useEffect(() => {
    if (!roster) return;
    const seeded = {};
    roster.students.forEach((student) => {
      const saved = roster.existing?.records?.find((r) => String(r.student) === String(student._id));
      seeded[student._id] = saved?.status ?? 'present';
    });
    setMarks(seeded);
    setTopic(roster.existing?.topic ?? '');
  }, [roster]);

  const counts = useMemo(() => {
    const values = Object.values(marks);
    return {
      present: values.filter((v) => v === 'present').length,
      absent: values.filter((v) => v === 'absent').length,
      late: values.filter((v) => v === 'late').length,
      excused: values.filter((v) => v === 'excused').length,
    };
  }, [marks]);

  const cycle = (studentId) =>
    setMarks((current) => {
      const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current[studentId]) + 1) % STATUS_CYCLE.length];
      return { ...current, [studentId]: next };
    });

  const setAll = (status) =>
    setMarks((current) => Object.fromEntries(Object.keys(current).map((id) => [id, status])));

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/attendance', {
        subject: subjectId,
        date,
        period: 1,
        topic,
        records: Object.entries(marks).map(([student, status]) => ({ student, status })),
      });
      toast('Attendance saved for this session.');
      reload();
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingSubjects) return <SkeletonCard lines={6} />;
  if (!subjects?.length) {
    return (
      <>
        <PageHeader eyebrow="Academics" title="Attendance" />
        <EmptyState icon={CalendarCheck} title="No subjects assigned" description="Attendance can be marked once subjects are allocated to you." />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Attendance"
        description="Mark a session for one of your subjects, then review the class report below."
        actions={
          <Button icon={Save} onClick={save} loading={saving} disabled={!roster?.students?.length}>
            {roster?.existing ? 'Update session' : 'Save attendance'}
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="label">Subject</span>
            <Select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.code} — {subject.name} (Sem {subject.semester})
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="label">Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field" />
          </label>
          <label className="block">
            <span className="label">Topic covered</span>
            <input
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. Unit 3 — Normalisation"
              className="field"
            />
          </label>
        </div>

        {roster?.existing && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={13} aria-hidden="true" />
            A session already exists for this date — saving will update it.
          </p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Class roster"
            subtitle="Tap a student to cycle present → absent → late → excused"
            icon={CalendarCheck}
            action={
              <div className="flex gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => setAll('present')}>All present</Button>
                <Button size="sm" variant="ghost" onClick={() => setAll('absent')}>All absent</Button>
              </div>
            }
          />

          <div className="mb-4 flex flex-wrap gap-2">
            <Badge tone="emerald">{counts.present} present</Badge>
            <Badge tone="rose">{counts.absent} absent</Badge>
            <Badge tone="amber">{counts.late} late</Badge>
            <Badge tone="slate">{counts.excused} excused</Badge>
          </div>

          {loadingRoster ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => <div key={index} className="skeleton h-12" />)}
            </div>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {roster?.students?.map((student) => {
                const status = marks[student._id] ?? 'present';
                return (
                  <li key={student._id}>
                    <button
                      type="button"
                      onClick={() => cycle(student._id)}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                        status === 'present' && 'border-emerald-400/50 bg-emerald-500/5',
                        status === 'absent' && 'border-rose-400/50 bg-rose-500/5',
                        status === 'late' && 'border-amber-400/50 bg-amber-500/5',
                        status === 'excused' && 'border-ink-300 bg-ink-100/60 dark:border-white/10 dark:bg-white/5'
                      )}
                      aria-label={`${student.user.name} — currently ${status}`}
                    >
                      <Avatar name={student.user.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.8125rem] font-medium">{student.user.name}</span>
                        <span className="block truncate text-[0.6875rem] text-ink-500 dark:text-ink-400">
                          {student.rollNo} · {student.registrationNo}
                        </span>
                      </span>
                      <Badge tone={STATUS_TONE[status]} className="capitalize">{status}</Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Class report"
            subtitle={report ? `${report.sessionCount} sessions marked · ${report.belowThreshold} below 75%` : 'Loading…'}
            icon={Check}
          />
          {report?.summary?.length ? (
            <div className="max-h-[30rem] overflow-y-auto">
              <Table className="min-w-0">
                <thead>
                  <tr>
                    <Th>Student</Th>
                    <Th align="right">Attendance</Th>
                  </tr>
                </thead>
                <tbody>
                  {report.summary.map((row) => (
                    <tr key={row.student._id}>
                      <Td>
                        <span className="text-[0.8125rem] font-medium">{row.student.user.name}</span>
                        <span className="block text-xs text-ink-400">{row.student.rollNo} · {row.attended}/{row.total}</span>
                      </Td>
                      <Td align="right">
                        <Badge tone={toneForPercentage(row.percentage)}>{row.percentage}%</Badge>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <EmptyState icon={CalendarCheck} title="No sessions marked yet" description="Save a session to build the class report." />
          )}
        </Card>
      </div>
    </>
  );
}
