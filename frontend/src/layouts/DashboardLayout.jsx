import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Building2, 
  BookOpen, 
  GraduationCap, 
  CalendarDays, 
  ClipboardCheck, 
  Award, 
  FileCheck2, 
  FileText, 
  FileDown, 
  Calendar, 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  CheckSquare, 
  Settings, 
  UserCog, 
  History, 
  Bell, 
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Students', path: '/students', icon: Users, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Faculty', path: '/faculty', icon: UserCheck, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Departments', path: '/departments', icon: Building2, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Courses', path: '/courses', icon: GraduationCap, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Attendance', path: '/attendance', icon: ClipboardCheck, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Internal Marks', path: '/internal-marks', icon: Award, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Semester Marks', path: '/semester-marks', icon: FileCheck2, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Subject Notes', path: '/notes', icon: FileDown, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Assignments', path: '/assignments', icon: FileText, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Timetable', path: '/timetable', icon: Calendar, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Import / Export', path: '/import-export', icon: FileSpreadsheet, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Downloads', path: '/downloads', icon: Download, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Activity Logs', path: '/activity-logs', icon: History, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['SuperAdmin'] },
];

export default function DashboardLayout({ children }) {
  const { userProfile, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const filteredNavItems = navItems.filter(item => !role || item.roles.includes(role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -250, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Fixed Sticky Bright Red Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-red-600 shadow-md text-white border-b border-red-700">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo & Institution Name */}
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-white hover:opacity-95 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-white text-red-600 flex items-center justify-center font-extrabold text-sm shadow">
              ERP
            </div>
            <span className="hidden sm:inline font-semibold text-base">J.P. College of Engineering</span>
          </Link>

          {/* Roller Horizontal Scroll Navigation Bar */}
          <div className="flex-1 max-w-4xl mx-4 relative flex items-center">
            <button 
              onClick={scrollLeft}
              className="p-1 rounded-full bg-red-700 text-white hover:bg-red-800 shrink-0 mr-1 focus:outline-none shadow-sm"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div 
              ref={scrollRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth w-full"
            >
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200
                      ${isActive 
                        ? 'bg-white text-red-600 shadow-sm font-bold scale-105' 
                        : 'text-white hover:bg-red-500/80 hover:text-white'}
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <button 
              onClick={scrollRight}
              className="p-1 rounded-full bg-red-700 text-white hover:bg-red-800 shrink-0 ml-1 focus:outline-none shadow-sm"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold leading-tight">{userProfile?.name || 'User'}</span>
              <span className="text-[10px] text-red-100 font-medium">{role || 'Admin'}</span>
            </div>
            <button 
              onClick={handleLogout} 
              title="Logout"
              className="p-1.5 rounded-full bg-red-700 hover:bg-red-800 text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Sub Header Section */}
      <header className="mt-14 bg-sky-50 border-b border-sky-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">J.P. College of Engineering</h1>
            <p className="text-xs text-sky-600 font-medium">College ERP Management System &bull; Admin Portal</p>
          </div>

          {/* Search, Notifications & Date */}
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ERP..."
                className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-sky-400 shadow-sm"
              />
            </div>

            <Link to="/notifications" className="p-2 bg-white hover:bg-sky-100 border border-gray-200 rounded-full text-sky-500 relative transition-colors shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>

            <span className="hidden lg:inline-block px-3 py-1 bg-white border border-sky-100 rounded-full text-xs font-semibold text-sky-700 shadow-sm">
              {currentDateStr}
            </span>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 bg-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
