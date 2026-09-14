import { useMemo, useState } from 'react';
import { BookOpen, Building2, Clock, DoorOpen, Mail, Search, Users } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Badge, Card, CardHeader, EmptyState, Input, Select, SkeletonCard, Tabs } from '../../components/ui/index.jsx';
import { DAYS } from '../../data/reference.js';

const TYPE_TONE = { Core: 'brand', Elective: 'gold', Lab: 'emerald', Project: 'amber', 'Open Elective': 'slate' };

export default function Courses() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState('subjects');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (department) params.set('department', department);
    if (semester) params.set('semester', semester);
    if (search.trim()) params.set('search', search.trim());
    const qs = params.toString();
    return `/academics/subjects${qs ? `?${qs}` : ''}`;
  }, [department, semester, search]);

  const { data: subjects, loading } = useApi(query);
  const { data: departments } = useApi('/academics/departments');
  const { data: courses } = useApi('/academics/courses');

  const canFilter = user.role !== 'student';

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Courses & Subjects"
        description={
          user.role === 'student'
            ? `Subjects registered for semester ${profile?.semester} of ${profile?.course?.name ?? 'your programme'}.`
            : 'Departments, programmes and the subject structure of each semester.'
        }
      />

      <Tabs
        className="mb-6 max-w-lg"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'subjects', label: 'Subjects', count: subjects?.length },
          { value: 'departments', label: 'Departments', count: departments?.length },
          { value: 'programmes', label: 'Programmes', count: courses?.length },
        ]}
      />

      {tab === 'subjects' && (
        <>
          {canFilter && (
            <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by subject code or name…"
                  className="pl-9"
                  aria-label="Search subjects"
                />
              </div>
              <Select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">
                <option value="">All departments</option>
                {(departments ?? []).map((d) => (
                  <option key={d._id} value={d._id}>{d.code} — {d.name}</option>
                ))}
              </Select>
              <Select value={semester} onChange={(event) => setSemester(event.target.value)} aria-label="Filter by semester">
                <option value="">All semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </Select>
            </div>
          )}

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} lines={4} />)}
            </div>
          ) : subjects?.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject) => (
                <Card key={subject._id} interactive className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-brand-600 dark:text-brand-300">{subject.code}</p>
                      <h3 className="mt-1 text-[0.9375rem] leading-snug font-semibold">{subject.name}</h3>
                    </div>
                    <Badge tone={TYPE_TONE[subject.type] ?? 'slate'}>{subject.type}</Badge>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-ink-100 py-3 text-center dark:border-white/5">
                    {[
                      ['Semester', subject.semester],
                      ['Credits', subject.credits],
                      ['Dept', subject.department?.code],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-[0.625rem] tracking-wide text-ink-400 uppercase">{label}</dt>
                        <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  {subject.faculty?.user && (
                    <div className="mt-4">
                      <p className="text-[0.6875rem] tracking-wide text-ink-400 uppercase">Faculty in charge</p>
                      <p className="mt-1 text-sm font-medium">{subject.faculty.user.name}</p>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
                        {subject.faculty.cabin && (
                          <span className="inline-flex items-center gap-1"><DoorOpen size={12} aria-hidden="true" /> Cabin {subject.faculty.cabin}</span>
                        )}
                        {subject.faculty.officialEmail && (
                          <a href={`mailto:${subject.faculty.officialEmail}`} className="inline-flex min-w-0 items-center gap-1 hover:text-brand-600 dark:hover:text-brand-300">
                            <Mail size={12} aria-hidden="true" />
                            <span className="truncate">{subject.faculty.officialEmail}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {subject.schedule?.length > 0 && (
                    <div className="mt-4 border-t border-ink-100 pt-3 dark:border-white/5">
                      <p className="mb-2 inline-flex items-center gap-1.5 text-[0.6875rem] tracking-wide text-ink-400 uppercase">
                        <Clock size={12} aria-hidden="true" /> Weekly schedule
                      </p>
                      <ul className="space-y-1 text-xs text-ink-600 dark:text-ink-300">
                        {[...subject.schedule]
                          .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
                          .map((slot, index) => (
                            <li key={`${slot.day}-${index}`} className="flex items-center justify-between gap-2">
                              <span className="font-medium">{slot.day}</span>
                              <span className="tabular-nums">{slot.startTime}–{slot.endTime}</span>
                              <span className="text-ink-400">{slot.room}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="No subjects found" description="Try a different search term or clear the filters." />
          )}
        </>
      )}

      {tab === 'departments' && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(departments ?? []).map((d) => (
            <Card key={d._id} interactive>
              <CardHeader title={`${d.code} — ${d.name}`} subtitle={d.block} icon={Building2} />
              <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">{d.description}</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-100 pt-3 text-center dark:border-white/5">
                {[
                  ['Students', d.studentCount],
                  ['Faculty', d.facultyCount],
                  ['Subjects', d.subjectCount],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[0.625rem] tracking-wide text-ink-400 uppercase">{label}</dt>
                    <dd className="mt-0.5 font-display text-lg font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
              {d.hod?.user && (
                <p className="mt-3 text-xs text-ink-500 dark:text-ink-400">
                  <span className="font-medium text-ink-700 dark:text-ink-200">Head of Department:</span> {d.hod.user.name} · Cabin {d.hod.cabin}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === 'programmes' && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(courses ?? []).map((course) => (
            <Card key={course._id} interactive>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-brand-600 dark:text-brand-300">{course.code}</p>
                  <h3 className="mt-1 text-[0.9375rem] leading-snug font-semibold">{course.name}</h3>
                </div>
                <Badge tone={course.level === 'PG' ? 'gold' : 'brand'}>{course.level}</Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Duration', `${course.durationYears} years`],
                  ['Semesters', course.totalSemesters],
                  ['Total credits', course.totalCredits],
                  ['Sanctioned intake', course.intake],
                ].map(([label, value]) => (
                  <div key={label} className="surface-muted px-3 py-2">
                    <dt className="text-[0.6875rem] text-ink-400">{label}</dt>
                    <dd className="mt-0.5 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                <Users size={13} aria-hidden="true" />
                {course.department?.name ?? course.department?.code}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
