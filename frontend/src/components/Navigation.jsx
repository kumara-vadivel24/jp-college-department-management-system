import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, FileSpreadsheet, Award,
  AlertTriangle, Calendar, ClipboardList, Bell, BrainCircuit, BookOpen, ShieldAlert, UserCircle
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  let tabs = [];

  if (role === 'superadmin') {
    tabs = [
      { id: 'superadmin', label: '7 Departments Console', icon: ShieldAlert, badge: 'SuperAdmin' },
      { id: 'subjects', label: 'Subject Management', icon: BookOpen },
      { id: 'students', label: 'All Department Students', icon: Users },
      { id: 'attendance', label: 'Global Attendance', icon: CalendarCheck },
      { id: 'marks', label: 'Global Internal Marks', icon: FileSpreadsheet },
      { id: 'semester-marks', label: 'Semester Exam Marks', icon: Award },
      { id: 'at-risk', label: 'At-Risk Analytics (ML)', icon: AlertTriangle },
      { id: 'timetable', label: 'Timetable Builder', icon: Calendar },
      { id: 'notices', label: 'Institutional Notices', icon: Bell }
    ];
  } else if (role === 'hod') {
    tabs = [
      { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      { id: 'subjects', label: 'Subject Management', icon: BookOpen },
      { id: 'students', label: 'Student Management', icon: Users },
      { id: 'attendance', label: 'Attendance Management', icon: CalendarCheck },
      { id: 'marks', label: 'Internal Marks', icon: FileSpreadsheet },
      { id: 'semester-marks', label: 'Semester Marks', icon: Award },
      { id: 'at-risk', label: 'At-Risk Students (ML)', icon: AlertTriangle, badge: 'ML Engine' },
      { id: 'timetable', label: 'Timetable Builder', icon: Calendar },
      { id: 'leaves', label: 'Leave Requests', icon: ClipboardList },
      { id: 'notices', label: 'Notice Board', icon: Bell },
      { id: 'ml-report', label: 'ML Model Insights', icon: BrainCircuit }
    ];
  } else if (role === 'faculty') {
    tabs = [
      { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'My Profile', icon: UserCircle },
      { id: 'subjects', label: 'Assigned Subjects', icon: BookOpen },
      { id: 'students', label: 'Class Students', icon: Users },
      { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
      { id: 'marks', label: 'Internal Marks Entry', icon: FileSpreadsheet },
      { id: 'semester-marks', label: 'Semester Marks Entry', icon: Award },
      { id: 'at-risk', label: 'At-Risk Warnings', icon: AlertTriangle },
      { id: 'timetable', label: 'Timetable', icon: Calendar },
      { id: 'leaves', label: 'Leave Portal', icon: ClipboardList },
      { id: 'notices', label: 'Notices', icon: Bell }
    ];
  } else {
    // Student
    tabs = [
      { id: 'dashboard', label: 'My Overview', icon: LayoutDashboard },
      { id: 'profile', label: 'My Profile', icon: UserCircle },
      { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
      { id: 'marks', label: 'Internal Marks', icon: FileSpreadsheet },
      { id: 'semester-marks', label: 'Semester Exam Results', icon: Award },
      { id: 'at-risk', label: 'Pass/Fail Risk Feedback', icon: AlertTriangle },
      { id: 'timetable', label: 'Class Timetable', icon: Calendar },
      { id: 'leaves', label: 'Apply Leave', icon: ClipboardList },
      { id: 'notices', label: 'Notices', icon: Bell }
    ];
  }

  return (
    <div className="bg-blue-800 text-white shadow-md border-b border-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-blue-900 font-bold shadow-md scale-[1.02]'
                    : 'text-blue-100 hover:text-white hover:bg-blue-700/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-900' : 'text-blue-200'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    isActive ? 'bg-amber-100 text-amber-900' : 'bg-amber-500 text-slate-900 font-extrabold'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
