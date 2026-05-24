import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  Users,
  Scale,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Plus,
  HelpCircle,
  Shield,
  Briefcase
} from 'lucide-react'
import { Star as StarIcon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useFilterStore } from '../store/filterStore'
import { useState } from 'react'
import RateModal from '../components/RateModal'

const DashboardLayout = ({ children }) => {
  const { user, logout, isClient, isLawyer, isAdmin } = useAuthStore()
  const { darkMode, toggleDarkMode } = useFilterStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rateOpen, setRateOpen] = useState(false)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const getNavItems = () => {
    if (isAdmin()) {
      return [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/verifications', icon: Users, label: 'Verifications' },
        { path: '/admin/users', icon: Users, label: 'All Users' },
      ]
    }
    if (isLawyer()) {
      return [
        { path: '/lawyer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/lawyer/consultations', icon: Calendar, label: 'Consultations' },
        { path: '/lawyer/documents', icon: FileText, label: 'Documents' },
        { path: '/lawyer/settings', icon: Settings, label: 'Settings' },
      ]
    }
    return [
      { path: '/client/dashboard', icon: LayoutDashboard, label: 'Home' },
      { path: '/client/documents', icon: FileText, label: 'Drafts' },
      { path: '/client/consultations', icon: Calendar, label: 'Consultations' },
      { path: '/client/settings', icon: Settings, label: 'Settings' },
    ]
  }

  const navItems = getNavItems()

  return (
    <div className="lawyer-portal-shell portal-shell min-h-screen font-sans">
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -300 }}
          className={`portal-sidebar fixed lg:sticky top-0 h-screen z-50 w-72 transform transition-transform duration-300 lg:transform-none flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
          {/* Logo Section */}
          <Link to="/" className="block p-8 pb-8 hover:opacity-90 transition-opacity border-b border-[color:var(--portal-border)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--portal-gold)] mb-2">Client Command Center</p>
            <h1 className="font-serif text-[1.46rem] font-bold text-[color:var(--portal-text)] tracking-wide mb-1">
              Lexora
            </h1>
            <p className="text-[10px] font-bold text-[color:var(--portal-muted)] uppercase tracking-widest leading-snug">
              Sovereign Legal<br />Experience
            </p>
          </Link>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.includes(item.path) && item.path !== '#'

              return (
                <Link
                  key={item.label}
                  to={item.path !== '#' ? item.path : '#'}
                  onClick={() => setSidebarOpen(false)}
                  className={`portal-nav-link group flex items-center gap-4 px-4 py-3 transition-all duration-300 border ${isActive
                    ? 'portal-nav-link-active font-semibold'
                    : 'font-medium'
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[color:var(--portal-gold)]' : 'text-[color:var(--portal-muted)] group-hover:text-[color:var(--portal-gold)]'}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-6 mt-auto flex flex-col gap-6 border-t border-[color:var(--portal-border)]">
            {isClient() && (
              <Link
                to="/lawyers"
                className="portal-btn-primary w-full flex items-center justify-center gap-2 rounded-full group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">New Consultation</span>
              </Link>
            )}

            <div className="flex flex-col gap-3">
              <button onClick={toggleDarkMode} className="flex items-center gap-3 text-sm text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] transition-colors px-2">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={() => setRateOpen(true)} className="flex items-center gap-3 text-sm text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] transition-colors px-2">
                <StarIcon className="w-4 h-4" />
                Ratings
              </button>
              <Link to="/help" className="flex items-center gap-3 text-sm text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] transition-colors px-2">
                <HelpCircle className="w-4 h-4" />
                Help Center
              </Link>
              <Link to="/privacy" className="flex items-center gap-3 text-sm text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] transition-colors px-2">
                <Shield className="w-4 h-4" />
                Privacy
              </Link>
              <button onClick={logout} className="flex items-center gap-3 text-sm text-red-500 hover:text-red-700 transition-colors px-2 mt-2">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="lawyer-portal-main portal-main relative flex-1 w-full min-h-screen p-6 lg:p-12 overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>
      <RateModal open={rateOpen} onClose={() => setRateOpen(false)} />
    </div>
  )
}

export default DashboardLayout

