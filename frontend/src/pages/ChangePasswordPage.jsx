import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import campusImage from '../assets/campus.png';
import { Lock, AlertCircle, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser, completeFirstLoginPasswordChange } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    // Rules: Minimum 8 chars, Uppercase, Lowercase, Number, Special Char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&).');
      return;
    }

    setLoading(true);
    try {
      completeFirstLoginPasswordChange(newPassword);
      alert('Password updated successfully! Welcome to your College ERP Portal.');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to update password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full relative flex items-center justify-center p-4 bg-cover bg-center font-sans"
      style={{ backgroundImage: `url(${campusImage})` }}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-0" />

      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-lg mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Security Check</h1>
          <p className="text-xs text-sky-600 font-bold">First Login: Please Update Your Default Password</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="e.g. Pass@1234"
              className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-[11px] text-sky-800 space-y-1">
            <p className="font-bold">Password Criteria:</p>
            <ul className="list-disc list-inside space-y-0.5 text-sky-700">
              <li>Minimum 8 characters</li>
              <li>At least 1 uppercase & 1 lowercase letter</li>
              <li>At least 1 number & 1 special character</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {loading ? 'Updating Password...' : 'Update Password & Continue'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
