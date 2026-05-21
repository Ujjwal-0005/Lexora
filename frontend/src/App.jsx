import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useFilterStore } from './store/filterStore'
import { useAuthStore } from './store/authStore'
import ScrollToTop from './components/ScrollToTop'

// Layouts
import AppLayout from './layouts/AppLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Public Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import GoogleAuthCallback from './pages/GoogleAuthCallback'
import VerifyOtp from './pages/VerifyOtp'
import ForgotPassword from './pages/ForgotPassword'
import VerifyResetOtp from './pages/VerifyResetOtp'
import ResetPassword from './pages/ResetPassword'
import LawyerList from './pages/LawyerList'
import LawyerProfile from './pages/LawyerProfile'
import BookConsultation from './pages/BookConsultation'
import Company from './pages/Company'

// Client Pages
import ClientDashboard from './pages/client/Dashboard'
import ClientConsultations from './pages/client/Consultations'
import ClientDocuments from './pages/client/Documents'
import ClientSettings from './pages/client/Settings'
import DocumentTypeSelection from './components/DocumentTypeSelection'
import DocumentFormWizard from './components/DocumentFormWizard'
import CustomDocumentRequestWizard from './components/CustomDocumentRequestWizard'

// Lawyer Pages
import LawyerDashboard from './pages/lawyer/Dashboard'
import LawyerConsultations from './pages/lawyer/Consultations'
import LawyerDocuments from './pages/lawyer/Documents'
import LawyerSettings from './pages/lawyer/Settings'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminVerifications from './pages/admin/Verifications'
import AdminUsers from './pages/admin/Users'
import Help from './pages/Help'
import HelpTicket from './pages/HelpTicket'
import LegalDocs from './pages/LegalDocs'

// Protected Route Component - For authenticated users only
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// Public Only Route Component - Redirect authenticated users away from auth pages
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'lawyer') return <Navigate to="/lawyer/dashboard" replace />
    return <Navigate to="/client/dashboard" replace />
  }

  return children
}

const App = () => {
  const { initDarkMode } = useFilterStore()
  const { user } = useAuthStore()

  useEffect(() => {
    initDarkMode()
  }, [])

  // Redirect helper based on role
  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard'
    if (user?.role === 'lawyer') return '/lawyer/dashboard'
    return '/client/dashboard'
  }

  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Landing />} />
            <Route path="login" element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } />
            <Route path="register" element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            } />
            <Route path="auth/google/callback" element={<GoogleAuthCallback />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="verify-reset-otp" element={<VerifyResetOtp />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="lawyers" element={<LawyerList />} />
            <Route path="lawyer/:id" element={<LawyerProfile />} />
          </Route>

          {/* Book Consultation - Protected */}
          <Route path="/book/:lawyerId" element={
            <ProtectedRoute allowedRoles={['client']}>
              <AppLayout>
                <BookConsultation />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Client Routes */}
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['client']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="consultations" element={<ClientConsultations />} />
            <Route path="documents" element={<ClientDocuments />} />
            <Route path="settings" element={<ClientSettings />} />
          </Route>

          {/* Document Routes - Shared */}
          <Route path="/documents" element={
            <ProtectedRoute allowedRoles={['client']}>
              <AppLayout>
                <ClientDocuments />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/documents/browse" element={
            <ProtectedRoute allowedRoles={['client']}>
              <DashboardLayout>
                <DocumentTypeSelection />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/documents/request/:typeId" element={
            <ProtectedRoute allowedRoles={['client']}>
              <DashboardLayout>
                <DocumentFormWizard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/documents/custom-request" element={
            <ProtectedRoute allowedRoles={['client']}>
              <DashboardLayout>
                <CustomDocumentRequestWizard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Public legal/help routes used by footer and sidebar links */}
          <Route path="/privacy" element={
            <AppLayout>
              <LegalDocs />
            </AppLayout>
          } />

          <Route path="/company" element={
            <AppLayout>
              <Company />
            </AppLayout>
          } />

          <Route path="/help" element={
            <AppLayout>
              <Help />
            </AppLayout>
          } />

          <Route path="/help/:id" element={
            <AppLayout>
              <HelpTicket />
            </AppLayout>
          } />

          {/* Lawyer Routes */}
          <Route path="/lawyer" element={
            <ProtectedRoute allowedRoles={['lawyer']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<LawyerDashboard />} />
            <Route path="consultations" element={<LawyerConsultations />} />
            <Route path="documents" element={<LawyerDocuments />} />
            <Route path="settings" element={<LawyerSettings />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="verifications" element={<AdminVerifications />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  )
}

export default App
