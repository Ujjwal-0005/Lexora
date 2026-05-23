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
    <div className="lawyer-portal-shell min-h-screen bg-[#f8f9fa] dark:bg-[#040915] font-sans">
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -300 }}
          className={`fixed lg:sticky top-0 h-screen z-50 w-72 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_42%),linear-gradient(165deg,#050b1a_0%,#0b1326_56%,#111827_100%)] border-r border-gray-200 dark:border-[#334155]/70 transform transition-transform duration-300 lg:transform-none flex flex-col shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:shadow-[0_24px_65px_rgba(0,0,0,0.55)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
          {/* Logo Section */}
          <Link to="/" className="block p-8 pb-8 hover:opacity-90 transition-opacity border-b border-gray-200/80 dark:border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9a3412] dark:text-[#fbbf24] mb-2">Legal Workspace</p>
            <h1 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white tracking-wide mb-1">
              Lexora
            </h1>
            <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest leading-snug">
              Premium Legal<br />Access
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
                  className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 border ${isActive
                    ? 'bg-[#fff6df] text-[#92400e] font-semibold border-[#e7dcc6] shadow-sm dark:bg-[#fbbf24]/12 dark:text-[#b89627] dark:hover:text-[#916d11] dark:border-[#fbbf24]/35'
                    : 'text-gray-600 dark:text-slate-300 border-transparent hover:bg-white/65 dark:hover:bg-white/[0.06] hover:border-gray-200 dark:hover:border-white/10 font-medium'
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#b45309] dark:text-[#fbbf24]' : 'text-gray-500 dark:text-slate-400 group-hover:text-[#9a3412] dark:group-hover:text-[#fbbf24]'}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-6 mt-auto flex flex-col gap-6 border-t border-gray-200/80 dark:border-white/10">
            {isClient() && (
              <Link
                to="/lawyers"
                className="w-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] dark:from-[#fbbf24] dark:to-[#f59e0b] text-white dark:text-[#0f172a] hover:from-black hover:to-[#111827] dark:hover:from-[#f8d974] dark:hover:to-[#fbbf24] flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-all shadow-[0_14px_28px_rgba(15,23,42,0.22)] dark:shadow-[0_14px_28px_rgba(0,0,0,0.35)] group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">New Consultation</span>
              </Link>
            )}

            <div className="flex flex-col gap-3">
              <button onClick={toggleDarkMode} className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={() => setRateOpen(true)} className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2">
                <StarIcon className="w-4 h-4" />
                Ratings
              </button>
              <Link to="/help" className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2">
                <HelpCircle className="w-4 h-4" />
                Help Center
              </Link>
              <Link to="/privacy" className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2">
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
        <main className="lawyer-portal-main relative flex-1 w-full min-h-screen p-6 lg:p-12 overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 hidden dark:block bg-[radial-gradient(circle_at_12%_8%,rgba(251,191,36,0.10),transparent_38%),radial-gradient(circle_at_88%_5%,rgba(56,189,248,0.08),transparent_35%),linear-gradient(180deg,rgba(3,7,18,0.78)_0%,rgba(3,7,18,0.45)_55%,rgba(3,7,18,0.70)_100%)]"></div>
          {children || <Outlet />}
        </main>
      </div>
      <RateModal open={rateOpen} onClose={() => setRateOpen(false)} />
    </div>
  )
}

export default DashboardLayout

