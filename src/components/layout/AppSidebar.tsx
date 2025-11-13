import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  Megaphone,
  FilePlus,
  FileCheck,
  BarChart3,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export const AppSidebar = () => {
  const { user } = useAuth();
  const { open } = useSidebar();

  const adminMenuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    { title: 'Employees', url: '/employees', icon: Users },
    { title: 'Offer Letters', url: '/offer-letters', icon: FilePlus },
    { title: 'Relieving Letters', url: '/relieving-letters', icon: FileCheck },
    { title: 'Leave Requests', url: '/leaves', icon: Calendar },
    { title: 'Attendance', url: '/attendance', icon: Clock },
    { title: 'Increments', url: '/increments', icon: TrendingUp },
    { title: 'Announcements', url: '/announcements', icon: Megaphone },
  ];

  const employeeMenuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'My Profile', url: '/profile', icon: Users },
    { title: 'My Leaves', url: '/my-leaves', icon: Calendar },
    { title: 'My Attendance', url: '/my-attendance', icon: Clock },
    { title: 'Documents', url: '/documents', icon: FileText },
  ];

  const menuItems = user?.role === 'admin' || user?.role === 'hr' ? adminMenuItems : employeeMenuItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-6">
          <h1 className="font-bold text-xl text-sidebar-foreground">
            Portal
          </h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
