import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAttendance, addAttendance, getEmployees } from '@/lib/storage';
import { Attendance as AttendanceType } from '@/types';
import { formatDate, generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Attendance = () => {
  const [records, setRecords] = useState<AttendanceType[]>([]);
  const [employees] = useState(getEmployees());

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = () => {
    const data = getAttendance();
    setRecords(data);
  };

  const markAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    
    employees.forEach((emp) => {
      const existing = records.find(
        (r) => r.employeeId === emp.id && r.date === today
      );

      if (!existing) {
        const newRecord: AttendanceType = {
          id: generateId('att'),
          employeeId: emp.id,
          date: today,
          checkIn: new Date().toTimeString().split(' ')[0],
          status: 'present',
        };
        addAttendance(newRecord);
      }
    });

    toast.success('Attendance marked for all employees');
    loadAttendance();
  };

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.name || 'Unknown';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground">Track employee attendance</p>
          </div>
          <Button onClick={markAttendance}>
            <Clock className="mr-2 h-4 w-4" />
            Mark Today's Attendance
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {getEmployeeName(record.employeeId)}
                      </TableCell>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{record.checkIn || '-'}</TableCell>
                      <TableCell>{record.checkOut || '-'}</TableCell>
                      <TableCell className="capitalize">{record.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Attendance;
