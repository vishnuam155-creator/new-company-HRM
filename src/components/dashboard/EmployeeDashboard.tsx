import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Clock, TrendingUp } from 'lucide-react';
import { getEmployee, getLeaveRequests, getEmployeeSalaryRevisions } from '@/lib/storage';
import { Employee } from '@/types';
import { calculateExperience, formatDate, formatCurrency } from '@/lib/utils';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [myLeaves, setMyLeaves] = useState(0);

  useEffect(() => {
    if (user) {
      const emp = getEmployee(user.id);
      setEmployee(emp);

      const leaves = getLeaveRequests();
      const myLeaveRequests = leaves.filter((leave) => leave.employeeId === user.id);
      setMyLeaves(myLeaveRequests.length);
    }
  }, [user]);

  if (!employee) return null;

  const experienceDays = calculateExperience(employee.joiningDate);
  const experienceYears = Math.floor(experienceDays / 365);
  const experienceMonths = Math.floor((experienceDays % 365) / 30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">Your personal workspace</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experienceYears}y {experienceMonths}m</div>
            <p className="text-xs text-muted-foreground">{experienceDays} days total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee.department}</div>
            <p className="text-xs text-muted-foreground">{employee.position}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myLeaves}</div>
            <p className="text-xs text-muted-foreground">Total applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(employee.salary)}</div>
            <p className="text-xs text-muted-foreground">Annual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{employee.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-sm">{employee.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Joining Date</p>
              <p className="text-sm">{formatDate(employee.joiningDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Probation End</p>
              <p className="text-sm">{formatDate(employee.probationEndDate)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/my-leaves" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">Apply for Leave</p>
              <p className="text-sm text-muted-foreground">Request time off</p>
            </a>
            <a href="/my-attendance" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">View Attendance</p>
              <p className="text-sm text-muted-foreground">Check your attendance records</p>
            </a>
            <a href="/documents" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">My Documents</p>
              <p className="text-sm text-muted-foreground">View and download documents</p>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
