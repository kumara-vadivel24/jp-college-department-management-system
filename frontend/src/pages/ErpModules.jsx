import React, { useState, useEffect } from 'react';
import { 
  departmentService, 
  activityLogService 
} from '../services/firestoreService';
import { exportToExcel, exportToCSV, exportToPDF, parseImportFile } from '../utils/importExportUtils';
import { 
  Building2, GraduationCap, BookOpen, CalendarDays, ClipboardCheck, Award, 
  FileCheck2, FileText, FileDown, Calendar, BarChart3, Download, FileSpreadsheet, 
  CheckSquare, Settings, UserCog, History, Bell, Plus, Edit2, Trash2, Search, Upload
} from 'lucide-react';

const PageHeader = ({ title, description, onAdd, addText, onExport }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
      <p className="text-gray-500 text-xs mt-0.5">{description}</p>
    </div>
    <div className="flex items-center gap-2">
      {onExport && (
        <button onClick={onExport} className="px-3 py-1.5 bg-white hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-sky-200 shadow-sm">
          <Download className="w-3.5 h-3.5 text-sky-500" /> Export Excel
        </button>
      )}
      {onAdd && (
        <button onClick={onAdd} className="px-4 py-2 bg-sky-400 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> {addText || 'Add New'}
        </button>
      )}
    </div>
  </div>
);

