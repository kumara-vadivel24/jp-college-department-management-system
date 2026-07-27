import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { exportToExcel, exportToCSV } from '../utils/importExportUtils';
import { logActivity } from '../services/firestoreService';
import { Users, ArrowRightLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PromotionPage() {
  const { department, role } = useAuth();
  const [selectedSem, setSelectedSem] = useState('4');
  const [targetSem, setTargetSem] = useState('5');
  const [logs, setLogs] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  const [students] = useState([
    { id: '1', usn: '23AIDS001', name: 'Aarav Sharma', department: department || 'AI & DS', semester: '4', section: 'A' },
    { id: '2', usn: '23AIDS045', name: 'Bhavna Reddy', department: department || 'AI & DS', semester: '4', section: 'B' },
  ]);

  const handlePromoteAll = async () => {
    if (window.confirm(`Promote all Semester ${selectedSem} students to Semester ${targetSem} for ${department || 'AI & DS'} department?`)) {
      const logEntry = `Promoted ${students.length} students from Sem ${selectedSem} to Sem ${targetSem}`;
      await logActivity(role, `HOD ${department || 'AI & DS'}`, 'STUDENT_PROMOTION', logEntry);
      setSuccessMsg(`Successfully promoted students to Semester ${targetSem}! Audit log generated.`);
      setLogs(prev => [logEntry, ...prev]);
    }
  };

  return (
    <div className="space-y-6 bg-white font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Student Promotion & Transfer System</h1>
          <p className="text-xs text-sky-600 font-bold mt-0.5">Department Isolation Scope: <span className="text-red-600">{department || 'AI & DS'}</span></p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-sky-500" /> Batch Semester Promotion Portal
        </h3>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-sky-50/50 p-4 rounded-xl border border-sky-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Current Semester</label>
            <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} className="w-full bg-white border border-gray-200 text-xs rounded-lg p-2.5 font-bold text-gray-800">
              {[1,2,3,4,5,6,7].map(s => <option key={s} value={String(s)}>Semester {s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Promote To Semester</label>
            <select value={targetSem} onChange={(e) => setTargetSem(e.target.value)} className="w-full bg-white border border-gray-200 text-xs rounded-lg p-2.5 font-bold text-gray-800">
              {[2,3,4,5,6,7,8].map(s => <option key={s} value={String(s)}>Semester {s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handlePromoteAll} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-md transition-all">
              Execute Promotion & Audit Log
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-sky-100 text-sky-800 uppercase font-bold border-b border-sky-200">
              <tr><th className="p-3.5">USN</th><th className="p-3.5">Student Name</th><th className="p-3.5">Department</th><th className="p-3.5">Current Semester</th><th className="p-3.5">Section</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="p-3.5 font-mono font-bold text-sky-600">{s.usn}</td>
                  <td className="p-3.5 font-bold text-gray-900">{s.name}</td>
                  <td className="p-3.5"><span className="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded border border-red-200">{s.department}</span></td>
                  <td className="p-3.5">Sem {s.semester}</td>
                  <td className="p-3.5">Sec {s.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
