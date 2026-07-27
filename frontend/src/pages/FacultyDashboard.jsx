import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck, FileSpreadsheet, AlertTriangle, Users,
  CheckCircle, XCircle, Clock, RefreshCw, Save, BarChart3, BookOpen
} from 'lucide-react';

export default function FacultyDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState(1);
  const [attendanceState, setAttendanceState] = useState({});
  const [savingAtt, setSavingAtt] = useState(false);
  const [message, setMessage] = useState('');

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const [cRes, stRes] = await Promise.all([
        axios.get('/api/marks/courses'),
        axios.get('/api/students?year=3&section=A')
      ]);
      setCourses(cRes.data);
      if (cRes.data.length > 0) setSelectedCourse(cRes.data[0].id);
      setStudents(stRes.data);

      const initial = {};
      stRes.data.forEach((s) => { initial[s.id] = 'Present'; });
      setAttendanceState(initial);
    } catch (e) {
      console.error('Faculty Dashboard Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFacultyData(); }, []);

  const handleToggleAttendance = (studentId, status) => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSavingAtt(true);
      setMessage('');
      const records = Object.entries(attendanceState).map(([id, status]) => ({
        student_id: Number(id), status
      }));
      const res = await axios.post('/api/attendance/mark', {
        course_id: selectedCourse,
        date: markingDate,
        period: Number(period),
        attendance_records: records
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Error saving attendance records.');
    } finally {
      setSavingAtt(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-600 dark:text-slate-300 font-semibold gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading Faculty Academic Portal...</span>
      </div>
    );
  }

  const atRiskCount = students.filter(s => s.predicted_result === 'Fail' || s.risk_level === 'High Risk').length;
  const presentCount = Object.values(attendanceState).filter(v => v === 'Present').length;
  const absentCount = students.length - presentCount;

  return (
    <div className="space-y-6">

      {/* === PROFESSIONAL ENTERPRISE DASHBOARD HEADER === */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
              Faculty Academic Dashboard
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.profile?.name || 'Faculty Member'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage Attendance • Internal Marks • Semester Results • Timetable • Student Performance • ML Risk Analysis
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('marks')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" /> Enter Marks
            </button>
            <button
              onClick={() => setActiveTab('at-risk')}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-300 font-semibold px-4 py-2.5 rounded-xl text-sm border border-red-200 dark:border-red-800 transition-all"
            >
              <AlertTriangle className="w-4 h-4" /> ML At-Risk ({atRiskCount})
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Section Students</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{students.length}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Year III · Section A</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">At-Risk Students</p>
            <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{atRiskCount}</h3>
            <span className="text-xs text-red-500 dark:text-red-400 font-semibold">Identified by ML Engine</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Today's Attendance</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{presentCount}/{students.length}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{absentCount} absent today</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Attendance Marking */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mark Today's Attendance</h2>
        </div>

        {message && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl text-sm font-semibold">
            {message}
          </div>
        )}

        {/* Attendance Controls */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input
              type="date"
              value={markingDate}
              onChange={(e) => setMarkingDate(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {[1,2,3,4,5,6].map(p => <option key={p} value={p}>Period {p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
            </select>
          </div>
        </div>

        {/* Student Attendance List */}
        <div className="space-y-2">
          {students.map((s) => {
            const status = attendanceState[s.id] || 'Present';
            return (
              <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${status === 'Present' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900'}`}>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">{s.reg_no}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAttendance(s.id, 'Present')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status === 'Present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Present
                  </button>
                  <button
                    onClick={() => handleToggleAttendance(s.id, 'Absent')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status === 'Absent' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Absent
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={savingAtt}
          className="w-full bg-blue-900 dark:bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow disabled:opacity-50"
        >
          {savingAtt ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {savingAtt ? 'Saving Attendance...' : `Save Attendance (${presentCount} Present, ${absentCount} Absent)`}
        </button>
      </div>
    </div>
  );
}
