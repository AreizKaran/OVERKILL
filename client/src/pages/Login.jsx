import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo } from '../components/layout/Logo.jsx';
import { Button, Field, Input, cx } from '../components/ui/index.jsx';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, isDemoMode } from '../lib/api.js';
import { INSTITUTE } from '../data/reference.js';

const ROLE_TABS = [
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'faculty', label: 'Faculty', icon: Users },
  { value: 'admin', label: 'Administrator', icon: ShieldCheck },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={location.state?.from ?? '/app'} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password, role });
      navigate(location.state?.from ?? '/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const useDemoAccount = (account) => {
    setRole(account.role);
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      {/* ------------------------------------------------------- Form */}
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-14">
        <Link to="/" className="inline-flex w-fit">
          <Logo />
        </Link>

        <div className="flex flex-1 items-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-md"
          >
            <p className="eyebrow">Secure sign-in</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              Sign in to the eCampus ELO Portal with your institute credentials.
            </p>

            {/* Role selector — also sent to the API so an account can't sign in under the wrong role. */}
            <div className="mt-7 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Sign in as">
              {ROLE_TABS.map((tab) => {
                const active = role === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setRole(tab.value)}
                    className={cx(
                      'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[0.75rem] font-medium transition sm:text-[0.8125rem]',
                      active
                        ? 'border-brand-500 bg-brand-500/10 text-brand-700 shadow-sm dark:text-brand-200'
                        : 'border-ink-200 text-ink-500 hover:border-ink-300 hover:text-ink-700 dark:border-white/10 dark:text-ink-400 dark:hover:text-ink-200'
                    )}
                  >
                    <tab.icon size={18} aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Institute email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@smit.smu.edu.in"
                  autoComplete="username"
                  required
                />
              </Field>

              <Field label="Password" required>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-400 transition hover:text-ink-700 dark:hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="flex items-start gap-2 rounded-xl bg-rose-500/10 px-3.5 py-3 text-sm text-rose-700 dark:text-rose-300"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {error}
                </motion.p>
              )}

              <Button type="submit" size="lg" className="w-full" loading={submitting} icon={submitting ? undefined : ArrowRight}>
                {submitting ? 'Signing in' : 'Sign in to portal'}
              </Button>
            </form>

            {isDemoMode && (
              <div className="mt-8 rounded-2xl border border-dashed border-ink-300 p-4 dark:border-white/15">
                <p className="text-[0.8125rem] font-semibold text-ink-700 dark:text-ink-200">
                  Demo Mode — no server required
                </p>
                <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                  Choose an account to explore a full sample academic year. Password for all three:{' '}
                  <code className="rounded bg-ink-100 px-1.5 py-0.5 font-medium dark:bg-white/10">{DEMO_PASSWORD}</code>
                </p>
                <div className="mt-3 grid gap-2">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => useDemoAccount(account)}
                      className="flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2.5 text-left transition hover:border-brand-400 hover:bg-brand-500/5 dark:border-white/10"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-[0.6875rem] font-bold text-brand-700 dark:text-brand-300">
                        {account.label[0]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.8125rem] font-medium">{account.name}</span>
                        <span className="block truncate text-xs text-ink-500 dark:text-ink-400">{account.detail}</span>
                      </span>
                      <ArrowRight size={15} className="shrink-0 text-ink-400" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-8 text-center text-xs text-ink-400">
              Trouble signing in? Contact the academic section at{' '}
              <span className="font-medium text-ink-600 dark:text-ink-300">academics.office@smit.smu.edu.in</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* ------------------------------------------------------ Poster */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 lg:block">
        <div className="grid-lines absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-gold-400/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-brand-400/25 blur-3xl" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="text-[0.6875rem] font-semibold tracking-[0.16em] text-gold-300 uppercase"
            >
              {INSTITUTE.short} · {INSTITUTE.term} {INSTITUTE.academicYear}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="mt-5 max-w-lg font-display text-4xl leading-tight font-extrabold text-balance text-white xl:text-[2.75rem]"
            >
              One Campus. One Platform. Everything Connected.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="mt-5 max-w-md text-pretty text-brand-100/85"
            >
              Attendance, assignments, examinations, results, notices, feedback and fees — held
              together by one secure academic record.
            </motion.p>
          </div>

          <motion.dl
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="grid grid-cols-3 gap-6 border-t border-white/15 pt-8"
          >
            {[
              ['11', 'Modules'],
              ['3', 'Secure roles'],
              ['6', 'Departments'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl font-bold text-white">{value}</dt>
                <dd className="mt-1 text-[0.8125rem] text-brand-200/80">{label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </div>
  );
}
