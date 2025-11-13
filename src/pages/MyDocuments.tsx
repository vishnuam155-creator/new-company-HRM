import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getEmployee } from '@/lib/storage';
import { Employee, EmployeeDocument } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  Download,
  Eye,
  Search,
  Calendar,
  DollarSign,
  File,
  Award
} from 'lucide-react';
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

const MyDocuments = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      const empData = getEmployee(user.id);
      setEmployee(empData);
    }
  }, [user]);

  if (!employee) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </AppLayout>
    );
  }

  const documents = employee.documents || [];

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'id_card':
        return <Award className="h-5 w-5" />;
      case 'offer_letter':
        return <FileText className="h-5 w-5" />;
      case 'payslip':
        return <DollarSign className="h-5 w-5" />;
      case 'relieving_letter':
        return <File className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'id_card':
        return 'ID Card';
      case 'offer_letter':
        return 'Offer Letter';
      case 'payslip':
        return 'Payslip';
      case 'relieving_letter':
        return 'Relieving Letter';
      default:
        return 'Other';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'id_card':
        return 'bg-purple-100 text-purple-800';
      case 'offer_letter':
        return 'bg-blue-100 text-blue-800';
      case 'payslip':
        return 'bg-green-100 text-green-800';
      case 'relieving_letter':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (doc: EmployeeDocument) => {
    // Create a blob URL and trigger download
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (doc: EmployeeDocument) => {
    window.open(doc.url, '_blank');
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Group documents by type for summary
  const documentsByType = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
          <p className="text-muted-foreground">Access and download your employment documents</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">All types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payslips</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {documentsByType['payslip'] || 0}
              </div>
              <p className="text-xs text-muted-foreground">Salary documents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offer Letters</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {documentsByType['offer_letter'] || 0}
              </div>
              <p className="text-xs text-muted-foreground">Employment offers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Other Documents</CardTitle>
              <File className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(documentsByType['id_card'] || 0) + (documentsByType['other'] || 0)}
              </div>
              <p className="text-xs text-muted-foreground">ID cards & misc</p>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="offer_letter">Offer Letter</SelectItem>
                  <SelectItem value="payslip">Payslip</SelectItem>
                  <SelectItem value="id_card">ID Card</SelectItem>
                  <SelectItem value="relieving_letter">Relieving Letter</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {documents.length === 0
                    ? 'No documents available yet'
                    : 'No documents match your search'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded">
                            {getDocumentIcon(doc.type)}
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {doc.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDocumentTypeColor(doc.type)}>
                          {getDocumentTypeName(doc.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(doc.uploadedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(doc)}
                            title="View Document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            title="Download Document"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {documentsByType['offer_letter'] > 0 && (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setTypeFilter('offer_letter')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Offer Letters ({documentsByType['offer_letter']})
                </Button>
              )}
              {documentsByType['payslip'] > 0 && (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setTypeFilter('payslip')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Payslips ({documentsByType['payslip']})
                </Button>
              )}
              {documentsByType['id_card'] > 0 && (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setTypeFilter('id_card')}
                >
                  <Award className="h-4 w-4 mr-2" />
                  View ID Cards ({documentsByType['id_card']})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MyDocuments;
