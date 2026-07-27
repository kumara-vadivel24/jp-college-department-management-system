import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import campusImage from '../assets/campus.png';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please check your username/email and password.');
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
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm z-0" />

      {/* Centered Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/30 mx-auto">
            ERP
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">J.P. College of Engineering</h1>
          <p className="text-xs text-sky-600 font-semibold">College ERP Management System &bull; Portal Login</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Clean Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Username / Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@erp.edu"
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
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

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-sky-500 focus:ring-sky-400"
              />
              <span>Remember Me</span>
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact system administrator to reset password.'); }} className="text-sky-600 hover:text-sky-700 font-semibold">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to ERP'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">Protected by Institutional Firebase Authentication & JWT Security</p>
        </div>
      </div>
    </div>
  );
}
