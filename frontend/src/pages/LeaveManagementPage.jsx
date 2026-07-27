import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Plus, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export default function LeaveManagementPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/leaves');
      setLeaves(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/leaves', {
        start_date: startDate,
        end_date: endDate,
        reason
      });
      setShowModal(false);
      setMsg('Leave application submitted successfully!');
      fetchLeaves();
    } catch (err) {
      alert('Error applying for leave.');
    }
  };

  const handleStatusChange = async (id, status) => {
    const remarks = window.prompt(`Optional remarks for status (${status}):`, '');
    await axios.put(`/api/leaves/${id}/status`, { status, remarks: remarks || '' });
    fetchLeaves();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-navy-900 font-semibold space-x-3">
        <RefreshCw className="w-6 h-6 animate-spin text-gold-500" />
        <span>Loading Leave Requests Portal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900 flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-gold-600" />
            <span>Leave Management & Approvals</span>
          </h2>
          <p className="text-xs text-slate-500">Apply for medical / OD leave and track approval status</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-navy-950 font-bold px-4 py-2 rounded-xl text-xs shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold">
          {msg}
        </div>
      )}

      {/* Leave Table */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="p-3.5">Applicant Name</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Dates</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Remarks</th>
                {user?.role === 'hod' && <th className="p-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium">
              {leaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-navy-900">{l.applicant_name}</td>
                  <td className="p-3.5 text-slate-600 uppercase font-semibold text-[10px]">{l.user_role}</td>
                  <td className="p-3.5 text-slate-800">{l.start_date} to {l.end_date}</td>
                  <td className="p-3.5 text-slate-600">{l.reason}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] uppercase ${
                      l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      l.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 italic">{l.remarks || '-'}</td>
                  {user?.role === 'hod' && (
                    <td className="p-3.5 text-right space-x-2">
                      {l.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(l.id, 'Approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(l.id, 'Rejected')}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleApply} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold font-display text-navy-900">Apply for Leave</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600">Reason for Leave</label>
                <textarea
                  required
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Medical fever / Participating in Symposium"
                  className="w-full mt-1 p-2 border border-slate-300 rounded-xl"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-gold-500 font-bold text-navy-950 rounded-xl text-xs">Submit Application</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
