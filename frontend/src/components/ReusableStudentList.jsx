import React, { useState } from 'react';
import axios from 'axios';
import { Search, Trash2, Download, FileSpreadsheet, FileText, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import StudentIdCardModal from './StudentIdCardModal';

export default function ReusableStudentList({
  students = [],
  onRefresh,
  title = "Student Directory",
  subtitle = "Department Student Records",
  renderCustomColumns,
  renderActions,
  exportType = "students"
}) {
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cardStudent, setCardStudent] = useState(null);

  // Filter students
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.reg_no.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()));

    const matchesYear = selectedYear === 'All' || String(s.year) === String(selectedYear);
    const matchesSection = selectedSection === 'All' || String(s.section) === String(selectedSection);

    return matchesSearch && matchesYear && matchesSection;
  });

  const allSelected = filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((s) => s.id));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      setDeleting(true);
      await axios.post('/api/students/delete-bulk', { student_ids: selectedIds });
      setSelectedIds([]);
      setShowConfirmDelete(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error deleting selected students.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportExcel = () => {
    if (exportType === 'semester' || exportType === 'internal') {
      window.open(`/api/marks/export/excel?type=${exportType}`, '_blank');
    } else {
      window.open('/api/students/export/excel', '_blank');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Toolbar Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div>
          <h3 className="text-lg font-bold font-display text-blue-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Reg No or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs w-52 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="All">All Years</option>
            <option value="1">Year I</option>
            <option value="2">Year II</option>
            <option value="3">Year III</option>
            <option value="4">Year IV</option>
          </select>

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="All">All Secs</option>
            <option value="A">Sec A</option>
            <option value="B">Sec B</option>
          </select>

          {/* Delete Selected Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1 bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>

        </div>

      </div>

      {/* Main Reusable Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-900 text-white font-semibold text-xs border-b border-blue-800">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button onClick={handleToggleAll} className="text-white hover:text-blue-200">
                    {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="p-3.5">Reg No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Year / Sec</th>
                {renderCustomColumns ? renderCustomColumns(true) : (
                  <>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">ML Status</th>
                  </>
                )}
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium">
              {filtered.map((st) => {
                const isChecked = selectedIds.includes(st.id);
                return (
                  <tr key={st.id} className={isChecked ? 'bg-blue-50/60' : 'hover:bg-slate-50'}>
                    <td className="p-3.5 text-center">
                      <button onClick={() => handleToggleRow(st.id)} className="text-slate-500">
                        {isChecked ? <CheckSquare className="w-4 h-4 text-blue-700" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3.5 font-bold text-blue-900">{st.reg_no}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{st.name}</td>
                    <td className="p-3.5 text-slate-700">Yr {st.year} - {st.section}</td>
                    
                    {renderCustomColumns ? renderCustomColumns(false, st) : (
                      <>
                        <td className="p-3.5 text-slate-600">{st.email}</td>
                        <td className="p-3.5 text-slate-600">{st.phone || 'N/A'}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            st.predicted_result === 'Fail' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {st.predicted_result === 'Fail' ? 'At-Risk' : 'Pass'}
                          </span>
                        </td>
                      </>
                    )}

                    <td className="p-3.5 text-right space-x-2">
                      {renderActions ? renderActions(st) : (
                        <button
                          onClick={() => setCardStudent(st)}
                          className="text-blue-700 hover:text-blue-900 font-bold underline"
                        >
                          ID Card
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 italic">
                    No student records found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Bulk Delete */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border-2 border-red-600">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold font-display">Confirm Bulk Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete the <strong>{selectedIds.length} selected student(s)</strong>? This action cannot be undone and will remove their student profiles, login accounts, attendance logs, and exam marks.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 font-bold text-white rounded-xl text-xs shadow"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {cardStudent && (
        <StudentIdCardModal student={cardStudent} onClose={() => setCardStudent(null)} />
      )}

    </div>
  );
}
