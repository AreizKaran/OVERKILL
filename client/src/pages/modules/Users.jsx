import { useMemo, useState } from 'react';
import { Search, ShieldCheck, UserCheck, UserCog, UserX, Users as UsersIcon } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Input, Select, Table, Td, Th } from '../../components/ui/index.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';

const ROLE_TONE = { admin: 'gold', faculty: 'brand', student: 'emerald' };

const PERMISSIONS = [
  {
    role: 'Student',
    tone: 'emerald',
    can: ['View own profile, attendance, results and fees', 'Submit assignments and faculty feedback', 'Read notices addressed to students'],
    cannot: ['See other students’ records', 'Mark attendance or publish marks', 'Create notices or manage users'],
  },
  {
    role: 'Faculty',
    tone: 'brand',
    can: ['Mark attendance for assigned subjects', 'Create assignments and evaluate submissions', 'Publish marks and read aggregated feedback'],
    cannot: ['Touch subjects not assigned to them', 'Manage fee records or user accounts', 'See who submitted anonymous feedback'],
  },
  {
    role: 'Administrator',
    tone: 'gold',
    can: ['Manage students, faculty, departments and subjects', 'Publish institute-wide notices', 'Manage fees, roles and account status'],
    cannot: ['Change their own role or deactivate their own account', 'See the author of anonymous feedback'],
  },
];

export default function Users() {
  const toast = useToast();
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (search.trim()) params.set('search', search.trim());
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ''}`;
  }, [role, search]);

  const { data: users, meta, loading, reload } = useApi(path);

  const counts = useMemo(() => {
    const list = users ?? [];
    return {
      total: meta?.total ?? list.length,
      active: list.filter((u) => u.isActive !== false).length,
      admins: list.filter((u) => u.role === 'admin').length,
    };
  }, [users, meta]);

  const toggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id ?? user.id}/status`, { isActive: user.isActive === false });
      toast(`${user.name} ${user.isActive === false ? 'reactivated' : 'deactivated'}.`);
      reload();
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Users & roles"
        description="Every portal account, the role it holds and whether it can currently sign in."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Accounts" value={counts.total} sub="Matching the current filters" icon={UsersIcon} tone="brand" />
        <StatCard index={1} label="Active" value={counts.active} sub="Able to sign in" icon={UserCheck} tone="emerald" />
        <StatCard index={2} label="Administrators" value={counts.admins} sub="With full access" icon={ShieldCheck} tone="gold" />
      </div>

      <Card className="mt-6 p-4 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email…" className="pl-9" aria-label="Search users" />
          </div>
          <Select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filter by role">
            <option value="">All roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Administrators</option>
          </Select>
        </div>
      </Card>

      <Card className="mt-5">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : users?.length ? (
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Identifier</Th>
                <Th align="center">Department</Th>
                <Th align="center">Role</Th>
                <Th align="center">Status</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id ?? user.id} className="transition hover:bg-ink-50 dark:hover:bg-white/[0.03]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-[0.875rem] font-medium">{user.name}</p>
                        <p className="truncate text-xs text-ink-500 dark:text-ink-400">{user.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-[0.8125rem]">{user.detail ?? '—'}</Td>
                  <Td align="center" className="text-[0.8125rem]">{user.department ?? '—'}</Td>
                  <Td align="center"><Badge tone={ROLE_TONE[user.role]} className="capitalize">{user.role}</Badge></Td>
                  <Td align="center">
                    <Badge tone={user.isActive === false ? 'rose' : 'emerald'}>
                      {user.isActive === false ? 'Disabled' : 'Active'}
                    </Badge>
                  </Td>
                  <Td align="right">
                    <Button size="sm" variant={user.isActive === false ? 'secondary' : 'ghost'} icon={user.isActive === false ? UserCheck : UserX} onClick={() => toggleActive(user)}>
                      {user.isActive === false ? 'Reactivate' : 'Deactivate'}
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon={UserCog} title="No accounts found" description="Adjust the search term or role filter." />
        )}
      </Card>

      <Card className="mt-6">
        <CardHeader title="Role permissions" subtitle="Enforced on the server for every request, not just hidden in the interface." icon={ShieldCheck} />
        <div className="grid gap-5 md:grid-cols-3">
          {PERMISSIONS.map((entry) => (
            <div key={entry.role} className="surface-muted p-4">
              <Badge tone={entry.tone}>{entry.role}</Badge>
              <p className="mt-3 text-[0.6875rem] font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">Can</p>
              <ul className="mt-1.5 space-y-1 text-[0.8125rem] text-ink-600 dark:text-ink-300">
                {entry.can.map((line) => <li key={line}>· {line}</li>)}
              </ul>
              <p className="mt-3 text-[0.6875rem] font-semibold tracking-wide text-rose-600 uppercase dark:text-rose-400">Cannot</p>
              <ul className="mt-1.5 space-y-1 text-[0.8125rem] text-ink-600 dark:text-ink-300">
                {entry.cannot.map((line) => <li key={line}>· {line}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
