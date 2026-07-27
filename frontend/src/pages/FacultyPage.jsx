import React, { useState, useEffect } from 'react';
import { facultyService, logActivity } from '../services/firestoreService';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/importExportUtils';
import { Search, Plus, Download, Edit2, Trash2, UserCheck, X } from 'lucide-react';

export default function FacultyPage() {
  const [facultyList, setFacultyList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    email: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    phone: ''
  });

  const mockFaculty = [
    { id: '1', facultyId: 'F001', name: 'Dr. Ramesh Kumar', email: 'ramesh@erp.edu', department: 'Computer Science', designation: 'Professor & HOD', phone: '9876500001' },
    { id: '2', facultyId: 'F002', name: 'Prof. Anitha S', email: 'anitha@erp.edu', department: 'Computer Science', designation: 'Associate Professor', phone: '9876500002' },
    { id: '3', facultyId: 'F003', name: 'Dr. Suresh V', email: 'suresh@erp.edu', department: 'Electronics', designation: 'Professor', phone: '9876500003' },
  ];

  useEffect(() => {
    const unsub = facultyService.subscribe((data) => {
      setFacultyList(data.length > 0 ? data : mockFaculty);
    });
    return () => unsub();
  }, []);

  const handleOpenModal = (fac = null) => {
    if (fac) {
      setEditingFaculty(fac);
      setFormData(fac);
    } else {
      setEditingFaculty(null);
      setFormData({
        facultyId: '',
        name: '',
        email: '',
        department: 'Computer Science',
        designation: 'Assistant Professor',
        phone: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await facultyService.update(editingFaculty.id, formData);
        await logActivity('Admin', 'Admin User', 'UPDATE_FACULTY', `Updated faculty ${formData.name}`);
      } else {
        await facultyService.add(formData);
        await logActivity('Admin', 'Admin User', 'CREATE_FACULTY', `Added faculty ${formData.name}`);
      }
      setIsModalOpen(false);
    } catch (err) {
      if (editingFaculty) {
        setFacultyList(prev => prev.map(f => f.id === editingFaculty.id ? { ...f, ...formData } : f));
      } else {
        setFacultyList(prev => [...prev, { id: String(Date.now()), ...formData }]);
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete faculty record for ${name}?`)) {
      try {
        await facultyService.delete(id);
        await logActivity('Admin', 'Admin User', 'DELETE_FACULTY', `Deleted faculty ${name}`);
      } catch (err) {
        setFacultyList(prev => prev.filter(f => f.id !== id));
      }
    }
  };

  const filteredFaculty = facultyList.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.facultyId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Faculty Management</h1>
          <p className="text-gray-500 text-xs mt-0.5">Manage teaching staff profiles, designations, and department roles.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => exportToExcel(filteredFaculty, 'Faculty_List')} className="px-3 py-1.5 bg-white hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-sky-200 shadow-sm">
            <Download className="w-3.5 h-3.5 text-sky-500" /> Excel
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-sky-400 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm">
            <UserCheck className="w-4 h-4" /> Add Faculty
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search Faculty ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-100 text-sky-800 font-bold border-b border-sky-200 uppercase tracking-wider">
            <tr>
              <th className="p-4">Faculty Member</th>
              <th className="p-4">ID</th>
              <th className="p-4">Department</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Phone</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {filteredFaculty.map((f) => (
              <tr key={f.id} className="hover:bg-sky-50/50 transition-colors">
                <td className="p-4 font-bold text-gray-900">{f.name}<div className="text-[10px] text-gray-500 font-normal">{f.email}</div></td>
                <td className="p-4 font-mono font-bold text-sky-600">{f.facultyId}</td>
                <td className="p-4">{f.department}</td>
                <td className="p-4"><span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-200 font-semibold">{f.designation}</span></td>
                <td className="p-4 text-gray-600">{f.phone}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(f)} className="p-1.5 hover:bg-sky-100 text-sky-600 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(f.id, f.name)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-200 bg-sky-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Faculty ID *</label>
                  <input type="text" required value={formData.facultyId} onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900">
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                  <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-400 text-white text-xs font-bold rounded-lg shadow-sm">Save Faculty</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
