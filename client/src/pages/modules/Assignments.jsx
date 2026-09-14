import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, FileUp, GraduationCap, Paperclip, Plus, Send } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, Progress, Select, SkeletonCard, Tabs, Textarea, cx } from '../../components/ui/index.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { bytes, daysUntil, formatDate, relativeTime, toneForPercentage } from '../../lib/format.js';

export default function Assignments() {
  const { user } = useAuth();
  return user.role === 'student' ? <StudentAssignments /> : <FacultyAssignments />;
}

/* ------------------------------------------------------------------ */
/* Student                                                             */
/* ------------------------------------------------------------------ */
function StudentAssignments() {
  const toast = useToast();
  const { data, loading, reload } = useApi('/assignments');
  const [tab, setTab] = useState('open');
  const [active, setActive] = useState(null);
  const [note, setNote] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const groups = useMemo(() => {
    const list = data ?? [];
    const now = new Date();
    return {
      open: list.filter((a) => !a.submission && new Date(a.dueDate) >= now),
      submitted: list.filter((a) => a.submission),
      overdue: list.filter((a) => !a.submission && new Date(a.dueDate) < now),
    };
  }, [data]);

  const openSubmit = (assignment) => {
    setActive(assignment);
    setNote(assignment.submission?.note ?? '');
    setFileName(assignment.submission?.files?.[0]?.name ?? '');
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/assignments/${active._id}/submit`, { note, fileName: fileName || undefined });
      toast('Assignment submitted successfully.');
      setActive(null);
      reload();
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="grid gap-5 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}</div>;

  const visible = groups[tab] ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Assignments"
        description="Track deadlines, submit your work and read the feedback your faculty leave on each submission."
      />

      <Tabs
        className="mb-6 max-w-lg"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'open', label: 'Open', count: groups.open.length },
          { value: 'submitted', label: 'Submitted', count: groups.submitted.length },
          { value: 'overdue', label: 'Missed', count: groups.overdue.length },
        ]}
      />

      {visible.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {visible.map((assignment) => {
            const days = daysUntil(assignment.dueDate);
            const submission = assignment.submission;
            return (
              <Card key={assignment._id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.6875rem] font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-300">
                      {assignment.subject?.code} · {assignment.subject?.name}
                    </p>
                    <h3 className="mt-1 text-base leading-snug font-semibold">{assignment.title}</h3>
                  </div>
                  {submission ? (
                    <Badge tone={submission.status === 'evaluated' ? 'emerald' : 'brand'}>
                      {submission.status === 'evaluated' ? 'Evaluated' : 'Submitted'}
                    </Badge>
                  ) : (
                    <Badge tone={days < 0 ? 'rose' : days <= 2 ? 'amber' : 'slate'}>
                      {days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `${days} days left`}
                    </Badge>
                  )}
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                  {assignment.description}
                </p>

                <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-ink-100 pt-3 text-xs dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <CalendarClock size={13} className="text-ink-400" aria-hidden="true" />
                    <dt className="sr-only">Due</dt>
                    <dd>{formatDate(assignment.dueDate)}</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-ink-400" aria-hidden="true" />
                    <dt className="sr-only">Maximum marks</dt>
                    <dd>{assignment.maxMarks} marks</dd>
                  </div>
                  {assignment.createdBy?.user && (
                    <div className="flex min-w-0 items-center gap-1.5">
                      <dt className="sr-only">Set by</dt>
                      <dd className="truncate text-ink-500 dark:text-ink-400">{assignment.createdBy.user.name}</dd>
                    </div>
                  )}
                </dl>

                {submission?.status === 'evaluated' && (
                  <div className="mt-4 rounded-xl bg-emerald-500/8 p-3.5">
                    <p className="flex items-center justify-between text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      <span>Score</span>
                      <span className="tabular-nums">{submission.marks} / {assignment.maxMarks}</span>
                    </p>
                    {submission.feedback && (
                      <p className="mt-2 text-[0.8125rem] text-emerald-900/80 dark:text-emerald-200/80">“{submission.feedback}”</p>
                    )}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="text-[0.6875rem] text-ink-400">
                    {submission ? `Submitted ${relativeTime(submission.submittedAt)}` : `Assigned ${relativeTime(assignment.assignedOn)}`}
                  </span>
                  {submission?.status === 'evaluated' ? (
                    <Badge tone="emerald" icon={CheckCircle2}>Closed</Badge>
                  ) : days < 0 && !assignment.allowLateSubmission && !submission ? (
                    <Badge tone="rose">Deadline passed</Badge>
                  ) : (
                    <Button size="sm" icon={FileUp} variant={submission ? 'secondary' : 'primary'} onClick={() => openSubmit(assignment)}>
                      {submission ? 'Resubmit' : 'Submit work'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title={tab === 'open' ? 'No open assignments' : tab === 'submitted' ? 'Nothing submitted yet' : 'No missed deadlines'}
          description={tab === 'overdue' ? 'You have submitted everything on time — keep it up.' : 'New assignments appear here as soon as your faculty publish them.'}
        />
      )}

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title}
        description={`${active?.subject?.code} · due ${formatDate(active?.dueDate)} · ${active?.maxMarks} marks`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setActive(null)}>Cancel</Button>
            <Button icon={Send} loading={submitting} onClick={submit}>Submit assignment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">{active?.description}</p>

          <Field label="File name" hint="Attach your work — the portal records the file against your submission.">
            <div className="flex gap-2">
              <Input value={fileName} onChange={(event) => setFileName(event.target.value)} placeholder="e.g. 021_CS1502_assignment.pdf" />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 px-3.5 text-sm font-medium whitespace-nowrap transition hover:bg-ink-50 dark:border-white/10 dark:hover:bg-white/5">
                <Paperclip size={15} aria-hidden="true" />
                Browse
                <input
                  type="file"
                  className="sr-only"
                  onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
                />
              </label>
            </div>
          </Field>

          <Field label="Note to your faculty" hint="Optional — mention anything the evaluator should know.">
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Question 4 uses an alternate approach…" />
          </Field>
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Faculty / admin                                                     */
/* ------------------------------------------------------------------ */
function FacultyAssignments() {
  const toast = useToast();
  const { user } = useAuth();
  const { data, loading, reload } = useApi('/assignments');
  const { data: subjects } = useApi('/academics/subjects');
  const [creating, setCreating] = useState(false);
  const [reviewing, setReviewing] = useState(null);

  if (loading) return <div className="grid gap-5 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}</div>;

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Assignments"
        description="Create assignments for your subjects, track submission progress and evaluate student work."
        actions={
          user.role === 'faculty' || user.role === 'admin' ? (
            <Button icon={Plus} onClick={() => setCreating(true)}>New assignment</Button>
          ) : null
        }
      />

      {data?.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((assignment) => {
            const rate = assignment.classSize ? (assignment.submitted / assignment.classSize) * 100 : 0;
            const pending = (assignment.submitted ?? 0) - (assignment.evaluated ?? 0);
            return (
              <Card key={assignment._id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.6875rem] font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-300">
                      {assignment.subject?.code}
                    </p>
                    <h3 className="mt-1 text-[0.9375rem] leading-snug font-semibold">{assignment.title}</h3>
                  </div>
                  <Badge tone={new Date(assignment.dueDate) < new Date() ? 'slate' : 'brand'}>
                    {new Date(assignment.dueDate) < new Date() ? 'Closed' : 'Open'}
                  </Badge>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{assignment.description}</p>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-baseline justify-between text-xs">
                    <span className="text-ink-500 dark:text-ink-400">Submissions</span>
                    <span className="font-semibold tabular-nums">
                      {assignment.submitted ?? 0}{assignment.classSize ? ` / ${assignment.classSize}` : ''}
                    </span>
                  </div>
                  <Progress value={rate} tone={toneForPercentage(rate)} size="sm" />
                </div>

                <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-500 dark:text-ink-400">
                  <div><dt className="sr-only">Due</dt><dd>Due {formatDate(assignment.dueDate)}</dd></div>
                  <div><dt className="sr-only">Marks</dt><dd>{assignment.maxMarks} marks</dd></div>
                  {pending > 0 && (
                    <div><dt className="sr-only">Pending</dt><dd className="font-medium text-amber-600 dark:text-amber-400">{pending} to evaluate</dd></div>
                  )}
                </dl>

                <div className="mt-auto pt-4">
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => setReviewing(assignment)}>
                    Review submissions
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Create your first assignment to start collecting submissions."
          action={<Button icon={Plus} onClick={() => setCreating(true)}>New assignment</Button>}
        />
      )}

      <CreateAssignmentModal
        open={creating}
        onClose={() => setCreating(false)}
        subjects={subjects ?? []}
        onCreated={() => {
          setCreating(false);
          reload();
          toast('Assignment published to the class.');
        }}
      />

      <SubmissionsModal assignment={reviewing} onClose={() => setReviewing(null)} onEvaluated={reload} />
    </>
  );
}

function CreateAssignmentModal({ open, onClose, subjects, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({ subject: '', title: '', description: '', dueDate: '', maxMarks: 20, allowLateSubmission: false });
  const [saving, setSaving] = useState(false);

  const update = (key) => (event) =>
    setForm((current) => ({
      ...current,
      [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/assignments', form);
      onCreated();
      setForm({ subject: '', title: '', description: '', dueDate: '', maxMarks: 20, allowLateSubmission: false });
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
      title="New assignment"
      description="Students in the subject's semester are notified as soon as it is published."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button form="assignment-form" type="submit" loading={saving} icon={Plus}>Publish assignment</Button>
        </>
      }
    >
      <form id="assignment-form" onSubmit={save} className="space-y-4">
        <Field label="Subject" required>
          <Select value={form.subject} onChange={update('subject')} required>
            <option value="">Choose a subject…</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.code} — {subject.name} (Sem {subject.semester})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Title" required>
          <Input value={form.title} onChange={update('title')} placeholder="e.g. Normalisation Case Study" required />
        </Field>

        <Field label="Instructions" required>
          <Textarea value={form.description} onChange={update('description')} placeholder="What should students submit, and how will it be evaluated?" required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Due date" required>
            <input type="datetime-local" value={form.dueDate} onChange={update('dueDate')} className="field" required />
          </Field>
          <Field label="Maximum marks" required>
            <Input type="number" min="1" max="100" value={form.maxMarks} onChange={update('maxMarks')} required />
          </Field>
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.allowLateSubmission}
            onChange={update('allowLateSubmission')}
            className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
          Allow late submissions after the deadline
        </label>
      </form>
    </Modal>
  );
}

function SubmissionsModal({ assignment, onClose, onEvaluated }) {
  const toast = useToast();
  const { data, loading, reload } = useApi(assignment ? `/assignments/${assignment._id}` : null, {
    enabled: Boolean(assignment),
  });
  const [draft, setDraft] = useState({});

  const evaluate = async (submission) => {
    const entry = draft[submission._id] ?? {};
    try {
      await api.patch(`/assignments/submissions/${submission._id}/evaluate`, {
        marks: Number(entry.marks ?? submission.marks ?? 0),
        feedback: entry.feedback ?? submission.feedback ?? '',
      });
      toast('Evaluation saved and the student notified.');
      reload();
      onEvaluated?.();
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  return (
    <Modal
      open={Boolean(assignment)}
      onClose={onClose}
      size="lg"
      title={assignment?.title}
      description={`${assignment?.subject?.code} · ${data?.submissions?.length ?? 0} of ${data?.classSize ?? '—'} submitted · ${assignment?.maxMarks} marks`}
    >
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20" />)}</div>
      ) : data?.submissions?.length ? (
        <ul className="space-y-3">
          {data.submissions.map((submission) => {
            const entry = draft[submission._id] ?? {};
            return (
              <li key={submission._id} className={cx('rounded-xl border p-4', submission.status === 'evaluated' ? 'border-emerald-400/40 bg-emerald-500/5' : 'border-ink-200 dark:border-white/10')}>
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar name={submission.student?.user?.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{submission.student?.user?.name}</p>
                    <p className="truncate text-xs text-ink-500 dark:text-ink-400">
                      {submission.student?.rollNo} · submitted {relativeTime(submission.submittedAt)}
                    </p>
                  </div>
                  <Badge tone={submission.status === 'evaluated' ? 'emerald' : submission.status === 'late' ? 'amber' : 'brand'} className="capitalize">
                    {submission.status}
                  </Badge>
                </div>

                {submission.files?.[0] && (
                  <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                    <Paperclip size={12} aria-hidden="true" />
                    {submission.files[0].name} · {bytes(submission.files[0].size)}
                  </p>
                )}
                {submission.note && <p className="mt-2 text-[0.8125rem] text-ink-600 dark:text-ink-300">“{submission.note}”</p>}

                <div className="mt-3 grid gap-2 sm:grid-cols-[7rem_1fr_auto]">
                  <Input
                    type="number"
                    min="0"
                    max={assignment?.maxMarks}
                    placeholder={`/ ${assignment?.maxMarks}`}
                    defaultValue={submission.marks ?? ''}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [submission._id]: { ...entry, marks: event.target.value } }))
                    }
                    aria-label={`Marks for ${submission.student?.user?.name}`}
                  />
                  <Input
                    placeholder="Feedback for the student…"
                    defaultValue={submission.feedback ?? ''}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [submission._id]: { ...entry, feedback: event.target.value } }))
                    }
                    aria-label={`Feedback for ${submission.student?.user?.name}`}
                  />
                  <Button size="md" onClick={() => evaluate(submission)}>
                    {submission.status === 'evaluated' ? 'Update' : 'Evaluate'}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={ClipboardList} title="No submissions yet" description="Students who submit will appear here for evaluation." />
      )}
    </Modal>
  );
}
