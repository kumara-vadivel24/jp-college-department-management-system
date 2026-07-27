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
  History, 
  Info,
  Bell, 
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Students', path: '/students', icon: Users, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Faculty', path: '/faculty', icon: UserCheck, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Departments', path: '/departments', icon: Building2, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Classes', path: '/courses', icon: GraduationCap, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Attendance', path: '/attendance', icon: ClipboardCheck, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Internal Marks', path: '/internal-marks', icon: Award, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Semester Marks', path: '/semester-marks', icon: FileCheck2, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Subject Notes', path: '/notes', icon: FileDown, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Assignments', path: '/assignments', icon: FileText, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Timetable', path: '/timetable', icon: Calendar, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Import Data', path: '/import-export', icon: FileSpreadsheet, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Export Data', path: '/import-export', icon: FileSpreadsheet, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Downloads', path: '/downloads', icon: Download, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'History', path: '/activity-logs', icon: History, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['SuperAdmin'] },
  { name: 'About', path: '/about', icon: Info, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
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
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -280, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Fixed Navigation Bar with White Background and Soft Bottom Shadow */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Institution Logo & Title */}
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-gray-900 shrink-0 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
              ERP
            </div>
            <span className="hidden sm:inline font-bold text-sm">J.P. College of Engineering</span>
          </Link>

          {/* Horizontally Scrollable Roller Navigation Bar with Bright Red Buttons */}
          <div className="flex-1 max-w-4xl mx-2 relative flex items-center min-w-0">
            <button 
              onClick={scrollLeft}
              className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 shrink-0 mr-1.5 focus:outline-none transition-colors"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div 
              ref={scrollRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth w-full"
            >
              {filteredNavItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={`${item.path}_${idx}`}
                    to={item.path}
                    className={`nav-red-btn ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <button 
              onClick={scrollRight}
              className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 shrink-0 ml-1.5 focus:outline-none transition-colors"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile & Logout Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold leading-tight text-gray-900">{userProfile?.name || 'User'}</span>
              <span className="text-[10px] text-gray-500 font-semibold">{role || 'Admin'}</span>
            </div>
            <button 
              onClick={handleLogout} 
              title="Logout"
              className="nav-red-btn !p-2 !rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Header Bar below Top Navigation Bar */}
      <header className="mt-16 bg-sky-50 border-b border-sky-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">J.P. College of Engineering</h1>
            <p className="text-xs text-sky-600 font-semibold">College ERP Management System &bull; Admin Dashboard</p>
          </div>

          {/* Search, Notifications & Date */}
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-2.5" />
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

      {/* Main Content Area */}
      <main className="flex-1 bg-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
