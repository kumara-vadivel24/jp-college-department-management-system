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
    <div className="space-y-6 bg-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Management</h1>
          <p className="text-gray-500 text-xs mt-0.5">Manage student profiles, enrollments, and academic details.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportExcel} className="px-3 py-1.5 bg-white hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-sky-200 shadow-sm">
            <Download className="w-3.5 h-3.5 text-sky-500" /> Excel
          </button>
          <button onClick={handleExportCSV} className="px-3 py-1.5 bg-white hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-sky-200 shadow-sm">
            <Download className="w-3.5 h-3.5 text-sky-500" /> CSV
          </button>
          <button onClick={handleExportPDF} className="px-3 py-1.5 bg-white hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-sky-200 shadow-sm">
            <Download className="w-3.5 h-3.5 text-sky-500" /> PDF
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-sky-400 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all">
            <UserPlus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by USN or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-gray-600 font-semibold">Department:</label>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-400"
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
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sky-100 text-sky-800 font-bold border-b border-sky-200 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">USN</th>
                <th className="p-4">Department</th>
                <th className="p-4">Sem & Sec</th>
                <th className="p-4">Contact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-sky-50/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center font-bold text-sky-600 overflow-hidden">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        s.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{s.name}</p>
                      <p className="text-[10px] text-gray-500">{s.email}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-sky-600">{s.usn}</td>
                  <td className="p-4">{s.department}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-200 font-semibold">
                      Sem {s.semester} - {s.section}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{s.phone || 'N/A'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(s)} className="p-1.5 hover:bg-sky-100 text-sky-600 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.usn)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg">
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-200 bg-sky-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">
                {editingStudent ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">USN *</label>
                  <input
                    type="text"
                    required
                    value={formData.usn}
                    onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-sky-400"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Upload Photo (Firebase Storage)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="w-full bg-white border border-gray-200 text-gray-700 text-xs rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-400 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-sm"
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
