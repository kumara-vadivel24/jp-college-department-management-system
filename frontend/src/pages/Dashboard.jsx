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
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { 
  studentService, 
  facultyService, 
  departmentService, 
  courseService, 
  activityLogService, 
  notificationService 
} from '../services/firestoreService';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalStudents: 1420,
    totalFaculty: 85,
    totalDepartments: 6,
    totalSubjects: 48,
    totalClasses: 14,
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
      if (data.length > 0) setMetrics(prev => ({ ...prev, totalClasses: data.length }));
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
    { title: 'Total Students', value: metrics.totalStudents, icon: Users },
    { title: 'Faculty Members', value: metrics.totalFaculty, icon: UserCheck },
    { title: 'Departments', value: metrics.totalDepartments, icon: Building2 },
    { title: 'Subjects', value: metrics.totalSubjects, icon: BookOpen },
    { title: 'Active Classes', value: metrics.totalClasses, icon: GraduationCap },
    { title: 'Attendance %', value: `${metrics.attendanceRate}%`, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 bg-white">
      {/* Metrics Cards Grid - Clean White with Sky Blue Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{card.title}</span>
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              <h2 className="font-bold text-gray-900 text-base">Today's Class Schedule</h2>
            </div>
            <span className="text-xs px-2.5 py-1 bg-sky-50 text-sky-600 rounded-full font-semibold border border-sky-100">Live Schedule</span>
          </div>

          <div className="space-y-3">
            {todaysClasses.map((cls) => (
              <div key={cls.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-sky-50/50 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{cls.subject}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Faculty: {cls.faculty}</span>
                    <span>•</span>
                    <span>Venue: {cls.room}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-sky-100 text-sky-700 rounded-lg">
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
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-gray-900 text-base">Announcements</h3>
              </div>
            </div>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notif, idx) => (
                  <div key={idx} className="p-3 bg-sky-50/60 rounded-lg text-xs space-y-1 border border-sky-100">
                    <p className="font-semibold text-gray-900">{notif.title}</p>
                    <p className="text-gray-600">{notif.message}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-sky-50/60 rounded-lg text-xs space-y-1 border border-sky-100">
                    <p className="font-semibold text-gray-900">Mid-Semester Exam Timetable Published</p>
                    <p className="text-gray-600">Check the timetable section for room allocations.</p>
                  </div>
                  <div className="p-3 bg-sky-50/60 rounded-lg text-xs space-y-1 border border-sky-100">
                    <p className="font-semibold text-gray-900">Internal Marks Submission Reminder</p>
                    <p className="text-gray-600">Faculty must submit IA-2 marks by Friday.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Logs Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-gray-900 text-base">Recent Activities</h3>
              </div>
            </div>
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">{act.userName || 'User'}</span>: {act.action} - {act.details}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>Attendance updated for CS501 by Prof. Anitha</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>New Assignment uploaded in Data Structures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sky-300" />
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
