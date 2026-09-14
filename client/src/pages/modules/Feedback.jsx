import { useState } from 'react';
import { MessageSquareQuote, Send, Star } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Field, Select, SkeletonCard, Tabs, Textarea, cx } from '../../components/ui/index.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { RatingRadar } from '../../components/charts/index.jsx';
import { relativeTime } from '../../lib/format.js';

const CRITERIA = [
  { key: 'teachingQuality', label: 'Teaching quality' },
  { key: 'clarity', label: 'Clarity of explanation' },
  { key: 'punctuality', label: 'Punctuality' },
  { key: 'supportiveness', label: 'Supportiveness' },
  { key: 'courseContent', label: 'Course content' },
];

export default function Feedback() {
  const { user } = useAuth();
  if (user.role === 'student') return <StudentFeedback />;
  if (user.role === 'faculty') return <FacultyFeedback />;
  return <AdminFeedback />;
}

/* ---------------------------- Student ----------------------------- */
function StudentFeedback() {
  const toast = useToast();
  const { data: submitted, loading, reload } = useApi('/feedback');
  const { data: subjects } = useApi('/academics/subjects');
  const [composing, setComposing] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Campus"
        title="Faculty feedback"
        description="Your responses are submitted anonymously and shown to faculty only as an aggregate, never attributed to you."
        actions={<Button icon={MessageSquareQuote} onClick={() => setComposing(true)}>Give feedback</Button>}
      />

      {loading ? (
        <SkeletonCard lines={5} />
      ) : submitted?.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {submitted.map((item) => (
            <Card key={item._id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[0.9375rem] font-semibold">{item.faculty?.user?.name ?? 'Administration'}</p>
                  <p className="truncate text-xs text-ink-500 dark:text-ink-400">
                    {item.subject?.code} · {item.subject?.name}
                  </p>
                </div>
                <Badge tone="gold" icon={Star}>{item.averageRating.toFixed(1)}</Badge>
              </div>

              <dl className="mt-4 space-y-2">
                {CRITERIA.map((criterion) => (
                  <div key={criterion.key} className="flex items-center justify-between gap-3 text-[0.8125rem]">
                    <dt className="text-ink-500 dark:text-ink-400">{criterion.label}</dt>
                    <dd><StarRow value={item.ratings?.[criterion.key] ?? 0} /></dd>
                  </div>
                ))}
              </dl>

              {item.comment && <p className="mt-4 border-t border-ink-100 pt-3 text-sm text-ink-600 dark:border-white/5 dark:text-ink-300">“{item.comment}”</p>}
              <p className="mt-3 text-xs text-ink-400">Submitted {relativeTime(item.createdAt)} · anonymous</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquareQuote}
          title="No feedback submitted yet"
          description="Share your experience of a subject — it helps faculty improve how the course is taught."
          action={<Button icon={MessageSquareQuote} onClick={() => setComposing(true)}>Give feedback</Button>}
        />
      )}

      <FeedbackModal
        open={composing}
        subjects={subjects ?? []}
        onClose={() => setComposing(false)}
        onSubmitted={() => {
          setComposing(false);
          reload();
          toast('Thank you — your anonymous feedback has been recorded.');
        }}
      />
    </>
  );
}

function FeedbackModal({ open, onClose, subjects, onSubmitted }) {
  const toast = useToast();
  const [subjectId, setSubjectId] = useState('');
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const subject = subjects.find((s) => s._id === subjectId);

  const save = async (event) => {
    event.preventDefault();
    if (!subject?.faculty?._id) {
      toast('Choose a subject with an assigned faculty member.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/feedback', {
        faculty: subject.faculty._id,
        subject: subject._id,
        ratings: Object.fromEntries(CRITERIA.map((c) => [c.key, ratings[c.key] ?? 3])),
        comment,
        anonymous: true,
      });
      onSubmitted();
      setSubjectId('');
      setRatings({});
      setComment('');
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
      title="Faculty feedback"
      description="Rate each criterion from 1 to 5. Your identity is never shown with the response."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button form="feedback-form" type="submit" loading={saving} icon={Send}>Submit feedback</Button>
        </>
      }
    >
      <form id="feedback-form" onSubmit={save} className="space-y-5">
        <Field label="Subject" required>
          <Select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} required>
            <option value="">Choose a subject…</option>
            {subjects.map((item) => (
              <option key={item._id} value={item._id}>
                {item.code} — {item.name}{item.faculty?.user ? ` (${item.faculty.user.name})` : ''}
              </option>
            ))}
          </Select>
        </Field>

        <fieldset className="space-y-3">
          <legend className="label">Ratings</legend>
          {CRITERIA.map((criterion) => (
            <div key={criterion.key} className="surface-muted flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
              <span className="text-[0.8125rem] font-medium">{criterion.label}</span>
              <div className="flex gap-1" role="radiogroup" aria-label={criterion.label}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={(ratings[criterion.key] ?? 3) === value}
                    aria-label={`${value} out of 5`}
                    onClick={() => setRatings((current) => ({ ...current, [criterion.key]: value }))}
                    className="rounded p-0.5 transition hover:scale-110"
                  >
                    <Star
                      size={19}
                      className={cx(
                        (ratings[criterion.key] ?? 3) >= value ? 'fill-gold-400 text-gold-400' : 'text-ink-300 dark:text-ink-600'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        <Field label="Comments" hint="Optional — specific, constructive comments are the most useful.">
          <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What worked well? What could be improved?" />
        </Field>
      </form>
    </Modal>
  );
}

/* ---------------------------- Faculty ----------------------------- */
function FacultyFeedback() {
  const { data, loading } = useApi('/feedback');

  if (loading) return <SkeletonCard lines={6} />;

  const list = data ?? [];
  const average = list.length ? list.reduce((sum, f) => sum + f.averageRating, 0) / list.length : 0;
  const radar = CRITERIA.map((criterion) => ({
    label: criterion.label.split(' ')[0],
    value: list.length
      ? Number((list.reduce((sum, f) => sum + (f.ratings?.[criterion.key] ?? 0), 0) / list.length).toFixed(2))
      : 0,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Campus"
        title="Student feedback"
        description="Aggregated, anonymous feedback from the students you teach. Individual responses are never attributed."
      />

      {list.length ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader title="Overall rating" subtitle={`${list.length} responses received`} icon={Star} />
            <p className="font-display text-4xl font-bold">{average.toFixed(2)}<span className="text-xl font-medium text-ink-400"> / 5</span></p>
            <div className="mt-3"><StarRow value={Math.round(average)} size={20} /></div>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Rating breakdown" subtitle="Average score per criterion" icon={MessageSquareQuote} />
            <RatingRadar data={radar} />
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader title="Comments" subtitle="Written feedback, newest first" icon={MessageSquareQuote} />
            <ul className="grid gap-3 md:grid-cols-2">
              {list.filter((item) => item.comment).map((item) => (
                <li key={item._id} className="surface-muted p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone="gold" icon={Star}>{item.averageRating.toFixed(1)}</Badge>
                    <span className="text-xs text-ink-400">{item.subject?.code} · {relativeTime(item.createdAt)}</span>
                  </div>
                  <p className="mt-2.5 text-sm text-ink-600 dark:text-ink-300">“{item.comment}”</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : (
        <EmptyState icon={MessageSquareQuote} title="No feedback yet" description="Responses appear here once students submit feedback for your subjects." />
      )}
    </>
  );
}

/* ----------------------------- Admin ------------------------------ */
function AdminFeedback() {
  const toast = useToast();
  const [tab, setTab] = useState('faculty');
  const { data: analytics, loading } = useApi('/feedback/analytics');
  const { data: all, reload } = useApi('/feedback?type=faculty-to-admin');

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/feedback/${id}/status`, { status });
      toast(`Marked as ${status}.`);
      reload();
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Campus"
        title="Feedback analytics"
        description="Aggregated student ratings per faculty member, and requests raised by faculty to the administration."
      />

      <Tabs
        className="mb-6 max-w-md"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'faculty', label: 'Faculty ratings', count: analytics?.length },
          { value: 'requests', label: 'Faculty requests', count: all?.length },
        ]}
      />

      {tab === 'faculty' &&
        (loading ? (
          <SkeletonCard lines={6} />
        ) : analytics?.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {analytics.map((entry) => (
              <Card key={entry.faculty?._id}>
                <div className="flex items-start gap-3">
                  <Avatar name={entry.faculty?.user?.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9375rem] font-semibold">{entry.faculty?.user?.name}</p>
                    <p className="truncate text-xs text-ink-500 dark:text-ink-400">
                      {entry.faculty?.department?.code} · {entry.count} responses
                    </p>
                  </div>
                  <Badge tone={entry.averageRating >= 4.2 ? 'emerald' : entry.averageRating >= 3.5 ? 'brand' : 'amber'}>
                    {entry.averageRating.toFixed(2)}
                  </Badge>
                </div>

                <dl className="mt-4 space-y-2">
                  {CRITERIA.map((criterion) => (
                    <div key={criterion.key} className="flex items-center justify-between gap-3 text-xs">
                      <dt className="text-ink-500 dark:text-ink-400">{criterion.label}</dt>
                      <dd className="font-semibold tabular-nums">{entry.breakdown[criterion.key]?.toFixed(2) ?? '—'}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState icon={MessageSquareQuote} title="No feedback collected yet" />
        ))}

      {tab === 'requests' &&
        (all?.length ? (
          <div className="space-y-4">
            {all.map((item) => (
              <Card key={item._id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={item.status === 'open' ? 'amber' : item.status === 'actioned' ? 'emerald' : 'brand'} className="capitalize">
                    {item.status}
                  </Badge>
                  <span className="text-xs text-ink-500 dark:text-ink-400">
                    {item.department?.code ?? '—'} · {relativeTime(item.createdAt)}
                  </span>
                  <div className="ml-auto flex gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => updateStatus(item._id, 'reviewed')}>Mark reviewed</Button>
                    <Button size="sm" onClick={() => updateStatus(item._id, 'actioned')}>Mark actioned</Button>
                  </div>
                </div>
                <p className="mt-3 text-[0.9375rem] text-ink-700 dark:text-ink-200">{item.comment}</p>
                {item.submittedByName && <p className="mt-2 text-xs text-ink-400">Raised by {item.submittedByName}</p>}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState icon={MessageSquareQuote} title="No faculty requests" />
        ))}
    </>
  );
}

function StarRow({ value, size = 14 }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          size={size}
          className={cx(index <= value ? 'fill-gold-400 text-gold-400' : 'text-ink-300 dark:text-ink-600')}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
