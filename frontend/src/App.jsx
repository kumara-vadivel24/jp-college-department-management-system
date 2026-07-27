import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import FacultyPage from './pages/FacultyPage';
import Login from './pages/Login';
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
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
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
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
