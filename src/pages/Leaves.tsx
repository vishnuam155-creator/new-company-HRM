import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getLeaveRequests, updateLeaveRequest, deleteLeaveRequest } from '@/lib/storage';
import { LeaveRequest } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Check, X, Eye, Trash2, XCircle, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

const Leaves = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = () => {
    const data = getLeaveRequests();
    // Sort by applied date, newest first
    const sorted = data.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    setLeaves(sorted);
  };

  const handleApprove = (id: string) => {
    updateLeaveRequest(id, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: user?.name || 'Admin'
    });
    toast.success('Leave approved successfully');
    loadLeaves();
  };

  const handleReject = (id: string) => {
    updateLeaveRequest(id, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: user?.name || 'Admin'
    });
    toast.error('Leave rejected');
    loadLeaves();
  };

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this leave? This action cannot be undone.')) {
      updateLeaveRequest(id, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.name || 'Admin (Cancelled)'
      });
      toast.info('Leave cancelled successfully');
      loadLeaves();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this leave request?')) {
      deleteLeaveRequest(id);
      toast.success('Leave request deleted');
      loadLeaves();
    }
  };

  const handleView = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setIsViewDialogOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getLeaveTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'casual':
        return 'bg-blue-100 text-blue-800';
      case 'sick':
        return 'bg-red-100 text-red-800';
      case 'privilege':
        return 'bg-purple-100 text-purple-800';
      case 'wfh':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    const matchesType = leaveTypeFilter === 'all' || leave.leaveType === leaveTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingLeaves = filteredLeaves.filter(l => l.status === 'pending');
  const approvedLeaves = filteredLeaves.filter(l => l.status === 'approved');
  const rejectedLeaves = filteredLeaves.filter(l => l.status === 'rejected');

  const renderLeaveTable = (leavesToShow: LeaveRequest[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Leave Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Days</TableHead>
          <TableHead>Applied On</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leavesToShow.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
              No leave requests found
            </TableCell>
          </TableRow>
        ) : (
          leavesToShow.map((leave) => {
            const days = calculateDays(leave.startDate, leave.endDate);
            return (
              <TableRow key={leave.id}>
                <TableCell className="font-medium">{leave.employeeName}</TableCell>
                <TableCell>
                  <Badge className={getLeaveTypeBadgeColor(leave.leaveType)}>
                    {leave.leaveType.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(leave.startDate)}</TableCell>
                <TableCell>{formatDate(leave.endDate)}</TableCell>
                <TableCell>{days} {days === 1 ? 'day' : 'days'}</TableCell>
                <TableCell>{formatDate(leave.appliedAt)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(leave.status)}>
                    {leave.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleView(leave)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {leave.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(leave.id)}
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(leave.id)}
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {leave.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(leave.id)}
                        title="Cancel Leave"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(leave.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">Review, approve, and manage all employee leave requests</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{leaves.filter(l => l.status === 'pending').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{leaves.filter(l => l.status === 'approved').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{leaves.filter(l => l.status === 'rejected').length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee name or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="privilege">Privilege</SelectItem>
                  <SelectItem value="wfh">WFH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({filteredLeaves.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingLeaves.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedLeaves.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedLeaves.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                {renderLeaveTable(filteredLeaves)}
              </TabsContent>
              <TabsContent value="pending" className="mt-4">
                {renderLeaveTable(pendingLeaves)}
              </TabsContent>
              <TabsContent value="approved" className="mt-4">
                {renderLeaveTable(approvedLeaves)}
              </TabsContent>
              <TabsContent value="rejected" className="mt-4">
                {renderLeaveTable(rejectedLeaves)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* View Leave Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>Complete information about this leave request</DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Employee Name</p>
                  <p className="text-base font-semibold">{selectedLeave.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
                  <Badge className={getLeaveTypeBadgeColor(selectedLeave.leaveType)}>
                    {selectedLeave.leaveType.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-base">{formatDate(selectedLeave.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-base">{formatDate(selectedLeave.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Days</p>
                  <p className="text-base font-semibold">
                    {calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={getStatusVariant(selectedLeave.status)}>
                    {selectedLeave.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applied On</p>
                  <p className="text-base">{formatDate(selectedLeave.appliedAt)}</p>
                </div>
                {selectedLeave.reviewedAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reviewed On</p>
                    <p className="text-base">{formatDate(selectedLeave.reviewedAt)}</p>
                  </div>
                )}
                {selectedLeave.reviewedBy && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Reviewed By</p>
                    <p className="text-base">{selectedLeave.reviewedBy}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Reason</p>
                <p className="text-base border rounded-md p-3 bg-muted">{selectedLeave.reason}</p>
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

export default Leaves;
