import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  Calendar, 
  Bell, 
  Activity, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { 
  studentService, 
  facultyService, 
  departmentService, 
  courseService, 
  attendanceService, 
  activityLogService, 
  notificationService 
} from '../services/firestoreService';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalStudents: 1420,
    totalFaculty: 85,
    totalDepartments: 6,
    totalCourses: 14,
    attendanceRate: 88.5
  });
  const [todaysClasses, setTodaysClasses] = useState([
    { id: 1, subject: 'Data Structures & Algorithms', time: '09:00 AM - 10:00 AM', room: 'Lab 3', faculty: 'Dr. Ramesh' },
    { id: 2, subject: 'Database Management Systems', time: '10:15 AM - 11:15 AM', room: 'Hall 201', faculty: 'Prof. Anitha' },
    { id: 3, subject: 'Web Technologies', time: '11:30 AM - 12:30 PM', room: 'Lab 1', faculty: 'Prof. Suresh' },
    { id: 4, subject: 'Operating Systems', time: '02:00 PM - 03:00 PM', room: 'Hall 105', faculty: 'Dr. Kavitha' },
  ]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to live Firebase updates or fallbacks
    const unsubStudents = studentService.subscribe((data) => {
      if (data.length > 0) setMetrics(prev => ({ ...prev, totalStudents: data.length }));
    });
    const unsubFaculty = facultyService.subscribe((data) => {
      if (data.length > 0) setMetrics(prev => ({ ...prev, totalFaculty: data.length }));
    });
    const unsubDept = departmentService.subscribe((data) => {
      if (data.length > 0) setMetrics(prev => ({ ...prev, totalDepartments: data.length }));
    });
    const unsubCourse = courseService.subscribe((data) => {
      if (data.length > 0) setMetrics(prev => ({ ...prev, totalCourses: data.length }));
    });
    const unsubLogs = activityLogService.subscribe((data) => {
      if (data.length > 0) setActivities(data.slice(0, 6));
    });
    const unsubNotifs = notificationService.subscribe((data) => {
      if (data.length > 0) setNotifications(data.slice(0, 5));
    });

    return () => {
      unsubStudents();
      unsubFaculty();
      unsubDept();
      unsubCourse();
      unsubLogs();
      unsubNotifs();
    };
  }, []);

  const statCards = [
    { title: 'Total Students', value: metrics.totalStudents, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { title: 'Faculty Members', value: metrics.totalFaculty, icon: UserCheck, color: 'from-emerald-500 to-teal-600' },
    { title: 'Departments', value: metrics.totalDepartments, icon: Building2, color: 'from-purple-500 to-pink-600' },
    { title: 'Active Courses', value: metrics.totalCourses, icon: GraduationCap, color: 'from-amber-500 to-orange-600' },
    { title: 'Avg Attendance %', value: `${metrics.attendanceRate}%`, icon: CheckCircle2, color: 'from-cyan-500 to-blue-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Top Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white tracking-tight">College ERP Control Center</h1>
          <p className="text-slate-300 mt-1 text-sm max-w-2xl">
            Real-time management portal for student attendance, faculty schedules, internal marks, subject notes, and academic reports.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mt-3">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-white">Today's Class Schedule</h2>
            </div>
            <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full font-medium">Live Timetable</span>
          </div>

          <div className="space-y-3">
            {todaysClasses.map((cls) => (
              <div key={cls.id} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-blue-500/30 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-200 text-sm">{cls.subject}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Faculty: {cls.faculty}</span>
                    <span>•</span>
                    <span>Venue: {cls.room}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                    {cls.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Recent Activity Sidebar */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white">Announcements</h3>
              </div>
            </div>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notif, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/50 rounded-lg text-xs space-y-1 border border-slate-800/60">
                    <p className="font-semibold text-slate-200">{notif.title}</p>
                    <p className="text-slate-400">{notif.message}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-slate-950/50 rounded-lg text-xs space-y-1 border border-slate-800/60">
                    <p className="font-semibold text-slate-200">Mid-Semester Exam Timetable Published</p>
                    <p className="text-slate-400">Check the timetable section for room allocations.</p>
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg text-xs space-y-1 border border-slate-800/60">
                    <p className="font-semibold text-slate-200">Internal Marks Submission Reminder</p>
                    <p className="text-slate-400">Faculty must submit IA-2 marks by Friday.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Logs Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Recent Activities</h3>
              </div>
            </div>
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-white">{act.userName || 'User'}</span>: {act.action} - {act.details}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Attendance updated for CS501 by Prof. Anitha</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>New Assignment uploaded in Data Structures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>HOD approved leave request for Prof. Ramesh</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
