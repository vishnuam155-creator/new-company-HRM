import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { verifyEmployeeCredential, getEmployee } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check admin login first
    if (email === 'admin@company.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@company.com',
        name: 'Admin User',
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return true;
    }

    // Check employee credentials
    const credential = verifyEmployeeCredential(email, password);
    if (credential) {
      const employee = getEmployee(credential.employeeId);
      if (employee && employee.status === 'active') {
        const employeeUser: User = {
          id: employee.id,
          email: employee.email,
          name: employee.name,
          role: 'employee',
        };
        setUser(employeeUser);
        localStorage.setItem('currentUser', JSON.stringify(employeeUser));
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
