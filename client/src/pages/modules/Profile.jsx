import { useState } from 'react';
import { KeyRound, Save, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api, isDemoMode } from '../../lib/api.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Avatar, Badge, Button, Card, CardHeader, Field, Input, Tabs, Textarea } from '../../components/ui/index.jsx';
import { formatDate } from '../../lib/format.js';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('details');

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Your portal account, contact details and password."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex flex-col items-center text-center">
            <Avatar name={user.name} size="xl" ring />
            <h2 className="mt-4 font-display text-lg font-bold">{user.name}</h2>
            <p className="text-sm text-ink-500 dark:text-ink-400">{user.email}</p>
            <Badge tone="brand" className="mt-3 capitalize">{user.role}</Badge>
          </div>

          <dl className="mt-6 space-y-3 border-t border-ink-100 pt-5 text-sm dark:border-white/5">
            {user.role === 'student' && profile && (
              <>
                <Row label="Registration number" value={profile.registrationNo} />
                <Row label="Roll number" value={profile.rollNo} />
                <Row label="Programme" value={profile.course?.name} />
                <Row label="Department" value={profile.department?.name} />
                <Row label="Semester · Section" value={`${profile.semester} · ${profile.section}`} />
                <Row label="Batch" value={profile.batch} />
                <Row label="Mentor" value={profile.mentor?.user?.name} />
              </>
            )}
            {user.role === 'faculty' && profile && (
              <>
                <Row label="Employee ID" value={profile.employeeId} />
                <Row label="Designation" value={profile.designation} />
                <Row label="Department" value={profile.department?.name} />
                <Row label="Qualification" value={profile.qualification} />
                <Row label="Experience" value={profile.experienceYears ? `${profile.experienceYears} years` : '—'} />
                <Row label="Joined" value={formatDate(profile.joiningDate)} />
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Row label="Role" value="Administrator" />
                <Row label="Access" value="Full institutional access" />
              </>
            )}
            <Row label="Last sign-in" value={user.lastLogin ? formatDate(user.lastLogin) : 'This session'} />
          </dl>
        </Card>

        <div className="lg:col-span-2">
          <Tabs
            className="mb-5 max-w-sm"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'details', label: 'Details' },
              { value: 'security', label: 'Security' },
            ]}
          />

          {tab === 'details' ? (
            <DetailsForm user={user} profile={profile} onSave={updateProfile} toast={toast} />
          ) : (
            <SecurityForm toast={toast} />
          )}
        </div>
      </div>
    </>
  );
}

function DetailsForm({ user, profile, onSave, toast }) {
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? '',
    cabin: profile?.cabin ?? '',
    officeHours: profile?.officeHours ?? '',
    bio: profile?.bio ?? '',
    addressLine1: profile?.address?.line1 ?? '',
    city: profile?.address?.city ?? '',
    state: profile?.address?.state ?? '',
    pincode: profile?.address?.pincode ?? '',
    guardianName: profile?.guardian?.name ?? '',
    guardianPhone: profile?.guardian?.phone ?? '',
  });
  const [saving, setSaving] = useState(false);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name: form.name,
        phone: form.phone,
        ...(user.role === 'faculty' ? { cabin: form.cabin, officeHours: form.officeHours, bio: form.bio } : {}),
        ...(user.role === 'student'
          ? {
              address: { line1: form.addressLine1, city: form.city, state: form.state, pincode: form.pincode },
              guardian: { name: form.guardianName, phone: form.guardianPhone },
            }
          : {}),
      });
      toast('Profile updated.');
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Personal details" subtitle="Keep your contact information current so the institute can reach you." icon={User} />
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <Input value={form.name} onChange={update('name')} required />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={update('phone')} placeholder="+91 …" />
          </Field>
        </div>

        <Field label="Institute email" hint="Your institutional email is managed by the academic section.">
          <Input value={user.email} disabled />
        </Field>

        {user.role === 'faculty' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cabin"><Input value={form.cabin} onChange={update('cabin')} placeholder="e.g. A-216" /></Field>
              <Field label="Office hours"><Input value={form.officeHours} onChange={update('officeHours')} placeholder="e.g. Mon–Fri · 15:00–17:00" /></Field>
            </div>
            <Field label="Short biography" hint="Shown on your profile in the faculty directory.">
              <Textarea value={form.bio} onChange={update('bio')} />
            </Field>
          </>
        )}

        {user.role === 'student' && (
          <>
            <fieldset className="space-y-4">
              <legend className="label">Correspondence address</legend>
              <Input value={form.addressLine1} onChange={update('addressLine1')} placeholder="House / street" aria-label="Address line" />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input value={form.city} onChange={update('city')} placeholder="City" aria-label="City" />
                <Input value={form.state} onChange={update('state')} placeholder="State" aria-label="State" />
                <Input value={form.pincode} onChange={update('pincode')} placeholder="PIN code" aria-label="PIN code" />
              </div>
            </fieldset>

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="label">Guardian</legend>
              <Input value={form.guardianName} onChange={update('guardianName')} placeholder="Guardian name" aria-label="Guardian name" />
              <Input value={form.guardianPhone} onChange={update('guardianPhone')} placeholder="Guardian phone" aria-label="Guardian phone" />
            </fieldset>
          </>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" icon={Save} loading={saving}>Save changes</Button>
        </div>
      </form>
    </Card>
  );
}

function SecurityForm({ toast }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast('The new passwords do not match.', 'error');
      return;
    }
    setSaving(true);
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast(response.message ?? 'Password updated.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Change password" subtitle="Use at least 8 characters, mixing letters, numbers and symbols." icon={KeyRound} />
        <form onSubmit={save} className="space-y-4">
          <Field label="Current password" required>
            <Input type="password" value={form.currentPassword} onChange={update('currentPassword')} autoComplete="current-password" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" required>
              <Input type="password" value={form.newPassword} onChange={update('newPassword')} minLength={8} autoComplete="new-password" required />
            </Field>
            <Field label="Confirm new password" required>
              <Input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} minLength={8} autoComplete="new-password" required />
            </Field>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" icon={KeyRound} loading={saving}>Update password</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="How your account is protected" icon={ShieldCheck} />
        <ul className="space-y-3 text-sm text-ink-600 dark:text-ink-300">
          {[
            'Passwords are salted and hashed with bcrypt — they are never stored in readable form.',
            'Sessions use signed, expiring JSON Web Tokens; a separate secret signs refresh tokens.',
            'Every API route checks your role, and records are scoped to the person who owns them.',
            'Failed sign-in attempts are rate limited to slow down credential-stuffing attacks.',
          ].map((line) => (
            <li key={line} className="flex gap-2.5">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
              {line}
            </li>
          ))}
        </ul>
        {isDemoMode && (
          <p className="mt-4 rounded-xl bg-gold-400/10 px-3.5 py-3 text-xs text-gold-800 dark:text-gold-200">
            You are in Demo Mode: data lives in your browser for this session only, and a password change resets on reload.
          </p>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-ink-500 dark:text-ink-400">{label}</dt>
      <dd className="text-right font-medium break-words">{value || '—'}</dd>
    </div>
  );
}
