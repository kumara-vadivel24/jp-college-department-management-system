import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  UserCheck,
  Building2,
  GraduationCap
} from 'lucide-react';

export default function SubjectManagementPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Filters
  const [filterYear, setFilterYear] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [filterDept, setFilterDept] = useState(user.role === 'superadmin' ? '' : user.department_id);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [form, setForm] = useState({
    course_code: '',
    course_name: '',
    year: '2',
    semester: '3',
    credits: '3',
    faculty_id: '',
    department_id: user.role === 'superadmin' ? '1' : user.department_id,
    is_active: '1'
  });

  // Year to Valid Semesters mapping
  const yearSemesterMap = {
    '1': [
      { sem: 1, label: 'Semester I' },
      { sem: 2, label: 'Semester II' }
    ],
    '2': [
      { sem: 3, label: 'Semester III' },
      { sem: 4, label: 'Semester IV' }
    ],
    '3': [
      { sem: 5, label: 'Semester V' },
      { sem: 6, label: 'Semester VI' }
    ],
    '4': [
      { sem: 7, label: 'Semester VII' },
      { sem: 8, label: 'Semester VIII' }
    ]
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterYear) params.year = filterYear;
      if (filterSem) params.semester = filterSem;
      if (filterDept) params.department_id = filterDept;

      const res = await axios.get('/api/subjects', { params });
      setSubjects(res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subjects list');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const deptsRes = await axios.get('/api/department/all');
      setDepartments(deptsRes.data || []);
      const facRes = await axios.get('/api/faculty');
      setFacultyList(facRes.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchAuxData();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [filterYear, filterSem, filterDept]);

  // When year in modal changes, auto-select first valid semester
  const handleYearChangeInForm = (selectedYear) => {
    const validSems = yearSemesterMap[selectedYear] || [];
    const firstSem = validSems.length > 0 ? String(validSems[0].sem) : '1';
    setForm({ ...form, year: selectedYear, semester: firstSem });
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm({
      course_code: '',
      course_name: '',
      year: '2',
      semester: '3',
      credits: '3',
      faculty_id: '',
      department_id: user.role === 'superadmin' ? (filterDept || '1') : user.department_id,
      is_active: '1'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (sub) => {
    setIsEditing(true);
    setCurrentId(sub.id);
    setForm({
      course_code: sub.course_code,
      course_name: sub.course_name,
      year: String(sub.year),
      semester: String(sub.semester),
      credits: String(sub.credits || 3),
      faculty_id: sub.faculty_id ? String(sub.faculty_id) : '',
      department_id: String(sub.department_id || 1),
      is_active: String(sub.is_active !== undefined ? sub.is_active : 1)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/subjects/${currentId}`, form);
        setMessage({ type: 'success', text: `Subject ${form.course_code} updated successfully!` });
      } else {
        await axios.post('/api/subjects', form);
        setMessage({ type: 'success', text: `Subject ${form.course_code} created successfully!` });
      }
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save subject' });
    }
  };

  const handleToggleActive = async (sub) => {
    try {
      const res = await axios.put(`/api/subjects/${sub.id}/toggle-active`);
      setMessage({ type: 'success', text: res.data.message });
      fetchSubjects();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to toggle subject active status' });
    }
  };

  const handleDelete = async (sub) => {
    if (!window.confirm(`Are you sure you want to delete ${sub.course_code} - ${sub.course_name}?`)) return;
    try {
      const res = await axios.delete(`/api/subjects/${sub.id}`);
      setMessage({ type: 'success', text: res.data.message });
      fetchSubjects();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete subject' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" /> Academic Curriculum Module
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Subject Management & Curriculum Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add, Edit, Activate/Deactivate Engineering Subjects with Year-Semester Dependencies & Faculty Assignment.
          </p>
        </div>

        {(user.role === 'superadmin' || user.role === 'hod') && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow transition-all"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        )}
      </div>

      {/* Notifications */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
          <Filter className="w-4 h-4" /> Dynamic Filters:
        </div>

        {/* Department Filter (Super Admin) */}
        {user.role === 'superadmin' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 font-semibold">Department:</label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        )}

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-semibold">Year:</label>
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setFilterSem('');
            }}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
          >
            <option value="">All Years</option>
            <option value="1">I Year (First Year)</option>
            <option value="2">II Year (Second Year)</option>
            <option value="3">III Year (Third Year)</option>
            <option value="4">IV Year (Fourth Year)</option>
          </select>
        </div>

        {/* Semester Filter (Dependent on Year) */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-semibold">Semester:</label>
          <select
            value={filterSem}
            onChange={(e) => setFilterSem(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
          >
            <option value="">All Semesters</option>
            {filterYear && yearSemesterMap[filterYear] ? (
              yearSemesterMap[filterYear].map((s) => (
                <option key={s.sem} value={s.sem}>{s.label}</option>
              ))
            ) : (
              [1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading engineering curriculum subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No subjects found matching selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4">Subject Code</th>
                  <th className="p-4">Subject Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Year & Semester</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4">Assigned Faculty</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-blue-900 font-mono">{sub.course_code}</td>
                    <td className="p-4 font-semibold text-slate-900">{sub.course_name}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                        {sub.department_code || 'CSE'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      Year {sub.year} • Semester {sub.semester}
                    </td>
                    <td className="p-4 font-bold">{sub.credits || 3}</td>
                    <td className="p-4 text-xs">
                      {sub.faculty_name ? (
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" /> {sub.faculty_name}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      {sub.is_active === 1 ? (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(sub)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          title="Toggle Active Status"
                        >
                          {sub.is_active === 1 ? <XCircle className="w-4 h-4 text-slate-400" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Edit Subject"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Subject Details' : 'Add New Curriculum Subject'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS301"
                    value={form.course_code}
                    onChange={(e) => setForm({ ...form, course_code: e.target.value.toUpperCase() })}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures & Algorithms"
                  value={form.course_name}
                  onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Year & Semester Dependent Selector */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                  <select
                    value={form.year}
                    onChange={(e) => handleYearChangeInForm(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                    required
                  >
                    <option value="1">First Year (I Year)</option>
                    <option value="2">Second Year (II Year)</option>
                    <option value="3">Third Year (III Year)</option>
                    <option value="4">Fourth Year (IV Year)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester (Filtered)</label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                    required
                  >
                    {yearSemesterMap[form.year]?.map((s) => (
                      <option key={s.sem} value={s.sem}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department (Super Admin only) */}
              {user.role === 'superadmin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department</label>
                  <select
                    value={form.department_id}
                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Faculty Assignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Subject Faculty</label>
                <select
                  value={form.faculty_id}
                  onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                >
                  <option value="">-- Select Assigned Faculty Member --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.faculty_id})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs font-semibold text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl shadow"
                >
                  {isEditing ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
