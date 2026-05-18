import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Menu, X, Sun, Moon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useLogout } from '../hooks/useAuth'
import { useFilterStore } from '../store/filterStore'

const Navbar = () => {
  const { isAuthenticated, user, isAdmin, isLawyer } = useAuthStore()
  const { darkMode, toggleDarkMode } = useFilterStore()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const profileMenuRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const isScrollToggledPage = ['/', '/login', '/register'].includes(location.pathname)

  const handleLogout = () => {
    logout.mutate()
    navigate('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [profileOpen])

  useEffect(() => {
    if (!isScrollToggledPage) {
      setIsNavbarVisible(true)
      return
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY <= 10) {
        setIsNavbarVisible(true)
        lastScrollYRef.current = currentScrollY
        return
      }

      if (currentScrollY > lastScrollYRef.current && !mobileMenuOpen && !profileOpen) {
        setIsNavbarVisible(false)
      } else {
        setIsNavbarVisible(true)
      }

      lastScrollYRef.current = currentScrollY
    }

    lastScrollYRef.current = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isScrollToggledPage, mobileMenuOpen, profileOpen])

  useEffect(() => {
    if (!isScrollToggledPage) {
      setIsNavbarVisible(true)
      return
    }

    if (mobileMenuOpen || profileOpen) {
      setIsNavbarVisible(true)
    }
  }, [isScrollToggledPage, mobileMenuOpen, profileOpen])

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin/dashboard'
    if (isLawyer()) return '/lawyer/dashboard'
    return '/client/dashboard'
  }

  let navLinks = []

  if (isAuthenticated) {
    navLinks = [
      { path: '/lawyers', label: 'Discovery' },
      { path: getDashboardLink(), label: 'Dashboard' },
    ]

    // Hide the Documents link for admin users since it's not applicable
    if (!isAdmin || !isAdmin()) {
      navLinks.push({ path: '/client/documents', label: 'Documents' })
    }
  }

  // The active path logic
  const isActive = (path) => {
    if (path === '/lawyers' && location.pathname.includes('/lawyer')) return true;
    if (path === getDashboardLink() && location.pathname.includes('/dashboard')) return true;
    if (path === '/client/documents' && location.pathname.includes('/document')) return true;
    return location.pathname === path;
  }

  const headerClass = `dd-navbar-wrap ${isScrollToggledPage && !isNavbarVisible ? 'dd-navbar-wrap--hidden' : ''} ${isNavbarVisible ? 'dd-navbar-wrap--elevated' : ''}`

  return (
    <header className={headerClass}>
      <div className="dd-navbar">
        {/* Left Area: Logo & Links */}
        <div className="dd-nav-left">
          <Link to="/" className="dd-nav-logo">
            Royal Law
          </Link>

          {/* Desktop Links */}
          <nav className="dd-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`dd-nav-link ${isActive(link.path) ? 'dd-nav-link--active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="dd-nav-actions">
          {!isAuthenticated && (
            <Link to="/login" className="dd-btn-sign">
              Sign In
            </Link>
          )}

          <button
            onClick={toggleDarkMode}
            className="dd-btn-sign"
            style={{ marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 10px' }}
          >
            {darkMode ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
          </button>

          {isAuthenticated && user && (
            <div className="dd-user-menu-wrap" ref={profileMenuRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="dd-btn-user"
                title={user?.name}
                style={{ marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 10px' }}


              >
                <span className="dd-avatar-initials">
                  {user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U'}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="dd-user-dropdown"
                  >
                    <div className="dd-dropdown-header">
                      <p className="dd-dropdown-name">{user?.name}</p>
                      <p className="dd-dropdown-email">{user?.email}</p>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setProfileOpen(false)}
                      className="dd-dropdown-item"
                    >
                      <User size={14} /> Dashboard
                    </Link>
                    <div className="dd-dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="dd-dropdown-item dd-dropdown-item--danger"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="dd-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="dd-mobile-menu"
          >
            <div className="dd-mobile-menu-inner">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`dd-mobile-link ${isActive(link.path) ? 'dd-mobile-link--active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="dd-btn-sign dd-btn-sign--mobile"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
