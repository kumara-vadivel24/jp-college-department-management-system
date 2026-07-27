import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Cpu, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const { deptInfo } = useAuth();

  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Col 1: Dept Info */}
          <div>
            <h3 className="text-white font-bold text-base mb-3 flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-gold-400" />
              <span>{deptInfo.name || 'Department of Computer Science'}</span>
            </h3>
            <p className="text-xs leading-relaxed text-slate-400 mb-3">
              {deptInfo.college_name || 'J.P. College of Engineering'}
            </p>
            <p className="text-xs text-slate-400 flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
              <span>{deptInfo.address || 'Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852'}</span>
            </p>
          </div>

          {/* Col 2: System Capabilities */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider text-gold-400">
              Department ERP & ML Engine
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Role-Based Access Control (HOD, Faculty, Student)</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ML Pass/Fail Risk Analysis (scikit-learn microservice)</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Automated Attendance Shortage & Grade Tracking</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider text-gold-400">
              Department Office
            </h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Office Phone: +91 4633 280 500</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Email: csedept@jpcoe.ac.in</span>
              </p>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} {deptInfo.college_name} - {deptInfo.name}. All Rights Reserved.</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Powered by Node.js, React & Python ML Microservice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
