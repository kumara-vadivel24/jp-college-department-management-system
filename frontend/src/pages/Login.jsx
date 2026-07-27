import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import campusImage from '../assets/campus.png';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck, GraduationCap, Building2 } from 'lucide-react';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('Student'); // 'Student' | 'Faculty' | 'HOD'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginByRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await loginByRole(selectedRole, identifier, password);
      if (user.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full relative flex items-center justify-center p-4 bg-cover bg-center font-sans"
      style={{ backgroundImage: `url(${campusImage})` }}
    >
      {/* Dark Overlay & Blur Effect */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-0" />

      {/* Centered Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/30 mx-auto">
            ERP
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">J.P. College of Engineering</h1>
          <p className="text-xs text-sky-600 font-bold">College ERP Portal Login</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setSelectedRole('Student'); setError(''); }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              selectedRole === 'Student' 
                ? 'bg-red-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Student
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRole('Faculty'); setError(''); }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              selectedRole === 'Faculty' 
                ? 'bg-red-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Faculty
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRole('HOD'); setError(''); }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              selectedRole === 'HOD' 
                ? 'bg-red-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> HOD
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Login Form Based on Role */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {selectedRole === 'Student' 
                ? 'Registration Number *' 
                : selectedRole === 'Faculty'
                  ? 'Faculty ID or Email *'
                  : 'HOD Department Email *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  selectedRole === 'Student' 
                    ? 'e.g. 23AIDS001' 
                    : selectedRole === 'Faculty'
                      ? 'faculty@erp.edu'
                      : 'jpcoeaids@gmail.com'
                }
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-500 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : `Login as ${selectedRole}`} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium">Protected by Department Access Control & JWT Security</p>
        </div>
      </div>
    </div>
  );
}
