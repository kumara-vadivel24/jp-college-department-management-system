import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Phone, Sparkles, RefreshCw } from 'lucide-react';
import StudentIdCardModal from '../components/StudentIdCardModal';

export default function AtRiskDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchAtRisk = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/ml/at-risk');
      setStudents(res.data);
    } catch (e) {
      console.error('Error loading at-risk students:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAtRisk(); }, []);

  const filtered = students.filter((s) => {
    if (filterLevel === 'High Risk') return s.risk_level === 'High Risk' || s.predicted_result === 'Fail';
    if (filterLevel === 'Medium Risk') return s.risk_level === 'Medium Risk';
    return true;
  });

  const getRiskBadge = (s) => {
    if (s.predicted_result === 'Fail' || s.risk_level === 'High Risk') {
      return 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800';
    }
    if (s.risk_level === 'Medium Risk') {
      return 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800';
    }
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-600 dark:text-slate-300 font-semibold gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span>Fetching ML Pass/Fail Early Warning Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Professional Header — theme-aware */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4" /> Machine Learning Early Warning Center
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ML At-Risk Student Monitoring
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Students predicted to fail by scikit-learn model. Flagged for early counseling intervention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Filter:</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            >
              <option value="All">All At-Risk ({students.length})</option>
              <option value="High Risk">High Risk Only</option>
              <option value="Medium Risk">Medium Risk Only</option>
            </select>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">
              {students.filter(s => s.predicted_result === 'Fail').length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Predicted Fail</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {students.filter(s => s.risk_level === 'Medium Risk').length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Medium Risk</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-slate-700 dark:text-slate-200">
              {students.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Total Monitored</p>
          </div>
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((st) => (
          <div
            key={st.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
          >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">REG: {st.reg_no}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{st.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Year {st.year} • Section '{st.section}'</p>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${getRiskBadge(st)}`}>
                  {st.predicted_result === 'Fail' ? '⚠ Predicted Fail' : '⚡ Borderline Pass'}
                </span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{st.confidence_score}% Confidence</p>
              </div>
            </div>

            {/* Score Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs mb-4">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">Internal 1</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{st.internal_1 || 30}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">Internal 2</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{st.internal_2 || 35}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">Attendance</span>
                <span className={`font-extrabold ${st.attendance_pct < 75 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {st.attendance_pct || 65}%
                </span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-3 rounded-xl text-xs mb-4">
              <div className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-100 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Recommended Action:
              </div>
              <p className="leading-relaxed">{st.recommended_action || 'Remedial classes & faculty counseling required.'}</p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">Parent:</span> {st.parent_name || 'Parent'} ({st.parent_phone || '+91 9442100001'})
              </div>
              <button
                onClick={() => setSelectedStudent(st)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View ID Card
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-500 dark:text-slate-400 font-medium">
            No at-risk students match the selected filter.
          </div>
        )}
      </div>

      {selectedStudent && (
        <StudentIdCardModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
