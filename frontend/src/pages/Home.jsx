import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, BrainCircuit, Users, Award, ShieldCheck, Bell, Sparkles } from 'lucide-react';

export default function Home() {
  const { deptInfo } = useAuth();
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    axios.get('/api/notices').then((res) => setNotices(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-12 pb-12">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-2xl border border-navy-700 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-500/30 px-3.5 py-1.5 rounded-full text-gold-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen Academic ERP + ML Pass/Fail Early Warning</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight leading-tight">
            {deptInfo.college_name || 'J.P. College of Engineering'}
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-gold-400 font-display">
            {deptInfo.name || 'Department of Computer Science'}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Digitizing academic operations: student records, attendance tracking, internal marks, timetable management, and automated Machine Learning risk prediction to identify at-risk students early.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-navy-950 font-bold px-8 py-3.5 rounded-2xl shadow-xl transition-all hover:scale-105"
            >
              <span>Access Department Portal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:border-gold-400 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2 font-display">Multi-Role Management</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tailored dashboards for Head of Department (HOD), Faculty members, and Students with strict JWT role-based security.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:border-gold-400 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2 font-display">ML Pass/Fail Microservice</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            scikit-learn predictive model evaluating internal marks and attendance to generate confidence scores and constructive remedial feedback.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:border-gold-400 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2 font-display">Automated ID Cards & Reports</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Generate printable student ID cards, downloadable mark sheets, shortage alerts (&lt;75%), and executive analytics dashboards.
          </p>
        </div>

      </div>

      {/* Latest Department Announcements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gold-600" />
              <h3 className="text-lg font-bold text-navy-900 font-display">Latest Department Notice Board</h3>
            </div>
            <Link to="/login" className="text-xs font-bold text-navy-800 hover:text-gold-600">
              View All Notices →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.slice(0, 4).map((n) => (
              <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-navy-800 bg-navy-100 px-2 py-0.5 rounded">{n.category}</span>
                  <span>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-navy-900 text-sm mb-1">{n.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
