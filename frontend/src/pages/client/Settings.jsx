import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Bell, Shield, Save, Eye, EyeOff, AlertTriangle, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import DeleteAccountModal from '../../components/DeleteAccountModal'

const ClientSettings = () => {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const isSocialUser = !!(user?.auth_provider || user?.google_id)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [awaitingSetPasswordOtp, setAwaitingSetPasswordOtp] = useState(false)
  const [setPasswordOtp, setSetPasswordOtp] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteOtp, setDeleteOtp] = useState('')
  const [deleteMode, setDeleteMode] = useState('password') // 'password' or 'otp'
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    consultation_reminders: true,
    document_updates: true,
  })

  useEffect(() => {
    const prefs = user?.notification_preferences || {}
    setNotifications({
      email: prefs.email ?? true,
      sms: prefs.sms ?? false,
      consultation_reminders: prefs.consultation_reminders ?? true,
      document_updates: prefs.document_updates ?? true,
    })
  }, [user?.notification_preferences])

  const handleProfileUpdate = async (e) => {
    e?.preventDefault?.()

    if (!formData.name?.trim()) {
      toast.error('Name is required')
      return
    }

    setProfileLoading(true)
    try {
      const payload = {
        name: formData.name.trim(),
      }
      if (formData.phone?.trim()) {
        payload.phone = formData.phone.trim()
      }

      const response = await api.put('/auth/profile', payload)

      updateUser({ name: formData.name, phone: formData.phone })
      toast.success('Profile updated successfully!')
    } catch (error) {
      const validationErrors = error.response?.data?.errors
      const message = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : (error.response?.data?.message || 'Failed to update profile')
      toast.error(message)
    } finally {
      setProfileLoading(false)
    }
  }

  const saveNotifications = async () => {
    setSavingNotifications(true)
    try {
      const payload = {
        notification_preferences: notifications.email
          ? notifications
          : { ...notifications, sms: false, consultation_reminders: false, document_updates: false },
      }

      const response = await api.put('/auth/profile', payload)
      if (response.data?.user) {
        updateUser(response.data.user)
      }
      toast.success('Communication preferences saved')
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save communication preferences'
      toast.error(message)
    } finally {
      setSavingNotifications(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e?.preventDefault?.()

    // If social user, call set-password endpoint
    if (isSocialUser) {
      return handleSetPassword(e)
    }

    if (!formData.currentPassword?.trim()) {
      toast.error('Current password is required')
      return
    }

    if (!formData.newPassword?.trim()) {
      toast.error('New password is required')
      return
    }

    if (!formData.confirmPassword?.trim()) {
      toast.error('Confirm password is required')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    // Check password strength
    const rules = [
      { ok: formData.newPassword.length >= 8 },
      { ok: /[A-Z]/.test(formData.newPassword) },
      { ok: /[a-z]/.test(formData.newPassword) },
      { ok: /\d/.test(formData.newPassword) },
      { ok: /[^A-Za-z0-9]/.test(formData.newPassword) },
    ]
    const strength = rules.filter(r => r.ok).length

    if (strength < 3) {
      toast.error('Password is too weak. It must contain uppercase, lowercase, number, and special character')
      return
    }

    setPasswordLoading(true)
    try {
      await api.post('/auth/change-password', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword,
      })

      toast.success('Password updated successfully!')
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password'
      toast.error(message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    // If we haven't initiated OTP, request one first
    if (!awaitingSetPasswordOtp) {
      // Basic client-side checks before sending OTP
      if (!formData.newPassword?.trim()) {
        toast.error('New password is required')
        return
      }

      if (!formData.confirmPassword?.trim()) {
        toast.error('Confirm password is required')
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      const rules = [
        { ok: formData.newPassword.length >= 8 },
        { ok: /[A-Z]/.test(formData.newPassword) },
        { ok: /[a-z]/.test(formData.newPassword) },
        { ok: /\d/.test(formData.newPassword) },
        { ok: /[^A-Za-z0-9]/.test(formData.newPassword) },
      ]
      const strength = rules.filter(r => r.ok).length
      if (strength < 3) {
        toast.error('Password is too weak. It must contain uppercase, lowercase, number, and special character')
        return
      }

      setPasswordLoading(true)
      try {
        const resp = await api.post('/auth/set-password', {})
        if (resp.data?.otp_sent) {
          setAwaitingSetPasswordOtp(true)
          toast.success('OTP sent to your email. Enter it below to complete setting your password.')
        } else {
          toast.error(resp.data?.message || 'Unable to initiate set-password flow')
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to initiate set-password'
        toast.error(message)
      } finally {
        setPasswordLoading(false)
      }

      return
    }

    // If awaiting OTP, confirm OTP + set password
    if (!setPasswordOtp || setPasswordOtp.length !== 6) {
      toast.error('Please enter the 6-digit OTP sent to your email')
      return
    }

    setPasswordLoading(true)
    try {
      await api.post('/auth/set-password', {
        otp: setPasswordOtp,
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword,
      })

      toast.success('Password set successfully! You can now sign in with your password.')
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' })
      setAwaitingSetPasswordOtp(false)
      setSetPasswordOtp('')
      updateUser({ ...user, auth_provider: null })
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to set password'
      toast.error(message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    // Determine mode: social users use OTP flow, others use password
    const isSocial = !!(user?.auth_provider || user?.google_id)
    setDeleting(true)
    try {
      if (isSocial) {
        try {
          const resp = await api.delete('/auth/delete', { data: {}, headers: { 'X-Skip-Auth-Logout': '1' } })
          if (resp.data?.otp_sent) {
            setDeleteMode('otp')
            setShowDeleteModal(true)
            toast.success('OTP sent to your email. Enter it to confirm deletion.')
            return
          }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to initiate delete'
          toast.error(message)
          return
        }
      } else {
        setDeleteMode('password')
        setShowDeleteModal(true)
      }
    } finally {
      setDeleting(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      if (deleteMode === 'password') {
        if (!deletePassword) {
          toast.error('Please enter your current password')
          setDeleting(false)
          return
        }

        await api.delete('/auth/delete', { data: { current_password: deletePassword }, headers: { 'X-Skip-Auth-Logout': '1' } })
      } else {
        if (!deleteOtp) {
          toast.error('Please enter the OTP sent to your email')
          setDeleting(false)
          return
        }

        await api.delete('/auth/delete', { data: { otp: deleteOtp }, headers: { 'X-Skip-Auth-Logout': '1' } })
      }

      toast.success('Account deleted successfully')
      setShowDeleteModal(false)
      // clear local auth state and redirect to home
      useAuthStore.getState().logout()
      window.location.href = '/'
    } catch (error) {
      const validationErrors = error.response?.data?.errors
      const message = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : (error.response?.data?.message || 'Failed to delete account')
      toast.error(message)
    } finally {
      setDeleting(false)
      setDeletePassword('')
      setDeleteOtp('')
      setDeleteMode('password')
    }
  }

  const getPasswordStrength = (password) => {
    const rules = [
      { key: 'length', ok: password?.length >= 8, label: '8+ characters' },
      { key: 'upper', ok: /[A-Z]/.test(password), label: 'Uppercase letter' },
      { key: 'lower', ok: /[a-z]/.test(password), label: 'Lowercase letter' },
      { key: 'number', ok: /\d/.test(password), label: 'Number' },
      { key: 'special', ok: /[^A-Za-z0-9]/.test(password), label: 'Special character' },
    ]
    return { rules, strength: rules.filter(r => r.ok).length }
  }

  return (
    <div className="portal-page portal-appear max-w-5xl space-y-10">
      <div>
        <h2 className="portal-page-kicker mb-2">Preferences</h2>
        <h1 className="portal-page-title">Account Settings</h1>
      </div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="portal-card p-8"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[color:var(--portal-border)]">
          <div className="w-12 h-12 rounded-xl bg-[linear-gradient(145deg,#172743,#2e446e)] flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[color:var(--portal-text)]">Profile Information</h2>
            <p className="text-sm text-[color:var(--portal-muted)] font-medium">Update your personal and contact details</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[color:var(--portal-text)] mb-2">Full Name</label>
              <div className="flex items-center gap-3">
                <User className="pointer-events-none w-4 h-4 shrink-0 text-[color:var(--portal-muted)]" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="portal-input flex-1 min-w-0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[color:var(--portal-text)] mb-2">Email Address</label>
              <div className="flex items-center gap-3">
                <Mail className="pointer-events-none w-4 h-4 shrink-0 text-[color:var(--portal-muted)]" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="portal-input flex-1 min-w-0 bg-gray-100/80 dark:bg-black/30 text-[color:var(--portal-muted)] cursor-not-allowed"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[color:var(--portal-text)] mb-2">Phone Number</label>
              <div className="flex items-center gap-3">
                <Phone className="pointer-events-none w-4 h-4 shrink-0 text-[color:var(--portal-muted)]" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="portal-input flex-1 min-w-0"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <button type="button" onClick={handleProfileUpdate} disabled={profileLoading} className="portal-btn-primary disabled:opacity-50 py-3 px-6 font-semibold text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            {profileLoading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </motion.div>

      {/* Password Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="portal-card p-8"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[color:var(--portal-border)]">
          <div className="w-12 h-12 rounded-xl bg-[linear-gradient(140deg,#f4dfb3,#d9b064)] flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#92400e]" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[color:var(--portal-text)]">{isSocialUser ? 'Set Password' : 'Security & Password'}</h2>
            <p className="text-sm text-[color:var(--portal-muted)] font-medium">{isSocialUser ? 'You signed in via Google. Set a password to enable password sign-in.' : 'Ensure your account uses a strong password'}</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {!isSocialUser && (
              <div>
                <label className="block text-sm font-semibold text-[color:var(--portal-text)] mb-2">Current Password</label>
                <div className="flex items-center gap-3">
                  <Lock className="pointer-events-none w-4 h-4 shrink-0 text-[color:var(--portal-muted)]" />
                  <div className="relative flex-1 min-w-0">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="portal-input w-full pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[color:var(--portal-text)] mb-2">New Password</label>
              <div className="flex items-center gap-3">
                <Lock className="pointer-events-none w-4 h-4 shrink-0 text-[color:var(--portal-muted)]" />
                <div className="relative flex-1 min-w-0">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="portal-input w-full pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)]"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password strength meter */}
              {formData.newPassword && (() => {
                const { rules, strength } = getPasswordStrength(formData.newPassword)
                const strengthLevels = [
                  { min: 0, max: 1, label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-500' },
                  { min: 2, max: 2, label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500' },
                  { min: 3, max: 3, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
                  { min: 4, max: 4, label: 'Good', color: 'bg-lime-500', textColor: 'text-lime-500' },
                  { min: 5, max: 5, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-500' },
                ]
                const current = strengthLevels.find(s => strength >= s.min && strength <= s.max)
                return (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[color:var(--portal-muted)]">Password strength</span>
                      <span className={`text-xs font-semibold ${current?.textColor}`}>{current?.label}</span>
                    </div>
                    <div className="w-full bg-gray-200/80 dark:bg-black/35 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(strength / 5) * 100}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`h-full ${current?.color}`}
                      />
                    </div>
                    <div className="space-y-1 pt-1">
                      {rules.map((r) => (
                        <div key={r.key} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${r.ok ? current?.color : 'bg-gray-200 dark:bg-dark-700'}`} />
                          <span className={`text-xs ${r.ok ? 'text-[color:var(--portal-muted)]' : 'text-[color:var(--portal-muted)]/70'}`}>{r.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[color:var(--portal-text)] mb-2">Confirm Password</label>
              <div className="flex items-center gap-3">
                <Lock className="pointer-events-none w-4 h-4 shrink-0 text-[color:var(--portal-muted)]" />
                <div className="relative flex-1 min-w-0">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="portal-input w-full pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button type="button" onClick={handlePasswordUpdate} disabled={passwordLoading} className="portal-btn-primary disabled:opacity-50 py-3 px-6 font-semibold text-sm flex items-center gap-2">
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        {/* If awaiting OTP show the OTP input */}
        {awaitingSetPasswordOtp && (
          <div className="mt-4 p-4 border border-[color:var(--portal-border)] rounded-xl bg-white/45 dark:bg-black/25">
            <label className="block text-sm font-semibold mb-2">Enter OTP sent to your email</label>
            <div className="flex gap-2 items-center">
              <input type="text" value={setPasswordOtp} onChange={(e) => setSetPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="portal-input w-40 font-mono text-lg text-center" placeholder="000000" />
              <button type="button" onClick={() => setAwaitingSetPasswordOtp(false)} className="portal-btn-ghost py-2 px-3">Cancel</button>
              <button type="button" onClick={handleSetPassword} disabled={passwordLoading} className="portal-btn-primary py-2 px-3">{passwordLoading ? 'Processing...' : 'Confirm & Set Password'}</button>
              <button type="button" onClick={async () => {
                try {
                  const resp = await api.post('/auth/set-password', {})
                  if (resp.data?.otp_sent) {
                    toast.success('OTP resent to your email')
                  } else {
                    toast.error('Unable to resend OTP')
                  }
                } catch (err) { toast.error(err.response?.data?.message || 'Unable to resend OTP') }
              }} className="portal-btn-ghost py-2 px-3">Resend</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Delete Account Section (improved) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="portal-card p-8"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mt-1">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-xl text-[color:var(--portal-text)]">Delete Account</h2>
                <p className="text-sm text-[color:var(--portal-muted)]">Permanently remove your account and all associated data.</p>
              </div>
              <div className="text-sm text-[color:var(--portal-muted)]">Account: <span className="font-medium text-[color:var(--portal-text)]">{user?.email}</span></div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                  <p className="text-sm text-red-800 dark:text-red-300 font-medium">Important</p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-2">This will permanently delete your profile, consultations, documents, messages, ratings and all related data. This action cannot be undone.</p>
                </div>

                {/* Expanded confirmation area */}
                <div className="mt-4 p-4 border border-[color:var(--portal-border)] rounded-xl bg-white/45 dark:bg-black/20">
                  {!showDeleteModal && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">To proceed, click the button below. You will be asked to confirm with a password or a one-time code depending on how you signed up.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                          className={`py-2 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-2 ${deleting ? 'cursor-wait' : ''}`}
                        >
                          {deleting ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Delete Account
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/client/documents')}
                          className="portal-btn-ghost py-2 px-4 text-sm"
                        >
                          Export Data
                        </button>
                      </div>
                    </div>
                  )}

                  {showDeleteModal && (
                    <div className="mt-2 space-y-3">
                      {/* Show method */}
                      <p className="text-sm text-[color:var(--portal-muted)]">Confirmation method: <span className="font-medium">{deleteMode === 'password' ? 'Password' : 'Email OTP'}</span></p>

                      {deleteMode === 'password' ? (
                        <div className="space-y-2">
                          <label className="text-sm text-[color:var(--portal-text)]">Current Password</label>
                          <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="portal-input w-full"
                            placeholder="Enter current password"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-sm text-[color:var(--portal-text)]">Enter OTP</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={deleteOtp}
                              onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              className="portal-input flex-1 font-mono text-lg text-center"
                              placeholder="000000"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await api.delete('/auth/delete', { data: {}, headers: { 'X-Skip-Auth-Logout': '1' } })
                                  toast.success('OTP resent to your email')
                                } catch (err) {
                                  toast.error(err.response?.data?.message || 'Unable to resend OTP')
                                }
                              }}
                              className="portal-btn-ghost py-2 px-3 text-sm"
                            >Resend</button>
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <label className="text-sm text-[color:var(--portal-text)]">Type <span className="font-semibold">DELETE</span> to confirm</label>
                        <input
                          type="text"
                          value={typeof window !== 'undefined' ? window.localStorage.getItem('delete-confirm') || '' : ''}
                          onChange={(e) => {
                            if (typeof window !== 'undefined') window.localStorage.setItem('delete-confirm', e.target.value)
                          }}
                          placeholder="Type DELETE to enable"
                          className="portal-input w-full mt-1"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteOtp(''); if (typeof window !== 'undefined') window.localStorage.removeItem('delete-confirm') }} className="portal-btn-ghost py-2 px-4">Cancel</button>
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmText = typeof window !== 'undefined' ? window.localStorage.getItem('delete-confirm') || '' : ''
                            if (confirmText !== 'DELETE') { toast.error('Type DELETE to confirm'); return }
                            await confirmDelete()
                          }}
                          disabled={deleting}
                          className="py-2 px-4 bg-red-600 text-white rounded-xl disabled:opacity-50"
                        >{deleting ? 'Processing...' : 'Confirm Delete'}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-white/45 dark:bg-black/20 border border-[color:var(--portal-border)] rounded-xl p-4">
                  <p className="text-sm font-semibold text-[color:var(--portal-text)]">Before you delete</p>
                  <ul className="text-xs mt-2 space-y-2 list-disc ml-4 text-[color:var(--portal-muted)]">
                    <li>Export any documents you need.</li>
                    <li>Notify contacts if required.</li>
                    <li>Deleting is permanent.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  )
}

export default ClientSettings