// 1. Departments Page
export const DepartmentsPage = () => {
  const [items, setItems] = useState([
    { id: '1', code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. Ramesh Kumar', intake: 180 },
    { id: '2', code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. Suresh V', intake: 120 },
    { id: '3', code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. Praveen B', intake: 60 },
  ]);
  useEffect(() => {
    departmentService.subscribe(data => { if (data.length) setItems(data); });
  }, []);

  return (
    <div className="space-y-6 bg-white">
      <PageHeader title="Department Management" description="Manage academic departments and HOD allocations." onExport={() => exportToExcel(items, 'Departments')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(dept => (
          <div key={dept.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-sky-100 text-sky-700 font-mono text-xs font-bold rounded border border-sky-200">{dept.code}</span>
              <Building2 className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">{dept.name}</h3>
            <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
              <p>Head of Department: <span className="text-gray-900 font-semibold">{dept.hod}</span></p>
              <p>Annual Intake: <span className="text-gray-900 font-semibold">{dept.intake} Students</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Courses Page
export const CoursesPage = () => {
  const [courses] = useState([
    { code: 'B.E. CSE', name: 'Bachelor of Engineering in CS', duration: '4 Years', credits: 160 },
    { code: 'M.Tech CSE', name: 'Master of Technology in CS', duration: '2 Years', credits: 80 },
  ]);
  return (
    <div className="space-y-6 bg-white">
      <PageHeader title="Courses & Programs" description="Manage degree programs, credit distributions, and durations." />
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-100 text-sky-800 uppercase font-bold border-b border-sky-200">
            <tr><th className="p-4">Program Code</th><th className="p-4">Course Name</th><th className="p-4">Duration</th><th className="p-4">Total Credits</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {courses.map((c, i) => (
              <tr key={i}><td className="p-4 font-mono font-bold text-sky-600">{c.code}</td><td className="p-4 font-semibold text-gray-900">{c.name}</td><td className="p-4">{c.duration}</td><td className="p-4">{c.credits}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. Subjects Page
export const SubjectsPage = () => {
  const [subjects] = useState([
    { code: 'CS501', title: 'Data Structures & Algorithms', sem: 5, credits: 4, type: 'Theory' },
    { code: 'CS502', title: 'Database Management Systems', sem: 5, credits: 4, type: 'Theory' },
    { code: 'CS503', title: 'DBMS Laboratory', sem: 5, credits: 1.5, type: 'Lab' },
  ]);
  return (
    <div className="space-y-6 bg-white">
      <PageHeader title="Subject Catalog" description="Manage curriculum subjects, scheme credits, and course types." />
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-100 text-sky-800 uppercase font-bold border-b border-sky-200">
            <tr><th className="p-4">Code</th><th className="p-4">Subject Title</th><th className="p-4">Semester</th><th className="p-4">Type</th><th className="p-4">Credits</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {subjects.map((s, i) => (
              <tr key={i}><td className="p-4 font-mono font-bold text-sky-600">{s.code}</td><td className="p-4 text-gray-900 font-semibold">{s.title}</td><td className="p-4">Semester {s.sem}</td><td className="p-4"><span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-200 font-semibold">{s.type}</span></td><td className="p-4">{s.credits}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 4. Semesters Page
export const SemestersPage = () => (
  <div className="space-y-6 bg-white">
    <PageHeader title="Semester Configuration" description="Manage active academic terms, start dates, and exam periods." />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
        <div key={s} className="bg-white border border-gray-200 rounded-xl p-4 text-center space-y-2 shadow-sm hover:shadow-md transition-shadow">
          <CalendarDays className="w-6 h-6 text-sky-500 mx-auto" />
          <h3 className="font-bold text-gray-900 text-sm">Semester {s}</h3>
          <span className="inline-block px-2.5 py-0.5 text-[10px] bg-sky-100 text-sky-700 rounded-full border border-sky-200 font-semibold">Active Term</span>
        </div>
      ))}
    </div>
  </div>
);

// 5. Attendance Page
export const AttendancePage = () => {
  const [records] = useState([
    { usn: '1JP21CS001', name: 'Aarav Sharma', subject: 'CS501', totalClasses: 40, attended: 36, percentage: '90%' },
    { usn: '1JP21CS045', name: 'Bhavna Reddy', subject: 'CS501', totalClasses: 40, attended: 32, percentage: '80%' },
  ]);
  return (
    <div className="space-y-6 bg-white">
      <PageHeader title="Attendance Portal" description="Track and log student class attendance in real-time." onExport={() => exportToExcel(records, 'Attendance')} />
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-100 text-sky-800 uppercase font-bold border-b border-sky-200">
            <tr><th className="p-4">USN</th><th className="p-4">Student</th><th className="p-4">Subject</th><th className="p-4">Classes Attended</th><th className="p-4">Attendance %</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {records.map((r, i) => (
              <tr key={i}><td className="p-4 font-mono font-bold text-sky-600">{r.usn}</td><td className="p-4 font-semibold text-gray-900">{r.name}</td><td className="p-4">{r.subject}</td><td className="p-4">{r.attended} / {r.totalClasses}</td><td className="p-4 font-bold text-sky-600">{r.percentage}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 6. Internal Marks Page
export const InternalMarksPage = () => {
  const [marks] = useState([
    { usn: '1JP21CS001', name: 'Aarav Sharma', subject: 'CS501', ia1: 23, ia2: 24, ia3: 25, average: 24.5 },
    { usn: '1JP21CS045', name: 'Bhavna Reddy', subject: 'CS501', ia1: 20, ia2: 21, ia3: 22, average: 21.0 },
  ]);
  return (
    <div className="space-y-6 bg-white">
      <PageHeader title="Internal Assessment Marks" description="Log and compile internal assessment scores (IA1, IA2, IA3)." onExport={() => exportToExcel(marks, 'Internal_Marks')} />
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-100 text-sky-800 uppercase font-bold border-b border-sky-200">
            <tr><th className="p-4">USN</th><th className="p-4">Student</th><th className="p-4">Subject</th><th className="p-4">IA-1</th><th className="p-4">IA-2</th><th className="p-4">IA-3</th><th className="p-4">Avg (/25)</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {marks.map((m, i) => (
              <tr key={i}><td className="p-4 font-mono font-bold text-sky-600">{m.usn}</td><td className="p-4 font-semibold text-gray-900">{m.name}</td><td className="p-4">{m.subject}</td><td className="p-4">{m.ia1}</td><td className="p-4">{m.ia2}</td><td className="p-4">{m.ia3}</td><td className="p-4 font-bold text-gray-900">{m.average}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 7. Semester Marks Page
export const SemesterMarksPage = () => {
  const [semMarks] = useState([
    { usn: '1JP21CS001', name: 'Aarav Sharma', semester: 'Sem 4', sgpa: '8.75', cgpa: '8.60', status: 'PASSED' },
    { usn: '1JP21CS045', name: 'Bhavna Reddy', semester: 'Sem 4', sgpa: '8.20', cgpa: '8.15', status: 'PASSED' },
  ]);
  return (
    <div className="space-y-6 bg-white">
      <PageHeader title="Semester Exam Results" description="View university end-semester transcripts, SGPA, and CGPA scores." />
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-100 text-sky-800 uppercase font-bold border-b border-sky-200">
            <tr><th className="p-4">USN</th><th className="p-4">Student</th><th className="p-4">Semester</th><th className="p-4">SGPA</th><th className="p-4">CGPA</th><th className="p-4">Result</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {semMarks.map((m, i) => (
              <tr key={i}><td className="p-4 font-mono font-bold text-sky-600">{m.usn}</td><td className="p-4 font-semibold text-gray-900">{m.name}</td><td className="p-4">{m.semester}</td><td className="p-4 font-bold text-gray-900">{m.sgpa}</td><td className="p-4 font-bold text-sky-600">{m.cgpa}</td><td className="p-4"><span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded border border-sky-200 font-bold">{m.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 8. Assignments Page
export const AssignmentsPage = () => {
  const [assignments] = useState([
    { title: 'Graph Algorithms Implementation', subject: 'CS501', dueDate: '2026-08-05', status: 'Active' },
    { title: 'SQL Schema & Queries Assignment', subject: 'CS502', dueDate: '2026-08-10', status: 'Active' },
  ]);
  return (
    <div className="space-y-6 bg-white">
      <PageHeader title="Assignments & Projects" description="Post and submit course assignments with Firebase Storage files." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((a, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-sky-100 text-sky-700 font-mono text-xs rounded font-bold">{a.subject}</span>
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">{a.title}</h3>
            <p className="text-xs text-gray-500">Due Date: <span className="text-gray-900 font-medium">{a.dueDate}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 9. Subject Notes Page
export const NotesPage = () => {
  const [notes] = useState([
    { title: 'Module 1: Trees and Graphs PDF', subject: 'CS501', uploadedBy: 'Dr. Ramesh' },
    { title: 'Module 2: Normalization Notes', subject: 'CS502', uploadedBy: 'Prof. Anitha' },
  ]);
  return (
    <div className="space-y-6 bg-white">
      <PageHeader title="Subject Study Notes" description="Download lecture slides, notes, and reference material." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((n, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] text-sky-600 font-mono font-bold uppercase">{n.subject}</span>
              <h4 className="font-bold text-gray-900 text-sm">{n.title}</h4>
              <p className="text-xs text-gray-500">Uploaded by {n.uploadedBy}</p>
            </div>
            <button className="p-2.5 bg-white hover:bg-sky-50 text-sky-600 rounded-lg border border-sky-200 shadow-sm">
              <FileDown className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 10. Timetable Page
export const TimetablePage = () => (
  <div className="space-y-6 bg-white">
    <PageHeader title="Class & Exam Timetable" description="Weekly course schedule and lab session allocations." />
    <div className="bg-white border border-gray-200 rounded-xl p-5 text-center text-gray-500 text-xs shadow-sm">
      <Calendar className="w-8 h-8 text-sky-500 mx-auto mb-2" />
      <p className="font-bold text-gray-900 text-sm">Semester 5 - Section A Weekly Schedule</p>
      <p className="mt-1">Interactive weekly grid renderer is active.</p>
    </div>
  </div>
);

// 11. Reports Page
export const ReportsPage = () => (
  <div className="space-y-6 bg-white">
    <PageHeader title="Academic Reports" description="Generate performance, attendance, and department statistics." />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {['Attendance Summary Report', 'IA Marks Analysis Report', 'At-Risk Students List'].map((r, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <BarChart3 className="w-6 h-6 text-sky-500" />
          <h3 className="font-bold text-gray-900 text-sm">{r}</h3>
          <button onClick={() => exportToPDF(r, [{ header: 'Field', key: 'f' }], [{ f: 'Sample Data' }], r)} className="w-full py-2 bg-white hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 border border-sky-200 shadow-sm">
            <Download className="w-4 h-4 text-red-500" /> Download PDF Report
          </button>
        </div>
      ))}
    </div>
  </div>
);

// 12. Downloads Page
export const DownloadsPage = () => (
  <div className="space-y-6 bg-white">
    <PageHeader title="Downloads & Circulars" description="Official college circulars, exam forms, and guidelines." />
    <div className="space-y-3">
      {['Academic Calendar 2026-27.pdf', 'Exam Fee Challan Format.pdf', 'Leave Application Form.pdf'].map((d, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="text-xs font-semibold text-gray-900">{d}</span>
          <button className="px-3 py-1.5 bg-white hover:bg-sky-50 text-sky-600 text-xs font-semibold rounded-lg flex items-center gap-1 border border-sky-200 shadow-sm">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      ))}
    </div>
  </div>
);

// 13. Import Export Page
export const ImportExportPage = () => {
  const [importStatus, setImportStatus] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setImportStatus('Parsing file...');
      const data = await parseImportFile(file);
      setImportStatus(`Successfully parsed ${data.length} records from ${file.name}`);
    } catch (err) {
      setImportStatus('Error parsing import file.');
    }
  };

  return (
    <div className="space-y-6 bg-white">
      <PageHeader title="Bulk Data Import / Export" description="Import and export student, faculty, and marks datasets in Excel or CSV format." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Upload className="w-5 h-5 text-sky-500" /> Import Dataset
          </h3>
          <p className="text-xs text-gray-500">Upload CSV or XLSX file containing student or marks records.</p>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-700" />
          {importStatus && <p className="text-xs font-mono text-sky-600 font-semibold">{importStatus}</p>}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-500" /> Quick Data Export
          </h3>
          <p className="text-xs text-gray-500">Export complete ERP records directly to spreadsheet files.</p>
          <div className="flex gap-3">
            <button onClick={() => exportToExcel([{ Sample: 'Data' }], 'ERP_Master_Export')} className="flex-1 py-2.5 bg-white hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg border border-sky-200 shadow-sm">Export Excel</button>
            <button onClick={() => exportToCSV([{ Sample: 'Data' }], 'ERP_Master_Export')} className="flex-1 py-2.5 bg-white hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg border border-sky-200 shadow-sm">Export CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 14. Approvals Page
export const ApprovalsPage = () => (
  <div className="space-y-6 bg-white">
    <PageHeader title="Requests & Approvals" description="Review student and faculty leave applications and document verification requests." />
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-gray-900">Prof. Anitha S - Medical Leave Request</h4>
          <p className="text-[10px] text-gray-500 mt-0.5">Dates: 2026-08-01 to 2026-08-03</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-sky-400 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-sm">Approve</button>
          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg">Reject</button>
        </div>
      </div>
    </div>
  </div>
);

// 15. Settings Page
export const SettingsPage = () => (
  <div className="space-y-6 bg-white">
    <PageHeader title="ERP Settings" description="System configuration, academic year parameters, and global metadata." />
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 max-w-xl shadow-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Institution Name</label>
        <input type="text" defaultValue="JP College of Engineering" className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Current Academic Session</label>
        <input type="text" defaultValue="2026 - 2027 (Odd Semester)" className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900" />
      </div>
      <button className="px-4 py-2 bg-sky-400 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-sm">Save Settings</button>
    </div>
  </div>
);

// 16. User Management Page
export const UserManagementPage = () => (
  <div className="space-y-6 bg-white">
    <PageHeader title="User Access & Roles" description="Manage login credentials, roles (SuperAdmin, HOD, Faculty, Student)." />
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="bg-sky-100 text-sky-800 uppercase font-bold border-b border-sky-200">
          <tr><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-gray-700">
          {[
            { name: 'System Admin', email: 'admin@erp.edu', role: 'SuperAdmin' },
            { name: 'Dr. Ramesh HOD', email: 'hod@erp.edu', role: 'Hod' },
            { name: 'Prof. Anitha Kumar', email: 'faculty@erp.edu', role: 'Faculty' },
            { name: 'Karthik S', email: 'student@erp.edu', role: 'Student' }
          ].map((u, i) => (
            <tr key={i}><td className="p-4 font-bold text-gray-900">{u.name}</td><td className="p-4 text-gray-500">{u.email}</td><td className="p-4"><span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded border border-sky-200 font-bold">{u.role}</span></td><td className="p-4 text-sky-600 font-bold">Active</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// 17. Activity Logs Page
export const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    activityLogService.subscribe(data => setLogs(data));
  }, []);

  return (
    <div className="space-y-6 bg-white">
      <PageHeader title="Audit & Activity Logs" description="Real-time audit log of actions taken within the College ERP." />
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
        {logs.length > 0 ? (
          logs.map((log, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs flex justify-between">
              <span className="text-gray-900 font-semibold">{log.userName}: <span className="text-gray-600 font-normal">{log.action} - {log.details}</span></span>
              <span className="text-[10px] text-gray-400">{log.timestamp}</span>
            </div>
          ))
        ) : (
          <div className="p-4 text-xs text-gray-500 text-center">System activity events will appear here in real-time.</div>
        )}
      </div>
    </div>
  );
};

// 18. Notifications Page
export const NotificationsPage = () => (
  <div className="space-y-6 bg-white">
    <PageHeader title="System Notifications" description="Broacast and view college notifications and alerts." />
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
      <div className="p-4 bg-sky-50/60 rounded-lg border border-sky-100 space-y-1">
        <h4 className="text-xs font-bold text-gray-900">Odd Semester Examination Notification</h4>
        <p className="text-xs text-gray-600">All department heads are requested to finalize internal marks by end of month.</p>
      </div>
    </div>
  </div>
);
