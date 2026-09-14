import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { Spinner } from './components/ui/index.jsx';
import { Logo } from './components/layout/Logo.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/dashboards/index.jsx';

// Module screens are split out of the initial bundle.
const Courses = lazy(() => import('./pages/modules/Courses.jsx'));
const Attendance = lazy(() => import('./pages/modules/Attendance.jsx'));
const Assignments = lazy(() => import('./pages/modules/Assignments.jsx'));
const Examinations = lazy(() => import('./pages/modules/Examinations.jsx'));
const Results = lazy(() => import('./pages/modules/Results.jsx'));
const Students = lazy(() => import('./pages/modules/Students.jsx'));
const StudentDetail = lazy(() => import('./pages/modules/StudentDetail.jsx'));
const Faculty = lazy(() => import('./pages/modules/Faculty.jsx'));
const Announcements = lazy(() => import('./pages/modules/Announcements.jsx'));
const Feedback = lazy(() => import('./pages/modules/Feedback.jsx'));
const Fees = lazy(() => import('./pages/modules/Fees.jsx'));
const Notifications = lazy(() => import('./pages/modules/Notifications.jsx'));
const Profile = lazy(() => import('./pages/modules/Profile.jsx'));
const Users = lazy(() => import('./pages/modules/Users.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function BootScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-50 dark:bg-ink-950">
      <div className="flex flex-col items-center gap-5">
        <Logo size={48} showWordmark={false} />
        <Spinner label="Preparing your campus" />
      </div>
    </div>
  );
}

/** Blocks unauthenticated access and, optionally, the wrong role. */
function Protected({ roles, children }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) return <BootScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/app"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="examinations" element={<Examinations />} />
        <Route
          path="results"
          element={
            <Protected roles={['student', 'admin']}>
              <Results />
            </Protected>
          }
        />
        <Route
          path="students"
          element={
            <Protected roles={['faculty', 'admin']}>
              <Students />
            </Protected>
          }
        />
        <Route
          path="students/:id"
          element={
            <Protected roles={['faculty', 'admin']}>
              <StudentDetail />
            </Protected>
          }
        />
        <Route path="faculty" element={<Faculty />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="feedback" element={<Feedback />} />
        <Route
          path="fees"
          element={
            <Protected roles={['student', 'admin']}>
              <Fees />
            </Protected>
          }
        />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route
          path="users"
          element={
            <Protected roles={['admin']}>
              <Users />
            </Protected>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<BootScreen />}>
              <AppRoutes />
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
