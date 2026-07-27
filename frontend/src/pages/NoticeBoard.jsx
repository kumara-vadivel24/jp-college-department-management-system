import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Bell, Plus, Trash2, Edit2, RefreshCw, Pin, Archive,
  Search, CheckCircle2, X, Upload, AlertTriangle
} from 'lucide-react';

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    title: '', content: '', category: 'General', target_role: 'All', is_pinned: false
  });

  const canManage = user?.role === 'hod' || user?.role === 'superadmin';

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/notices');
      setNotices(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ title: '', content: '', category: 'General', target_role: 'All', is_pinned: false });
    setShowModal(true);
  };

  const handleOpenEdit = (n) => {
    setEditingId(n.id);
    setForm({ title: n.title, content: n.content, category: n.category, target_role: n.target_role || 'All', is_pinned: Boolean(n.is_pinned) });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/notices/${editingId}`, form);
        setMessage({ type: 'success', text: 'Notice updated successfully!' });
      } else {
        await axios.post('/api/notices', form);
        setMessage({ type: 'success', text: 'Notice published successfully!' });
      }
      setShowModal(false);
      fetchNotices();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save notice.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this notice?')) return;
    try {
      await axios.delete(`/api/notices/${id}`);
      setMessage({ type: 'success', text: 'Notice deleted.' });
      fetchNotices();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to delete notice.' });
    }
  };

  const handlePin = async (n) => {
    try {
      await axios.put(`/api/notices/${n.id}`, { ...n, is_pinned: !n.is_pinned });
      fetchNotices();
    } catch (e) {}
  };

  const CATEGORIES = ['All', 'Exams', 'Academic', 'General', 'Meeting', 'Holiday', 'Sports', 'Cultural'];
  const categoryColors = {
    'Exams': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    'Academic': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'General': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'Meeting': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    'Holiday': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    'Sports': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    'Cultural': 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  };

  const filtered = notices.filter(n => {
    const matchSearch = !searchQuery || n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'All' || n.category === filterCategory;
    return matchSearch && matchCat;
  });

  // Sort: pinned first
  const sorted = [...filtered].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-600 dark:text-slate-300 font-semibold gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading Department Notice Board...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" /> Departmental Communication Center
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notice Board & Circulars</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Official notices, exam alerts, academic updates, and department circulars.</p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition-all"
          >
            <Plus className="w-4 h-4" /> Post New Notice
          </button>
        )}
      </div>

      {/* Notifications */}
      {message && (
        <div className={`p-3.5 rounded-xl flex items-center justify-between text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4 opacity-60" /></button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterCategory === cat ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 font-medium">
          No notices found matching your search or filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sorted.map((n) => (
            <div
              key={n.id}
              className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${n.is_pinned ? 'border-amber-400 dark:border-amber-600' : 'border-slate-200 dark:border-slate-800'}`}
            >
              {/* Pinned indicator */}
              {n.is_pinned && (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Pin className="w-3 h-3" /> Pinned Notice
                </div>
              )}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${categoryColors[n.category] || categoryColors['General']}`}>
                    {n.category}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    {new Date(n.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">{n.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{n.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  By: <strong className="text-slate-800 dark:text-slate-200">{n.author_name || 'HOD'}</strong>
                  {n.target_role && n.target_role !== 'All' && (
                    <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">→ {n.target_role}</span>
                  )}
                </span>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handlePin(n)} title={n.is_pinned ? 'Unpin' : 'Pin notice'} className="p-1 rounded text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleOpenEdit(n)} className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingId ? 'Edit Notice' : 'Post New Department Notice'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Internal Assessment II Timetable Released"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {['Exams','Academic','General','Meeting','Holiday','Sports','Cultural'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
                  <select
                    value={form.target_role}
                    onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="All">All Department</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Content / Description *</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full notice content..."
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_pinned}
                  onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                  className="rounded border-slate-300"
                />
                Pin this notice to the top
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow">
                  {editingId ? 'Save Changes' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
