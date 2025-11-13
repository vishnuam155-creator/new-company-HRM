import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEmployee } from '@/lib/storage';
import { Employee } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, calculateExperience } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  Users as UsersIcon,
  Heart
} from 'lucide-react';

const MyProfile = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);

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
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  const experienceDays = calculateExperience(employee.joiningDate);
  const experienceYears = Math.floor(experienceDays / 365);
  const experienceMonths = Math.floor((experienceDays % 365) / 30);

  const probationEndDate = new Date(employee.probationEndDate);
  const today = new Date();
  const isProbationCompleted = probationEndDate < today;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">View and manage your personal information</p>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {employee.image ? (
                  <img
                    src={employee.image}
                    alt={employee.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-16 h-16 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{employee.name}</h2>
                    <p className="text-muted-foreground">{employee.position}</p>
                  </div>
                  <Badge
                    variant={employee.status === 'active' ? 'default' : 'secondary'}
                    className="mt-2 md:mt-0 w-fit"
                  >
                    {employee.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Joined {formatDate(employee.joiningDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Information Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experience</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {experienceYears}y {experienceMonths}m
              </div>
              <p className="text-xs text-muted-foreground">
                With the company
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Probation Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isProbationCompleted ? 'Completed' : 'Active'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isProbationCompleted
                  ? `Ended ${formatDate(employee.probationEndDate)}`
                  : `Ends ${formatDate(employee.probationEndDate)}`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employee ID</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employee.id.split('-')[1]?.toUpperCase() || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique identifier
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base">{employee.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="text-base">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                <p className="text-base">{employee.phone}</p>
              </div>
              {employee.bloodGroup && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Blood Group
                  </p>
                  <p className="text-base">{employee.bloodGroup}</p>
                </div>
              )}
              {employee.address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Address
                  </p>
                  <p className="text-base">{employee.address}</p>
                </div>
              )}
              {employee.emergencyContact && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                  <p className="text-base">{employee.emergencyContact}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Position</p>
                <p className="text-base">{employee.position}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="text-base">{employee.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Joining Date
                </p>
                <p className="text-base">{formatDate(employee.joiningDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Probation End Date
                </p>
                <p className="text-base">{formatDate(employee.probationEndDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Annual Salary
                </p>
                <p className="text-base font-semibold">${employee.salary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employment Status</p>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => window.location.href = '/my-leaves'}>
                <Calendar className="w-4 h-4 mr-2" />
                View My Leaves
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/documents'}>
                <Briefcase className="w-4 h-4 mr-2" />
                My Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MyProfile;
