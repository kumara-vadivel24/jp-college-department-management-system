import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { user, logout, deptInfo, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userDeptCode = user?.department_code || deptInfo?.code || 'CSE';

  return (
    <header className="bg-slate-900 dark:bg-slate-950 text-white shadow-lg border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Department Branding */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-blue-900/80 px-2 py-0.5 rounded border border-blue-700">
                  {user?.role === 'superadmin' ? 'ALL DEPTS' : userDeptCode}
                </span>
                <span className="text-[11px] text-slate-300 font-medium">Department ERP</span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold font-display tracking-tight text-white group-hover:text-blue-200 transition-colors">
                {deptInfo.college_name || 'J.P. College of Engineering'}
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                {user?.role === 'superadmin' ? '7 Engineering Departments Central Admin' : (user?.department_name || deptInfo.name || 'Department of Computer Science')}
              </p>
            </div>
          </Link>

          {/* Action Buttons & Theme Switcher */}
          <div className="flex items-center space-x-3">
            {/* Dark/Light Mode Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 dark:text-blue-300 border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-blue-300" />
                  <span className="hidden md:inline text-slate-200">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-slate-200">Light Mode</span>
                </>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3 bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow">
                  {user.profile?.name ? user.profile.name.charAt(0) : (user.login_id || 'U').charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                    {user.profile?.name || user.login_id}
                    {user.role === 'superadmin' && (
                      <span className="bg-amber-500 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">SUPER ADMIN</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-300">
                      ID: {user.login_id} • {user.role} ({userDeptCode})
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs"
              >
                <User className="w-4 h-4" />
                <span>Portal Login</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
