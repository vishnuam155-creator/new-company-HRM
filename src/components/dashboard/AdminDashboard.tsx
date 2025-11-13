import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, TrendingUp, Calendar, Clock, AlertCircle } from 'lucide-react';
import { getEmployees, getLeaveRequests } from '@/lib/storage';
import { calculateExperience } from '@/lib/utils';
import { DashboardStats } from '@/types';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    newJoinersThisMonth: 0,
    employeesCompletedOneYear: 0,
    upcomingProbationEnd: 0,
    pendingIncrements: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    const employees = getEmployees();
    const leaves = getLeaveRequests();
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const newJoiners = employees.filter((emp) => {
      const joinDate = new Date(emp.joiningDate);
      return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
    });

    const completedOneYear = employees.filter((emp) => {
      const experience = calculateExperience(emp.joiningDate);
      return experience >= 365 && experience < 395;
    });

    const upcomingProbation = employees.filter((emp) => {
      const probationEnd = new Date(emp.probationEndDate);
      const daysUntilEnd = Math.ceil((probationEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilEnd > 0 && daysUntilEnd <= 30;
    });

    const pendingLeaves = leaves.filter((leave) => leave.status === 'pending');

    setStats({
      totalEmployees: employees.length,
      newJoinersThisMonth: newJoiners.length,
      employeesCompletedOneYear: completedOneYear.length,
      upcomingProbationEnd: upcomingProbation.length,
      pendingIncrements: completedOneYear.length,
      pendingLeaves: pendingLeaves.length,
    });
  }, []);

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'New Joiners',
      value: stats.newJoinersThisMonth,
      icon: UserPlus,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Completed 1 Year',
      value: stats.employeesCompletedOneYear,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: Calendar,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Probation Ending',
      value: stats.upcomingProbationEnd,
      icon: Clock,
      color: 'text-chart-4',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pending Increments',
      value: stats.pendingIncrements,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of company metrics and activities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/employees/new" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">Add New Employee</p>
              <p className="text-sm text-muted-foreground">Onboard a new team member</p>
            </a>
            <a href="/leaves" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">Review Leave Requests</p>
              <p className="text-sm text-muted-foreground">{stats.pendingLeaves} pending requests</p>
            </a>
            <a href="/increments" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">Process Increments</p>
              <p className="text-sm text-muted-foreground">{stats.pendingIncrements} employees eligible</p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.upcomingProbationEnd > 0 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="font-medium text-warning">Probation Ending Soon</p>
                <p className="text-sm text-muted-foreground">
                  {stats.upcomingProbationEnd} employees in next 30 days
                </p>
              </div>
            )}
            {stats.pendingIncrements > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="font-medium text-destructive">Increments Due</p>
                <p className="text-sm text-muted-foreground">
                  {stats.pendingIncrements} employees completed 1 year
                </p>
              </div>
            )}
            {stats.pendingLeaves > 0 && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="font-medium text-primary">Pending Leave Approvals</p>
                <p className="text-sm text-muted-foreground">{stats.pendingLeaves} requests waiting</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
