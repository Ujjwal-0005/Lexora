import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Lock, Sparkles, ArrowRight, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFilterStore } from '../store/filterStore'
import api from '../api/axios'
import Loader from '../components/Loader'
import StyledInput from '../components/StyledInput'

// Password strength check function
const getPasswordStrength = (password) => {
    const rules = [
        { key: 'length', ok: password.length >= 8 },
        { key: 'upper', ok: /[A-Z]/.test(password) },
        { key: 'lower', ok: /[a-z]/.test(password) },
        { key: 'number', ok: /\d/.test(password) },
        { key: 'special', ok: /[^A-Za-z0-9]/.test(password) },
    ]
    return { rules, strength: rules.filter(r => r.ok).length }
}

const strengthLevels = [
    { min: 0, max: 1, label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-500' },
    { min: 2, max: 2, label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500' },
    { min: 3, max: 3, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    { min: 4, max: 4, label: 'Good', color: 'bg-lime-500', textColor: 'text-lime-500' },
    { min: 5, max: 5, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-500' },
]

const useQuery = () => new URLSearchParams(useLocation().search)

const ResetPassword = () => {
    const navigate = useNavigate()
    const query = useQuery()
    const email = query.get('email') || ''
    const otp = query.get('otp') || ''
    const { darkMode } = useFilterStore()

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        new_password: '',
        password_confirmation: '',
    })

    const resetPasswordHeroPanelStyle = darkMode
        ? {
            background: 'linear-gradient(135deg, #0a1218 0%, #1a3a5a 25%, #2d5a7f 50%, #1a3a4f 75%, #0a0f1a 100%)',
        }
        : {
            background: 'linear-gradient(135deg, #0d1a2e 0%, #1a3a5f 25%, #2d5a8f 50%, #1a3a5f 75%, #0a1628 100%)',
        }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !otp) {
            toast.error('Reset session is invalid. Please request OTP again.')
            navigate('/forgot-password')
            return
        }

        try {
            setIsSubmitting(true)
            await api.post('/auth/reset-password', {
                email,
                otp,
                new_password: formData.new_password,
                password_confirmation: formData.password_confirmation,
            })
            toast.success('Password reset successful')
            navigate('/login')
        } catch (error) {
            const data = error.response?.data
            if (data?.errors) {
                const firstError = Object.values(data.errors).flat()[0]
                toast.error(firstError || 'Password reset failed')
            } else {
                const message = data?.message || 'Password reset failed'
                toast.error(message)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden font-sans transition-colors duration-300"
            style={{
                background: darkMode
                    ? 'linear-gradient(135deg, #030810 0%, #0a1220 15%, #1a2a4a 35%, #2a4a7a 50%, #1a2a5a 65%, #0a1220 85%, #030810 100%)'
                    : 'linear-gradient(135deg, #f5f8fc 0%, #f0f4f9 12%, #e8eef7 32%, #dfe8f4 50%, #e8eef7 68%, #f0f4f9 88%, #f5f8fc 100%)',
            }}
        >
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-30 dark:opacity-20" style={{
                    background: darkMode
                        ? 'radial-gradient(circle, rgba(100,200,255,0.3) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(168,212,248,0.4) 0%, transparent 70%)',
                }} />
                <div className="absolute -bottom-1/3 -right-1/3 w-full h-full rounded-full blur-3xl opacity-40 dark:opacity-25" style={{
                    background: darkMode
                        ? 'radial-gradient(circle, rgba(255,192,61,0.25) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(248,168,212,0.15) 0%, transparent 70%)',
                }} />
            </div>
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
                {/* Left Panel */}
                <div className="hidden md:flex md:w-[45%] relative overflow-hidden flex-col justify-between p-12 lg:p-14" style={resetPasswordHeroPanelStyle}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(255,192,61,0.35),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(100,220,255,0.3),transparent_32%),radial-gradient(circle_at_25%_80%,rgba(168,100,255,0.25),transparent_40%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,15,35,0.5)_0%,rgba(15,40,70,0.6)_50%,rgba(10,55,80,0.7)_100%)] pointer-events-none" />
                    <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#ffc966]/30 blur-3xl pointer-events-none opacity-90" />
                    <div className="absolute -bottom-24 -left-40 w-full h-96 rounded-full bg-[#64c8ff]/25 blur-3xl pointer-events-none opacity-80" />
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:40px_40px]" />

                    <div className="relative z-10 mt-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-white/40 bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-[0_8px_32px_rgba(255,192,61,0.25)]">
                            <Sparkles size={18} strokeWidth={2} />
                        </div>
                        <h1 className="text-[0.72rem] font-bold tracking-[0.28em] text-white/95 uppercase">
                            Set New Credentials
                        </h1>
                    </div>

                    <div className="relative z-10 max-w-[300px]">
                        <h2 className="font-display text-5xl lg:text-[2.5rem] font-bold text-white mb-4 tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                            Reset secure.
                        </h2>
                        <p className="text-white/90 text-[0.98rem] leading-relaxed max-w-[280px] font-light">
                            Create a new strong password to secure your account.
                        </p>
                    </div>

                    <div className="relative z-10 rounded-2xl border border-white/25 bg-gradient-to-br from-white/12 to-white/5 backdrop-blur-xl px-6 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:border-white/35 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 to-white/10 border border-white/40 flex items-center justify-center text-white shrink-0 shadow-[0_4px_16px_rgba(255,192,61,0.15)]">
                                <KeyRound size={18} strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Strong Security</p>
                                <p className="text-white/75 text-xs mt-0.5">Password strength indicators guide your choices.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full md:w-[55%] flex flex-col justify-start items-center p-8 lg:p-12 xl:p-16 relative bg-gradient-to-br from-[#fafbfc]/90 via-[#f8f4ef]/85 to-[#f5f0ea]/90 dark:from-[rgba(20,30,50,0.3)] dark:via-[rgba(20,35,55,0.25)] dark:to-[rgba(15,25,45,0.3)] overflow-y-auto scrollbar-hide min-h-[90vh]">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-l from-[#ffc966]/12 via-transparent to-transparent rounded-full blur-3xl opacity-60 dark:opacity-40" />
                        <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-[#64c8ff]/10 via-transparent to-transparent rounded-full blur-3xl opacity-50 dark:opacity-30" />
                    </div>
                    <div className="w-full max-w-[420px] relative z-10 bg-white/60 dark:bg-white/5 rounded-2xl p-8 lg:p-10 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                        <Link
                            to={`/verify-reset-otp?email=${encodeURIComponent(email)}`}
                            className="inline-flex items-center gap-2 text-[#ffc966] hover:text-[#ffb84d] dark:hover:text-[#ffd480] transition-colors mb-8 text-[0.8rem] font-semibold uppercase tracking-wide"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Verification
                        </Link>

                        <div className="mb-12 relative">
                            <div className="inline-block mb-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ffc966]/20 to-[#64c8ff]/20 border border-[#ffc966]/30 dark:border-[#ffc966]/40">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffc966] animate-pulse"></div>
                                    <span className="text-[0.7rem] font-bold text-[#a1804a] dark:text-[#ffc966] tracking-widest uppercase">Password Reset</span>
                                </div>
                            </div>
                            <h2 className="font-display text-[2.3rem] font-bold text-[#0a0f19] dark:text-white mb-3 tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                                Set New Password
                            </h2>
                            <p className="text-[0.87rem] text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                                Create a strong password with uppercase, lowercase, numbers, and special characters
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="mb-6 relative">
                                <label className="block text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={formData.new_password}
                                        onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                        placeholder="•••••••••••••••"
                                        className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-dark-600 px-0 py-2 text-sm text-[#111827] dark:text-white focus:ring-0 focus:border-[#ffc966] dark:focus:border-[#ffc966] transition-colors placeholder-gray-300 dark:placeholder-gray-500 outline-none"
                                        style={{ boxShadow: 'none' }}
                                    />
                                    <div
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </div>
                                </div>

                                {(() => {
                                    const pw = formData.new_password || ''
                                    const { rules, strength } = getPasswordStrength(pw)
                                    const current = strengthLevels.find(s => strength >= s.min && strength <= s.max)
                                    return (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Strength</span>
                                                <span className={`text-xs font-bold ${current?.textColor}`}>{current?.label}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(strength / 5) * 100}%` }}
                                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                                    className={`h-full ${current?.color}`}
                                                />
                                            </div>
                                            <div className="flex gap-1 pt-1">
                                                {rules.map((r) => (
                                                    <div
                                                        key={r.key}
                                                        className={`h-1 flex-1 rounded-full transition-all ${r.ok ? current?.color : 'bg-gray-200 dark:bg-gray-700'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>

                            <StyledInput
                                label="Confirm Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="•••••••••••••••"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                required
                                rightElement={(
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                )}
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full relative group py-[16px] px-6 rounded-xl font-bold tracking-[0.16em] uppercase text-[0.75rem] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 overflow-hidden mt-8"
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
                                        Update Password <ArrowRight size={16} strokeWidth={2.5} />
                                    </>
                                )}
                            </button>

                            <div className="mt-8 text-center pt-8 border-t border-gray-300/40 dark:border-white/15">
                                <Link
                                    to="/login"
                                    className="text-[0.75rem] font-bold text-[#ffc966] hover:text-[#ffb84d] dark:hover:text-[#ffd480] transition-colors duration-200 uppercase tracking-wider"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default ResetPassword
