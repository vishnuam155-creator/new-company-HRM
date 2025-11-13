import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { AppLayout } from '@/components/layout/AppLayout';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      {user?.role === 'admin' || user?.role === 'hr' ? (
        <AdminDashboard />
      ) : (
        <EmployeeDashboard />
      )}
    </AppLayout>
  );
};

export default Dashboard;
