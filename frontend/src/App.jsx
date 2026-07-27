import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import FacultyPage from './pages/FacultyPage';
import Login from './pages/Login';
import ChangePasswordPage from './pages/ChangePasswordPage';
import PromotionPage from './pages/PromotionPage';
import {
  DepartmentsPage,
  CoursesPage,
  SubjectsPage,
  SemestersPage,
  AttendancePage,
  InternalMarksPage,
  SemesterMarksPage,
  AssignmentsPage,
  NotesPage,
  TimetablePage,
  ReportsPage,
  DownloadsPage,
  ImportExportPage,
  ApprovalsPage,
  SettingsPage,
  UserManagementPage,
  ActivityLogsPage,
  NotificationsPage
} from './pages/ErpModules';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isFirstLogin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Force first login password update redirect
  if (isFirstLogin && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      {/* 1. Explore Landing Page at URL '/' */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Standalone Login Page without Top Navbar */}
      <Route path="/login" element={<Login />} />

      {/* 3. First Login Change Password Route */}
      <Route 
        path="/change-password" 
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        } 
      />

      {/* 4. Protected College ERP Role-Based Dashboards & Admin Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/promotions" element={<PromotionPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/faculty" element={<FacultyPage />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/semesters" element={<SemestersPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/internal-marks" element={<InternalMarksPage />} />
                <Route path="/semester-marks" element={<SemesterMarksPage />} />
                <Route path="/assignments" element={<AssignmentsPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/timetable" element={<TimetablePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                <Route path="/import-export" element={<ImportExportPage />} />
                <Route path="/approvals" element={<ApprovalsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/user-management" element={<UserManagementPage />} />
                <Route path="/activity-logs" element={<ActivityLogsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/about" element={<Navigate to="/" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
