import { Employee, LeaveRequest, Attendance, Announcement, SalaryRevision } from '@/types';

// Initialize default data
const initializeData = () => {
  if (!localStorage.getItem('employees')) {
    const defaultEmployees: Employee[] = [
      {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@company.com',
        phone: '+1234567890',
        position: 'Senior Developer',
        department: 'Engineering',
        joiningDate: '2023-01-15',
        salary: 80000,
        probationEndDate: '2023-04-15',
        status: 'active',
      },
      {
        id: 'emp-2',
        name: 'Jane Smith',
        email: 'jane@company.com',
        phone: '+1234567891',
        position: 'Product Manager',
        department: 'Product',
        joiningDate: '2023-11-01',
        salary: 90000,
        probationEndDate: '2024-02-01',
        status: 'active',
      },
    ];
    localStorage.setItem('employees', JSON.stringify(defaultEmployees));
  }

  if (!localStorage.getItem('leaveRequests')) {
    localStorage.setItem('leaveRequests', JSON.stringify([]));
  }

  if (!localStorage.getItem('attendance')) {
    localStorage.setItem('attendance', JSON.stringify([]));
  }

  if (!localStorage.getItem('announcements')) {
    localStorage.setItem('announcements', JSON.stringify([]));
  }

  if (!localStorage.getItem('salaryRevisions')) {
    localStorage.setItem('salaryRevisions', JSON.stringify([]));
  }
};

initializeData();

// Employee operations
export const getEmployees = (): Employee[] => {
  return JSON.parse(localStorage.getItem('employees') || '[]');
};

export const getEmployee = (id: string): Employee | null => {
  const employees = getEmployees();
  return employees.find(emp => emp.id === id) || null;
};

export const addEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  employees.push(employee);
  localStorage.setItem('employees', JSON.stringify(employees));
};

export const updateEmployee = (id: string, updates: Partial<Employee>): void => {
  const employees = getEmployees();
  const index = employees.findIndex(emp => emp.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...updates };
    localStorage.setItem('employees', JSON.stringify(employees));
  }
};

export const deleteEmployee = (id: string): void => {
  const employees = getEmployees();
  const filtered = employees.filter(emp => emp.id !== id);
  localStorage.setItem('employees', JSON.stringify(filtered));
};

// Leave operations
export const getLeaveRequests = (): LeaveRequest[] => {
  return JSON.parse(localStorage.getItem('leaveRequests') || '[]');
};

export const addLeaveRequest = (leave: LeaveRequest): void => {
  const leaves = getLeaveRequests();
  leaves.push(leave);
  localStorage.setItem('leaveRequests', JSON.stringify(leaves));
};

export const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>): void => {
  const leaves = getLeaveRequests();
  const index = leaves.findIndex(leave => leave.id === id);
  if (index !== -1) {
    leaves[index] = { ...leaves[index], ...updates };
    localStorage.setItem('leaveRequests', JSON.stringify(leaves));
  }
};

// Attendance operations
export const getAttendance = (): Attendance[] => {
  return JSON.parse(localStorage.getItem('attendance') || '[]');
};

export const addAttendance = (attendance: Attendance): void => {
  const records = getAttendance();
  records.push(attendance);
  localStorage.setItem('attendance', JSON.stringify(records));
};

// Announcement operations
export const getAnnouncements = (): Announcement[] => {
  return JSON.parse(localStorage.getItem('announcements') || '[]');
};

export const addAnnouncement = (announcement: Announcement): void => {
  const announcements = getAnnouncements();
  announcements.push(announcement);
  localStorage.setItem('announcements', JSON.stringify(announcements));
};

// Salary revision operations
export const getSalaryRevisions = (): SalaryRevision[] => {
  return JSON.parse(localStorage.getItem('salaryRevisions') || '[]');
};

export const addSalaryRevision = (revision: SalaryRevision): void => {
  const revisions = getSalaryRevisions();
  revisions.push(revision);
  localStorage.setItem('salaryRevisions', JSON.stringify(revisions));
};

export const getEmployeeSalaryRevisions = (employeeId: string): SalaryRevision[] => {
  const revisions = getSalaryRevisions();
  return revisions.filter(rev => rev.employeeId === employeeId);
};
