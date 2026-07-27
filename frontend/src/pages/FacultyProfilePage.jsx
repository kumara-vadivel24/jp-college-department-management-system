import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Phone, MapPin, BookOpen, Clock, Lock,
  Edit2, Save, X, CheckCircle2, KeyRound, Briefcase, GraduationCap
} from 'lucide-react';

export default function FacultyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState(null);

  // Change Password state
  const [showPwdSection, setShowPwdSection] = useState(false);
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
      const res = await axios.get('/api/faculty/me');
      setProfile(res.data);
      setEditData({ phone: res.data.phone || '', address: res.data.address || '' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSaveProfile = async () => {
    try {
      await axios.put('/api/faculty/me', editData);
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
      setShowPwdSection(false);
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-600 dark:text-slate-300 gap-2 font-semibold">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      Loading Faculty Profile...
    </div>
  );

  const faculty = profile || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900" />
        <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-blue-100 dark:bg-blue-900/40 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-3xl font-extrabold text-blue-900 dark:text-blue-300">
            {(faculty.name || 'F').charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{faculty.name || user?.profile?.name || 'Faculty Member'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {faculty.designation || 'Assistant Professor'} • {faculty.department_code || user?.department_code || 'CSE'}
            </p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${editMode ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white'}`}
          >
            {editMode ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit2 className="w-3.5 h-3.5" /> Edit Profile</>}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4 opacity-60" /></button>
        </div>
      )}

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Read-only Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Professional Information</h2>

          {[
            { icon: User, label: 'Faculty ID', value: faculty.faculty_id || user?.login_id, readonly: true },
            { icon: Mail, label: 'Email Address', value: faculty.email || user?.email, readonly: true },
            { icon: Briefcase, label: 'Designation', value: faculty.designation || 'Assistant Professor', readonly: true },
            { icon: GraduationCap, label: 'Department', value: faculty.department_name || user?.department_name, readonly: true },
            { icon: BookOpen, label: 'Qualification', value: faculty.qualification || 'M.E. / M.Tech', readonly: true },
            { icon: Clock, label: 'Experience', value: faculty.experience ? `${faculty.experience} years` : '5+ years', readonly: true },
          ].map(({ icon: Icon, label, value, readonly }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{value || '—'}</p>
                {readonly && <p className="text-[10px] text-slate-400 dark:text-slate-600 italic">Read-only</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Editable Fields */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Contact Details {editMode && <span className="text-xs text-blue-600 font-normal ml-2">(Editable)</span>}</h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
              {editMode ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" /> {faculty.phone || editData.phone || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
              {editMode ? (
                <textarea
                  rows={3}
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" /> {faculty.address || editData.address || 'Not set'}
                </p>
              )}
            </div>

            {editMode && (
              <button onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                <Save className="w-4 h-4" /> Save Profile Changes
              </button>
            )}
          </div>

          {/* Office Hours */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">Office Hours</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <div key={day} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{day}</span>
                  <span className="text-slate-500 dark:text-slate-400">09:00 - 11:00</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" /> Security — Change Password
          </h2>
          <button
            onClick={() => setShowPwdSection(!showPwdSection)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${showPwdSection ? 'bg-slate-100 text-slate-600' : 'bg-blue-600 text-white'}`}
          >
            {showPwdSection ? 'Hide' : 'Change Password'}
          </button>
        </div>

        {showPwdSection && (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            {pwdError && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-medium">{pwdError}</div>}

            {[
              { label: 'Current Password', field: 'current_password', placeholder: 'Enter current password' },
              { label: 'New Password', field: 'new_password', placeholder: 'Min 8 chars, uppercase, number, special' },
              { label: 'Confirm New Password', field: 'confirm_password', placeholder: 'Re-enter new password' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={pwdForm[field]}
                    onChange={(e) => setPwdForm({ ...pwdForm, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            ))}

            {/* Complexity Checklist */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs space-y-1">
              {[
                { label: '8+ characters', ok: hasMinLength },
                { label: 'Uppercase (A-Z)', ok: hasUpper },
                { label: 'Lowercase (a-z)', ok: hasLower },
                { label: 'Number (0-9)', ok: hasNumber },
                { label: 'Special character', ok: hasSpecial },
                { label: 'Passwords match', ok: isMatch },
              ].map(({ label, ok }) => (
                <div key={label} className={`flex items-center gap-1.5 ${ok ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5">•</span>}
                  {label}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={pwdLoading || !isPwdValid}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-40 transition-all"
            >
              {pwdLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
