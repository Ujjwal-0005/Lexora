import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuthStore } from '../store/authStore'

const AppLayout = ({ children }) => {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  // Show landing navbar on public/auth pages and the lawyers list regardless of auth
  const publicNavbarPaths = [
    '/',
    '/company',
    '/lawyers',
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
    '/verify-reset-otp',
    '/reset-password',
  ]

  const showNavbar = publicNavbarPaths.includes(location.pathname) || isLandingPage

  return (
    <div className={`min-h-screen text-gray-900 dark:text-white transition-colors duration-300 ${isLandingPage ? 'bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#0f172a]' : 'bg-gray-50 dark:bg-dark-900'}`}>
      {showNavbar && <Navbar />}
      <main className="min-h-[calc(100vh-64px-300px)]">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
