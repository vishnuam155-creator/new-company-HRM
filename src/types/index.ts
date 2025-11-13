export type UserRole = 'admin' | 'hr' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joiningDate: string;
  salary: number;
  probationEndDate: string;
  status: 'active' | 'inactive';
  documents?: EmployeeDocument[];
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  type: 'id_card' | 'offer_letter' | 'payslip' | 'other';
  name: string;
  url: string;
  uploadedAt: string;
}

export interface SalaryRevision {
  id: string;
  employeeId: string;
  previousSalary: number;
  newSalary: number;
  incrementPercentage: number;
  effectiveDate: string;
  reason: string;
  newDesignation?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'casual' | 'sick' | 'privilege' | 'wfh';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  documentUrl?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  newJoinersThisMonth: number;
  employeesCompletedOneYear: number;
  upcomingProbationEnd: number;
  pendingIncrements: number;
  pendingLeaves: number;
}
