import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Eye, Trash2, FileText, Download, Send, Check, X } from 'lucide-react';
import { getOfferLetters, addOfferLetter, updateOfferLetter, deleteOfferLetter, addEmployee } from '@/lib/storage';
import { OfferLetter, Employee } from '@/types';
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
import { useAuth } from '@/contexts/AuthContext';

const OfferLetters = () => {
  const [offerLetters, setOfferLetters] = useState<OfferLetter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferLetter | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateAddress: '',
    position: '',
    department: '',
    salary: '',
    joiningDate: '',
    probationPeriod: '6',
    benefits: 'Health Insurance, Provident Fund, Annual Leave',
    workLocation: '',
    reportingTo: '',
    workingHours: '9:00 AM - 6:00 PM (Monday to Friday)',
  });

  useEffect(() => {
    loadOfferLetters();
  }, []);

  const loadOfferLetters = () => {
    const data = getOfferLetters();
    setOfferLetters(data.sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const benefitsArray = formData.benefits.split(',').map(b => b.trim()).filter(b => b);

    const offerLetter: OfferLetter = {
      id: editingId || `offer-${Date.now()}`,
      candidateName: formData.candidateName,
      candidateEmail: formData.candidateEmail,
      candidatePhone: formData.candidatePhone,
      candidateAddress: formData.candidateAddress,
      position: formData.position,
      department: formData.department,
      salary: parseFloat(formData.salary),
      joiningDate: formData.joiningDate,
      probationPeriod: parseInt(formData.probationPeriod),
      benefits: benefitsArray,
      workLocation: formData.workLocation,
      reportingTo: formData.reportingTo,
      workingHours: formData.workingHours,
      generatedDate: new Date().toISOString(),
      generatedBy: user?.name || 'Admin',
      status: 'draft',
    };

    if (editingId) {
      updateOfferLetter(editingId, offerLetter);
      toast.success('Offer letter updated successfully');
    } else {
      addOfferLetter(offerLetter);
      toast.success('Offer letter generated successfully');
    }

    resetForm();
    loadOfferLetters();
  };

  const resetForm = () => {
    setFormData({
      candidateName: '',
      candidateEmail: '',
      candidatePhone: '',
      candidateAddress: '',
      position: '',
      department: '',
      salary: '',
      joiningDate: '',
      probationPeriod: '6',
      benefits: 'Health Insurance, Provident Fund, Annual Leave',
      workLocation: '',
      reportingTo: '',
      workingHours: '9:00 AM - 6:00 PM (Monday to Friday)',
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this offer letter?')) {
      deleteOfferLetter(id);
      toast.success('Offer letter deleted successfully');
      loadOfferLetters();
    }
  };

  const handleView = (offer: OfferLetter) => {
    setSelectedOffer(offer);
    setIsViewDialogOpen(true);
  };

  const handleStatusChange = (id: string, status: OfferLetter['status']) => {
    updateOfferLetter(id, { status });
    toast.success(`Offer letter marked as ${status}`);
    loadOfferLetters();
  };

  const handleConvertToEmployee = (offer: OfferLetter) => {
    if (offer.status !== 'accepted') {
      toast.error('Only accepted offer letters can be converted to employees');
      return;
    }

    const probationEndDate = new Date(offer.joiningDate);
    probationEndDate.setMonth(probationEndDate.getMonth() + offer.probationPeriod);

    const employee: Employee = {
      id: `emp-${Date.now()}`,
      name: offer.candidateName,
      email: offer.candidateEmail,
      phone: offer.candidatePhone,
      position: offer.position,
      department: offer.department,
      joiningDate: offer.joiningDate,
      salary: offer.salary,
      probationEndDate: probationEndDate.toISOString().split('T')[0],
      status: 'active',
      address: offer.candidateAddress,
    };

    addEmployee(employee);
    updateOfferLetter(offer.id, { employeeId: employee.id });
    toast.success('Candidate successfully added as employee!');
    loadOfferLetters();
  };

  const handleDownload = (offer: OfferLetter) => {
    const content = generateOfferLetterHTML(offer);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Offer_Letter_${offer.candidateName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Offer letter downloaded');
  };

  const generateOfferLetterHTML = (offer: OfferLetter) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Offer Letter - ${offer.candidateName}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
    .letter-content { margin-top: 30px; }
    .section { margin: 20px 0; }
    .signature { margin-top: 60px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .label { font-weight: bold; width: 200px; }
    .benefits { margin-left: 20px; }
    .benefits li { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">Your Company Name</div>
    <p>Company Address | Email | Phone</p>
  </div>

  <div class="letter-content">
    <p><strong>Date:</strong> ${formatDate(offer.generatedDate)}</p>
    <p><strong>To,</strong><br>
    ${offer.candidateName}<br>
    ${offer.candidateAddress}<br>
    Email: ${offer.candidateEmail}<br>
    Phone: ${offer.candidatePhone}</p>

    <p><strong>Subject: Offer of Employment - ${offer.position}</strong></p>

    <p>Dear ${offer.candidateName},</p>

    <div class="section">
      <p>We are pleased to offer you the position of <strong>${offer.position}</strong> in our <strong>${offer.department}</strong> department. We believe your skills and experience will be a valuable asset to our team.</p>
    </div>

    <div class="section">
      <p><strong>Terms of Employment:</strong></p>
      <table>
        <tr>
          <td class="label">Position:</td>
          <td>${offer.position}</td>
        </tr>
        <tr>
          <td class="label">Department:</td>
          <td>${offer.department}</td>
        </tr>
        <tr>
          <td class="label">Reporting To:</td>
          <td>${offer.reportingTo}</td>
        </tr>
        <tr>
          <td class="label">Work Location:</td>
          <td>${offer.workLocation}</td>
        </tr>
        <tr>
          <td class="label">Start Date:</td>
          <td>${formatDate(offer.joiningDate)}</td>
        </tr>
        <tr>
          <td class="label">Annual Salary:</td>
          <td>$${offer.salary.toLocaleString()}</td>
        </tr>
        <tr>
          <td class="label">Working Hours:</td>
          <td>${offer.workingHours}</td>
        </tr>
        <tr>
          <td class="label">Probation Period:</td>
          <td>${offer.probationPeriod} months</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <p><strong>Benefits & Perks:</strong></p>
      <ul class="benefits">
        ${offer.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <p>This offer is contingent upon successful completion of background verification and reference checks. Please confirm your acceptance by signing and returning this letter by ${formatDate(new Date(new Date(offer.generatedDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())}.</p>
    </div>

    <div class="signature">
      <p>Sincerely,</p>
      <p><strong>${offer.generatedBy}</strong><br>
      HR Department<br>
      Your Company Name</p>
    </div>

    <div class="signature">
      <p>I accept the terms and conditions of this offer:</p>
      <p>_________________________<br>
      ${offer.candidateName}<br>
      Date: _______________</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const filteredOfferLetters = offerLetters.filter((offer) =>
    offer.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Offer Letters</h1>
            <p className="text-muted-foreground">Generate and manage job offer letters</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Offer Letter
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search offer letters..."
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
                  <TableHead>Candidate Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOfferLetters.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.candidateName}</TableCell>
                    <TableCell>{offer.position}</TableCell>
                    <TableCell>{offer.department}</TableCell>
                    <TableCell>${offer.salary.toLocaleString()}</TableCell>
                    <TableCell>{formatDate(offer.joiningDate)}</TableCell>
                    <TableCell>
                      <Select
                        value={offer.status}
                        onValueChange={(value) => handleStatusChange(offer.id, value as OfferLetter['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(offer)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(offer)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {offer.status === 'accepted' && !offer.employeeId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleConvertToEmployee(offer)}
                            title="Add as Employee"
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(offer.id)}
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
            {filteredOfferLetters.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No offer letters found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Offer Letter</DialogTitle>
            <DialogDescription>
              Fill in the details to generate a job offer letter
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateName">Candidate Name *</Label>
                  <Input
                    id="candidateName"
                    value={formData.candidateName}
                    onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidateEmail">Email *</Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    value={formData.candidateEmail}
                    onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidatePhone">Phone *</Label>
                  <Input
                    id="candidatePhone"
                    value={formData.candidatePhone}
                    onChange={(e) => setFormData({ ...formData, candidatePhone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date *</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="candidateAddress">Address *</Label>
                <Textarea
                  id="candidateAddress"
                  value={formData.candidateAddress}
                  onChange={(e) => setFormData({ ...formData, candidateAddress: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary ($) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probationPeriod">Probation Period (months) *</Label>
                  <Input
                    id="probationPeriod"
                    type="number"
                    value={formData.probationPeriod}
                    onChange={(e) => setFormData({ ...formData, probationPeriod: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workLocation">Work Location *</Label>
                  <Input
                    id="workLocation"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportingTo">Reporting To *</Label>
                  <Input
                    id="reportingTo"
                    value={formData.reportingTo}
                    onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours">Working Hours *</Label>
                <Input
                  id="workingHours"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits (comma-separated) *</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="Health Insurance, Provident Fund, Annual Leave"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">Generate Offer Letter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offer Letter Preview</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-4 text-sm">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-blue-600">Your Company Name</h2>
                <p className="text-muted-foreground">Company Address | Email | Phone</p>
              </div>

              <div>
                <p><strong>Date:</strong> {formatDate(selectedOffer.generatedDate)}</p>
                <div className="mt-4">
                  <p><strong>To,</strong></p>
                  <p>{selectedOffer.candidateName}</p>
                  <p>{selectedOffer.candidateAddress}</p>
                  <p>Email: {selectedOffer.candidateEmail}</p>
                  <p>Phone: {selectedOffer.candidatePhone}</p>
                </div>
              </div>

              <div>
                <p className="font-bold">Subject: Offer of Employment - {selectedOffer.position}</p>
              </div>

              <div>
                <p>Dear {selectedOffer.candidateName},</p>
                <p className="mt-2">We are pleased to offer you the position of <strong>{selectedOffer.position}</strong> in our <strong>{selectedOffer.department}</strong> department. We believe your skills and experience will be a valuable asset to our team.</p>
              </div>

              <div>
                <p className="font-bold mb-2">Terms of Employment:</p>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Position:</span>
                    <span>{selectedOffer.position}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Department:</span>
                    <span>{selectedOffer.department}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Reporting To:</span>
                    <span>{selectedOffer.reportingTo}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Work Location:</span>
                    <span>{selectedOffer.workLocation}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Start Date:</span>
                    <span>{formatDate(selectedOffer.joiningDate)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Annual Salary:</span>
                    <span>${selectedOffer.salary.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Working Hours:</span>
                    <span>{selectedOffer.workingHours}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Probation Period:</span>
                    <span>{selectedOffer.probationPeriod} months</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-bold mb-2">Benefits & Perks:</p>
                <ul className="list-disc list-inside space-y-1">
                  {selectedOffer.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <p>Sincerely,</p>
                <p className="mt-2"><strong>{selectedOffer.generatedBy}</strong></p>
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

export default OfferLetters;
