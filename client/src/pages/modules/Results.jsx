import { useState } from 'react';
import { Award, GraduationCap, TrendingUp } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Badge, Card, CardHeader, EmptyState, Select, SkeletonCard, Table, Td, Th } from '../../components/ui/index.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { TrendChart, BarSeriesChart } from '../../components/charts/index.jsx';
import { gradeTone } from '../../lib/format.js';

export default function Results() {
  const { user } = useAuth();
  return user.role === 'student' ? <StudentResults /> : <AdminResults />;
}

function StudentResults() {
  const { profile } = useAuth();
  const { data, loading } = useApi('/exams/results/me');
  const [semester, setSemester] = useState('all');

  if (loading) return <SkeletonCard lines={8} />;
  if (!data?.semesters?.length) {
    return (
      <>
        <PageHeader eyebrow="Academics" title="Results" />
        <EmptyState icon={GraduationCap} title="No results published yet" description="Your marks will appear here once the examination section publishes them." />
      </>
    );
  }

  const published = data.semesters.filter((s) => s.published);
  const visible = semester === 'all' ? data.semesters : data.semesters.filter((s) => String(s.semester) === semester);

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Results & academic performance"
        description={`Internal and external marks, grades and grade points for ${profile?.course?.name ?? 'your programme'}.`}
        actions={
          <Select value={semester} onChange={(event) => setSemester(event.target.value)} className="w-44" aria-label="Filter by semester">
            <option value="all">All semesters</option>
            {data.semesters.map((s) => <option key={s.semester} value={s.semester}>Semester {s.semester}</option>)}
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Cumulative CGPA" value={data.cgpa.toFixed(2)} sub={`${data.totalCredits} credits earned`} icon={GraduationCap} tone="brand" />
        <StatCard index={1} label="Semesters published" value={published.length} sub={`${data.semesters.length} on record`} icon={Award} tone="emerald" />
        <StatCard index={2} label="Active backlogs" value={data.backlogs} sub={data.backlogs ? 'Clear these to stay on track' : 'All clear'} icon={TrendingUp} tone={data.backlogs ? 'rose' : 'emerald'} />
      </div>

      {published.length > 1 && (
        <Card className="mt-6">
          <CardHeader title="SGPA progression" subtitle="Semester grade point average over time" icon={TrendingUp} />
          <TrendChart
            data={published.map((s) => ({ label: `Sem ${s.semester}`, sgpa: s.sgpa }))}
            xKey="label"
            yKey="sgpa"
            name="SGPA"
            domain={[0, 10]}
          />
        </Card>
      )}

      <div className="mt-6 space-y-6">
        {visible.map((sem) => (
          <Card key={sem.semester}>
            <CardHeader
              title={`Semester ${sem.semester}`}
              subtitle={sem.published ? `SGPA ${sem.sgpa.toFixed(2)} · ${sem.credits} credits` : 'Internal assessment in progress — final marks pending'}
              icon={GraduationCap}
              action={sem.published ? <Badge tone={sem.sgpa >= 8 ? 'emerald' : sem.sgpa >= 6.5 ? 'brand' : 'amber'}>SGPA {sem.sgpa.toFixed(2)}</Badge> : <Badge tone="slate">Pending</Badge>}
            />
            <Table>
              <thead>
                <tr>
                  <Th>Subject</Th>
                  <Th align="center">Credits</Th>
                  <Th align="center">Internal</Th>
                  <Th align="center">External</Th>
                  <Th align="center">Total</Th>
                  <Th align="right">Grade</Th>
                </tr>
              </thead>
              <tbody>
                {sem.results.map((row) => {
                  const internal =
                    (row.internal?.sessional1 ?? 0) + (row.internal?.sessional2 ?? 0) +
                    (row.internal?.assignment ?? 0) + (row.internal?.attendance ?? 0);
                  return (
                    <tr key={row.id ?? row._id}>
                      <Td>
                        <span className="font-semibold">{row.subject?.code}</span>
                        <span className="block truncate text-xs text-ink-500 dark:text-ink-400">{row.subject?.name}</span>
                      </Td>
                      <Td align="center" className="tabular-nums">{row.credits}</Td>
                      <Td align="center" className="tabular-nums">{internal} / {row.maxInternal}</Td>
                      <Td align="center" className="tabular-nums">
                        {row.status === 'pending' ? <span className="text-ink-400">—</span> : `${row.externalMarks} / ${row.maxExternal}`}
                      </Td>
                      <Td align="center" className="font-semibold tabular-nums">
                        {row.status === 'pending' ? <span className="font-normal text-ink-400">—</span> : row.totalMarks}
                      </Td>
                      <Td align="right">
                        {row.grade ? <Badge tone={gradeTone(row.grade)}>{row.grade}</Badge> : <Badge tone="slate">Awaited</Badge>}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        ))}
      </div>
    </>
  );
}

function AdminResults() {
  const { data, loading } = useApi('/dashboard');

  if (loading) return <SkeletonCard lines={8} />;

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Academic performance"
        description="Grade distribution and department-level performance across every published result."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Average CGPA" value={data.stats.averageCgpa.toFixed(2)} sub="Across all students" icon={GraduationCap} tone="brand" />
        <StatCard index={1} label="Pass rate" value={`${data.stats.passRate}%`} sub="Published results" icon={Award} tone="emerald" />
        <StatCard index={2} label="Results on record" value={data.gradeDistribution.reduce((sum, g) => sum + g.count, 0)} sub="Graded subject entries" icon={TrendingUp} tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Grade distribution" subtitle="Count of results per grade" icon={GraduationCap} />
          <BarSeriesChart data={data.gradeDistribution} xKey="grade" yKey="count" name="Results" height={260} />
        </Card>

        <Card>
          <CardHeader title="Department performance" subtitle="Average CGPA per department" icon={Award} />
          <Table>
            <thead>
              <tr>
                <Th>Department</Th>
                <Th align="right">Students</Th>
                <Th align="right">Average CGPA</Th>
              </tr>
            </thead>
            <tbody>
              {data.byDepartment.map((row) => (
                <tr key={row.code}>
                  <Td>
                    <span className="font-semibold">{row.code}</span>
                    <span className="block truncate text-xs text-ink-500 dark:text-ink-400">{row.name}</span>
                  </Td>
                  <Td align="right" className="tabular-nums">{row.students}</Td>
                  <Td align="right">
                    <Badge tone={row.avgCgpa >= 8 ? 'emerald' : row.avgCgpa >= 7 ? 'brand' : 'amber'}>{row.avgCgpa.toFixed(2)}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}
