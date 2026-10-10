import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ROLES } from '@/lib/constants';

// Layouts & Nav
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Public & Auth Pages
import LandingPage from '@/pages/public/LandingPage';
import AboutPage from '@/pages/public/AboutPage';
import HowItWorksPage from '@/pages/public/HowItWorksPage';
import NotFoundPage from '@/pages/public/NotFoundPage';
import UnauthorizedPage from '@/pages/public/UnauthorizedPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Donor Pages
import DonorDashboardPage from '@/pages/donor/DonorDashboardPage';
import DonationHistoryPage from '@/pages/donor/DonationHistoryPage';

// Patient Pages
import PatientRequestsPage from '@/pages/patient/PatientRequestsPage';
import CreateRequestPage from '@/pages/patient/CreateRequestPage';
import PatientProfilePage from '@/pages/patient/PatientProfilePage';
import InventorySearchPage from '@/pages/patient/InventorySearchPage';

// Hospital Pages
import HospitalInventoryPage from '@/pages/hospital/HospitalInventoryPage';
import HospitalRequestsPage from '@/pages/hospital/HospitalRequestsPage';
import OpenRequestsPage from '@/pages/hospital/OpenRequestsPage';
import HospitalProfilePage from '@/pages/hospital/HospitalProfilePage';

// Admin Pages
import AdminDonorsPage from '@/pages/admin/AdminDonorsPage';
import AdminHospitalsPage from '@/pages/admin/AdminHospitalsPage';
import CreateHospitalPage from '@/pages/admin/CreateHospitalPage';

// Notifications
import NotificationsPage from '@/pages/notifications/NotificationsPage';

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col bg-white">
    <Navbar />
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export const router = createBrowserRouter([
  // Public Routes
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/how-it-works', element: <HowItWorksPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/unauthorized', element: <UnauthorizedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // Authenticated Notifications (accessible to all logged-in roles)
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <NotificationsPage /> }],
  },

  // Donor Dashboard Routes
  {
    path: '/donor',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.DONOR]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DonorDashboardPage /> },
      { path: 'history', element: <DonationHistoryPage /> },
    ],
  },

  // Patient Dashboard Routes
  {
    path: '/patient',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PatientRequestsPage /> },
      { path: 'new-request', element: <CreateRequestPage /> },
      { path: 'profile', element: <PatientProfilePage /> },
      { path: 'inventory-search', element: <InventorySearchPage /> },
    ],
  },

  // Hospital Dashboard Routes
  {
    path: '/hospital',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.HOSPITAL]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HospitalInventoryPage /> },
      { path: 'requests', element: <HospitalRequestsPage /> },
      { path: 'open-requests', element: <OpenRequestsPage /> },
      { path: 'profile', element: <HospitalProfilePage /> },
    ],
  },

  // Admin Dashboard Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDonorsPage /> },
      { path: 'hospitals', element: <AdminHospitalsPage /> },
      { path: 'create-hospital', element: <CreateHospitalPage /> },
      { path: 'open-requests', element: <OpenRequestsPage /> },
    ],
  },
]);

export default router;
