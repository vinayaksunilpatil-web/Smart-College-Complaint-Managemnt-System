import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import SubmitComplaint from '../pages/student/SubmitComplaint';
import MyComplaints from '../pages/student/MyComplaints';
import ComplaintDetails from '../pages/student/ComplaintDetails';

// Staff Pages
import StaffDashboard from '../pages/staff/StaffDashboard';
import DepartmentComplaints from '../pages/staff/DepartmentComplaints';
import StaffComplaintDetails from '../pages/staff/StaffComplaintDetails';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AllComplaints from '../pages/admin/AllComplaints';
import DepartmentsPage from '../pages/admin/DepartmentsPage';
import StaffPage from '../pages/admin/StaffPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import DbVizPage from '../pages/admin/DbVizPage';
import UsersPage from '../pages/admin/UsersPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student Portal (Role: student) */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="submit" element={<SubmitComplaint />} />
        <Route path="my-complaints" element={<MyComplaints />} />
        <Route path="complaints/:id" element={<ComplaintDetails />} />
      </Route>

      {/* Staff Portal (Role: staff, admin) */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="complaints" element={<DepartmentComplaints />} />
        <Route path="complaints/:id" element={<StaffComplaintDetails />} />
      </Route>

      {/* Admin Portal (Role: admin) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard"   element={<AdminDashboard />} />
        <Route path="complaints"  element={<AllComplaints />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="staff"       element={<StaffPage />} />
        <Route path="analytics"   element={<AnalyticsPage />} />
        <Route path="users"       element={<UsersPage />} />
        <Route path="db-viz"      element={<DbVizPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
