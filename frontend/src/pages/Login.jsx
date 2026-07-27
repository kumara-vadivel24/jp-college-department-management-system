import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, GraduationCap, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Red Header Branding Bar */}
      <div className="bg-red-600 py-4 px-6 fixed top-0 inset-x-0 shadow-md text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-red-600 flex items-center justify-center font-black text-sm shadow">
            ERP
          </div>
          <span className="font-bold text-sm tracking-wide">J.P. College of Engineering</span>
        </div>
        <span className="text-xs font-semibold bg-red-700 px-3 py-1 rounded-full text-white">Enterprise Portal</span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">College ERP Portal</h2>
          <p className="text-xs text-gray-500 font-medium">Sign in with your institutional credentials</p>
        </div>

        <div className="mt-6 bg-white py-8 px-6 shadow-xl border border-gray-200 rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-sky-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@erp.edu"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-400 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sky-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-400 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-400 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Fill Shortcuts */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-[11px] text-gray-500 font-semibold text-center">Quick Demo Login Shortcuts:</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button onClick={() => handleDemoFill('admin@erp.edu')} className="p-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg text-sky-700 font-mono text-center font-semibold">
                Super Admin
              </button>
              <button onClick={() => handleDemoFill('hod@erp.edu')} className="p-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg text-sky-700 font-mono text-center font-semibold">
                HOD User
              </button>
              <button onClick={() => handleDemoFill('faculty@erp.edu')} className="p-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg text-sky-700 font-mono text-center font-semibold">
                Faculty User
              </button>
              <button onClick={() => handleDemoFill('student@erp.edu')} className="p-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg text-sky-700 font-mono text-center font-semibold">
                Student User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
