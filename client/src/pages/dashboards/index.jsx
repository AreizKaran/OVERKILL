import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { SkeletonCard, EmptyState, Button } from '../../components/ui/index.jsx';
import { AlertTriangle } from 'lucide-react';
import StudentDashboard from './StudentDashboard.jsx';
import FacultyDashboard from './FacultyDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi('/dashboard');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} lines={2} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <SkeletonCard className="lg:col-span-2" lines={6} />
          <SkeletonCard lines={6} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Could not load your dashboard"
        description={error?.message ?? 'Something went wrong while fetching your data.'}
        action={<Button onClick={reload}>Try again</Button>}
      />
    );
  }

  if (user.role === 'student') return <StudentDashboard data={data} />;
  if (user.role === 'faculty') return <FacultyDashboard data={data} />;
  return <AdminDashboard data={data} />;
}
