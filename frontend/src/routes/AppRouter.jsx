import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ROLE_HOME_ROUTES } from '@/utils/roleGuards';

// Auth Pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const UnauthorizedPage = lazy(() => import('@/pages/auth/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Student Pages
const StudentDashboard = lazy(() => import('@/pages/student/DashboardPage'));
const StudentCatalog = lazy(() => import('@/pages/student/CatalogPage'));
const StudentItemDetail = lazy(() => import('@/pages/student/ItemDetailPage'));
const StudentCart = lazy(() => import('@/pages/student/CartPage'));
const StudentCheckout = lazy(() => import('@/pages/student/CheckoutPage'));
const StudentOrders = lazy(() => import('@/pages/student/OrdersPage'));
const StudentOrderDetail = lazy(() => import('@/pages/student/OrderDetailPage'));
const StudentProfile = lazy(() => import('@/pages/student/ProfilePage'));

// Faculty Pages
const FacultyDashboard = lazy(() => import('@/pages/faculty/DashboardPage'));
const FacultyCheckout = lazy(() => import('@/pages/faculty/CheckoutPage'));

// Shop Admin Pages
const ShopAdminDashboard = lazy(() => import('@/pages/shopadmin/DashboardPage'));
const ShopAdminInventory = lazy(() => import('@/pages/shopadmin/InventoryPage'));
const ShopAdminOrders = lazy(() => import('@/pages/shopadmin/OrdersPage'));
const ShopAdminSlots = lazy(() => import('@/pages/shopadmin/SlotsPage'));
const ShopAdminReports = lazy(() => import('@/pages/shopadmin/ReportsPage'));
const ShopAdminProfile = lazy(() => import('@/pages/shopadmin/ProfilePage'));

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'));
const AdminAccounts = lazy(() => import('@/pages/admin/AccountsPage'));
const AdminSettings = lazy(() => import('@/pages/admin/SettingsPage'));
const AdminAuditLog = lazy(() => import('@/pages/admin/AuditLogPage'));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  }>
    {children}
  </Suspense>
);

export default function AppRouter() {
  const { user, role } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          user && role
            ? <Navigate to={ROLE_HOME_ROUTES[role] || '/login'} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Auth routes */}
      <Route path="/login" element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} />
      <Route path="/forgot-password" element={<SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper>} />
      <Route path="/unauthorized" element={<SuspenseWrapper><UnauthorizedPage /></SuspenseWrapper>} />

      {/* Student routes */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student']}>
          <SuspenseWrapper>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="catalog" element={<StudentCatalog />} />
              <Route path="catalog/:itemId" element={<StudentItemDetail />} />
              <Route path="cart" element={<StudentCart />} />
              <Route path="checkout" element={<StudentCheckout />} />
              <Route path="orders" element={<StudentOrders />} />
              <Route path="orders/:orderId" element={<StudentOrderDetail />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </SuspenseWrapper>
        </ProtectedRoute>
      } />

      {/* Faculty routes */}
      <Route path="/faculty/*" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <SuspenseWrapper>
            <Routes>
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="catalog" element={<StudentCatalog />} />
              <Route path="catalog/:itemId" element={<StudentItemDetail />} />
              <Route path="cart" element={<StudentCart />} />
              <Route path="checkout" element={<FacultyCheckout />} />
              <Route path="orders" element={<StudentOrders />} />
              <Route path="orders/:orderId" element={<StudentOrderDetail />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </SuspenseWrapper>
        </ProtectedRoute>
      } />

      {/* Shop Admin routes */}
      <Route path="/shopadmin/*" element={
        <ProtectedRoute allowedRoles={['shopadmin']}>
          <SuspenseWrapper>
            <Routes>
              <Route path="dashboard" element={<ShopAdminDashboard />} />
              <Route path="inventory" element={<ShopAdminInventory />} />
              <Route path="orders" element={<ShopAdminOrders />} />
              <Route path="slots" element={<ShopAdminSlots />} />
              <Route path="reports" element={<ShopAdminReports />} />
              <Route path="profile" element={<ShopAdminProfile />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </SuspenseWrapper>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <SuspenseWrapper>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="accounts" element={<AdminAccounts />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="audit-log" element={<AdminAuditLog />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </SuspenseWrapper>
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<SuspenseWrapper><NotFoundPage /></SuspenseWrapper>} />
    </Routes>
  );
}
