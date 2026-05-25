import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Plus,
  HelpCircle,
  Shield
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rateOpen, setRateOpen] = useState(false)
  const isAdminPortal = isAdmin()

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
  const activeAdminRoute = location.pathname.split('/').pop() || 'dashboard'
  const adminRouteLabelMap = {
    dashboard: 'Executive Command Center',
    verifications: 'Verification Authority Desk',
    users: 'Identity Control Grid',
  }

  return (
    <div className={`${isAdminPortal ? 'admin-control-shell' : 'lawyer-portal-shell portal-shell'} min-h-screen font-sans`}>
      <div className={isAdminPortal ? 'lg:flex lg:items-stretch' : 'flex'}>
        <aside
          className={`${isAdminPortal ? 'admin-sidebar' : 'portal-sidebar'} fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col transform transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-72'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <button
            onClick={() => setSidebarCollapsed((value) => !value)}
            className={`hidden lg:inline-flex absolute top-6 right-0 translate-x-1/2 items-center justify-center h-11 w-11 rounded-full border transition-colors shadow-[0_12px_24px_rgba(15,23,42,0.12)] ${isAdminPortal
              ? 'border-[color:var(--admin-border)] bg-[color:var(--admin-surface)] text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] hover:border-[color:var(--admin-border-strong)]'
              : 'border-[color:var(--portal-border)] bg-[color:var(--portal-surface-elevated)] text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] hover:border-[color:var(--portal-border-strong)]'
              }`}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>

          {isAdminPortal ? (
            <>
              <Link
                to="/"
                className={`block transition-opacity border-b ${sidebarCollapsed ? 'px-4 py-6 lg:px-3 lg:py-6' : 'p-8 pb-8'} border-[color:var(--admin-border)]`}
              >
                {sidebarCollapsed ? (
                  <div className="flex items-center justify-center w-full">
                    <div className="admin-sidebar-logo-rail">
                      <span className="admin-sidebar-logo-mark">L</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="admin-brand-kicker">Executive Operations</p>
                    <h1 className="admin-brand-title">Lexora Grid</h1>
                    <p className="admin-brand-subtitle">Command-grade control architecture</p>
                  </>
                )}
              </Link>

              <nav className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'px-2 py-5 space-y-2' : 'px-4 py-6 space-y-2'}`}>
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname.includes(item.path) && item.path !== '#'

                  return (
                    <Link
                      key={item.label}
                      to={item.path !== '#' ? item.path : '#'}
                      onClick={() => setSidebarOpen(false)}
                      className={`admin-nav-link group flex items-center transition-all duration-300 border ${isActive ? 'admin-nav-link-active font-semibold' : 'font-medium'} ${sidebarCollapsed ? 'w-full justify-center px-0 py-3' : 'gap-4 px-4 py-3'}`}
                    >
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[color:var(--admin-accent)]' : 'text-[color:var(--admin-muted)] group-hover:text-[color:var(--admin-accent)]'}`} />
                      {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                    </Link>
                  )
                })}
              </nav>

              <div className={`mt-auto flex flex-col gap-5 border-t border-[color:var(--admin-border)] ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={toggleDarkMode}
                    className={`flex items-center text-sm transition-colors px-2 text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] ${sidebarCollapsed ? 'w-full justify-center' : 'gap-3'}`}
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {!sidebarCollapsed && (darkMode ? 'Light Mode' : 'Dark Mode')}
                  </button>
                  <button
                    onClick={() => setRateOpen(true)}
                    className={`flex items-center text-sm transition-colors px-2 text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] ${sidebarCollapsed ? 'w-full justify-center' : 'gap-3'}`}
                  >
                    <StarIcon className="w-4 h-4" />
                    {!sidebarCollapsed && 'Ratings'}
                  </button>
                  <Link
                    to="/help"
                    className={`flex items-center text-sm transition-colors px-2 text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] ${sidebarCollapsed ? 'w-full justify-center' : 'gap-3'}`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    {!sidebarCollapsed && 'Help Center'}
                  </Link>
                  <Link
                    to="/privacy"
                    className={`flex items-center text-sm transition-colors px-2 text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] ${sidebarCollapsed ? 'w-full justify-center' : 'gap-3'}`}
                  >
                    <Shield className="w-4 h-4" />
                    {!sidebarCollapsed && 'Privacy'}
                  </Link>
                  <button onClick={logout} className={`flex items-center text-sm transition-colors px-2 mt-2 text-red-400 hover:text-red-300 ${sidebarCollapsed ? 'w-full justify-center' : 'gap-3'}`}>
                    <LogOut className="w-4 h-4" />
                    {!sidebarCollapsed && 'Logout'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`block transition-opacity border-b ${sidebarCollapsed ? 'px-4 py-6 lg:px-3 lg:py-6' : 'p-8 pb-8'} border-[color:var(--portal-border)]`}
              >
                {sidebarCollapsed ? (
                  <div className="flex items-center justify-center w-full">
                    <div className="portal-sidebar-logo-rail">
                      <span className="portal-sidebar-logo-mark">L</span>
                    </div>
                  </div>
                ) : (
                  <>

                    <h1 className="portal-brand-title">Lexora</h1>
                    <p className="portal-brand-subtitle">Sovereign Legal Experience</p>
                  </>
                )}
              </Link>

              <nav className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'px-2 py-5 space-y-2' : 'px-4 py-6 space-y-2'}`}>
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname.includes(item.path) && item.path !== '#'

                  return (
                    <Link
                      key={item.label}
                      to={item.path !== '#' ? item.path : '#'}
                      onClick={() => setSidebarOpen(false)}
                      className={`portal-nav-link group flex items-center transition-all duration-300 border ${isActive ? 'portal-nav-link-active font-semibold' : 'font-medium'} ${sidebarCollapsed ? 'w-full justify-center px-0 py-3' : 'gap-4 px-4 py-3'}`}
                    >
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[color:var(--portal-gold)]' : 'text-[color:var(--portal-muted)] group-hover:text-[color:var(--portal-gold)]'}`} />
                      {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                    </Link>
                  )
                })}
              </nav>

              <div className={`mt-auto flex flex-col gap-6 border-t border-[color:var(--portal-border)] ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
                {isClient() && !sidebarCollapsed && (
                  <Link
                    to="/lawyers"
                    className="portal-btn-primary w-full flex items-center justify-center gap-2 rounded-full group"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold">New Consultation</span>
                  </Link>
                )}

                <div className="flex flex-col gap-3">
                  <button onClick={toggleDarkMode} className={`flex items-center text-sm transition-colors px-2 text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] ${sidebarCollapsed ? 'w-full justify-center' : 'gap-3'}`}>
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {!sidebarCollapsed && (darkMode ? 'Light Mode' : 'Dark Mode')}
                  </button>
                  <button onClick={() => setRateOpen(true)} className={`flex items-center text-sm transition-colors px-2 text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] ${sidebarCollapsed ? 'w-full justify-center' : 'gap-3'}`}>
                    <StarIcon className="w-4 h-4" />
                    {!sidebarCollapsed && 'Ratings'}
                  </button>
                  <Link to="/help" className={`flex items-center text-sm transition-colors px-2 text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] ${sidebarCollapsed ? 'w-full justify-center' : 'gap-3'}`}>
                    <HelpCircle className="w-4 h-4" />
                    {!sidebarCollapsed && 'Help Center'}
                  </Link>
                  <Link to="/privacy" className={`flex items-center text-sm transition-colors px-2 text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] ${sidebarCollapsed ? 'w-full justify-center' : 'gap-3'}`}>
                    <Shield className="w-4 h-4" />
                    {!sidebarCollapsed && 'Privacy'}
                  </Link>
                  <button onClick={logout} className={`flex items-center text-sm transition-colors px-2 mt-2 text-red-500 hover:text-red-700 ${sidebarCollapsed ? 'w-full justify-center' : 'gap-3'}`}>
                    <LogOut className="w-4 h-4" />
                    {!sidebarCollapsed && 'Logout'}
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>

        {sidebarOpen && (
          <div
            className={`fixed inset-0 z-40 lg:hidden ${isAdminPortal ? 'bg-[#03050a]/70 backdrop-blur-md' : 'bg-black/20 backdrop-blur-sm'}`}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className={`${isAdminPortal ? 'admin-main-shell min-w-0' : 'lawyer-portal-main portal-main'} relative flex-1 w-full min-h-screen p-5 lg:p-10 overflow-x-hidden`}>
          {!isAdminPortal && (
            <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[color:var(--portal-border)] text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] hover:border-[color:var(--portal-border-strong)] transition-colors"
                aria-label="Open navigation panel"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="text-right">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[color:var(--portal-muted)]">Portal Workspace</p>
                <h2 className="text-sm font-semibold text-[color:var(--portal-text)]">{isLawyer() ? 'Lawyer' : 'Client'} Portal</h2>
              </div>
            </div>
          )}

          {isAdminPortal && (
            <div className="admin-workspace-bar mb-6 lg:mb-8">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[color:var(--admin-border)] text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] hover:border-[color:var(--admin-border-strong)] transition-colors"
                  aria-label="Open navigation panel"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <p className="admin-workspace-kicker">Operational Workspace</p>
                  <h2 className="admin-workspace-title">{adminRouteLabelMap[activeAdminRoute] || 'Executive Workspace'}</h2>
                </div>
              </div>
              <div className="admin-workspace-status">
                <span className="admin-status-dot" />
                Secure session active
              </div>
            </div>
          )}

          {children || <Outlet />}
        </main>
      </div>

      <RateModal open={rateOpen} onClose={() => setRateOpen(false)} />
    </div>
  )
}

export default DashboardLayout

