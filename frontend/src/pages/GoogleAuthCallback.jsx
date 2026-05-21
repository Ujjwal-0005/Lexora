import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import React from 'react'

const GoogleAuthCallback = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { setAuth } = useAuthStore()

    useEffect(() => {
        const completeGoogleAuth = async () => {
            const token = searchParams.get('token')
            const lawyerRegistrationToken = searchParams.get('lawyer_registration_token')
            const error = searchParams.get('error')

            if (error) {
                const errorMessages = {
                    oauth_failed: 'Google authentication failed. Please try again.',
                    email_missing: 'Your Google account does not provide an email address.',
                    lawyer_pending_verification: 'Your lawyer account is pending admin verification.',
                    account_exists: 'An account with this email already exists. Please sign in.',
                    account_not_found: 'No account found for this Google account. Please register to continue.',
                }

                toast.error(errorMessages[error] || 'Unable to authenticate with Google.')

                if (error === 'account_not_found') {
                    // If backend included email/role, prefill register page.
                    const email = searchParams.get('email')
                    const role = searchParams.get('role') || 'client'
                    const query = new URLSearchParams()
                    if (email) query.set('email', email)
                    if (role) query.set('role', role)

                    navigate(`/register?${query.toString()}`, { replace: true })
                    return
                }

                navigate('/login', { replace: true })
                return
            }

            if (lawyerRegistrationToken) {
                navigate(`/register?role=lawyer&google_lawyer_token=${encodeURIComponent(lawyerRegistrationToken)}`, { replace: true })
                return
            }

            if (!token) {
                toast.error('Missing Google authentication token.')
                navigate('/login', { replace: true })
                return
            }

            try {
                const response = await api.get('/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                const user = response.data?.user
                if (!user) {
                    throw new Error('User profile missing')
                }

                setAuth(user, token)
                toast.success('Signed in with Google successfully.')

                const path = user.role === 'admin'
                    ? '/admin/dashboard'
                    : user.role === 'lawyer'
                        ? '/lawyer/dashboard'
                        : '/client/dashboard'

                navigate(path, { replace: true })
            } catch {
                toast.error('Google sign-in completed but profile could not be loaded.')
                navigate('/login', { replace: true })
            }
        }

        completeGoogleAuth()
    }, [navigate, searchParams, setAuth])

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#f5f8fc] via-[#e8eef7] to-[#f0f4f9] dark:from-[#030810] dark:via-[#1a2a4a] dark:to-[#0a1220]">
            <div className="w-full max-w-md rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-8 text-center">
                <h1 className="text-xl font-bold text-[#0a0f19] dark:text-white mb-3">Completing Google Sign-In</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Please wait while we securely sign you in.</p>
            </div>
        </div>
    )
}

export default GoogleAuthCallback
