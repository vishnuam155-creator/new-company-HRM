import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getEmployees, getSalaryRevisions, addSalaryRevision, updateEmployee } from '@/lib/storage';
import { Employee, SalaryRevision } from '@/types';
import { formatDate, formatCurrency, generateId, calculateExperience } from '@/lib/utils';
import { toast } from 'sonner';
import { TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Increments = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [eligibleEmployees, setEligibleEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [formData, setFormData] = useState({
    incrementPercentage: '',
    newDesignation: '',
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allEmployees = getEmployees();
    setEmployees(allEmployees);

    const eligible = allEmployees.filter((emp) => {
      const experience = calculateExperience(emp.joiningDate);
      return experience >= 365;
    });
    setEligibleEmployees(eligible);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const employee = employees.find((emp) => emp.id === selectedEmployee);
    if (!employee) return;

    const incrementPercentage = parseFloat(formData.incrementPercentage);
    const newSalary = employee.salary * (1 + incrementPercentage / 100);

    const revision: SalaryRevision = {
      id: generateId('rev'),
      employeeId: employee.id,
      previousSalary: employee.salary,
      newSalary,
      incrementPercentage,
      effectiveDate: new Date().toISOString(),
      reason: formData.reason,
      newDesignation: formData.newDesignation || undefined,
    };

    addSalaryRevision(revision);
    updateEmployee(employee.id, {
      salary: newSalary,
      position: formData.newDesignation || employee.position,
    });

    toast.success('Increment processed successfully');
    setOpen(false);
    loadData();
    setFormData({ incrementPercentage: '', newDesignation: '', reason: '' });
    setSelectedEmployee('');
  };

  const revisions = getSalaryRevisions();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Salary Increments</h1>
            <p className="text-muted-foreground">Process salary revisions</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <TrendingUp className="mr-2 h-4 w-4" />
                Process Increment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Salary Increment</DialogTitle>
                <DialogDescription>
                  Update employee salary and designation
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incrementPercentage">Increment Percentage</Label>
                  <Input
                    id="incrementPercentage"
                    type="number"
                    step="0.1"
                    value={formData.incrementPercentage}
                    onChange={(e) =>
                      setFormData({ ...formData, incrementPercentage: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newDesignation">New Designation (Optional)</Label>
                  <Input
                    id="newDesignation"
                    value={formData.newDesignation}
                    onChange={(e) =>
                      setFormData({ ...formData, newDesignation: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Process Increment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Eligible Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {eligibleEmployees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No employees eligible for increment
                  </p>
                ) : (
                  eligibleEmployees.map((emp) => {
                    const experience = calculateExperience(emp.joiningDate);
                    const years = Math.floor(experience / 365);
                    return (
                      <div
                        key={emp.id}
                        className="p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {emp.position} • {years} years experience
                        </p>
                        <p className="text-sm font-medium mt-1">
                          Current: {formatCurrency(emp.salary)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Revisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {revisions.slice(0, 5).map((rev) => {
                  const emp = employees.find((e) => e.id === rev.employeeId);
                  return (
                    <div key={rev.id} className="p-3 rounded-lg border">
                      <p className="font-medium">{emp?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(rev.previousSalary)} → {formatCurrency(rev.newSalary)}
                      </p>
                      <p className="text-sm text-success font-medium">
                        +{rev.incrementPercentage}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Increments;
