import { useMemo, useState } from 'react';
import { Award, BookOpen, Building2, Clock, DoorOpen, Mail, Phone, Search } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Avatar, Badge, Card, EmptyState, Input, Select, SkeletonCard } from '../../components/ui/index.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

const DESIGNATION_TONE = { HOD: 'gold', Professor: 'brand', 'Associate Professor': 'emerald' };

export default function Faculty() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [selected, setSelected] = useState(null);

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (department) params.set('department', department);
    const qs = params.toString();
    return `/faculty${qs ? `?${qs}` : ''}`;
  }, [search, department]);

  const { data: faculty, loading } = useApi(path);
  const { data: departments } = useApi('/academics/departments');

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Faculty directory"
        description="Department, designation, cabin number, institutional email and the subjects each faculty member teaches."
      />

      <Card className="mb-6 p-4 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, employee ID or specialisation…"
              className="pl-9"
              aria-label="Search faculty"
            />
          </div>
          <Select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">
            <option value="">All departments</option>
            {(departments ?? []).map((d) => <option key={d._id} value={d._id}>{d.code} — {d.name}</option>)}
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : faculty?.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {faculty.map((member) => (
            <Card key={member._id} interactive as="article">
              <button type="button" onClick={() => setSelected(member)} className="w-full text-left">
                <div className="flex items-start gap-3.5">
                  <Avatar name={member.user?.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[0.9375rem] font-semibold">{member.user?.name}</h3>
                    <p className="truncate text-xs text-ink-500 dark:text-ink-400">{member.employeeId}</p>
                    <Badge tone={DESIGNATION_TONE[member.designation] ?? 'slate'} className="mt-2">{member.designation}</Badge>
                  </div>
                </div>

                <dl className="mt-4 space-y-2 border-t border-ink-100 pt-3.5 text-xs dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Building2 size={13} className="shrink-0 text-ink-400" aria-hidden="true" />
                    <dt className="sr-only">Department</dt>
                    <dd className="truncate">{member.department?.name}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <DoorOpen size={13} className="shrink-0 text-ink-400" aria-hidden="true" />
                    <dt className="sr-only">Cabin</dt>
                    <dd>Cabin {member.cabin} · {member.block}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="shrink-0 text-ink-400" aria-hidden="true" />
                    <dt className="sr-only">Email</dt>
                    <dd className="truncate">{member.officialEmail}</dd>
                  </div>
                </dl>

                {member.specialization?.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {member.specialization.slice(0, 3).map((area) => (
                      <span key={area} className="rounded-md bg-ink-100 px-2 py-0.5 text-[0.6875rem] text-ink-600 dark:bg-white/5 dark:text-ink-300">
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Building2} title="No faculty found" description="Try a different search term or department." />
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.user?.name}
        description={`${selected?.designation} · ${selected?.department?.name ?? ''}`}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={selected.user?.name} size="xl" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{selected.employeeId}</p>
                <p className="text-sm text-ink-500 dark:text-ink-400">{selected.qualification}</p>
                <p className="mt-1 text-xs text-ink-400">{selected.experienceYears} years of experience</p>
              </div>
            </div>

            {selected.bio && <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">{selected.bio}</p>}

            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                [DoorOpen, 'Cabin', `${selected.cabin} · ${selected.block ?? ''}`],
                [Clock, 'Office hours', selected.officeHours ?? '—'],
                [Mail, 'Institutional email', selected.officialEmail],
                [Phone, 'Contact', selected.contact ?? '—'],
              ].map(([Icon, label, value]) => (
                <div key={label} className="surface-muted flex items-start gap-2.5 p-3">
                  <Icon size={14} className="mt-0.5 shrink-0 text-ink-400" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-[0.6875rem] text-ink-400">{label}</dt>
                    <dd className="mt-0.5 text-[0.8125rem] font-medium break-words">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {selected.specialization?.length > 0 && (
              <div>
                <p className="eyebrow mb-2 inline-flex items-center gap-1.5"><Award size={12} aria-hidden="true" /> Specialisation</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.specialization.map((area) => (
                    <Badge key={area} tone="brand">{area}</Badge>
                  ))}
                </div>
              </div>
            )}

            {selected.subjects?.length > 0 && (
              <div>
                <p className="eyebrow mb-2 inline-flex items-center gap-1.5"><BookOpen size={12} aria-hidden="true" /> Subjects taught</p>
                <ul className="space-y-1.5">
                  {selected.subjects.map((subject) => (
                    <li key={subject._id} className="surface-muted flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span className="min-w-0 truncate">
                        <span className="font-semibold">{subject.code}</span> — {subject.name}
                      </span>
                      <span className="shrink-0 text-xs text-ink-400">Sem {subject.semester} · {subject.credits} cr</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
