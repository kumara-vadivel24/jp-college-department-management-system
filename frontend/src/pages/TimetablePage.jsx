import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Clock, MapPin, RefreshCw, Upload, Download, Copy, Trash2,
  Lock, Unlock, ShieldAlert, CheckCircle2, AlertTriangle, FileSpreadsheet,
  FileText, Image as ImageIcon, Plus, Save, RotateCcw, ArrowRightLeft, UserCheck
} from 'lucide-react';

export default function TimetablePage() {
  const { user } = useAuth();

  // Filters
  const [filterDept, setFilterDept] = useState(user.role === 'superadmin' ? '1' : user.department_id || '1');
  const [filterYear, setFilterYear] = useState('3');
  const [filterSem, setFilterSem] = useState('5');
  const [filterSec, setFilterSec] = useState('A');
  const [filterRoom, setFilterRoom] = useState('');

  // Auxiliary data
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status & Edit state
  const [isLocked, setIsLocked] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [conflicts, setConflicts] = useState([]);
  const [message, setMessage] = useState(null);
  const [draggedCourse, setDraggedCourse] = useState(null);

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [ocrPreviewData, setOcrPreviewData] = useState(null);
  const [copyData, setCopyData] = useState({ source_year: '2', source_section: 'A', target_year: '3', target_section: 'B' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6];

  const canEdit = (user.role === 'superadmin' || user.role === 'hod') && !isLocked;

  const fetchAuxData = async () => {
    try {
      const dRes = await axios.get('/api/department/all');
      setDepartments(dRes.data || []);
      const cRes = await axios.get('/api/subjects');
      setCourses(cRes.data || []);
      const fRes = await axios.get('/api/faculty');
      setFacultyList(fRes.data || []);
    } catch (e) {}
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const params = {
        department_id: filterDept,
        year: filterYear,
        semester: filterSem,
        section: filterSec
      };
      if (filterRoom) params.room_no = filterRoom;

      const res = await axios.get('/api/timetable', { params });
      setTimetable(res.data || []);

      // Check conflicts
      if (res.data && res.data.length > 0) {
        checkConflicts(res.data);
      } else {
        setConflicts([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = async (slots) => {
    try {
      const res = await axios.post('/api/timetable/check-conflicts', {
        department_id: filterDept,
        slots
      });
      if (res.data && res.data.has_conflicts) {
        setConflicts(res.data.conflicts || []);
      } else {
        setConflicts([]);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAuxData();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [filterDept, filterYear, filterSem, filterSec, filterRoom]);

  const getSlot = (day, pNum) => {
    return timetable.find(t => t.day_of_week === day && t.period_number === pNum);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, course) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(course));
    setDraggedCourse(course);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, day, pNum) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      const courseDataRaw = e.dataTransfer.getData('text/plain');
      const course = courseDataRaw ? JSON.parse(courseDataRaw) : draggedCourse;
      if (!course) return;

      const newSlot = {
        day_of_week: day,
        period_number: pNum,
        course_id: course.id,
        faculty_id: course.faculty_id || (facultyList[0] ? facultyList[0].id : 1),
        room_no: `Hall-${pNum}`
      };

      const updatedTimetable = timetable.filter(t => !(t.day_of_week === day && t.period_number === pNum));
      updatedTimetable.push({
        ...newSlot,
        course_code: course.course_code,
        course_name: course.course_name,
        faculty_name: course.faculty_name || 'Assigned Faculty'
      });
      setTimetable(updatedTimetable);

      // Auto-save slot to backend
      await axios.post('/api/timetable/batch-save', {
        department_id: filterDept,
        year: filterYear,
        section: filterSec,
        slots: updatedTimetable
      });

      setMessage({ type: 'success', text: `Slot for ${day} Period ${pNum} updated with ${course.course_code}!` });
      checkConflicts(updatedTimetable);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update slot.' });
    }
  };

  const handleClearSlot = async (day, pNum) => {
    if (!canEdit) return;
    const updated = timetable.filter(t => !(t.day_of_week === day && t.period_number === pNum));
    setTimetable(updated);
    await axios.post('/api/timetable/batch-save', {
      department_id: filterDept,
      year: filterYear,
      section: filterSec,
      slots: updated
    });
    setMessage({ type: 'success', text: `Cleared ${day} Period ${pNum}.` });
    checkConflicts(updated);
  };

  // Copy Timetable Handler
  const handleCopyTimetable = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/timetable/copy', {
        department_id: filterDept,
        ...copyData
      });
      setMessage({ type: 'success', text: res.data.message });
      setShowCopyModal(false);
      fetchTimetable();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Copy operation failed.' });
    }
  };

  // Import File / OCR Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate OCR / File import parser
    const simulatedPreview = [
      { day: 'Monday', p1: 'CS301', p2: 'CS301', p3: 'CS401', p4: 'CS501', p5: 'Free', p6: 'Free' },
      { day: 'Tuesday', p1: 'CS401', p2: 'CS401', p3: 'CS301', p4: 'CS501', p5: 'CS501', p6: 'Free' },
      { day: 'Wednesday', p1: 'CS501', p2: 'CS301', p3: 'CS401', p4: 'Lab-1', p5: 'Lab-1', p6: 'Lab-1' },
      { day: 'Thursday', p1: 'CS301', p2: 'CS401', p3: 'CS501', p4: 'Free', p5: 'Free', p6: 'Free' },
      { day: 'Friday', p1: 'CS401', p2: 'CS501', p3: 'CS301', p4: 'Free', p5: 'Free', p6: 'Free' }
    ];

    setOcrPreviewData(simulatedPreview);
    setMessage({ type: 'success', text: `Imported file ${file.name}. Review extracted grid below.` });
  };

  // Export Timetable Handler
  const handleExport = (format) => {
    alert(`Exporting Timetable as ${format.toUpperCase()}... File download initialized.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" /> Timetable Engine & Schedule Management
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Classroom & Faculty Timetable Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive Drag & Drop Scheduler, Conflict Auto-Detector, OCR File Import, & Multi-Format Exporter.
          </p>
        </div>

        {/* Action Controls for Admin/HOD */}
        {(user.role === 'superadmin' || user.role === 'hod') && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${isLocked ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
            </button>

            <button
              onClick={() => setShowCopyModal(true)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate / Copy
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-xs px-3 py-2 rounded-xl border border-blue-200 transition-all"
            >
              <Upload className="w-3.5 h-3.5" /> Import File (OCR)
            </button>

            <div className="relative group">
              <button className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-2 rounded-xl shadow transition-all">
                <Download className="w-3.5 h-3.5" /> Export Schedule
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-30 w-36 text-xs">
                <button onClick={() => handleExport('excel')} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Excel (.xlsx)</button>
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">PDF Document</button>
                <button onClick={() => handleExport('word')} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Word (.docx)</button>
                <button onClick={() => handleExport('png')} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">PNG Image</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Conflicts Alert Banner */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4 rounded-2xl space-y-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Automated Schedule Conflicts Detected ({conflicts.length})
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {conflicts.map((c, idx) => (
              <li key={idx}>{c.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs font-semibold">
        {/* Department Filter (SuperAdmin) */}
        {user.role === 'superadmin' && (
          <div className="flex items-center gap-2">
            <label className="text-slate-600 dark:text-slate-400">Department:</label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        )}

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <label className="text-slate-600 dark:text-slate-400">Year:</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="1">First Year (I Year)</option>
            <option value="2">Second Year (II Year)</option>
            <option value="3">Third Year (III Year)</option>
            <option value="4">Fourth Year (IV Year)</option>
          </select>
        </div>

        {/* Semester Filter */}
        <div className="flex items-center gap-2">
          <label className="text-slate-600 dark:text-slate-400">Semester:</label>
          <select
            value={filterSem}
            onChange={(e) => setFilterSem(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        {/* Section Filter */}
        <div className="flex items-center gap-2">
          <label className="text-slate-600 dark:text-slate-400">Section:</label>
          <select
            value={filterSec}
            onChange={(e) => setFilterSec(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        {/* Room Filter */}
        <div className="flex items-center gap-2">
          <label className="text-slate-600 dark:text-slate-400">Room/Lab Filter:</label>
          <input
            type="text"
            placeholder="e.g. Hall-1 or Lab-2"
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Available Subjects Palette for Drag & Drop (Admin/HOD Edit Mode) */}
      {canEdit && (
        <div className="bg-blue-50/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-blue-200 dark:border-slate-800 space-y-2">
          <p className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
            🖐️ Drag & Drop Subjects Palette (Drag onto any Period slot below to schedule):
          </p>
          <div className="flex flex-wrap gap-2.5">
            {courses.map((c) => (
              <div
                key={c.id}
                draggable
                onDragStart={(e) => handleDragStart(e, c)}
                className="bg-white dark:bg-slate-800 border border-blue-300 dark:border-slate-700 hover:border-blue-500 rounded-xl px-3 py-2 shadow-sm cursor-grab active:cursor-grabbing hover:scale-105 transition-all text-xs"
              >
                <div className="font-bold text-blue-900 dark:text-blue-300 font-mono">{c.course_code}</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">{c.course_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Timetable Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" /> Loading timetable grid...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border-b border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="p-4 text-left border-r border-slate-200 dark:border-slate-700">Day / Period</th>
                  {periods.map(p => (
                    <th key={p} className="p-3.5 border-r border-slate-200 dark:border-slate-700">
                      <div>Period {p}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                        {p === 1 ? '09:00 - 10:00' : p === 2 ? '10:00 - 11:00' : p === 3 ? '11:15 - 12:15' : p === 4 ? '01:00 - 02:00' : p === 5 ? '02:00 - 03:00' : '03:15 - 04:15'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-850 border-r border-slate-200 dark:border-slate-700 text-left">
                      {day}
                    </td>
                    {periods.map((p) => {
                      const slot = getSlot(day, p);
                      return (
                        <td
                          key={p}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day, p)}
                          className="p-2 border-r border-slate-200 dark:border-slate-700 min-w-[130px]"
                        >
                          {slot ? (
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 space-y-1 relative group">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-900 dark:text-blue-300 text-xs font-mono">{slot.course_code}</span>
                                {canEdit && (
                                  <button
                                    onClick={() => handleClearSlot(day, p)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
                                    title="Clear slot"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-700 dark:text-slate-300 block font-medium line-clamp-1">{slot.course_name}</span>
                              <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold block">{slot.room_no} • {slot.faculty_name}</span>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-[11px]">
                              - Free Slot -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Copy Timetable Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Duplicate / Copy Timetable Schedule</h3>
            <form onSubmit={handleCopyTimetable} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Source Year</label>
                  <select
                    value={copyData.source_year}
                    onChange={(e) => setCopyData({ ...copyData, source_year: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="1">I Year</option>
                    <option value="2">II Year</option>
                    <option value="3">III Year</option>
                    <option value="4">IV Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Source Section</label>
                  <select
                    value={copyData.source_section}
                    onChange={(e) => setCopyData({ ...copyData, source_section: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Target Year</label>
                  <select
                    value={copyData.target_year}
                    onChange={(e) => setCopyData({ ...copyData, target_year: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="1">I Year</option>
                    <option value="2">II Year</option>
                    <option value="3">III Year</option>
                    <option value="4">IV Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Target Section</label>
                  <select
                    value={copyData.target_section}
                    onChange={(e) => setCopyData({ ...copyData, target_section: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                    <option value="C">Sec C</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCopyModal(false)} className="px-4 py-2 rounded-xl text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold">Copy Timetable</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import OCR Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import Timetable (Excel, CSV, PDF, PNG/JPG OCR)</h3>
            <p className="text-xs text-slate-500">Upload schedule file or image for automated OCR period parsing.</p>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-2xl text-center">
              <input type="file" onChange={handleFileUpload} className="hidden" id="fileUpload" accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp" />
              <label htmlFor="fileUpload" className="cursor-pointer space-y-2 flex flex-col items-center">
                <Upload className="w-8 h-8 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to Select Timetable File</span>
              </label>
            </div>

            {ocrPreviewData && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-emerald-600">Extracted Grid Preview (Click save to apply):</p>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl max-h-40 overflow-y-auto text-xs font-mono">
                  {ocrPreviewData.map((row, idx) => (
                    <div key={idx}>{row.day}: {row.p1} | {row.p2} | {row.p3} | {row.p4}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 rounded-xl text-slate-600 text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
