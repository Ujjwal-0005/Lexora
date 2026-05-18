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
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-dark-900 font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#f4f5f7] dark:bg-dark-800 border-b border-gray-200 dark:border-dark-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-8 h-8 text-[#0f172a] dark:text-white" />
          <span className="font-serif text-xl font-bold text-gray-900 dark:text-white">Lexora</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-[#0f172a] dark:text-white" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6 dark:text-white" /> : <Menu className="w-6 h-6 dark:text-white" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -300 }}
          className={`fixed lg:sticky top-0 h-screen z-50 w-64 bg-[#f4f5f7] dark:bg-dark-800 border-r border-gray-200 dark:border-dark-600 transform transition-transform duration-300 lg:transform-none flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
          {/* Logo Section */}
          <Link to="/" className="block p-8 pb-10 hover:opacity-80 transition-opacity">
            <h1 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white tracking-wide mb-1">
              Lexora
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-snug">
              Premium Legal<br />Access
            </p>
          </Link>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.includes(item.path) && item.path !== '#'

              return (
                <Link
                  key={item.label}
                  to={item.path !== '#' ? item.path : '#'}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 ${isActive
                    ? 'bg-green-200/60 text-green-900 font-semibold dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-dark-700 font-medium'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-green-800 dark:text-green-400' : 'text-gray-500'}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-6 mt-auto flex flex-col gap-6">
            {isClient() && (
              <Link
                to="/lawyers"
                className="w-full bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] hover:bg-black dark:hover:bg-slate-600 dark:hover:text-white flex items-center justify-center gap-2 py-3 px-4 rounded-sm transition-colors shadow-md group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">New Consultation</span>
              </Link>
            )}

            <div className="flex flex-col gap-3">
              <button onClick={toggleDarkMode} className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-2">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={() => setRateOpen(true)} className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-2">
                <StarIcon className="w-4 h-4" />
                Rattings
              </button>
              <Link to="/help" className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-2">
                <HelpCircle className="w-4 h-4" />
                Help Center
              </Link>
              <Link to="/privacy" className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-2">
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
        <main className="flex-1 w-full min-h-screen p-6 lg:p-12 overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>
      <RateModal open={rateOpen} onClose={() => setRateOpen(false)} />
    </div>
  )
}

export default DashboardLayout

