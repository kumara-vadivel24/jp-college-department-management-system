import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import ReusableStudentList from '../components/ReusableStudentList';

export default function MarksEntryPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [marksList, setMarksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const [cRes, mRes] = await Promise.all([
        axios.get('/api/marks/courses'),
        axios.get(`/api/marks?course_id=${selectedCourse}`)
      ]);
      setCourses(cRes.data);
      setMarksList(mRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, [selectedCourse]);

  const handleInputChange = (id, field, value) => {
    setMarksList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: Number(value) } : item))
    );
  };

  const handleSaveMarks = async (record) => {
    try {
      setMessage('');
      await axios.post('/api/marks/update', {
        student_id: record.student_id,
        course_id: selectedCourse,
        internal_1: record.internal_1,
        internal_2: record.internal_2,
        internal_3: record.internal_3,
        assignment_score: record.assignment_score,
        attendance_pct: record.attendance_pct,
        past_gpa: record.past_gpa
      });
      setMessage(`Updated internal marks for ${record.name}! ML predictions refreshed.`);
      fetchMarks();
    } catch (err) {
      alert('Error updating marks.');
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-blue-900 font-semibold space-x-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-700" />
        <span>Loading Internal Exam Console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-blue-900 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <span>Internal Assessment & Marks Console</span>
          </h2>
          <p className="text-xs text-slate-500">Enter Internal 1, 2, 3, assignment marks and auto-sync with Python ML service</p>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(Number(e.target.value))}
            className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-blue-700" />
          <span>{message}</span>
        </div>
      )}

      {/* Reusable Student List with Internal Marks Columns */}
      <ReusableStudentList
        students={marksList}
        onRefresh={fetchMarks}
        title="Internal Marks Assessment Sheet"
        subtitle="Search, edit internal marks, select rows for bulk deletion, or export to Excel"
        exportType="internal"
        renderCustomColumns={(isHeader, row) => {
          if (isHeader) {
            return (
              <>
                <th className="p-3.5">Internal 1 (100)</th>
                <th className="p-3.5">Internal 2 (100)</th>
                <th className="p-3.5">Internal 3 (100)</th>
                <th className="p-3.5">Assignment (100)</th>
                <th className="p-3.5">Attendance %</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">ML Status</th>
              </>
            );
          }
          return (
            <>
              <td className="p-3.5">
                {(user?.role === 'hod' || user?.role === 'faculty') ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={row.internal_1}
                    onChange={(e) => handleInputChange(row.id, 'internal_1', e.target.value)}
                    className="w-16 p-1 border border-slate-300 rounded text-xs font-bold text-center"
                  />
                ) : (
                  <span>{row.internal_1}</span>
                )}
              </td>

              <td className="p-3.5">
                {(user?.role === 'hod' || user?.role === 'faculty') ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={row.internal_2}
                    onChange={(e) => handleInputChange(row.id, 'internal_2', e.target.value)}
                    className="w-16 p-1 border border-slate-300 rounded text-xs font-bold text-center"
                  />
                ) : (
                  <span>{row.internal_2}</span>
                )}
              </td>

              <td className="p-3.5">
                {(user?.role === 'hod' || user?.role === 'faculty') ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={row.internal_3}
                    onChange={(e) => handleInputChange(row.id, 'internal_3', e.target.value)}
                    className="w-16 p-1 border border-slate-300 rounded text-xs font-bold text-center"
                  />
                ) : (
                  <span>{row.internal_3}</span>
                )}
              </td>

              <td className="p-3.5">
                {(user?.role === 'hod' || user?.role === 'faculty') ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={row.assignment_score}
                    onChange={(e) => handleInputChange(row.id, 'assignment_score', e.target.value)}
                    className="w-16 p-1 border border-slate-300 rounded text-xs font-bold text-center"
                  />
                ) : (
                  <span>{row.assignment_score}</span>
                )}
              </td>

              <td className="p-3.5">
                <span className={`font-bold ${row.attendance_pct < 75 ? 'text-red-600' : 'text-slate-800'}`}>
                  {row.attendance_pct}%
                </span>
              </td>

              <td className="p-3.5 font-bold text-blue-900">{row.grade}</td>

              <td className="p-3.5">
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  row.predicted_result === 'Fail' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  {row.predicted_result === 'Fail' ? 'At Risk' : 'Passing'}
                </span>
              </td>
            </>
          );
        }}
        renderActions={(row) => (
          (user?.role === 'hod' || user?.role === 'faculty') ? (
            <button
              onClick={() => handleSaveMarks(row)}
              className="inline-flex items-center space-x-1 bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          ) : null
        )}
      />

    </div>
  );
}
