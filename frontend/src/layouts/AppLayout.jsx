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
    '/help',
    '/privacy',
    '/lawyers',
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
    '/verify-reset-otp',
    '/reset-password',
  ]

  const showNavbar = publicNavbarPaths.includes(location.pathname) || location.pathname.startsWith('/help/') || isLandingPage

  return (
    <div className={`min-h-screen text-gray-900 dark:text-white transition-colors duration-300 ${isLandingPage ? 'bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#0f172a]' : 'bg-gray-50 dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_42%),linear-gradient(165deg,#050b1a_0%,#0b1326_56%,#111827_100%)]'}`}>
      {showNavbar && <Navbar />}
      <main className="min-h-[calc(100vh-64px-300px)]">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
