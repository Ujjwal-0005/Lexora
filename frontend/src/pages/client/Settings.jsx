import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Bell, Shield, Save, Eye, EyeOff, AlertTriangle, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import DeleteAccountModal from '../../components/DeleteAccountModal'

const ClientSettings = () => {
  const { user, updateUser } = useAuthStore()
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
  const [loading, setLoading] = useState(false)
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
    e.preventDefault()

    if (!formData.name?.trim()) {
      toast.error('Name is required')
      return
    }

    setLoading(true)
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
      setLoading(false)
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
    e.preventDefault()

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

    setLoading(true)
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
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    // Determine mode: social users use OTP flow, others use password
    const isSocial = !!(user?.auth_provider || user?.google_id)
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
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div>
        <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-2">Preferences</h2>
        <h1 className="text-3xl font-serif font-bold text-[#0f172a] dark:text-white">Account Settings</h1>
      </div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-sm shadow-sm p-8"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-dark-600">
          <div className="w-12 h-12 rounded-sm bg-[#0f172a] flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#0f172a] dark:text-white">Profile Information</h2>
            <p className="text-sm text-gray-500 font-medium">Update your personal and contact details</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input pl-12 !rounded-sm bg-gray-50 border-gray-200 focus:border-[#0f172a] focus:ring-[#0f172a]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input pl-12 !rounded-sm bg-gray-100 border-gray-200 text-gray-500 dark:bg-dark-700 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#0f172a] dark:text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input pl-12 !rounded-sm bg-gray-50 border-gray-200 focus:border-[#0f172a] focus:ring-[#0f172a]"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="bg-[#0f172a] text-white hover:bg-black disabled:opacity-50 py-3 px-6 rounded-sm shadow-md font-semibold text-sm flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </motion.div>

      {/* Password Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-sm shadow-sm p-8"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-dark-600">
          <div className="w-12 h-12 rounded-sm bg-[#fef3c7] flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#92400e]" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#0f172a] dark:text-white">Security & Password</h2>
            <p className="text-sm text-gray-500 font-medium">Ensure your account uses a strong password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] dark:text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="input pl-12 pr-12 !rounded-sm bg-gray-50 border-gray-200 focus:border-[#0f172a] focus:ring-[#0f172a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] dark:text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="input pl-12 pr-12 !rounded-sm bg-gray-50 border-gray-200 focus:border-[#0f172a] focus:ring-[#0f172a]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
                      <span className="text-xs font-medium text-gray-400">Password strength</span>
                      <span className={`text-xs font-semibold ${current?.textColor}`}>{current?.label}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 overflow-hidden">
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
                          <span className={`text-xs ${r.ok ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'}`}>{r.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f172a] dark:text-gray-300 mb-2">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input !rounded-sm bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="bg-[#0f172a] text-white hover:bg-black disabled:opacity-50 py-3 px-6 rounded-sm shadow-md font-semibold text-sm flex items-center gap-2 transition-colors">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>

      {/* Delete Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-dark-800 border border-red-200 dark:border-red-900/30 rounded-sm shadow-sm p-8"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-red-100 dark:border-red-900/20">
          <div className="w-12 h-12 rounded-sm bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-red-600 dark:text-red-400">Delete Account</h2>
            <p className="text-sm text-gray-500 font-medium">Permanently remove your account and all associated data</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Warning Message */}
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-sm p-4">
            <p className="text-sm text-red-800 dark:text-red-300">
              <span className="font-semibold block mb-2">⚠️ Warning: This action cannot be undone</span>
              Deleting your account will permanently remove all your data including:
            </p>
            <ul className="text-sm text-red-800 dark:text-red-300 mt-3 ml-4 space-y-1 list-disc">
              <li>Your profile information and personal details</li>
              <li>All consultations and consultation history</li>
              <li>Document requests and submissions</li>
              <li>Messages and communications</li>
              <li>Ratings and reviews</li>
              <li>All account activity and preferences</li>
            </ul>
          </div>

          {/* Confirmation Message */}
          <div className="bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Once deleted, there is no way to recover your account. Please make sure you are absolutely certain before proceeding.
            </p>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-sm shadow-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            {deleting ? 'Processing...' : 'Delete My Account Permanently'}
          </button>
        </div>
      </motion.div>

      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteOtp('') }}
        mode={deleteMode}
        password={deletePassword}
        setPassword={setDeletePassword}
        otp={deleteOtp}
        setOtp={setDeleteOtp}
        onConfirm={confirmDelete}
        loading={deleting}
      />

    </div>
  )
}

export default ClientSettings
