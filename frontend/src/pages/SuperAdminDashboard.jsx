import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building2,
  Users,
  UserCheck,
  BookOpen,
  ArrowRightLeft,
  Download,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Modal States
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', college_name: 'J.P. College of Engineering', address: 'Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852' });

  // Faculty & Student Transfer States
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [transferData, setTransferData] = useState({ faculty_id: '', student_id: '', target_department_id: '' });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/department/all');
      setDepartments(res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await axios.get('/api/faculty');
      setFacultyList(res.data || []);
    } catch (e) {}
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudentList(res.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchDepartments();
    fetchFaculty();
    fetchStudents();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/department', deptForm);
      setMessage({ type: 'success', text: `Department ${deptForm.code} created successfully!` });
      setShowAddDeptModal(false);
      setDeptForm({ name: '', code: '', college_name: 'J.P. College of Engineering', address: 'Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852' });
      fetchDepartments();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create department' });
    }
  };

  const handleTransferFaculty = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/department/transfer-faculty', {
        faculty_id: transferData.faculty_id,
        target_department_id: transferData.target_department_id
      });
      setMessage({ type: 'success', text: res.data.message });
      fetchFaculty();
      fetchDepartments();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Faculty transfer failed' });
    }
  };

  const handleTransferStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/department/transfer-student', {
        student_id: transferData.student_id,
        target_department_id: transferData.target_department_id
      });
      setMessage({ type: 'success', text: res.data.message });
      fetchStudents();
      fetchDepartments();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Student transfer failed' });
    }
  };

  const handleBackup = async () => {
    try {
      const res = await axios.get('/api/department/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'JPCOE_ERP_Full_Backup.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage({ type: 'success', text: 'Database backup downloaded successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to download database backup.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" /> Super Admin Central Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Department ERP Administration
          </h1>
          <p className="text-blue-100/80 text-sm mt-1">
            Managing 7 Engineering Departments, Faculty Transfers, Cross-Department Data Isolation & Security.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddDeptModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
          <button
            onClick={handleBackup}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Download className="w-4 h-4" /> Export DB Backup
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <ShieldAlert className="w-5 h-5 text-red-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeSubTab === 'overview' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Building2 className="w-4 h-4" /> 7 Departments Overview
        </button>
        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeSubTab === 'transfers' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Transfers & Reallocations
        </button>
      </div>

      {/* Overview Grid */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {dept.code}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2 leading-snug">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    HOD: <span className="font-semibold text-slate-700">{dept.hod_name || 'Dr. Department HOD'}</span>
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600 opacity-20" />
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Students</p>
                  <p className="text-base font-extrabold text-blue-900">{dept.student_count || 6}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Faculty</p>
                  <p className="text-base font-extrabold text-indigo-900">{dept.faculty_count || 3}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Subjects</p>
                  <p className="text-base font-extrabold text-emerald-900">{dept.subject_count || 3}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Isolated DB
                </span>
                <span className="font-mono text-slate-400">Dept ID: {dept.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transfers Tab */}
      {activeSubTab === 'transfers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transfer Faculty Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Transfer Faculty Member</h3>
                <p className="text-xs text-slate-500">Reassign faculty to a different engineering department</p>
              </div>
            </div>

            <form onSubmit={handleTransferFaculty} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Faculty Member</label>
                <select
                  value={transferData.faculty_id}
                  onChange={(e) => setTransferData({ ...transferData, faculty_id: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Choose Faculty --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.faculty_id} - {f.department_code || 'Dept'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Department</label>
                <select
                  value={transferData.target_department_id}
                  onChange={(e) => setTransferData({ ...transferData, target_department_id: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Target Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow"
              >
                Execute Faculty Transfer
              </button>
            </form>
          </div>

          {/* Transfer Student Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Transfer Student Cohort</h3>
                <p className="text-xs text-slate-500">Reassign student records to a different department</p>
              </div>
            </div>

            <form onSubmit={handleTransferStudent} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  value={transferData.student_id}
                  onChange={(e) => setTransferData({ ...transferData, student_id: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {studentList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.reg_no} - {s.department_code || 'Dept'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Department</label>
                <select
                  value={transferData.target_department_id}
                  onChange={(e) => setTransferData({ ...transferData, target_department_id: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Target Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow"
              >
                Execute Student Transfer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Add New Engineering Department</h3>

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Department of Cyber Security"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  placeholder="e.g. CY"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="text-xs font-semibold text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl shadow"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
