import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getEmployees,
  getLeaveRequests,
  getAttendance,
  getSalaryRevisions,
  getOfferLetters,
  getRelievingLetters,
} from '@/lib/storage';
import { Employee, LeaveRequest, Attendance, SalaryRevision, OfferLetter, RelievingLetter } from '@/types';
import {
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  FileText,
  PieChart,
  BarChart3,
  Clock,
  Award,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const Analytics = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salaryRevisions, setSalaryRevisions] = useState<SalaryRevision[]>([]);
  const [offerLetters, setOfferLetters] = useState<OfferLetter[]>([]);
  const [relievingLetters, setRelievingLetters] = useState<RelievingLetter[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEmployees(getEmployees());
    setLeaveRequests(getLeaveRequests());
    setAttendance(getAttendance());
    setSalaryRevisions(getSalaryRevisions());
    setOfferLetters(getOfferLetters());
    setRelievingLetters(getRelievingLetters());
  };

  // Calculate metrics
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const inactiveEmployees = employees.filter(emp => emp.status === 'inactive').length;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const newHiresThisMonth = employees.filter(emp => {
    const joiningDate = new Date(emp.joiningDate);
    return joiningDate.getMonth() === currentMonth && joiningDate.getFullYear() === currentYear;
  }).length;

  const exitThisMonth = relievingLetters.filter(letter => {
    const exitDate = new Date(letter.relievingDate);
    return exitDate.getMonth() === currentMonth && exitDate.getFullYear() === currentYear;
  }).length;

  const pendingOffers = offerLetters.filter(offer => offer.status === 'sent').length;
  const acceptedOffers = offerLetters.filter(offer => offer.status === 'accepted').length;

  const pendingLeaves = leaveRequests.filter(leave => leave.status === 'pending').length;
  const approvedLeaves = leaveRequests.filter(leave => leave.status === 'approved').length;

  const avgSalary = employees.length > 0
    ? Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length)
    : 0;

  const totalSalaryBudget = employees
    .filter(emp => emp.status === 'active')
    .reduce((sum, emp) => sum + emp.salary, 0);

  // Department distribution
  const departmentData = employees.reduce((acc, emp) => {
    if (emp.status === 'active') {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const departmentChartData = Object.entries(departmentData).map(([name, value]) => ({
    name,
    value,
  }));

  // Salary distribution by department
  const salaryByDept = employees
    .filter(emp => emp.status === 'active')
    .reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + emp.salary;
      return acc;
    }, {} as Record<string, number>);

  const salaryChartData = Object.entries(salaryByDept).map(([name, value]) => ({
    name,
    salary: Math.round(value),
  }));

  // Leave type distribution
  const leaveTypeData = leaveRequests.reduce((acc, leave) => {
    acc[leave.leaveType] = (acc[leave.leaveType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const leaveTypeChartData = Object.entries(leaveTypeData).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
  }));

  // Monthly hiring trend (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      hires: 0,
      exits: 0,
    };
  }).reverse();

  employees.forEach(emp => {
    const joiningDate = new Date(emp.joiningDate);
    const monthStr = joiningDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const monthData = last6Months.find(m => m.month === monthStr);
    if (monthData) monthData.hires++;
  });

  relievingLetters.forEach(letter => {
    const exitDate = new Date(letter.relievingDate);
    const monthStr = exitDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const monthData = last6Months.find(m => m.month === monthStr);
    if (monthData) monthData.exits++;
  });

  // Attendance statistics
  const totalAttendanceRecords = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  const attendanceRate = totalAttendanceRecords > 0
    ? Math.round((presentCount / totalAttendanceRecords) * 100)
    : 0;

  // Offer letter stats
  const offerAcceptanceRate = offerLetters.length > 0
    ? Math.round((acceptedOffers / offerLetters.length) * 100)
    : 0;

  // Average tenure
  const avgTenureDays = employees.length > 0
    ? Math.round(
        employees.reduce((sum, emp) => {
          const joiningDate = new Date(emp.joiningDate);
          const days = Math.floor((currentDate.getTime() - joiningDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / employees.length
      )
    : 0;

  const avgTenureMonths = Math.floor(avgTenureDays / 30);

  // Attrition rate (last 12 months)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const exitsLastYear = relievingLetters.filter(letter => {
    const exitDate = new Date(letter.relievingDate);
    return exitDate >= oneYearAgo;
  }).length;

  const attritionRate = employees.length > 0
    ? Math.round((exitsLastYear / employees.length) * 100)
    : 0;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your workforce</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees}</div>
              <p className="text-xs text-muted-foreground">
                {inactiveEmployees} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Hires</CardTitle>
              <UserPlus className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newHiresThisMonth}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exits</CardTitle>
              <UserMinus className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exitThisMonth}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attrition Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attritionRate}%</div>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgSalary.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Per employee/year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Salary Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(totalSalaryBudget / 1000)}K</div>
              <p className="text-xs text-muted-foreground">Annual budget</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLeaves}</div>
              <p className="text-xs text-muted-foreground">
                {approvedLeaves} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Tenure</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgTenureMonths}</div>
              <p className="text-xs text-muted-foreground">Months</p>
            </CardContent>
          </Card>
        </div>

        {/* Recruitment Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOffers}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted Offers</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptedOffers}</div>
              <p className="text-xs text-muted-foreground">Ready to join</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offer Acceptance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offerAcceptanceRate}%</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={departmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Salary Budget by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Bar dataKey="salary" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hiring & Attrition Trend (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={last6Months}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="hires" stroke="#10b981" name="New Hires" strokeWidth={2} />
                  <Line type="monotone" dataKey="exits" stroke="#ef4444" name="Exits" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leaveTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold">{attendanceRate}%</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-3xl font-bold text-green-600">{presentCount}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Late</p>
                <p className="text-3xl font-bold text-orange-600">{lateCount}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-3xl font-bold text-red-600">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Revisions */}
        {salaryRevisions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Salary Revisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salaryRevisions.slice(0, 5).map((revision) => {
                  const employee = employees.find(emp => emp.id === revision.employeeId);
                  return (
                    <div key={revision.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{employee?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(revision.effectiveDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+{revision.incrementPercentage}%</p>
                        <p className="text-xs text-muted-foreground">
                          ${revision.previousSalary.toLocaleString()} → ${revision.newSalary.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Analytics;
