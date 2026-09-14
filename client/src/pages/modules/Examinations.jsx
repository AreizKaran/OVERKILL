import { useMemo, useState } from 'react';
import { CalendarDays, Clock, FileBadge, MapPin, Plus } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Badge, Button, Card, EmptyState, Field, Input, Select, SkeletonCard, Tabs, Textarea } from '../../components/ui/index.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { formatDate, relativeTime } from '../../lib/format.js';

const TYPE_TONE = {
  'Sessional I': 'brand',
  'Sessional II': 'brand',
  'End Semester': 'gold',
  'Lab Internal': 'emerald',
  Practical: 'emerald',
  Makeup: 'amber',
};

export default function Examinations() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, reload } = useApi('/exams');
  const { data: subjects } = useApi('/academics/subjects');
  const [tab, setTab] = useState('upcoming');
  const [scheduling, setScheduling] = useState(false);

  const groups = useMemo(() => {
    const list = data ?? [];
    const now = new Date();
    return {
      upcoming: list.filter((exam) => new Date(exam.date) >= now),
      completed: list.filter((exam) => new Date(exam.date) < now).reverse(),
    };
  }, [data]);

  const visible = groups[tab] ?? [];
  const canSchedule = user.role === 'admin' || user.role === 'faculty';

  if (loading) return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}</div>;

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Examinations"
        description={
          user.role === 'student'
            ? 'Your examination schedule for the current semester. Carry your institute identity card and report 15 minutes early.'
            : 'Examination schedule across the subjects you are responsible for.'
        }
        actions={canSchedule ? <Button icon={Plus} onClick={() => setScheduling(true)}>Schedule exam</Button> : null}
      />

      <Tabs
        className="mb-6 max-w-sm"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'upcoming', label: 'Upcoming', count: groups.upcoming.length },
          { value: 'completed', label: 'Completed', count: groups.completed.length },
        ]}
      />

      {visible.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((exam) => (
            <Card key={exam._id} interactive className="flex gap-4">
              <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-500/10 py-3 text-brand-700 dark:bg-brand-400/10 dark:text-brand-200">
                <span className="text-[0.6875rem] font-semibold uppercase">
                  {new Date(exam.date).toLocaleDateString('en-IN', { month: 'short' })}
                </span>
                <span className="font-display text-2xl leading-none font-bold">{new Date(exam.date).getDate()}</span>
                <span className="mt-0.5 text-[0.625rem]">
                  {new Date(exam.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-[0.9375rem] font-semibold">{exam.subject?.code}</p>
                  <Badge tone={TYPE_TONE[exam.type] ?? 'slate'}>{exam.type}</Badge>
                </div>
                <p className="mt-0.5 truncate text-sm text-ink-500 dark:text-ink-400">{exam.subject?.name}</p>

                <dl className="mt-3 space-y-1.5 text-xs text-ink-600 dark:text-ink-300">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="shrink-0 text-ink-400" aria-hidden="true" />
                    <dt className="sr-only">Time</dt>
                    <dd>{exam.startTime} · {exam.durationMinutes} minutes</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="shrink-0 text-ink-400" aria-hidden="true" />
                    <dt className="sr-only">Venue</dt>
                    <dd>{exam.room}</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileBadge size={13} className="shrink-0 text-ink-400" aria-hidden="true" />
                    <dt className="sr-only">Maximum marks</dt>
                    <dd>{exam.maxMarks} marks</dd>
                  </div>
                </dl>

                <p className="mt-3 text-[0.6875rem] text-ink-400">
                  {new Date(exam.date) >= new Date() ? relativeTime(exam.date) : `Held ${formatDate(exam.date)}`}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title={tab === 'upcoming' ? 'No examinations scheduled' : 'No completed examinations'}
          description="Examination schedules appear here once the academic section publishes them."
        />
      )}

      <ScheduleExamModal
        open={scheduling}
        onClose={() => setScheduling(false)}
        subjects={subjects ?? []}
        onCreated={() => {
          setScheduling(false);
          reload();
          toast('Examination scheduled and students notified.');
        }}
      />
    </>
  );
}

function ScheduleExamModal({ open, onClose, subjects, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({
    subject: '',
    name: '',
    type: 'Sessional II',
    date: '',
    startTime: '10:00',
    durationMinutes: 90,
    room: '',
    maxMarks: 30,
    instructions: '',
  });
  const [saving, setSaving] = useState(false);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const subject = subjects.find((s) => s._id === form.subject);
      await api.post('/exams', { ...form, name: form.name || `${form.type} — ${subject?.code ?? ''}` });
      onCreated();
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule an examination"
      description="Every student in the subject's semester is notified when the schedule is published."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button form="exam-form" type="submit" loading={saving} icon={Plus}>Schedule</Button>
        </>
      }
    >
      <form id="exam-form" onSubmit={save} className="space-y-4">
        <Field label="Subject" required>
          <Select value={form.subject} onChange={update('subject')} required>
            <option value="">Choose a subject…</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.code} — {subject.name}</option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Examination type" required>
            <Select value={form.type} onChange={update('type')}>
              {Object.keys(TYPE_TONE).map((type) => <option key={type}>{type}</option>)}
            </Select>
          </Field>
          <Field label="Maximum marks" required>
            <Input type="number" min="1" value={form.maxMarks} onChange={update('maxMarks')} required />
          </Field>
          <Field label="Date" required>
            <input type="date" value={form.date} onChange={update('date')} className="field" required />
          </Field>
          <Field label="Start time" required>
            <input type="time" value={form.startTime} onChange={update('startTime')} className="field" required />
          </Field>
          <Field label="Duration (minutes)" required>
            <Input type="number" min="15" step="15" value={form.durationMinutes} onChange={update('durationMinutes')} required />
          </Field>
          <Field label="Room / hall" required>
            <Input value={form.room} onChange={update('room')} placeholder="e.g. Exam Hall 2" required />
          </Field>
        </div>

        <Field label="Instructions" hint="Shown to students alongside the schedule.">
          <Textarea value={form.instructions} onChange={update('instructions')} placeholder="e.g. Answer all questions. Non-programmable calculators permitted." />
        </Field>
      </form>
    </Modal>
  );
}
