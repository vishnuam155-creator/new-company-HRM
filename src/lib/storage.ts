import { Employee, LeaveRequest, Attendance, Announcement, SalaryRevision, OfferLetter, RelievingLetter } from '@/types';

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
        address: '123 Main Street, San Francisco, CA 94102',
        emergencyContact: '+1234567899',
        bloodGroup: 'O+',
        documents: [
          {
            id: 'doc-1',
            employeeId: 'emp-1',
            type: 'offer_letter',
            name: 'Offer Letter - Senior Developer',
            url: '#offer-letter-john',
            uploadedAt: '2023-01-10',
          },
          {
            id: 'doc-2',
            employeeId: 'emp-1',
            type: 'payslip',
            name: 'Payslip - November 2024',
            url: '#payslip-nov-2024',
            uploadedAt: '2024-11-01',
          },
          {
            id: 'doc-3',
            employeeId: 'emp-1',
            type: 'payslip',
            name: 'Payslip - October 2024',
            url: '#payslip-oct-2024',
            uploadedAt: '2024-10-01',
          },
          {
            id: 'doc-4',
            employeeId: 'emp-1',
            type: 'payslip',
            name: 'Payslip - September 2024',
            url: '#payslip-sep-2024',
            uploadedAt: '2024-09-01',
          },
          {
            id: 'doc-5',
            employeeId: 'emp-1',
            type: 'id_card',
            name: 'Employee ID Card',
            url: '#id-card-john',
            uploadedAt: '2023-01-15',
          },
        ],
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
        address: '456 Oak Avenue, San Francisco, CA 94103',
        emergencyContact: '+1234567898',
        bloodGroup: 'A+',
        documents: [
          {
            id: 'doc-6',
            employeeId: 'emp-2',
            type: 'offer_letter',
            name: 'Offer Letter - Product Manager',
            url: '#offer-letter-jane',
            uploadedAt: '2023-10-25',
          },
          {
            id: 'doc-7',
            employeeId: 'emp-2',
            type: 'payslip',
            name: 'Payslip - November 2024',
            url: '#payslip-nov-2024-jane',
            uploadedAt: '2024-11-01',
          },
          {
            id: 'doc-8',
            employeeId: 'emp-2',
            type: 'payslip',
            name: 'Payslip - October 2024',
            url: '#payslip-oct-2024-jane',
            uploadedAt: '2024-10-01',
          },
          {
            id: 'doc-9',
            employeeId: 'emp-2',
            type: 'payslip',
            name: 'Payslip - September 2024',
            url: '#payslip-sep-2024-jane',
            uploadedAt: '2024-09-01',
          },
          {
            id: 'doc-10',
            employeeId: 'emp-2',
            type: 'id_card',
            name: 'Employee ID Card',
            url: '#id-card-jane',
            uploadedAt: '2023-11-01',
          },
        ],
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

  if (!localStorage.getItem('offerLetters')) {
    localStorage.setItem('offerLetters', JSON.stringify([]));
  }

  if (!localStorage.getItem('relievingLetters')) {
    localStorage.setItem('relievingLetters', JSON.stringify([]));
  }

  // Initialize employee login credentials
  if (!localStorage.getItem('employeeCredentials')) {
    const defaultCredentials = [
      { employeeId: 'emp-1', email: 'john@company.com', password: 'john123' },
      { employeeId: 'emp-2', email: 'jane@company.com', password: 'jane123' },
    ];
    localStorage.setItem('employeeCredentials', JSON.stringify(defaultCredentials));
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

export const deleteLeaveRequest = (id: string): void => {
  const leaves = getLeaveRequests();
  const filtered = leaves.filter(leave => leave.id !== id);
  localStorage.setItem('leaveRequests', JSON.stringify(filtered));
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

// Offer Letter operations
export const getOfferLetters = (): OfferLetter[] => {
  return JSON.parse(localStorage.getItem('offerLetters') || '[]');
};

export const getOfferLetter = (id: string): OfferLetter | null => {
  const offerLetters = getOfferLetters();
  return offerLetters.find(offer => offer.id === id) || null;
};

export const addOfferLetter = (offerLetter: OfferLetter): void => {
  const offerLetters = getOfferLetters();
  offerLetters.push(offerLetter);
  localStorage.setItem('offerLetters', JSON.stringify(offerLetters));
};

export const updateOfferLetter = (id: string, updates: Partial<OfferLetter>): void => {
  const offerLetters = getOfferLetters();
  const index = offerLetters.findIndex(offer => offer.id === id);
  if (index !== -1) {
    offerLetters[index] = { ...offerLetters[index], ...updates };
    localStorage.setItem('offerLetters', JSON.stringify(offerLetters));
  }
};

export const deleteOfferLetter = (id: string): void => {
  const offerLetters = getOfferLetters();
  const filtered = offerLetters.filter(offer => offer.id !== id);
  localStorage.setItem('offerLetters', JSON.stringify(filtered));
};

// Relieving Letter operations
export const getRelievingLetters = (): RelievingLetter[] => {
  return JSON.parse(localStorage.getItem('relievingLetters') || '[]');
};

export const getRelievingLetter = (id: string): RelievingLetter | null => {
  const relievingLetters = getRelievingLetters();
  return relievingLetters.find(letter => letter.id === id) || null;
};

export const getRelievingLetterByEmployeeId = (employeeId: string): RelievingLetter | null => {
  const relievingLetters = getRelievingLetters();
  return relievingLetters.find(letter => letter.employeeId === employeeId) || null;
};

export const addRelievingLetter = (relievingLetter: RelievingLetter): void => {
  const relievingLetters = getRelievingLetters();
  relievingLetters.push(relievingLetter);
  localStorage.setItem('relievingLetters', JSON.stringify(relievingLetters));
};

export const updateRelievingLetter = (id: string, updates: Partial<RelievingLetter>): void => {
  const relievingLetters = getRelievingLetters();
  const index = relievingLetters.findIndex(letter => letter.id === id);
  if (index !== -1) {
    relievingLetters[index] = { ...relievingLetters[index], ...updates };
    localStorage.setItem('relievingLetters', JSON.stringify(relievingLetters));
  }
};

export const deleteRelievingLetter = (id: string): void => {
  const relievingLetters = getRelievingLetters();
  const filtered = relievingLetters.filter(letter => letter.id !== id);
  localStorage.setItem('relievingLetters', JSON.stringify(filtered));
};

// Employee Credential operations
export interface EmployeeCredential {
  employeeId: string;
  email: string;
  password: string;
}

export const getEmployeeCredentials = (): EmployeeCredential[] => {
  return JSON.parse(localStorage.getItem('employeeCredentials') || '[]');
};

export const addEmployeeCredential = (credential: EmployeeCredential): void => {
  const credentials = getEmployeeCredentials();
  credentials.push(credential);
  localStorage.setItem('employeeCredentials', JSON.stringify(credentials));
};

export const updateEmployeeCredential = (employeeId: string, updates: Partial<EmployeeCredential>): void => {
  const credentials = getEmployeeCredentials();
  const index = credentials.findIndex(cred => cred.employeeId === employeeId);
  if (index !== -1) {
    credentials[index] = { ...credentials[index], ...updates };
    localStorage.setItem('employeeCredentials', JSON.stringify(credentials));
  }
};

export const deleteEmployeeCredential = (employeeId: string): void => {
  const credentials = getEmployeeCredentials();
  const filtered = credentials.filter(cred => cred.employeeId !== employeeId);
  localStorage.setItem('employeeCredentials', JSON.stringify(filtered));
};

export const verifyEmployeeCredential = (email: string, password: string): EmployeeCredential | null => {
  const credentials = getEmployeeCredentials();
  return credentials.find(cred => cred.email === email && cred.password === password) || null;
};
