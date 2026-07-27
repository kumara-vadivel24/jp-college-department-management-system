import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Phone, MapPin, BookOpen, Calendar,
  Edit2, Save, X, CheckCircle2, KeyRound, Lock, GraduationCap, Heart
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState(null);

  // Password state
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const hasMinLength = pwdForm.new_password.length >= 8;
  const hasUpper = /[A-Z]/.test(pwdForm.new_password);
  const hasLower = /[a-z]/.test(pwdForm.new_password);
  const hasNumber = /[0-9]/.test(pwdForm.new_password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwdForm.new_password);
  const isMatch = pwdForm.new_password.length > 0 && pwdForm.new_password === pwdForm.confirm_password;
  const isPwdValid = pwdForm.current_password.length > 0 && hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && isMatch;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/students/${user.id}`);
      const s = res.data?.student || {};
      setProfile(s);
      setEditData({ phone: s.phone || '', address: s.address || '', parent_name: s.parent_name || '', parent_phone: s.parent_phone || '' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [user]);

  const handleSave = async () => {
    try {
      await axios.put(`/api/students/${user.id}`, editData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
      fetchProfile();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (!isPwdValid) { setPwdError('Please fulfill all password requirements.'); return; }
    try {
      setPwdLoading(true);
      await axios.post('/api/auth/change-password', pwdForm);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
      setShowPwd(false);
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-600 dark:text-slate-300 gap-2 font-semibold">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      Loading Student Profile...
    </div>
  );

  const s = profile || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-900 via-blue-800 to-blue-900" />
        <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="w-24 h-24 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-3xl font-extrabold text-indigo-900 dark:text-indigo-300">
            {(s.name || 'S').charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.name || user?.profile?.name || 'Student'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Reg No: <strong className="text-slate-800 dark:text-slate-200">{s.reg_no || user?.login_id}</strong> • Year {s.year} - Section '{s.section}'
            </p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${editMode ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white'}`}
          >
            {editMode ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit2 className="w-3.5 h-3.5" /> Edit Contact Info</>}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4 opacity-60" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Info — Read Only */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Academic Details <span className="text-xs text-slate-400 font-normal ml-1">(Read-only)</span>
          </h2>
          {[
            { icon: GraduationCap, label: 'Department', value: s.department_name || user?.department_name },
            { icon: BookOpen, label: 'Course', value: `B.E. ${s.department_code || user?.department_code}` },
            { icon: User, label: 'Year / Section', value: `Year ${s.year} - Section '${s.section}'` },
            { icon: Calendar, label: 'Date of Birth', value: s.dob },
            { icon: User, label: 'Gender', value: s.gender },
            { icon: Heart, label: 'Blood Group', value: s.blood_group || 'O+' },
            { icon: Mail, label: 'Email Address', value: s.email || user?.email },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{value || '—'}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Editable Contact Info */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Contact Information {editMode && <span className="text-xs text-indigo-600 font-normal ml-1">(Editable)</span>}
            </h2>

            {[
              { label: 'Mobile Number', field: 'phone', type: 'tel', icon: Phone },
              { label: 'Parent / Guardian Name', field: 'parent_name', type: 'text', icon: User },
              { label: 'Emergency Contact (Parent)', field: 'parent_phone', type: 'tel', icon: Phone },
            ].map(({ label, field, type, icon: Icon }) => (
              <div key={field}>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                {editMode ? (
                  <input
                    type={type}
                    value={editData[field] || ''}
                    onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Icon className="w-4 h-4 text-indigo-600 shrink-0" /> {editData[field] || '—'}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
              {editMode ? (
                <textarea rows={3} value={editData.address || ''}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" /> {s.address || editData.address || '—'}
                </p>
              )}
            </div>

            {editMode && (
              <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" /> Change Password
              </h2>
              <button onClick={() => setShowPwd(!showPwd)} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${showPwd ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white'}`}>
                {showPwd ? 'Hide' : 'Change Password'}
              </button>
            </div>

            {showPwd && (
              <form onSubmit={handleChangePassword} className="space-y-3">
                {pwdError && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs">{pwdError}</div>}

                {[
                  { label: 'Current Password', field: 'current_password' },
                  { label: 'New Password', field: 'new_password' },
                  { label: 'Confirm Password', field: 'confirm_password' },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input type="password" value={pwdForm[field]} onChange={(e) => setPwdForm({ ...pwdForm, [field]: e.target.value })}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        required />
                    </div>
                  </div>
                ))}

                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs grid grid-cols-2 gap-1">
                  {[['8+ chars', hasMinLength], ['Uppercase', hasUpper], ['Lowercase', hasLower], ['Number', hasNumber], ['Special char', hasSpecial], ['Match', isMatch]].map(([label, ok]) => (
                    <div key={label} className={`flex items-center gap-1 ${ok ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      {ok ? <CheckCircle2 className="w-3 h-3" /> : <span>•</span>} {label}
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={pwdLoading || !isPwdValid} className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-40 transition-all">
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
