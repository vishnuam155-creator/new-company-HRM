import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Eye, Trash2, FileText, Download } from 'lucide-react';
import {
  getRelievingLetters,
  addRelievingLetter,
  updateRelievingLetter,
  deleteRelievingLetter,
  getEmployees,
  updateEmployee
} from '@/lib/storage';
import { RelievingLetter, Employee } from '@/types';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';

const RelievingLetters = () => {
  const [relievingLetters, setRelievingLetters] = useState<RelievingLetter[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<RelievingLetter | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    employeeId: '',
    relievingDate: '',
    lastWorkingDay: '',
    reason: '',
    noticePeriodServed: true,
    hrClearance: true,
    financeClearance: true,
    itClearance: true,
    adminClearance: true,
    performanceRating: 'good' as 'excellent' | 'good' | 'average' | 'poor' | '',
    rehireEligible: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const letterData = getRelievingLetters();
    setRelievingLetters(letterData.sort((a, b) =>
      new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()
    ));

    const empData = getEmployees();
    setEmployees(empData.filter(emp => emp.status === 'active'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const employee = employees.find(emp => emp.id === formData.employeeId);
    if (!employee) {
      toast.error('Employee not found');
      return;
    }

    const relievingLetter: RelievingLetter = {
      id: `relieving-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      position: employee.position,
      department: employee.department,
      joiningDate: employee.joiningDate,
      relievingDate: formData.relievingDate,
      lastWorkingDay: formData.lastWorkingDay,
      reason: formData.reason,
      noticePeriodServed: formData.noticePeriodServed,
      clearanceStatus: {
        hr: formData.hrClearance,
        finance: formData.financeClearance,
        it: formData.itClearance,
        admin: formData.adminClearance,
      },
      generatedDate: new Date().toISOString(),
      generatedBy: user?.name || 'Admin',
      status: 'draft',
      performanceRating: formData.performanceRating || undefined,
      rehireEligible: formData.rehireEligible,
    };

    addRelievingLetter(relievingLetter);

    // Update employee status to inactive
    updateEmployee(employee.id, { status: 'inactive' });

    toast.success('Relieving letter generated successfully');
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      relievingDate: '',
      lastWorkingDay: '',
      reason: '',
      noticePeriodServed: true,
      hrClearance: true,
      financeClearance: true,
      itClearance: true,
      adminClearance: true,
      performanceRating: 'good',
      rehireEligible: true,
    });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this relieving letter?')) {
      deleteRelievingLetter(id);
      toast.success('Relieving letter deleted successfully');
      loadData();
    }
  };

  const handleView = (letter: RelievingLetter) => {
    setSelectedLetter(letter);
    setIsViewDialogOpen(true);
  };

  const handleStatusChange = (id: string, status: RelievingLetter['status']) => {
    updateRelievingLetter(id, { status });
    toast.success(`Relieving letter marked as ${status}`);
    loadData();
  };

  const handleDownload = (letter: RelievingLetter) => {
    const content = generateRelievingLetterHTML(letter);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relieving_Letter_${letter.employeeName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Relieving letter downloaded');
  };

  const generateRelievingLetterHTML = (letter: RelievingLetter) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relieving Letter - ${letter.employeeName}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
    .letter-content { margin-top: 30px; }
    .section { margin: 20px 0; }
    .signature { margin-top: 60px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .label { font-weight: bold; width: 250px; }
    .clearance { margin: 20px 0; }
    .clearance-item { display: flex; align-items: center; margin: 5px 0; }
    .clearance-item span { margin-left: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">Your Company Name</div>
    <p>Company Address | Email | Phone</p>
  </div>

  <div class="letter-content">
    <p><strong>Date:</strong> ${formatDate(letter.generatedDate)}</p>
    <p><strong>To Whom It May Concern,</strong></p>

    <div class="section">
      <p><strong>Subject: Relieving Letter</strong></p>
    </div>

    <div class="section">
      <p>This is to certify that <strong>${letter.employeeName}</strong> was employed with our organization from <strong>${formatDate(letter.joiningDate)}</strong> to <strong>${formatDate(letter.lastWorkingDay)}</strong>.</p>
    </div>

    <div class="section">
      <p><strong>Employee Details:</strong></p>
      <table>
        <tr>
          <td class="label">Employee Name:</td>
          <td>${letter.employeeName}</td>
        </tr>
        <tr>
          <td class="label">Email:</td>
          <td>${letter.employeeEmail}</td>
        </tr>
        <tr>
          <td class="label">Designation:</td>
          <td>${letter.position}</td>
        </tr>
        <tr>
          <td class="label">Department:</td>
          <td>${letter.department}</td>
        </tr>
        <tr>
          <td class="label">Date of Joining:</td>
          <td>${formatDate(letter.joiningDate)}</td>
        </tr>
        <tr>
          <td class="label">Last Working Day:</td>
          <td>${formatDate(letter.lastWorkingDay)}</td>
        </tr>
        <tr>
          <td class="label">Relieving Date:</td>
          <td>${formatDate(letter.relievingDate)}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <p>During their tenure with us, ${letter.employeeName} worked as <strong>${letter.position}</strong> in the <strong>${letter.department}</strong> department. ${letter.performanceRating ? `Their performance was rated as <strong>${letter.performanceRating}</strong>.` : ''}</p>
    </div>

    <div class="section">
      <p><strong>Clearance Status:</strong></p>
      <div class="clearance">
        <div class="clearance-item">
          <span>${letter.clearanceStatus.hr ? '✓' : '✗'}</span>
          <span>HR Clearance</span>
        </div>
        <div class="clearance-item">
          <span>${letter.clearanceStatus.finance ? '✓' : '✗'}</span>
          <span>Finance Clearance</span>
        </div>
        <div class="clearance-item">
          <span>${letter.clearanceStatus.it ? '✓' : '✗'}</span>
          <span>IT Clearance</span>
        </div>
        <div class="clearance-item">
          <span>${letter.clearanceStatus.admin ? '✓' : '✗'}</span>
          <span>Admin Clearance</span>
        </div>
      </div>
    </div>

    <div class="section">
      <p>${letter.noticePeriodServed ? 'The employee has served the complete notice period as per company policy.' : 'The notice period was waived off by mutual agreement.'}</p>
    </div>

    <div class="section">
      <p>We wish ${letter.employeeName} all the best for their future endeavors.</p>
    </div>

    <div class="signature">
      <p>Sincerely,</p>
      <p><strong>${letter.generatedBy}</strong><br>
      HR Department<br>
      Your Company Name</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const filteredLetters = relievingLetters.filter((letter) =>
    letter.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    letter.employeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    letter.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allClearances = (letter: RelievingLetter) => {
    return letter.clearanceStatus.hr &&
           letter.clearanceStatus.finance &&
           letter.clearanceStatus.it &&
           letter.clearanceStatus.admin;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relieving Letters</h1>
            <p className="text-muted-foreground">Generate and manage employee relieving letters</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Relieving Letter
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search relieving letters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Last Working Day</TableHead>
                  <TableHead>Clearance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLetters.map((letter) => (
                  <TableRow key={letter.id}>
                    <TableCell className="font-medium">{letter.employeeName}</TableCell>
                    <TableCell>{letter.position}</TableCell>
                    <TableCell>{letter.department}</TableCell>
                    <TableCell>{formatDate(letter.lastWorkingDay)}</TableCell>
                    <TableCell>
                      <Badge variant={allClearances(letter) ? 'default' : 'secondary'}>
                        {allClearances(letter) ? 'Complete' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={letter.status}
                        onValueChange={(value) => handleStatusChange(letter.id, value as RelievingLetter['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="generated">Generated</SelectItem>
                          <SelectItem value="issued">Issued</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(letter)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(letter)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(letter.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredLetters.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No relieving letters found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Relieving Letter</DialogTitle>
            <DialogDescription>
              Fill in the details to generate an employee relieving letter
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Select Employee *</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastWorkingDay">Last Working Day *</Label>
                  <Input
                    id="lastWorkingDay"
                    type="date"
                    value={formData.lastWorkingDay}
                    onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relievingDate">Relieving Date *</Label>
                  <Input
                    id="relievingDate"
                    type="date"
                    value={formData.relievingDate}
                    onChange={(e) => setFormData({ ...formData, relievingDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leaving *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Personal reasons, Career growth, Higher studies, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="performanceRating">Performance Rating</Label>
                <Select
                  value={formData.performanceRating}
                  onValueChange={(value) => setFormData({ ...formData, performanceRating: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select performance rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Clearance Status</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hrClearance"
                      checked={formData.hrClearance}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hrClearance: checked as boolean })
                      }
                    />
                    <Label htmlFor="hrClearance" className="font-normal cursor-pointer">
                      HR Clearance
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="financeClearance"
                      checked={formData.financeClearance}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, financeClearance: checked as boolean })
                      }
                    />
                    <Label htmlFor="financeClearance" className="font-normal cursor-pointer">
                      Finance Clearance
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="itClearance"
                      checked={formData.itClearance}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, itClearance: checked as boolean })
                      }
                    />
                    <Label htmlFor="itClearance" className="font-normal cursor-pointer">
                      IT Clearance
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="adminClearance"
                      checked={formData.adminClearance}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, adminClearance: checked as boolean })
                      }
                    />
                    <Label htmlFor="adminClearance" className="font-normal cursor-pointer">
                      Admin Clearance
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noticePeriodServed"
                    checked={formData.noticePeriodServed}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, noticePeriodServed: checked as boolean })
                    }
                  />
                  <Label htmlFor="noticePeriodServed" className="font-normal cursor-pointer">
                    Notice Period Served
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rehireEligible"
                    checked={formData.rehireEligible}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, rehireEligible: checked as boolean })
                    }
                  />
                  <Label htmlFor="rehireEligible" className="font-normal cursor-pointer">
                    Eligible for Rehire
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">Generate Letter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relieving Letter Preview</DialogTitle>
          </DialogHeader>
          {selectedLetter && (
            <div className="space-y-4 text-sm">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-blue-600">Your Company Name</h2>
                <p className="text-muted-foreground">Company Address | Email | Phone</p>
              </div>

              <div>
                <p><strong>Date:</strong> {formatDate(selectedLetter.generatedDate)}</p>
                <p className="mt-4"><strong>To Whom It May Concern,</strong></p>
              </div>

              <div>
                <p className="font-bold">Subject: Relieving Letter</p>
              </div>

              <div>
                <p>This is to certify that <strong>{selectedLetter.employeeName}</strong> was employed with our organization from <strong>{formatDate(selectedLetter.joiningDate)}</strong> to <strong>{formatDate(selectedLetter.lastWorkingDay)}</strong>.</p>
              </div>

              <div>
                <p className="font-bold mb-2">Employee Details:</p>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Employee Name:</span>
                    <span>{selectedLetter.employeeName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Email:</span>
                    <span>{selectedLetter.employeeEmail}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Designation:</span>
                    <span>{selectedLetter.position}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Department:</span>
                    <span>{selectedLetter.department}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Date of Joining:</span>
                    <span>{formatDate(selectedLetter.joiningDate)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Last Working Day:</span>
                    <span>{formatDate(selectedLetter.lastWorkingDay)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Relieving Date:</span>
                    <span>{formatDate(selectedLetter.relievingDate)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p>During their tenure with us, {selectedLetter.employeeName} worked as <strong>{selectedLetter.position}</strong> in the <strong>{selectedLetter.department}</strong> department.
                {selectedLetter.performanceRating && ` Their performance was rated as ${selectedLetter.performanceRating}.`}</p>
              </div>

              <div>
                <p className="font-bold mb-2">Clearance Status:</p>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span>{selectedLetter.clearanceStatus.hr ? '✓' : '✗'}</span>
                    <span>HR Clearance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{selectedLetter.clearanceStatus.finance ? '✓' : '✗'}</span>
                    <span>Finance Clearance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{selectedLetter.clearanceStatus.it ? '✓' : '✗'}</span>
                    <span>IT Clearance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{selectedLetter.clearanceStatus.admin ? '✓' : '✗'}</span>
                    <span>Admin Clearance</span>
                  </div>
                </div>
              </div>

              <div>
                <p>{selectedLetter.noticePeriodServed ? 'The employee has served the complete notice period as per company policy.' : 'The notice period was waived off by mutual agreement.'}</p>
              </div>

              <div>
                <p>We wish {selectedLetter.employeeName} all the best for their future endeavors.</p>
              </div>

              <div className="border-t pt-4">
                <p>Sincerely,</p>
                <p className="mt-2"><strong>{selectedLetter.generatedBy}</strong></p>
                <p>HR Department</p>
                <p>Your Company Name</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default RelievingLetters;
