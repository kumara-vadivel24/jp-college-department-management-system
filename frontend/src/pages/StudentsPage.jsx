import React, { useState, useEffect } from 'react';
import { 
  studentService, 
  logActivity 
} from '../services/firestoreService';
import { uploadFile } from '../services/storageService';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/importExportUtils';
import { Search, Plus, Download, Edit2, Trash2, UserPlus, Image as ImageIcon, X } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    usn: '',
    name: '',
    email: '',
    department: 'Computer Science',
    semester: '5',
    section: 'A',
    phone: '',
    photoUrl: ''
  });

  const initialMockData = [
    { id: '1', usn: '1JP21CS001', name: 'Aarav Sharma', email: 'aarav@erp.edu', department: 'Computer Science', semester: '5', section: 'A', phone: '9876543210' },
    { id: '2', usn: '1JP21CS045', name: 'Bhavna Reddy', email: 'bhavna@erp.edu', department: 'Computer Science', semester: '5', section: 'B', phone: '9876543211' },
    { id: '3', usn: '1JP21EC012', name: 'Chetan Kumar', email: 'chetan@erp.edu', department: 'Electronics', semester: '3', section: 'A', phone: '9876543212' },
    { id: '4', usn: '1JP21ME008', name: 'Divya Patel', email: 'divya@erp.edu', department: 'Mechanical', semester: '7', section: 'A', phone: '9876543213' },
  ];

  useEffect(() => {
    const unsub = studentService.subscribe((data) => {
      setStudents(data.length > 0 ? data : initialMockData);
    });
    return () => unsub();
  }, []);

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData(student);
    } else {
      setEditingStudent(null);
      setFormData({
        usn: '',
        name: '',
        email: '',
        department: 'Computer Science',
        semester: '5',
        section: 'A',
        phone: '',
        photoUrl: ''
      });
    }
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let photoUrl = formData.photoUrl;
      if (photoFile) {
        photoUrl = await uploadFile(photoFile, 'students/photos');
      }

      const payload = { ...formData, photoUrl };

      if (editingStudent) {
        await studentService.update(editingStudent.id, payload);
        await logActivity('Admin', 'Admin User', 'UPDATE_STUDENT', `Updated student ${payload.usn}`);
      } else {
        await studentService.add(payload);
        await logActivity('Admin', 'Admin User', 'CREATE_STUDENT', `Created student ${payload.usn}`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save student error:", err);
      // Fallback local update
      if (editingStudent) {
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s));
      } else {
        setStudents(prev => [...prev, { id: String(Date.now()), ...formData }]);
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id, usn) => {
    if (window.confirm(`Are you sure you want to delete student ${usn}?`)) {
      try {
        await studentService.delete(id);
        await logActivity('Admin', 'Admin User', 'DELETE_STUDENT', `Deleted student ${usn}`);
      } catch (err) {
        setStudents(prev => prev.filter(s => s.id !== id));
      }
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.usn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'ALL' || s.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const handleExportExcel = () => exportToExcel(filteredStudents, 'Students_List');
  const handleExportCSV = () => exportToCSV(filteredStudents, 'Students_List');
  const handleExportPDF = () => {
    const cols = [
      { header: 'USN', key: 'usn' },
      { header: 'Name', key: 'name' },
      { header: 'Department', key: 'department' },
      { header: 'Semester', key: 'semester' },
      { header: 'Email', key: 'email' }
    ];
    exportToPDF('Students Directory Report', cols, filteredStudents, 'Students_Report');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Management</h1>
          <p className="text-slate-400 text-sm">Manage student profiles, enrollments, and academic details.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportExcel} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700">
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Excel
          </button>
          <button onClick={handleExportCSV} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700">
            <Download className="w-3.5 h-3.5 text-blue-400" /> CSV
          </button>
          <button onClick={handleExportPDF} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700">
            <Download className="w-3.5 h-3.5 text-red-400" /> PDF
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/20">
            <UserPlus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by USN or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-slate-400 font-medium">Department:</label>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">USN</th>
                <th className="p-4">Department</th>
                <th className="p-4">Sem & Sec</th>
                <th className="p-4">Contact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 overflow-hidden">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        s.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-400">{s.email}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-medium text-blue-400">{s.usn}</td>
                  <td className="p-4">{s.department}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 font-medium">
                      Sem {s.semester} - {s.section}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{s.phone || 'N/A'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(s)} className="p-1.5 hover:bg-slate-800 text-blue-400 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.usn)} className="p-1.5 hover:bg-slate-800 text-red-400 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white text-base">
                {editingStudent ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">USN *</label>
                  <input
                    type="text"
                    required
                    value={formData.usn}
                    onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Upload Photo (Firebase Storage)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/20"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
