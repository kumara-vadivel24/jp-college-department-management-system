import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, CalendarCheck, FileSpreadsheet, Sparkles,
  AlertCircle, CheckCircle2, RefreshCw, Printer, BookOpen, Clock
} from 'lucide-react';
import StudentIdCardModal from '../components/StudentIdCardModal';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIdCard, setShowIdCard] = useState(false);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/students/${user.id}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-navy-900 font-semibold space-x-3">
        <RefreshCw className="w-6 h-6 animate-spin text-gold-500" />
        <span>Loading Student Portal...</span>
      </div>
    );
  }

  const student = data?.student || {};
  const marks = data?.marks || [];
  const dept = data?.department || {};

  // Compute attendance stats
  const attPct = student.attendance_pct || 86;
  const isShortage = attPct < 75;

  const predictedResult = student.predicted_result || 'Pass';
  const confidence = student.confidence_score || 88.5;
  const passProb = student.pass_probability || 88.5;
  const riskLevel = student.risk_level || 'Low Risk';
  const focusAreas = student.focus_areas ? student.focus_areas.split(',') : [];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-navy-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/20 text-gold-400 font-bold text-2xl flex items-center justify-center border-2 border-gold-500 shadow-md">
            {student.name ? student.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
              <span>Student Academic Console</span>
            </div>
            <h2 className="text-2xl font-bold font-display">{student.name}</h2>
            <p className="text-xs text-slate-300">REG NO: <span className="text-gold-400 font-bold">{student.reg_no}</span> • Year {student.year} - Sec '{student.section}'</p>
          </div>
        </div>

        <button
          onClick={() => setShowIdCard(true)}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-navy-950 font-bold px-5 py-3 rounded-2xl text-xs shadow-lg transition-all hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          <span>View / Print Student ID Card</span>
        </button>
      </div>

      {/* Grid Row 1: Attendance Progress & Constructive ML Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Progress & Shortage Alert */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-navy-900 font-display flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-gold-600" />
                <span>Overall Class Attendance</span>
              </h3>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                isShortage ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isShortage ? 'Shortage Warning (< 75%)' : 'Good Standing'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-extrabold text-navy-900">{attPct}%</span>
                <span className="text-xs text-slate-500 font-medium">Minimum Required: 75%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isShortage ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${Math.min(attPct, 100)}%` }}
                ></div>
              </div>

              {isShortage ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 mt-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Attendance Shortage Alert!</span> Your attendance is currently below 75%. Submit leave medical certificates or attend upcoming revision sessions to meet hall ticket eligibility.
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-2">You are in full academic eligibility for end-semester examinations.</p>
              )}
            </div>
          </div>
        </div>

        {/* Constructive ML Pass/Fail Risk Analysis Feedback Card */}
        <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white p-6 rounded-3xl shadow-xl border border-navy-700 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-gold-400" />
                <h3 className="text-base font-bold font-display text-white">AI Academic Growth Insights</h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                predictedResult === 'Pass' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {riskLevel}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Our Department Machine Learning engine analyzes your internal exam scores and attendance trends to guide your study focus early.
            </p>

            <div className="bg-navy-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Pass Likelihood Confidence:</span>
                <span className="font-bold text-gold-400 text-sm">{passProb}% Probability</span>
              </div>
              <div className="text-xs text-slate-200 pt-1 border-t border-slate-800 font-medium">
                💬 <span className="font-semibold text-amber-300">Actionable Advice:</span> {student.recommended_action || 'Your current performance indicates strong potential. Focus on maintaining consistency in Internal 3 and assignments.'}
              </div>
            </div>

            {focusAreas.length > 0 && (
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Recommended Focus Areas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {focusAreas.map((fa, idx) => (
                    <span key={idx} className="bg-amber-500/10 text-amber-300 text-[11px] px-2 py-0.5 rounded border border-amber-500/20">
                      {fa.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Internal Assessment Marks Breakdown */}
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-bold text-navy-900 font-display mb-4 flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-gold-600" />
          <span>Internal Assessment Marks & Grade Summary</span>
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="p-3.5">Course Code</th>
                <th className="p-3.5">Course Title</th>
                <th className="p-3.5">Internal 1 (100)</th>
                <th className="p-3.5">Internal 2 (100)</th>
                <th className="p-3.5">Internal 3 (100)</th>
                <th className="p-3.5">Assignment (100)</th>
                <th className="p-3.5">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium">
              {marks.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-navy-900">{m.course_code}</td>
                  <td className="p-3.5 font-semibold text-slate-800">{m.course_name}</td>
                  <td className="p-3.5">{m.internal_1}</td>
                  <td className="p-3.5">{m.internal_2}</td>
                  <td className="p-3.5">{m.internal_3}</td>
                  <td className="p-3.5">{m.assignment_score}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                      m.grade === 'O' || m.grade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                      m.grade === 'RA' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student ID Card Modal */}
      {showIdCard && (
        <StudentIdCardModal
          student={student}
          onClose={() => setShowIdCard(false)}
        />
      )}

    </div>
  );
}
