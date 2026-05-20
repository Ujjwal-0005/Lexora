import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Scale, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import { useFilterStore } from '../store/filterStore'
import Loader from '../components/Loader'
import StyledInput from '../components/StyledInput'

const Login = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { darkMode } = useFilterStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const loginHeroPanelStyle = darkMode
    ? {
      background: 'linear-gradient(135deg, #0a1218 0%, #1a3a5a 25%, #2d5a7f 50%, #1a3a4f 75%, #0a0f1a 100%)',
    }
    : {
      background: 'linear-gradient(135deg, #0d1a2e 0%, #1a3a5f 25%, #2d5a8f 50%, #1a3a5f 75%, #0a1628 100%)',
    }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      const response = await api.post('/auth/login', formData)
      const result = response.data

      if (result.user && result.token) {
        setAuth(result.user, result.token)
        toast.success('Welcome back!')

        // Redirect based on role
        const path = result.user.role === 'admin'
          ? '/admin/dashboard'
          : result.user.role === 'lawyer'
            ? '/lawyer/dashboard'
            : '/client/dashboard'

        navigate(path)
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Invalid email or password')
        setFormData((prev) => ({ ...prev, password: '' }))
        return
      }

      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSubmitting(true)
      const response = await api.get('/auth/google/redirect', {
        params: {
          intent: 'login',
        },
      })
      const redirectUrl = response.data?.url

      if (!redirectUrl) {
        toast.error('Unable to start Google sign-in. Please try again.')
        return
      }

      window.location.assign(redirectUrl)
    } catch (error) {
      const message = error.response?.data?.message || 'Google sign-in is currently unavailable.'
      toast.error(message)
      setIsGoogleSubmitting(false)
    }
  }



  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 pt-[112px] relative overflow-hidden font-sans transition-colors duration-300"
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, #030810 0%, #0a1220 15%, #1a2a4a 35%, #2a4a7a 50%, #1a2a5a 65%, #0a1220 85%, #030810 100%)'
          : 'linear-gradient(135deg, #f5f8fc 0%, #f0f4f9 12%, #e8eef7 32%, #dfe8f4 50%, #e8eef7 68%, #f0f4f9 88%, #f5f8fc 100%)',
      }}
    >
      {/* Background Decoration - Extraordinary */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Multiple animated gradient orbs */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-30 dark:opacity-20" style={{
          background: darkMode
            ? 'radial-gradient(circle, rgba(100,200,255,0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168,212,248,0.4) 0%, transparent 70%)',
        }} />
        <div className="absolute -bottom-1/3 -right-1/3 w-full h-full rounded-full blur-3xl opacity-40 dark:opacity-25" style={{
          background: darkMode
            ? 'radial-gradient(circle, rgba(255,192,61,0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(248,168,212,0.35) 0%, transparent 70%)',
        }} />
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-15" style={{
          background: darkMode
            ? 'radial-gradient(circle, rgba(168,100,255,0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(212,168,248,0.3) 0%, transparent 70%)',
        }} />
      </div>
      {/* Fine overlay pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)`,
        backgroundSize: darkMode ? '50px 50px' : '60px 60px',
        opacity: darkMode ? 0.05 : 0.03,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[950px] flex flex-col md:flex-row bg-white/95 dark:bg-[rgba(20,30,50,0.4)] shadow-[0_40px_120px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden max-h-[90vh] border border-white/50 dark:border-white/10 rounded-3xl backdrop-blur-xl"
      >
        {/* Left Panel - Extraordinary */}
        <div className="hidden md:flex md:w-[45%] relative overflow-hidden flex-col justify-between p-12 lg:p-14" style={loginHeroPanelStyle}>
          {/* Multi-layer dramatic effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(255,192,61,0.35),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(100,220,255,0.3),transparent_32%),radial-gradient(circle_at_25%_80%,rgba(168,100,255,0.25),transparent_40%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,15,35,0.5)_0%,rgba(15,40,70,0.6)_50%,rgba(10,55,80,0.7)_100%)] pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#ffc966]/30 blur-3xl pointer-events-none opacity-90" />
          <div className="absolute -bottom-24 -left-40 w-full h-96 rounded-full bg-[#64c8ff]/25 blur-3xl pointer-events-none opacity-80" />
          <div className="absolute top-1/4 -right-48 w-96 h-96 rounded-full bg-[#a864ff]/20 blur-3xl pointer-events-none opacity-60" />
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative z-10 mt-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/40 bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-[0_8px_32px_rgba(255,192,61,0.25)]">
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <h1 className="text-[0.72rem] font-bold tracking-[0.28em] text-white/95 uppercase">
              Lexora Sign In
            </h1>
          </div>

          <div className="relative z-10 max-w-[300px]">
            <h2 className="font-display text-5xl lg:text-[2.5rem] font-bold text-white mb-4 tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              Welcome back.
            </h2>
            <p className="text-white/90 text-[0.98rem] leading-relaxed max-w-[280px] font-light">
              Fast, secure access to your legal workspace.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/25 bg-gradient-to-br from-white/12 to-white/5 backdrop-blur-xl px-6 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:border-white/35 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 to-white/10 border border-white/40 flex items-center justify-center text-white shrink-0 shadow-[0_4px_16px_rgba(255,192,61,0.15)]">
                <Shield size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Protected authentication</p>
                <p className="text-white/75 text-xs mt-0.5">Encrypted login and session security.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Section - Extraordinary */}
        <div className="w-full md:w-[55%] flex flex-col justify-start items-center p-8 lg:p-12 xl:p-16 relative bg-gradient-to-br from-[#fafbfc]/90 via-[#f8f4ef]/85 to-[#f5f0ea]/90 dark:from-[rgba(20,30,50,0.3)] dark:via-[rgba(20,35,55,0.25)] dark:to-[rgba(15,25,45,0.3)] overflow-y-auto scrollbar-hide min-h-[90vh]">
          {/* Premium background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-l from-[#ffc966]/12 via-transparent to-transparent rounded-full blur-3xl opacity-60 dark:opacity-40" />
            <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-[#64c8ff]/10 via-transparent to-transparent rounded-full blur-3xl opacity-50 dark:opacity-30" />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#a864ff]/8 rounded-full blur-3xl opacity-40 dark:opacity-25" />
          </div>
          <div className="w-full max-w-[420px] relative z-10 bg-white/60 dark:bg-white/5 rounded-2xl p-8 lg:p-10 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="mb-12 relative">
              <div className="inline-block mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ffc966]/20 to-[#64c8ff]/20 border border-[#ffc966]/30 dark:border-[#ffc966]/40">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffc966] animate-pulse"></div>
                  <span className="text-[0.7rem] font-bold text-[#a1804a] dark:text-[#ffc966] tracking-widest uppercase">Secure Access</span>
                </div>
              </div>
              <h2 className="font-display text-[2.3rem] font-bold text-[#0a0f19] dark:text-white mb-3 tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                User Authentication
              </h2>
              <p className="text-[0.87rem] text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                Please provide your credentials to enter the digital vault.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <StyledInput
                label="Email / ID"
                type="email"
                placeholder="justice.v@firm.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <StyledInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="•••••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                rightElement={
                  <div onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                }
              />

              <div className="flex items-center justify-between text-sm pt-2 mb-10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-dark-500 text-[#ffc966] dark:text-[#ffc966] focus:ring-[#ffc966] focus:ring-2 transition-all"
                  />
                  <span className="text-[0.8rem] font-medium text-[#4b5563] dark:text-gray-300 group-hover:text-[#0a0f19] dark:group-hover:text-white transition-colors">
                    Keep me logged in
                  </span>
                </label>
                <Link to="/forgot-password" className="text-[0.8rem] font-semibold text-[#ffc966] hover:text-[#ffb84d] dark:hover:text-[#ffd480] transition-colors duration-200">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative group py-[16px] px-6 rounded-xl font-bold tracking-[0.16em] uppercase text-[0.75rem] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 overflow-hidden"
                style={{
                  background: !darkMode
                    ? 'linear-gradient(135deg, #0a0f19 0%, #1a2a3a 50%, #0a0f19 100%)'
                    : 'linear-gradient(135deg, #ffc966 0%, #ffb84d 50%, #ffc966 100%)',
                  color: !darkMode ? '#ffc966' : '#0a0f19',
                  boxShadow: darkMode
                    ? '0 20px 60px rgba(255, 201, 102, 0.3)'
                    : '0 20px 60px rgba(0, 0, 0, 0.2)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full" style={{ animation: 'none' }} />
                {isSubmitting ? <Loader size="sm" /> : (
                  <>
                    Secure Login <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/15" />
                <span className="text-[0.62rem] tracking-[0.2em] font-semibold text-gray-500 dark:text-gray-400 uppercase">Or continue with</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/15" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting}
                className="w-full py-[13px] px-5 rounded-xl border border-gray-300/80 dark:border-white/20 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-[#0a0f19] dark:text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-[0.78rem] tracking-wide"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.57c1.92-1.77 3.03-4.38 3.03-7.49 0-.72-.06-1.41-.2-2.08H12z" />
                  <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.3-2.57c-.92.62-2.1.98-3.31.98-2.54 0-4.7-1.72-5.47-4.03l-3.41 2.64A9.99 9.99 0 0012 22z" />
                  <path fill="#4A90E2" d="M6.53 13.94A6.01 6.01 0 016.22 12c0-.67.11-1.33.31-1.94L3.12 7.42A10 10 0 002 12c0 1.61.39 3.14 1.12 4.58l3.41-2.64z" />
                  <path fill="#FBBC05" d="M12 6.03c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 3.02 14.69 2 12 2A9.99 9.99 0 003.12 7.42l3.41 2.64c.77-2.31 2.93-4.03 5.47-4.03z" />
                </svg>
                {isGoogleSubmitting ? 'Connecting to Google...' : 'Sign In With Google'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-[0.75rem] text-gray-600 dark:text-gray-400 font-light">Don't have an account? </span>
              <Link to="/register" className="text-[0.75rem] font-bold text-[#ffc966] hover:text-[#ffb84d] dark:hover:text-[#ffd480] transition-colors duration-200 uppercase tracking-wider ml-1">
                Sign up
              </Link>
            </div>

            <div className="mt-16 flex items-center justify-center gap-16 border-t border-gray-300/40 dark:border-white/15 pt-10">
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#ffc966]/10 to-[#64c8ff]/10 group-hover:from-[#ffc966]/20 group-hover:to-[#64c8ff]/20 transition-all">
                  <Shield size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-[#ffc966] dark:group-hover:text-[#ffc966] transition-colors" />
                </div>
                <span className="text-[0.55rem] font-bold text-gray-600 dark:text-gray-400 tracking-widest uppercase group-hover:text-[#a1804a] dark:group-hover:text-[#ffc966] transition-colors">
                  256-Bit Encrypted
                </span>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#ffc966]/10 to-[#64c8ff]/10 group-hover:from-[#ffc966]/20 group-hover:to-[#64c8ff]/20 transition-all">
                  <Scale size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-[#64c8ff] dark:group-hover:text-[#64c8ff] transition-colors" />
                </div>
                <span className="text-[0.55rem] font-bold text-gray-600 dark:text-gray-400 tracking-widest uppercase group-hover:text-[#a1804a] dark:group-hover:text-[#64c8ff] transition-colors">
                  Regulatory Compliant
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
