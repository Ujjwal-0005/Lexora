import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Scale, ShieldCheck, Plus, Trash2, ArrowRight, Lock, BadgeCheck } from 'lucide-react'
import { useRegister } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'
import { useFilterStore } from '../store/filterStore'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'
import StyledInput from '../components/StyledInput'
import api from '../api/axios'

const Register = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const register = useRegister()
    const { setAuth } = useAuthStore()
    const { darkMode } = useFilterStore()
    const [role, setRole] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
    const [isGoogleLawyerLoading, setIsGoogleLawyerLoading] = useState(false)
    const [googleLawyerToken, setGoogleLawyerToken] = useState('')
    const [documentTypes, setDocumentTypes] = useState([])

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        license_number: '',
        bar_council_id: '',
        years_of_experience: '',
        bio: '',
        consultation_fee: '',
        consultation_fee_60: '',
        consultation_fee_90: '',
    })

    const [educationList, setEducationList] = useState([{ degree: '', university: '' }])
    const [admissionsAwards, setAdmissionsAwards] = useState([])
    const [admissionsDraft, setAdmissionsDraft] = useState('')
    const [cities, setCities] = useState([])
    const [citiesDraft, setCitiesDraft] = useState('')
    const [coreCompetencies, setCoreCompetencies] = useState([])
    const [competencyDraft, setCompetencyDraft] = useState('')
    const [selectedPortalDocs, setSelectedPortalDocs] = useState([])
    const [customDocName, setCustomDocName] = useState('')
    const [customDocFee, setCustomDocFee] = useState('')
    const [customDocuments, setCustomDocuments] = useState([])
    const [profilePhoto, setProfilePhoto] = useState(null)

    useEffect(() => {
        const fetchDocumentTypes = async () => {
            try {
                const response = await api.get('/document-types')
                const docs = response.data?.documentTypes || []
                setDocumentTypes(docs)
            } catch {
                setDocumentTypes([])
            }
        }

        fetchDocumentTypes()
    }, [])

    useEffect(() => {
        const roleParam = searchParams.get('role')
        const tokenParam = searchParams.get('google_lawyer_token')

        const emailParam = searchParams.get('email')

        if (roleParam === 'lawyer') {
            setRole('lawyer')
        } else if (roleParam === 'client') {
            setRole('client')
        }

        if (emailParam) {
            setFormData((prev) => ({ ...prev, email: emailParam }))
        }

        if (!tokenParam) {
            return
        }

        let mounted = true

        const hydrateGoogleLawyerProfile = async () => {
            try {
                setIsGoogleLawyerLoading(true)
                const response = await api.get('/auth/google/lawyer-profile', {
                    params: { token: tokenParam },
                })

                if (!mounted) {
                    return
                }

                setGoogleLawyerToken(tokenParam)
                setFormData((prev) => ({
                    ...prev,
                    name: response.data?.name || prev.name,
                    email: response.data?.email || prev.email,
                    password: '',
                    password_confirmation: '',
                }))
            } catch {
                if (!mounted) {
                    return
                }

                toast.error('Google professional signup session expired. Please start again.')
                navigate('/register', { replace: true })
            } finally {
                if (mounted) {
                    setIsGoogleLawyerLoading(false)
                }
            }
        }

        hydrateGoogleLawyerProfile()

        return () => {
            mounted = false
        }
    }, [navigate, searchParams])

    const sanitizedEducation = useMemo(() => {
        return educationList
            .map((item) => ({
                degree: item.degree.trim(),
                university: item.university.trim(),
            }))
            .filter((item) => item.degree && item.university)
    }, [educationList])

    const documentExpertise = useMemo(() => {
        const normalizedPortalDocs = selectedPortalDocs
            .map((doc) => ({
                name: doc.name,
                fee: Number(doc.fee),
                source: 'portal',
            }))
            .filter((doc) => doc.name && Number.isFinite(doc.fee) && doc.fee >= 0)

        const normalizedCustomDocs = customDocuments
            .map((doc) => ({
                name: doc.name,
                fee: Number(doc.fee),
                source: 'custom',
            }))
            .filter((doc) => doc.name && Number.isFinite(doc.fee) && doc.fee >= 0)

        return [...normalizedPortalDocs, ...normalizedCustomDocs]
    }, [selectedPortalDocs, customDocuments])

    const handleEducationChange = (index, key, value) => {
        setEducationList((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
    }

    const addEducationRow = () => {
        setEducationList((prev) => [...prev, { degree: '', university: '' }])
    }

    const removeEducationRow = (index) => {
        setEducationList((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
    }

    const togglePortalDocument = (name) => {
        setSelectedPortalDocs((prev) => {
            const exists = prev.find((item) => item.name === name)
            if (exists) {
                return prev.filter((item) => item.name !== name)
            }

            return [...prev, { name, fee: '' }]
        })
    }

    const updatePortalDocumentFee = (name, fee) => {
        setSelectedPortalDocs((prev) => prev.map((item) => (item.name === name ? { ...item, fee } : item)))
    }

    const addCustomDocument = () => {
        const name = customDocName.trim()
        const feeNumber = Number(customDocFee)

        if (!name) {
            toast.error('Custom document name is required.')
            return
        }

        if (!Number.isFinite(feeNumber) || feeNumber < 0) {
            toast.error('Custom document fee must be a valid amount.')
            return
        }

        const existsInPortal = selectedPortalDocs.some((doc) => doc.name.toLowerCase() === name.toLowerCase())
        const existsInCustom = customDocuments.some((doc) => doc.name.toLowerCase() === name.toLowerCase())

        if (existsInPortal || existsInCustom) {
            toast.error('This document is already added.')
            return
        }

        setCustomDocuments((prev) => [...prev, { name, fee: feeNumber }])
        setCustomDocName('')
        setCustomDocFee('')
    }

    const removeCustomDocument = (name) => {
        setCustomDocuments((prev) => prev.filter((doc) => doc.name !== name))
    }

    const addAdmissionsAward = () => {
        const value = admissionsDraft.trim()

        if (!value) {
            return
        }

        const exists = admissionsAwards.some((item) => item.toLowerCase() === value.toLowerCase())
        if (exists) {
            setAdmissionsDraft('')
            return
        }

        setAdmissionsAwards((prev) => [...prev, value])
        setAdmissionsDraft('')
    }

    const removeAdmissionsAward = (value) => {
        setAdmissionsAwards((prev) => prev.filter((item) => item !== value))
    }

    const addCity = () => {
        const value = citiesDraft.trim()

        if (!value) {
            return
        }

        const exists = cities.some((item) => item.toLowerCase() === value.toLowerCase())
        if (exists) {
            setCitiesDraft('')
            return
        }

        setCities((prev) => [...prev, value])
        setCitiesDraft('')
    }

    const removeCity = (value) => {
        setCities((prev) => prev.filter((item) => item !== value))
    }

    const addCoreCompetency = () => {
        const value = competencyDraft.trim()

        if (!value) {
            return
        }

        const exists = coreCompetencies.some((item) => item.toLowerCase() === value.toLowerCase())
        if (exists) {
            setCompetencyDraft('')
            return
        }

        setCoreCompetencies((prev) => [...prev, value])
        setCompetencyDraft('')
    }

    const removeCoreCompetency = (value) => {
        setCoreCompetencies((prev) => prev.filter((item) => item !== value))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!role) {
            toast.error('Please select an entrance (role).')
            return
        }

        const sanitizedPhone = (formData.phone || '').replace(/\D/g, '')
        if (sanitizedPhone && sanitizedPhone.length !== 10) {
            toast.error('Phone number must be exactly 10 digits.')
            return
        }

        const commonPayload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
            phone: sanitizedPhone,
            role,
        }

        if (role === 'lawyer') {
            if (!profilePhoto) {
                toast.error('Profile photo is required for lawyer registration.')
                return
            }

            if (sanitizedEducation.length === 0) {
                toast.error('Add at least one educational qualification with university.')
                return
            }

            if (admissionsAwards.length === 0) {
                toast.error('Add at least one admission or award.')
                return
            }

            if (cities.length === 0) {
                toast.error('Add at least one city.')
                return
            }

            if (coreCompetencies.length === 0) {
                toast.error('Add at least one core competency.')
                return
            }

            if (documentExpertise.length === 0) {
                toast.error('Add at least one document expertise entry with fee.')
                return
            }

            if (!formData.consultation_fee || Number(formData.consultation_fee) < 0) {
                toast.error('Consultation fee per 30 minutes is required.')
                return
            }

            if (!formData.consultation_fee_60 || Number(formData.consultation_fee_60) < 0) {
                toast.error('Consultation fee per 60 minutes is required.')
                return
            }

            if (!formData.consultation_fee_90 || Number(formData.consultation_fee_90) < 0) {
                toast.error('Consultation fee per 90 minutes is required.')
                return
            }

            const formPayload = new FormData()
            if (googleLawyerToken) {
                formPayload.append('google_registration_token', googleLawyerToken)
                formPayload.append('phone', sanitizedPhone)
            } else {
                Object.entries(commonPayload).forEach(([key, value]) => {
                    formPayload.append(key, value ?? '')
                })
            }

            formPayload.append('license_number', formData.license_number)
            formPayload.append('bar_council_id', formData.bar_council_id)
            formPayload.append('years_of_experience', formData.years_of_experience)
            formPayload.append('bio', formData.bio)
            formPayload.append('consultation_fee', formData.consultation_fee)
            formPayload.append('consultation_fee_60', formData.consultation_fee_60)
            formPayload.append('consultation_fee_90', formData.consultation_fee_90)
            formPayload.append('educational_qualifications', JSON.stringify(sanitizedEducation))
            formPayload.append('admissions_awards', JSON.stringify(admissionsAwards))
            formPayload.append('cities', JSON.stringify(cities))
            formPayload.append('core_competencies', JSON.stringify(coreCompetencies))
            formPayload.append('document_expertise', JSON.stringify(documentExpertise))
            formPayload.append('profile_photo', profilePhoto)

            try {
                if (googleLawyerToken) {
                    const response = await api.post('/auth/google/lawyer/register', formPayload)
                    const result = response.data

                    if (result?.user && result?.token) {
                        setAuth(result.user, result.token)
                        toast.success('Professional account created. Awaiting admin verification.')
                        navigate('/lawyer/dashboard')
                    }
                } else {
                    const result = await register.mutateAsync(formPayload)
                    if (result) {
                        const { setPendingRegistration } = useAuthStore.getState()
                        setPendingRegistration({
                            ...commonPayload,
                            license_number: formData.license_number,
                            bar_council_id: formData.bar_council_id,
                            years_of_experience: formData.years_of_experience,
                            bio: formData.bio,
                            consultation_fee: formData.consultation_fee,
                            consultation_fee_60: formData.consultation_fee_60,
                            consultation_fee_90: formData.consultation_fee_90,
                            educational_qualifications: sanitizedEducation,
                            admissions_awards: admissionsAwards,
                            cities,
                            core_competencies: coreCompetencies,
                            document_expertise: documentExpertise,
                            profile_photo_path: result.profile_photo_path || null,
                        })
                        toast.success('OTP sent. Check your email.')
                        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
                    }
                }
            } catch (error) {
                if (googleLawyerToken) {
                    const message = error.response?.data?.errors
                        ? Object.values(error.response.data.errors).flat()[0]
                        : error.response?.data?.message || 'Unable to complete professional Google signup.'
                    toast.error(message)
                }
            }

            return
        }

        try {
            const result = await register.mutateAsync(commonPayload)
            if (result) {
                const { setPendingRegistration } = useAuthStore.getState()
                setPendingRegistration(commonPayload)
                toast.success('OTP sent. Check your email.')
                navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
            }
        } catch {
            // errors handled in hook
        }
    }

    const handleGoogleSignIn = async () => {
        if (!role) {
            toast.error('Please select Client or Professional first.')
            return
        }

        try {
            setIsGoogleSubmitting(true)
            const response = await api.get('/auth/google/redirect', {
                params: {
                    intent: 'register',
                    role,
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

    const pw = formData.password || ''
    const rules = [
        { key: 'length', ok: pw.length >= 8 },
        { key: 'upper', ok: /[A-Z]/.test(pw) },
        { key: 'lower', ok: /[a-z]/.test(pw) },
        { key: 'number', ok: /\d/.test(pw) },
        { key: 'special', ok: /[^A-Za-z0-9]/.test(pw) },
    ]

    const strength = rules.filter((r) => r.ok).length
    const strengthLevels = [
        { min: 0, max: 1, color: 'bg-red-500' },
        { min: 2, max: 2, color: 'bg-orange-500' },
        { min: 3, max: 3, color: 'bg-yellow-500' },
        { min: 4, max: 4, color: 'bg-lime-500' },
        { min: 5, max: 5, color: 'bg-green-500' },
    ]

    const currentStrength = strengthLevels.find((s) => strength >= s.min && strength <= s.max)

    return (
        <div className="auth-premium-shell auth-premium-register min-h-screen pt-[112px]">
            <div className="auth-premium-atmosphere " />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="auth-premium-frame auth-premium-frame-wide"
            >
                <aside className="auth-premium-aside">
                    <div className="auth-premium-brandline">
                        <span className="auth-premium-badge">Premium Client Onboarding</span>
                        <h1>Create Your Protected Legal Account</h1>
                        <p>Start your relationship with a private, high-trust consultation platform built for sensitive legal matters.</p>
                    </div>

                    <div className="auth-premium-trustlist">
                        <div className="auth-premium-trustitem">
                            <ShieldCheck className="w-4 h-4" />
                            <div>
                                <p>Trusted account creation</p>
                                <span>Structured intake with secure profile verification.</span>
                            </div>
                        </div>
                        <div className="auth-premium-trustitem">
                            <BadgeCheck className="w-4 h-4" />
                            <div>
                                <p>Professional-grade standards</p>
                                <span>Purpose-built for private legal consultation workflows.</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="auth-premium-main auth-premium-main-scroll">
                    <div className="auth-premium-card auth-premium-card-wide">
                        <div className="auth-premium-card-head">
                            <p className="auth-premium-kicker">Secure Registration</p>
                            <h2>Create Account</h2>
                            <p>Complete your details to enter a confidential consultation environment designed for trust and precision.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-premium-form w-full space-y-6">
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    type="button"
                                    onClick={() => setRole('client')}
                                    className={`auth-premium-role-option ${role === 'client'
                                        ? 'auth-premium-role-option-active'
                                        : ''
                                        }`}
                                >
                                    <div className={`auth-premium-role-icon ${role === 'client' ? 'scale-110' : ''}`}>
                                        <User size={28} strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center relative z-10">
                                        <span className="block text-[0.56rem] font-bold tracking-[0.15em] text-[color:var(--auth-muted)] uppercase mb-1">I am a</span>
                                        <span className="block font-semibold text-[0.95rem] text-[color:var(--auth-text)]">Client</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('lawyer')}
                                    className={`auth-premium-role-option ${role === 'lawyer'
                                        ? 'auth-premium-role-option-active'
                                        : ''
                                        }`}
                                >
                                    <div className={`auth-premium-role-icon ${role === 'lawyer' ? 'scale-110' : ''}`}>
                                        <Scale size={28} strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center relative z-10">
                                        <span className="block text-[0.56rem] font-bold tracking-[0.15em] text-[color:var(--auth-muted)] uppercase mb-1">I am a</span>
                                        <span className="block font-semibold text-[0.95rem] text-[color:var(--auth-text)]">Professional</span>
                                    </div>
                                </button>
                            </div>

                            <div className={`transition-all duration-300 ${role ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                <StyledInput
                                    label="Full Name / Username"
                                    type="text"
                                    placeholder={role === 'lawyer' ? 'e.g., Justice V Kumar' : 'e.g., John Doe'}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={!!googleLawyerToken}
                                    required
                                />

                                <StyledInput
                                    label="Email / ID"
                                    type="email"
                                    placeholder="justice.v@firm.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!!googleLawyerToken}
                                    required
                                />

                                {!googleLawyerToken && <div className="grid grid-cols-2 gap-5">
                                    <div className="mb-6 relative">
                                        <label className="block text-[0.65rem] font-bold tracking-widest uppercase mb-1 text-[color:var(--auth-muted)]">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={8}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="•••••••••••••••"
                                                className="auth-premium-input w-full"
                                            />
                                            <div
                                                className="auth-premium-icon-btn absolute right-3 top-1/2 -translate-y-1/2"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </div>
                                        </div>
                                        {pw.length > 0 && (
                                            <div className="absolute -bottom-2 left-0 right-0 flex gap-1 mt-1">
                                                {rules.map((r, i) => (
                                                    <div key={i} className={`h-[2px] flex-1 ${r.ok ? currentStrength?.color : 'bg-gray-100 dark:bg-gray-700'}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <StyledInput
                                        label="Confirm Password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="•••••••••••••••"
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                        required
                                    />
                                </div>}

                                <StyledInput
                                    label="Phone Number"
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                />

                                <AnimatePresence>
                                    {role === 'lawyer' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mb-7 rounded-xl border border-gray-200 dark:border-dark-600 p-5 bg-gray-50/40 dark:bg-dark-900/50">
                                                <p className="text-[0.65rem] font-bold text-gray-500 tracking-widest uppercase mb-3">Profile Photo (Required)</p>
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                                    onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                                                    className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:px-4 file:py-2 file:border-0 file:bg-[#0f1e30] file:text-white file:rounded-md"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-5 pt-1">
                                                <StyledInput
                                                    label="License Number"
                                                    placeholder="e.g., BAR12345DL2024"
                                                    value={formData.license_number}
                                                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                                                    required
                                                />
                                                <StyledInput
                                                    label="Bar Council ID"
                                                    placeholder="e.g., DHC-2015-001"
                                                    value={formData.bar_council_id}
                                                    onChange={(e) => setFormData({ ...formData, bar_council_id: e.target.value })}
                                                    required
                                                />
                                                <StyledInput
                                                    label="Years of Experience"
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g., 5"
                                                    value={formData.years_of_experience}
                                                    onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                                                    required
                                                />
                                                <StyledInput
                                                    label="Consultation Fee Per 30 Min (INR)"
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g., 2000"
                                                    value={formData.consultation_fee}
                                                    onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                                                    required
                                                />
                                                <StyledInput
                                                    label="Consultation Fee Per 60 Min (INR)"
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g., 3000"
                                                    value={formData.consultation_fee_60}
                                                    onChange={(e) => setFormData({ ...formData, consultation_fee_60: e.target.value })}
                                                    required
                                                />
                                                <StyledInput
                                                    label="Consultation Fee Per 90 Min (INR)"
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g., 4500"
                                                    value={formData.consultation_fee_90}
                                                    onChange={(e) => setFormData({ ...formData, consultation_fee_90: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="mb-6">
                                                <label className="block text-[0.65rem] font-bold text-gray-500 tracking-widest uppercase mb-1">Professional Bio</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    placeholder="Brief description of your expertise..."
                                                    className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-dark-600 px-0 py-2 text-sm text-[#111827] dark:text-white focus:ring-0 focus:border-[#a1804a] transition-colors placeholder-gray-300 dark:placeholder-gray-500 resize-none outline-none"
                                                    style={{ boxShadow: 'none' }}
                                                />
                                            </div>

                                            <div className="mb-7 rounded-xl border border-gray-200 dark:border-dark-600 p-5 bg-gray-50/40 dark:bg-dark-900/50">
                                                <p className="text-[0.65rem] font-bold text-gray-500 tracking-widest uppercase mb-3">Educational Qualifications</p>
                                                <div className="space-y-3">
                                                    {educationList.map((item, index) => (
                                                        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                                                            <input
                                                                type="text"
                                                                value={item.degree}
                                                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                                placeholder="Degree (LLB, LLM, PhD)"
                                                                className="w-full border border-gray-300 dark:border-dark-600 px-3 py-2 text-sm bg-white dark:bg-dark-800"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={item.university}
                                                                onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                                                                placeholder="University"
                                                                className="w-full border border-gray-300 dark:border-dark-600 px-3 py-2 text-sm bg-white dark:bg-dark-800"
                                                            />
                                                            <button type="button" onClick={() => removeEducationRow(index)} className="px-3 border border-red-200 text-red-600 hover:bg-red-50">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button type="button" onClick={addEducationRow} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0f1e30] dark:text-white">
                                                    <Plus size={14} /> Add Qualification
                                                </button>
                                            </div>

                                            <div className="mb-6 rounded-xl border border-gray-200 dark:border-dark-600 p-5 bg-gray-50/40 dark:bg-dark-900/50">
                                                <label className="block text-[0.65rem] font-bold text-gray-500 tracking-widest uppercase mb-3">Admissions & Awards (Multiple)</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={admissionsDraft}
                                                        onChange={(e) => setAdmissionsDraft(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                addAdmissionsAward()
                                                            }
                                                        }}
                                                        placeholder="Type an admission or award and press Add"
                                                        className="flex-1 border border-gray-300 dark:border-dark-600 px-3 py-2 text-sm bg-white dark:bg-dark-800"
                                                    />
                                                    <button type="button" onClick={addAdmissionsAward} className="px-4 bg-[#0f1e30] text-white text-sm font-semibold">
                                                        Add
                                                    </button>
                                                </div>
                                                {admissionsAwards.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {admissionsAwards.map((item) => (
                                                            <span key={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f1e30] text-white text-xs font-semibold">
                                                                {item}
                                                                <button type="button" onClick={() => removeAdmissionsAward(item)} className="text-white/80 hover:text-white">
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-6 rounded-xl border border-gray-200 dark:border-dark-600 p-5 bg-gray-50/40 dark:bg-dark-900/50">
                                                <label className="block text-[0.65rem] font-bold text-gray-500 tracking-widest uppercase mb-3">Cities You Serve (Multiple)</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={citiesDraft}
                                                        onChange={(e) => setCitiesDraft(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                addCity()
                                                            }
                                                        }}
                                                        placeholder="Type a city and press Add"
                                                        className="flex-1 border border-gray-300 dark:border-dark-600 px-3 py-2 text-sm bg-white dark:bg-dark-800"
                                                    />
                                                    <button type="button" onClick={addCity} className="px-4 bg-[#0f1e30] text-white text-sm font-semibold">
                                                        Add
                                                    </button>
                                                </div>
                                                {cities.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {cities.map((item) => (
                                                            <span key={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f1e30] text-white text-xs font-semibold">
                                                                {item}
                                                                <button type="button" onClick={() => removeCity(item)} className="text-white/80 hover:text-white">
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-6 rounded-xl border border-gray-200 dark:border-dark-600 p-5 bg-gray-50/40 dark:bg-dark-900/50">
                                                <label className="block text-[0.65rem] font-bold text-gray-500 tracking-widest uppercase mb-3">Core Competencies (Multiple)</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={competencyDraft}
                                                        onChange={(e) => setCompetencyDraft(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                addCoreCompetency()
                                                            }
                                                        }}
                                                        placeholder="Type a competency and press Add"
                                                        className="flex-1 border border-gray-300 dark:border-dark-600 px-3 py-2 text-sm bg-white dark:bg-dark-800"
                                                    />
                                                    <button type="button" onClick={addCoreCompetency} className="px-4 bg-[#0f1e30] text-white text-sm font-semibold">
                                                        Add
                                                    </button>
                                                </div>

                                                {coreCompetencies.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {coreCompetencies.map((item) => (
                                                            <span key={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f1e30] text-white text-xs font-semibold">
                                                                {item}
                                                                <button type="button" onClick={() => removeCoreCompetency(item)} className="text-white/80 hover:text-white">
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-7 rounded-xl border border-gray-200 dark:border-dark-600 p-5 bg-gray-50/40 dark:bg-dark-900/50">
                                                <p className="text-[0.65rem] font-bold text-gray-500 tracking-widest uppercase mb-3">Document Expertise & Fee</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-300 mb-3">Select portal documents and set your fee for each.</p>

                                                <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                                                    {documentTypes.map((doc) => {
                                                        const checked = selectedPortalDocs.some((item) => item.name === doc.name)
                                                        const current = selectedPortalDocs.find((item) => item.name === doc.name)
                                                        return (
                                                            <div key={doc.id} className="border border-gray-200 dark:border-dark-600 p-3 bg-white dark:bg-dark-800">
                                                                <label className="flex items-center gap-2 text-sm font-medium">
                                                                    <input type="checkbox" checked={checked} onChange={() => togglePortalDocument(doc.name)} />
                                                                    {doc.name}
                                                                </label>
                                                                {checked && (
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={current?.fee ?? ''}
                                                                        onChange={(e) => updatePortalDocumentFee(doc.name, e.target.value)}
                                                                        placeholder="Fee (INR)"
                                                                        className="mt-2 w-full border border-gray-300 dark:border-dark-600 px-3 py-2 text-sm bg-white dark:bg-dark-800"
                                                                    />
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                <div className="mt-4 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={customDocName}
                                                        onChange={(e) => setCustomDocName(e.target.value)}
                                                        placeholder="Custom document name"
                                                        className="w-full border border-gray-300 dark:border-dark-600 px-3 py-3 text-sm bg-white dark:bg-dark-800 focus:outline-none focus:border-[#0f1e30] dark:focus:border-white transition-colors"
                                                    />
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={customDocFee}
                                                            onChange={(e) => setCustomDocFee(e.target.value)}
                                                            placeholder="Fee"
                                                            className="w-full sm:flex-1 border border-gray-300 dark:border-dark-600 px-3 py-3 text-sm bg-white dark:bg-dark-800 focus:outline-none focus:border-[#0f1e30] dark:focus:border-white transition-colors"
                                                        />
                                                        <button type="button" onClick={addCustomDocument} className="w-full sm:w-[120px] shrink-0 px-5 py-3 bg-[#0f1e30] text-white text-sm font-semibold rounded-sm whitespace-nowrap">
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>

                                                {customDocuments.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {customDocuments.map((doc) => (
                                                            <div key={doc.name} className="flex items-center justify-between text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 px-3 py-2">
                                                                <span>{doc.name} - INR {doc.fee}</span>
                                                                <button type="button" onClick={() => removeCustomDocument(doc.name)} className="text-red-600">Remove</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                type="submit"
                                disabled={register.isPending || !role}
                                className="auth-premium-btn-primary w-full"
                            >
                                {register.isPending ? <Loader size="sm" /> : (
                                    <>
                                        Create Protected Account <ArrowRight size={16} strokeWidth={2.5} />
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
                                disabled={isGoogleSubmitting || !role || isGoogleLawyerLoading || !!googleLawyerToken}
                                className="auth-premium-btn-secondary w-full"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.57c1.92-1.77 3.03-4.38 3.03-7.49 0-.72-.06-1.41-.2-2.08H12z" />
                                    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.3-2.57c-.92.62-2.1.98-3.31.98-2.54 0-4.7-1.72-5.47-4.03l-3.41 2.64A9.99 9.99 0 0012 22z" />
                                    <path fill="#4A90E2" d="M6.53 13.94A6.01 6.01 0 016.22 12c0-.67.11-1.33.31-1.94L3.12 7.42A10 10 0 002 12c0 1.61.39 3.14 1.12 4.58l3.41-2.64z" />
                                    <path fill="#FBBC05" d="M12 6.03c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 3.02 14.69 2 12 2A9.99 9.99 0 003.12 7.42l3.41 2.64c.77-2.31 2.93-4.03 5.47-4.03z" />
                                </svg>
                                {isGoogleSubmitting ? 'Connecting to Google...' : 'Sign Up with Google'}
                            </button>

                            {!role && (
                                <p className="text-[0.72rem] text-center text-[color:var(--auth-muted)]">
                                    Select Client or Professional first to continue.
                                </p>
                            )}

                            {role === 'lawyer' && !googleLawyerToken && (
                                <p className="text-[0.72rem] text-center text-[color:var(--auth-muted)]">
                                    Professional with Google requires one more step: continue with Google, then complete all required profile fields.
                                </p>
                            )}

                            {googleLawyerToken && (
                                <p className="text-[0.72rem] text-center text-emerald-600 dark:text-emerald-300">
                                    Google account linked. Name and email are prefilled; complete the remaining professional details.
                                </p>
                            )}
                        </form>

                        <div className="mt-8 text-center auth-premium-footnote pt-8">
                            <span>Already registered? </span>
                            <Link to="/login" className="auth-premium-link font-semibold ml-1">
                                Sign in
                            </Link>
                        </div>

                        <div className="auth-premium-assurance">
                            <div className="auth-premium-assurance-item">
                                <ShieldCheck size={16} />
                                <span>Verified identity</span>
                            </div>
                            <div className="auth-premium-assurance-item">
                                <Lock size={16} />
                                <span>Encrypted records</span>
                            </div>
                        </div>
                    </div>
                </section>
            </motion.div>
        </div>
    )
}

export default Register
