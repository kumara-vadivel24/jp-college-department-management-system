import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Users, AlertTriangle, FileSpreadsheet, CalendarCheck,
  BrainCircuit, RefreshCw, Plus, CheckCircle, TrendingUp, Settings
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import MLEvaluationModal from '../components/MLEvaluationModal';
import StudentIdCardModal from '../components/StudentIdCardModal';

export default function HodDashboard({ setActiveTab }) {
  const { deptInfo, fetchDeptInfo } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMLEval, setShowMLEval] = useState(false);
  const [selectedStudentForID, setSelectedStudentForID] = useState(null);

  // Department branding state
  const [editDept, setEditDept] = useState(false);
  const [collegeName, setCollegeName] = useState(deptInfo.college_name || '');
  const [deptName, setDeptName] = useState(deptInfo.name || '');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [anRes, riskRes] = await Promise.all([
        axios.get('/api/reports/analytics'),
        axios.get('/api/ml/at-risk')
      ]);
      setAnalytics(anRes.data);
      setAtRiskStudents(riskRes.data);
    } catch (e) {
      console.error('HOD Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateDept = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/department', {
        college_name: collegeName,
        name: deptName,
        code: deptInfo.code,
        address: deptInfo.address
      });
      fetchDeptInfo();
      setEditDept(false);
    } catch (err) {
      alert('Error updating department info');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-navy-900 font-semibold space-x-3">
        <RefreshCw className="w-6 h-6 animate-spin text-gold-500" />
        <span>Loading Executive HOD Dashboard...</span>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const riskDist = analytics?.risk_distribution || [];
  const subjectAvgs = analytics?.subject_averages || [];

  return (
    <div className="space-y-8">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white p-6 rounded-3xl shadow-xl border border-navy-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <span>Head of Department Portal</span>
          </div>
          <h2 className="text-2xl font-bold font-display">{deptInfo.name} Overview</h2>
          <p className="text-xs text-slate-300 mt-1">{deptInfo.college_name} • Academic Year 2026-2027</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowMLEval(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-navy-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all hover:scale-[1.02]"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>ML Model Transparency Report</span>
          </button>

          <button
            onClick={() => setEditDept(!editDept)}
            className="inline-flex items-center space-x-2 bg-navy-700 hover:bg-navy-600 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md border border-slate-600 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Config Branding</span>
          </button>
        </div>
      </div>

      {/* Config Department Branding Modal / Form */}
      {editDept && (
        <form onSubmit={handleUpdateDept} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">Configurable Department & College Name</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">College Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Department Name</label>
              <input
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setEditDept(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-gold-500 font-bold text-navy-950 rounded-xl text-xs">Save Changes</button>
          </div>
        </form>
      )}

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</p>
            <h3 className="text-2xl font-extrabold text-navy-900 mt-1">{summary.total_students || 40}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Active Enrolled</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">At-Risk Students (ML)</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{summary.at_risk_students || atRiskStudents.length}</h3>
            <span className="text-[11px] text-rose-500 font-semibold">Needs Faculty Intervention</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Attendance</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{summary.overall_attendance || 88}%</h3>
            <span className="text-[11px] text-slate-500">Department Average</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Faculty</p>
            <h3 className="text-2xl font-extrabold text-navy-900 mt-1">{summary.total_faculty || 5}</h3>
            <span className="text-[11px] text-slate-500">Assigned Courses</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pass/Fail ML Risk Distribution */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
          <h3 className="text-base font-bold text-navy-900 font-display mb-1 flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-gold-600" />
            <span>ML Pass/Fail Risk Distribution</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Categorized by Machine Learning risk prediction probability</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {riskDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject-wise Internal Marks Average */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
          <h3 className="text-base font-bold text-navy-900 font-display mb-1 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-gold-600" />
            <span>Course Internal Assessment Averages</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Average marks out of 100 across internal exams</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAvgs}>
                <XAxis dataKey="course_code" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg_internal_1" name="Internal 1" fill="#1e3a8a" />
                <Bar dataKey="avg_internal_2" name="Internal 2" fill="#f59e0b" />
                <Bar dataKey="avg_internal_3" name="Internal 3" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* At-Risk Students Priority Action Table */}
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div>
            <h3 className="text-lg font-bold text-navy-900 font-display flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Priority Early Warning: At-Risk Students</span>
            </h3>
            <p className="text-xs text-slate-500">Students predicted by the ML model to require academic intervention</p>
          </div>
          <button
            onClick={() => setActiveTab('at-risk')}
            className="text-xs font-bold text-navy-800 hover:text-gold-600 bg-navy-50 px-3 py-1.5 rounded-lg border border-navy-200"
          >
            Full At-Risk Dashboard →
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="p-3.5">Reg No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Predicted Status</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Key Focus Area</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {atRiskStudents.slice(0, 6).map((st) => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-navy-900">{st.reg_no}</td>
                  <td className="p-3.5 font-semibold">{st.name}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      st.predicted_result === 'Fail' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {st.predicted_result === 'Fail' ? 'Likely to Fail' : 'Borderline'}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-navy-800">{st.confidence_score}%</td>
                  <td className="p-3.5 text-slate-600 max-w-xs truncate">{st.focus_areas || 'Internal Marks revision'}</td>
                  <td className="p-3.5">
                    <button
                      onClick={() => setSelectedStudentForID(st)}
                      className="text-xs font-bold text-gold-600 hover:text-gold-700 underline"
                    >
                      ID Card / Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ML Evaluation Modal */}
      {showMLEval && <MLEvaluationModal onClose={() => setShowMLEval(false)} />}

      {/* Student ID Card Modal */}
      {selectedStudentForID && (
        <StudentIdCardModal
          student={selectedStudentForID}
          onClose={() => setSelectedStudentForID(null)}
        />
      )}

    </div>
  );
}
