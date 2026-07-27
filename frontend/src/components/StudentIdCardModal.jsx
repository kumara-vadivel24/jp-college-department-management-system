import React, { useRef } from 'react';
import { X, Printer, GraduationCap, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudentIdCardModal({ student, onClose }) {
  const { deptInfo } = useAuth();
  if (!student) return null;

  const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const expiryYear = new Date().getFullYear() + 1;
  const expiryDate = `May ${expiryYear}`;

  // Generate a simple QR-like pattern using the student reg_no as data URI
  const qrDataUrl = `https://jpcoe.ac.in/student/${student.reg_no || '23CSE001'}`;

  const handlePrint = () => {
    const printArea = document.getElementById('student-id-card-printable');
    const originalBody = document.body.innerHTML;
    document.body.innerHTML = `
      <style>
        @page { size: 85.6mm 53.98mm; margin: 0; }
        body { margin: 0; font-family: Arial, sans-serif; }
        .id-card-print { width: 85.6mm; height: 53.98mm; }
        @media print { .no-print { display: none !important; } }
      </style>
      <div class="id-card-print">${printArea.innerHTML}</div>
    `;
    window.print();
    document.body.innerHTML = originalBody;
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">

        {/* Toolbar */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-white">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Official Student ID Card</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Download PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Preview Area */}
        <div className="p-6 bg-slate-100 flex justify-center">
          <div
            id="student-id-card-printable"
            className="printable-card w-[340px] bg-white rounded-xl shadow-xl overflow-hidden border-2 border-blue-900"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            {/* College Header — Blue top bar with WHITE text (intended dark bg) */}
            <div className="bg-blue-900 px-4 py-2.5 flex items-center gap-3 border-b-4 border-amber-500">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-7 h-7 text-blue-900" />
              </div>
              <div>
                <p className="text-white font-extrabold text-[11px] uppercase tracking-tight leading-tight">
                  {deptInfo.college_name || 'J.P. College of Engineering'}
                </p>
                <p className="text-amber-300 text-[9px] font-semibold uppercase tracking-widest">
                  Approved by AICTE • Affiliated to Anna University
                </p>
              </div>
            </div>

            {/* Main Card Body — ALL BLACK TEXT */}
            <div className="flex gap-3 p-3">
              {/* Photo Column */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-20 h-24 rounded-lg bg-slate-100 border-2 border-blue-900 overflow-hidden flex items-center justify-center text-blue-900 font-bold text-2xl">
                  {student.photo_url
                    ? <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                    : <span>{(student.name || 'S').charAt(0)}</span>
                  }
                </div>
                {/* QR Code (SVG placeholder with pattern) */}
                <div className="w-20 h-20 bg-white border border-slate-300 rounded flex items-center justify-center">
                  <svg viewBox="0 0 21 21" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
                    <rect width="21" height="21" fill="white"/>
                    <rect x="0" y="0" width="7" height="7" fill="none" stroke="black" strokeWidth="1"/>
                    <rect x="2" y="2" width="3" height="3" fill="black"/>
                    <rect x="14" y="0" width="7" height="7" fill="none" stroke="black" strokeWidth="1"/>
                    <rect x="16" y="2" width="3" height="3" fill="black"/>
                    <rect x="0" y="14" width="7" height="7" fill="none" stroke="black" strokeWidth="1"/>
                    <rect x="2" y="16" width="3" height="3" fill="black"/>
                    <rect x="9" y="2" width="1" height="2" fill="black"/>
                    <rect x="11" y="2" width="2" height="1" fill="black"/>
                    <rect x="9" y="6" width="2" height="2" fill="black"/>
                    <rect x="12" y="5" width="1" height="2" fill="black"/>
                    <rect x="9" y="9" width="3" height="1" fill="black"/>
                    <rect x="14" y="9" width="2" height="2" fill="black"/>
                    <rect x="18" y="9" width="2" height="1" fill="black"/>
                    <rect x="9" y="12" width="2" height="2" fill="black"/>
                    <rect x="12" y="12" width="1" height="3" fill="black"/>
                    <rect x="14" y="12" width="3" height="1" fill="black"/>
                    <rect x="14" y="16" width="2" height="2" fill="black"/>
                    <rect x="18" y="14" width="2" height="3" fill="black"/>
                    <rect x="9" y="17" width="3" height="2" fill="black"/>
                    <text x="1" y="20.5" fontSize="1.5" fill="black" fontFamily="monospace">{(student.reg_no || '23CSE001').substring(0,8)}</text>
                  </svg>
                </div>
              </div>

              {/* Details Column — ALL BLACK TEXT */}
              <div className="flex-1 space-y-1 text-[10px]">
                <div className="text-center bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 mb-1.5">
                  <p className="text-[8px] font-bold text-blue-900 uppercase tracking-widest">Student Identity Card</p>
                </div>

                <div>
                  <p className="text-black font-extrabold text-sm uppercase leading-tight">{student.name}</p>
                  <p className="text-black font-bold text-[9px] tracking-widest">REG: {student.reg_no}</p>
                </div>

                <div className="space-y-0.5 text-[9.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Branch:</span>
                    <span className="text-black font-bold">{student.department_code || 'CSE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Year / Sec:</span>
                    <span className="text-black font-bold">Year {student.year} - '{student.section}'</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">DOB:</span>
                    <span className="text-black font-bold">{student.dob || '15-05-2003'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Blood Group:</span>
                    <span className="text-black font-bold">{student.blood_group || 'O+'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Emergency:</span>
                    <span className="text-black font-bold">{student.parent_phone || '+91 9442100001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Issue:</span>
                    <span className="text-black font-bold">{issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Expiry:</span>
                    <span className="text-black font-bold">{expiryDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Row */}
            <div className="px-4 pb-2 flex justify-between items-end text-[8px] font-bold text-black">
              <div className="text-center">
                <div className="h-4 border-b border-black w-20 mb-0.5"></div>
                <p className="text-black uppercase tracking-wider">Student Signature</p>
              </div>
              <div className="text-center">
                <div className="h-4 border-b border-black w-24 mb-0.5"></div>
                <p className="text-black uppercase tracking-wider">HOD Signature</p>
              </div>
            </div>

            {/* Barcode-style bottom bar */}
            <div className="bg-blue-900 py-1.5 px-3 text-center">
              <p className="text-white text-[7px] font-mono tracking-[0.25em] uppercase">
                {student.reg_no || '23CSE001'} • JPCOE • VALID {new Date().getFullYear()}-{expiryYear}
              </p>
              <div className="flex justify-center gap-px mt-0.5">
                {Array.from({ length: 40 }, (_, i) => (
                  <div key={i} className={`w-px bg-amber-400 ${[1,3,5,8,10,13,15,17,20,22,25,27,30,33,35,38].includes(i) ? 'h-3' : 'h-2'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center no-print">
          <MapPin className="w-3 h-3 inline mr-1" />
          Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852 • +91 4633 280 123
        </div>
      </div>
    </div>
  );
}
