import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import { UserRole } from './types';

// Auth Pages
import Login from './pages/auth/Login';

// Common Pages
import Dashboard from './pages/Dashboard';

// Admin Pages
import AdminCourses from './pages/admin/Courses';
import AdminUsers from './pages/admin/Users';

// Teacher Pages
import TeacherCourseDetail from './pages/teacher/CourseDetail';
import TeacherCourses from './pages/teacher/Courses';
import TeacherAssignments from './pages/teacher/Assignments';

// Student Pages
import StudentCourseDetail from './pages/student/CourseDetail';
import StudentCourses from './pages/student/Courses';
import StudentAssignments from './pages/student/Assignments';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected Routes for All Users */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            
            {/* Teacher Routes */}
            <Route
              path="/teacher/courses"
              element={
                <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                  <TeacherCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/courses/:courseId"
              element={
                <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                  <TeacherCourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                  <TeacherAssignments />
                </ProtectedRoute>
              }
            />
            
            {/* Student Routes */}
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentCourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
