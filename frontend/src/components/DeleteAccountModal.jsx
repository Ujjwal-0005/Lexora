import React from 'react'
import { AlertTriangle, Eye, EyeOff } from 'lucide-react'

const DeleteAccountModal = ({ open, onClose, mode = 'password', password, setPassword, otp, setOtp, onConfirm, loading }) => {
    const [showPassword, setShowPassword] = React.useState(false)
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 rounded-sm shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-dark-600">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0f172a] dark:text-white">Confirm Account Deletion</h3>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {mode === 'password'
                        ? 'Enter your password to confirm the permanent deletion of your account.'
                        : 'Enter the confirmation code sent to your email to complete the deletion.'}
                </p>

                {/* Warning Box */}
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-sm p-3 mb-6">
                    <p className="text-xs text-red-800 dark:text-red-300 font-medium">
                        ⚠️ This action cannot be undone. All your data will be permanently deleted.
                    </p>
                </div>

                {/* Input Section */}
                <div className="mb-6">
                    {mode === 'password' ? (
                        <>
                            <label className="block text-sm font-medium text-[#0f172a] dark:text-gray-300 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="input w-full pr-12 bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 focus:border-red-500 focus:ring-red-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <label className="block text-sm font-medium text-[#0f172a] dark:text-gray-300 mb-2">
                                Confirmation Code
                            </label>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    We sent a 6-digit code to your email. Please enter it below.
                                </p>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    maxLength="6"
                                    className="input w-full bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 focus:border-red-500 focus:ring-red-500 font-mono text-lg text-center tracking-widest"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2 px-4 rounded-sm border border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 font-medium text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2 px-4 rounded-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
                    >
                        {loading ? (mode === 'password' ? 'Deleting...' : 'Verifying...') : (mode === 'password' ? 'Delete Account' : 'Confirm & Delete')}
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                    {mode === 'otp' && "Didn't receive the code? Check your spam folder or try again."}
                </p>
            </div>
        </div>
    )
}

export default DeleteAccountModal
