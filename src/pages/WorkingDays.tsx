import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getEmployees, getAttendance, getLeaveRequests } from '@/lib/storage';
import { Employee, Attendance, LeaveRequest } from '@/types';
import { formatDate } from '@/lib/utils';
import { Search, Calendar, Clock, UserCheck, TrendingUp, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const WorkingDays = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEmployees(getEmployees().filter(emp => emp.status === 'active'));
    setAttendance(getAttendance());
    setLeaveRequests(getLeaveRequests());
  };

  const calculateWorkingDays = (employeeId: string, month: string) => {
    const [year, monthNum] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);

    const employeeAttendance = attendance.filter(
      (att) => att.employeeId === employeeId
    );

    const presentDays = employeeAttendance.filter((att) => {
      const attDate = new Date(att.date);
      return (
        attDate >= firstDay &&
        attDate <= lastDay &&
        (att.status === 'present' || att.status === 'late')
      );
    }).length;

    const absentDays = employeeAttendance.filter((att) => {
      const attDate = new Date(att.date);
      return attDate >= firstDay && attDate <= lastDay && att.status === 'absent';
    }).length;

    const lateDays = employeeAttendance.filter((att) => {
      const attDate = new Date(att.date);
      return attDate >= firstDay && attDate <= lastDay && att.status === 'late';
    }).length;

    const halfDays = employeeAttendance.filter((att) => {
      const attDate = new Date(att.date);
      return attDate >= firstDay && attDate <= lastDay && att.status === 'half-day';
    }).length;

    // Calculate approved leaves for this month
    const approvedLeaves = leaveRequests.filter((leave) => {
      if (leave.employeeId !== employeeId || leave.status !== 'approved') return false;

      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);

      return (
        (leaveStart >= firstDay && leaveStart <= lastDay) ||
        (leaveEnd >= firstDay && leaveEnd <= lastDay) ||
        (leaveStart < firstDay && leaveEnd > lastDay)
      );
    }).reduce((total, leave) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const diffTime = Math.abs(leaveEnd.getTime() - leaveStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return total + diffDays;
    }, 0);

    const totalWorkingDays = lastDay.getDate();
    const attendanceRate =
      presentDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;

    // Calculate total hours (assuming 9 hours per working day)
    const totalHours = presentDays * 9;

    return {
      totalWorkingDays,
      presentDays,
      absentDays,
      lateDays,
      halfDays,
      approvedLeaves,
      attendanceRate,
      totalHours,
    };
  };

  const getAverageCheckInTime = (employeeId: string, month: string) => {
    const [year, monthNum] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);

    const checkIns = attendance
      .filter((att) => {
        const attDate = new Date(att.date);
        return (
          att.employeeId === employeeId &&
          att.checkIn &&
          attDate >= firstDay &&
          attDate <= lastDay
        );
      })
      .map((att) => att.checkIn!);

    if (checkIns.length === 0) return 'N/A';

    const avgMinutes =
      checkIns.reduce((sum, time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return sum + hours * 60 + minutes;
      }, 0) / checkIns.length;

    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.floor(avgMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const departments = Array.from(new Set(employees.map((emp) => emp.department)));

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      departmentFilter === 'all' || emp.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const exportToCSV = () => {
    const csvData = filteredEmployees.map((emp) => {
      const stats = calculateWorkingDays(emp.id, selectedMonth);
      const avgCheckIn = getAverageCheckInTime(emp.id, selectedMonth);

      return {
        Name: emp.name,
        Email: emp.email,
        Department: emp.department,
        Position: emp.position,
        'Total Days': stats.totalWorkingDays,
        'Present Days': stats.presentDays,
        'Absent Days': stats.absentDays,
        'Late Days': stats.lateDays,
        'Half Days': stats.halfDays,
        'Leaves Taken': stats.approvedLeaves,
        'Attendance Rate': `${stats.attendanceRate}%`,
        'Total Hours': stats.totalHours,
        'Avg Check-in': avgCheckIn,
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `working_days_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate overall statistics
  const totalStats = filteredEmployees.reduce(
    (acc, emp) => {
      const stats = calculateWorkingDays(emp.id, selectedMonth);
      return {
        totalPresent: acc.totalPresent + stats.presentDays,
        totalAbsent: acc.totalAbsent + stats.absentDays,
        totalLate: acc.totalLate + stats.lateDays,
        totalLeaves: acc.totalLeaves + stats.approvedLeaves,
        totalHours: acc.totalHours + stats.totalHours,
      };
    },
    { totalPresent: 0, totalAbsent: 0, totalLate: 0, totalLeaves: 0, totalHours: 0 }
  );

  const overallAttendanceRate =
    filteredEmployees.length > 0
      ? Math.round(
          filteredEmployees.reduce((sum, emp) => {
            const stats = calculateWorkingDays(emp.id, selectedMonth);
            return sum + stats.attendanceRate;
          }, 0) / filteredEmployees.length
        )
      : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Working Days</h1>
          <p className="text-muted-foreground">
            Track attendance, working hours, and productivity for all employees
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Present Days</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalStats.totalPresent}</div>
              <p className="text-xs text-muted-foreground">Across all employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{overallAttendanceRate}%</div>
              <p className="text-xs text-muted-foreground">Average across team</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalStats.totalHours.toLocaleString()}h
              </div>
              <p className="text-xs text-muted-foreground">Worked this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leaves Taken</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalStats.totalLeaves}</div>
              <p className="text-xs text-muted-foreground">Approved leaves</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full md:w-[200px]"
                />
              </div>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Leaves</TableHead>
                    <TableHead className="text-center">Total Hours</TableHead>
                    <TableHead className="text-center">Avg Check-in</TableHead>
                    <TableHead className="text-center">Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => {
                      const stats = calculateWorkingDays(employee.id, selectedMonth);
                      const avgCheckIn = getAverageCheckInTime(employee.id, selectedMonth);

                      return (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {stats.presentDays}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              {stats.absentDays}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              {stats.lateDays}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {stats.approvedLeaves}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {stats.totalHours}h
                          </TableCell>
                          <TableCell className="text-center">{avgCheckIn}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div
                                className={`text-sm font-bold ${
                                  stats.attendanceRate >= 90
                                    ? 'text-green-600'
                                    : stats.attendanceRate >= 75
                                    ? 'text-orange-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {stats.attendanceRate}%
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-800 rounded"></div>
                <span>Present Days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-800 rounded"></div>
                <span>Absent Days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 border border-orange-800 rounded"></div>
                <span>Late Arrivals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-800 rounded"></div>
                <span>Approved Leaves</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              * Total Hours = Present Days × 9 hours (standard working day)
              <br />* Attendance Rate = (Present Days / Total Working Days) × 100
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default WorkingDays;
