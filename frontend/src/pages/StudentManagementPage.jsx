import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Upload, User, RefreshCw } from 'lucide-react';
import ReusableStudentList from '../components/ReusableStudentList';
import StudentIdCardModal from '../components/StudentIdCardModal';

export default function StudentManagementPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Add Form State
  const [formData, setFormData] = useState({
    reg_no: '',
    name: '',
    email: '',
    dob: '2003-05-15',
    gender: 'Male',
    year: 3,
    section: 'A',
    phone: '',
    address: '',
    parent_name: '',
    parent_phone: ''
  });

  const [csvFile, setCsvFile] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/students', formData);
      setShowAddModal(false);
      setMsg(`Student created successfully! Register Number: ${formData.reg_no} (Default Password: 123)`);
      fetchStudents();
      setFormData({ reg_no: '', name: '', email: '', dob: '2003-05-15', gender: 'Male', year: 3, section: 'A', phone: '', address: '', parent_name: '', parent_phone: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating student.');
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    const form = new FormData();
    form.append('file', csvFile);
    try {
      const res = await axios.post('/api/students/bulk-import', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg(res.data.message);
      fetchStudents();
      setShowCsvModal(false);
    } catch (err) {
      alert('CSV upload failed.');
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-blue-900 font-semibold space-x-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-700" />
        <span>Loading Student Directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-blue-900">Student Directory & Records</h2>
          <p className="text-xs text-slate-500">Manage student profiles, bulk CSV import, multi-select deletion, and Excel export</p>
        </div>

        {user?.role === 'hod' && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>

            <button
              onClick={() => setShowCsvModal(true)}
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-all"
            >
              <Upload className="w-4 h-4 text-blue-300" />
              <span>Bulk CSV Import</span>
            </button>
          </div>
        )}
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3.5 rounded-xl text-xs font-semibold">
          {msg}
        </div>
      )}

      {/* Reusable Student List with Multi-Select Delete & Excel Export */}
      <ReusableStudentList
        students={students}
        onRefresh={fetchStudents}
        title="Enrolled Student Roster"
        subtitle="Select checkboxes to delete multiple students or export directory to Excel (.xlsx)"
        exportType="students"
        renderActions={(st) => (
          <button
            onClick={() => setSelectedStudent(st)}
            className="text-blue-700 hover:text-blue-900 font-bold underline text-xs"
          >
            ID Card
          </button>
        )}
      />

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateStudent} className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold font-display text-blue-900">Add New Student Profile</h3>
            <p className="text-xs text-slate-500">Account login created automatically with Register Number & default password <code className="font-bold text-blue-700">123</code>.</p>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Register Number *</label>
                <input
                  type="text"
                  required
                  value={formData.reg_no}
                  onChange={(e) => setFormData({ ...formData, reg_no: e.target.value })}
                  placeholder="953621CS041"
                  className="w-full mt-1 p-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Official Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Parent Name</label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-blue-700 font-bold text-white rounded-xl text-xs shadow">Create Record</button>
            </div>
          </form>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCsvUpload} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold font-display text-blue-900">Bulk Import Students via CSV</h3>
            <p className="text-xs text-slate-500">Upload a CSV file containing columns: RegNo, Name, Email, Year, Section. All accounts get default password <code className="font-bold text-blue-700">123</code>.</p>
            <input
              type="file"
              accept=".csv"
              required
              onChange={(e) => setCsvFile(e.target.files[0])}
              className="w-full p-2 border border-slate-300 rounded-xl text-xs"
            />
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setShowCsvModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-blue-900 font-bold text-white rounded-xl text-xs shadow">Upload & Import</button>
            </div>
          </form>
        </div>
      )}

      {selectedStudent && (
        <StudentIdCardModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

    </div>
  );
}
