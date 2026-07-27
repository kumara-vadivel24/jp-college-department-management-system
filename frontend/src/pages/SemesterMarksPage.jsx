import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Award, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import ReusableStudentList from '../components/ReusableStudentList';

export default function SemesterMarksPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [semesterMarks, setSemesterMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchSemesterMarks = async () => {
    try {
      setLoading(true);
      const [cRes, smRes] = await Promise.all([
        axios.get('/api/marks/courses'),
        axios.get(`/api/marks/semester?course_id=${selectedCourse}`)
      ]);
      setCourses(cRes.data);
      setSemesterMarks(smRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesterMarks();
  }, [selectedCourse]);

  const handleScoreChange = (id, score) => {
    setSemesterMarks((prev) =>
      prev.map((row) => (row.id === id ? { ...row, semester_score: Number(score) } : row))
    );
  };

  const handleSaveRow = async (row) => {
    try {
      setMessage('');
      await axios.post('/api/marks/semester/update', {
        student_id: row.student_id,
        course_id: selectedCourse,
        semester_score: row.semester_score,
        credits: row.credits || 3
      });
      setMessage(`Semester exam mark updated for ${row.name}!`);
      fetchSemesterMarks();
    } catch (err) {
      alert('Error updating semester mark.');
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-blue-900 font-semibold space-x-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-700" />
        <span>Loading Semester Exam Results...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-blue-900 flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-700" />
            <span>Final Semester Exam Marks Console</span>
          </h2>
          <p className="text-xs text-slate-500">Record final semester exam scores, auto-compute grades, and export marks sheets</p>
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

      {/* Reusable Student List with Semester Marks Columns */}
      <ReusableStudentList
        students={semesterMarks}
        onRefresh={fetchSemesterMarks}
        title="Semester Exam Marks Sheet"
        subtitle="Manage final semester exam marks and export to Excel/Word"
        exportType="semester"
        renderCustomColumns={(isHeader, row) => {
          if (isHeader) {
            return (
              <>
                <th className="p-3.5">Semester Marks (100)</th>
                <th className="p-3.5">Final Grade</th>
                <th className="p-3.5">Credits</th>
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
                    value={row.semester_score}
                    onChange={(e) => handleScoreChange(row.id, e.target.value)}
                    className="w-20 p-1.5 border border-slate-300 rounded-lg text-xs font-bold text-center"
                  />
                ) : (
                  <span className="font-extrabold text-blue-900">{row.semester_score}</span>
                )}
              </td>
              <td className="p-3.5">
                <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                  row.grade === 'O' || row.grade === 'A+' ? 'bg-blue-100 text-blue-900' :
                  row.grade === 'RA' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {row.grade}
                </span>
              </td>
              <td className="p-3.5 font-bold text-slate-700">{row.credits || 3}</td>
            </>
          );
        }}
        renderActions={(row) => (
          (user?.role === 'hod' || user?.role === 'faculty') ? (
            <button
              onClick={() => handleSaveRow(row)}
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
