import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, Users } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Avatar, Badge, Button, Card, EmptyState, Input, Select, Table, Td, Th } from '../../components/ui/index.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Students() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (department) params.set('department', department);
    if (semester) params.set('semester', semester);
    const qs = params.toString();
    return `/students${qs ? `?${qs}` : ''}`;
  }, [search, department, semester]);

  const { data: students, meta, loading } = useApi(path);
  const { data: departments } = useApi('/academics/departments');

  const stats = useMemo(() => {
    const list = students ?? [];
    const cgpas = list.map((s) => s.cgpa).filter(Boolean);
    return {
      total: meta?.total ?? list.length,
      average: cgpas.length ? (cgpas.reduce((a, b) => a + b, 0) / cgpas.length).toFixed(2) : '—',
      distinction: list.filter((s) => s.cgpa >= 8.5).length,
    };
  }, [students, meta]);

  /** Client-side CSV export of exactly what the table is showing. */
  const exportCsv = () => {
    const rows = [
      ['Registration No', 'Roll No', 'Name', 'Email', 'Department', 'Semester', 'Section', 'CGPA', 'Status'],
      ...(students ?? []).map((s) => [
        s.registrationNo, s.rollNo, s.user?.name, s.user?.email,
        s.department?.code, s.semester, s.section, s.cgpa, s.status,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `smit-students-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${(students ?? []).length} student records.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Students"
        description="Enrolment records, academic standing and contact details for every student on the portal."
        actions={<Button variant="secondary" icon={Download} onClick={exportCsv} disabled={!students?.length}>Export CSV</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Students listed" value={stats.total} sub="Matching the current filters" icon={Users} tone="brand" />
        <StatCard index={1} label="Average CGPA" value={stats.average} sub="Across listed students" icon={Users} tone="emerald" />
        <StatCard index={2} label="CGPA 8.5 and above" value={stats.distinction} sub="Distinction band" icon={Users} tone="gold" />
      </div>

      <Card className="mt-6 p-4 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, registration or roll number…"
              className="pl-9"
              aria-label="Search students"
            />
          </div>
          <Select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">
            <option value="">All departments</option>
            {(departments ?? []).map((d) => <option key={d._id} value={d._id}>{d.code}</option>)}
          </Select>
          <Select value={semester} onChange={(event) => setSemester(event.target.value)} aria-label="Filter by semester">
            <option value="">All semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="mt-5 p-0 sm:p-0">
        {loading ? (
          <div className="space-y-2 p-5">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : students?.length ? (
          <div className="p-4 sm:p-5">
            <Table>
              <thead>
                <tr>
                  <Th>Student</Th>
                  <Th>Registration</Th>
                  <Th>Programme</Th>
                  <Th align="center">Semester</Th>
                  <Th align="right">CGPA</Th>
                  <Th align="right">Profile</Th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="transition hover:bg-ink-50 dark:hover:bg-white/[0.03]">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={student.user?.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[0.875rem] font-medium">{student.user?.name}</p>
                          <p className="truncate text-xs text-ink-500 dark:text-ink-400">{student.user?.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-medium tabular-nums">{student.registrationNo}</span>
                      <span className="block text-xs text-ink-400">Roll {student.rollNo}</span>
                    </Td>
                    <Td>
                      <span className="text-[0.8125rem]">{student.department?.code}</span>
                      <span className="block truncate text-xs text-ink-500 dark:text-ink-400">{student.course?.code}</span>
                    </Td>
                    <Td align="center">
                      <Badge tone="slate">Sem {student.semester} · {student.section}</Badge>
                    </Td>
                    <Td align="right">
                      <Badge tone={student.cgpa >= 8.5 ? 'emerald' : student.cgpa >= 7 ? 'brand' : student.cgpa ? 'amber' : 'slate'}>
                        {student.cgpa ? student.cgpa.toFixed(2) : '—'}
                      </Badge>
                    </Td>
                    <Td align="right">
                      <Link to={`/app/students/${student._id}`} className="text-[0.8125rem] font-medium text-brand-600 hover:underline dark:text-brand-300">
                        View
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <EmptyState icon={Users} title="No students found" description="Adjust the search term or filters to widen the results." />
        )}
      </Card>
    </>
  );
}
