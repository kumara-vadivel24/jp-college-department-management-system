import React, { useState } from 'react';
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
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Students', path: '/students', icon: Users, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Faculty', path: '/faculty', icon: UserCheck, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Departments', path: '/departments', icon: Building2, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Courses', path: '/courses', icon: GraduationCap, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Semester', path: '/semesters', icon: CalendarDays, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Attendance', path: '/attendance', icon: ClipboardCheck, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Internal Marks', path: '/internal-marks', icon: Award, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Semester Marks', path: '/semester-marks', icon: FileCheck2, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Assignments', path: '/assignments', icon: FileText, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Subject Notes', path: '/notes', icon: FileDown, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Timetable', path: '/timetable', icon: Calendar, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['SuperAdmin', 'Hod', 'Faculty'] },
  { name: 'Downloads', path: '/downloads', icon: Download, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
  { name: 'Import / Export', path: '/import-export', icon: FileSpreadsheet, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['SuperAdmin'] },
  { name: 'User Management', path: '/user-management', icon: UserCog, roles: ['SuperAdmin'] },
  { name: 'Activity Logs', path: '/activity-logs', icon: History, roles: ['SuperAdmin', 'Hod'] },
  { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['SuperAdmin', 'Hod', 'Faculty', 'Student'] },
];

export default function DashboardLayout({ children }) {
  const { userProfile, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => !role || item.roles.includes(role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              ERP
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-base leading-tight">College ERP</h1>
              <p className="text-xs text-blue-400 font-medium">Enterprise System</p>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-400" />}
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-slate-300 text-sm">
                {(userProfile?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-200 truncate">{userProfile?.name || 'User'}</p>
                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                  {role || 'Guest'}
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-white truncate">
              {filteredNavItems.find(i => i.path === location.pathname)?.name || 'College ERP System'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/notifications" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
