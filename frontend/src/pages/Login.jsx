import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, Eye, EyeOff, Lock, BadgeCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import Loader from '../components/Loader'
import StyledInput from '../components/StyledInput'

const Login = () => {
  const navigate = useNavigate()
  const { setAuth, rememberMe: storedRememberMe } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [rememberSession, setRememberSession] = useState(storedRememberMe)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      const response = await api.post('/auth/login', formData)
      const result = response.data

      if (result.user && result.token) {
        setAuth(result.user, result.token, rememberSession)
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
    <div className="auth-premium-shell auth-premium-login min-h-screen pt-[100px]">
      <div className="auth-premium-atmosphere" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="auth-premium-frame"
      >
        <aside className="auth-premium-aside">
          <div className="auth-premium-brandline">
            <span className="auth-premium-badge">Private Client Gateway</span>
            <h1>Access Your Secure Legal Workspace</h1>
            <p>Confidential communication, protected records, and enterprise-grade account security from the first step.</p>
          </div>

          <div className="auth-premium-trustlist">
            <div className="auth-premium-trustitem">
              <Shield className="w-4 h-4" />
              <div>
                <p>Confidential by design</p>
                <span>Protected client access with encrypted session controls.</span>
              </div>
            </div>
            <div className="auth-premium-trustitem">
              <BadgeCheck className="w-4 h-4" />
              <div>
                <p>Professional legal environment</p>
                <span>Structured for serious matters and trusted advisory workflows.</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="auth-premium-main">
          <div className="auth-premium-card">
            <div className="auth-premium-card-head">
              <p className="auth-premium-kicker">Secure Client Access</p>
              <h2>Sign In</h2>
              <p>Enter your credentials to continue in a protected legal consultation environment.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-premium-form space-y-5">
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
                  <div onClick={() => setShowPassword(!showPassword)} className="auth-premium-icon-btn">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                }
              />

              <div className="flex items-center justify-between text-sm pt-1 mb-2">
                <label className="flex items-center gap-3 cursor-pointer auth-premium-check">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-4 h-4 rounded border-[color:var(--auth-border)] text-[color:var(--auth-accent)] focus:ring-[color:var(--auth-accent)] focus:ring-2"
                  />
                  <span className="text-[0.8rem] font-medium text-[color:var(--auth-muted)]">
                    Keep this session trusted
                  </span>
                </label>
                <Link to="/forgot-password" className="auth-premium-link text-[0.8rem] font-semibold">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="auth-premium-btn-primary w-full"
              >
                {isSubmitting ? <Loader size="sm" /> : (
                  <>
                    Sign In Securely <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>

              <div className="auth-premium-separator">
                <div className="h-px flex-1" />
                <span>Or continue with</span>
                <div className="h-px flex-1" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting}
                className="auth-premium-btn-secondary w-full"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.57c1.92-1.77 3.03-4.38 3.03-7.49 0-.72-.06-1.41-.2-2.08H12z" />
                  <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.3-2.57c-.92.62-2.1.98-3.31.98-2.54 0-4.7-1.72-5.47-4.03l-3.41 2.64A9.99 9.99 0 0012 22z" />
                  <path fill="#4A90E2" d="M6.53 13.94A6.01 6.01 0 016.22 12c0-.67.11-1.33.31-1.94L3.12 7.42A10 10 0 002 12c0 1.61.39 3.14 1.12 4.58l3.41-2.64z" />
                  <path fill="#FBBC05" d="M12 6.03c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 3.02 14.69 2 12 2A9.99 9.99 0 003.12 7.42l3.41 2.64c.77-2.31 2.93-4.03 5.47-4.03z" />
                </svg>
                {isGoogleSubmitting ? 'Connecting to Google...' : 'Sign In with Google'}
              </button>
            </form>

            <div className="mt-8 text-center auth-premium-footnote">
              <span>New to Lexora? </span>
              <Link to="/register" className="auth-premium-link font-semibold">
                Create your secure account
              </Link>
            </div>

            <div className="auth-premium-assurance">
              <div className="auth-premium-assurance-item">
                <Lock size={16} />
                <span>Confidential access</span>
              </div>
              <div className="auth-premium-assurance-item">
                <Shield size={16} />
                <span>Protected communication</span>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  )
}

export default Login
