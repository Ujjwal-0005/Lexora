import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Scale, ShieldCheck, Sparkles, Plus, Trash2, ArrowRight, Lock } from 'lucide-react'
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

    const registerHeroPanelStyle = darkMode
        ? {
            background: 'linear-gradient(135deg, #0a1218 0%, #1a3a5a 25%, #2d5a7f 50%, #1a3a4f 75%, #0a0f1a 100%)',
        }
        : {
            background: 'linear-gradient(135deg, #0d1a2e 0%, #1a3a5f 25%, #2d5a8f 50%, #1a3a5f 75%, #0a1628 100%)',
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
                <div className="hidden md:flex md:w-[45%] relative overflow-hidden flex-col justify-between p-12 lg:p-14" style={registerHeroPanelStyle}>
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
                            Lexora Onboarding
                        </h1>
                    </div>

                    <div className="relative z-10 max-w-[300px]">
                        <h2 className="font-display text-5xl lg:text-[2.5rem] font-bold text-white mb-4 tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                            Join the vault.
                        </h2>
                        <p className="text-white/90 text-[0.98rem] leading-relaxed max-w-[280px] font-light">
                            Build your verified legal identity with secure access to premium services.
                        </p>
                    </div>

                    <div className="relative z-10 rounded-2xl border border-white/25 bg-gradient-to-br from-white/12 to-white/5 backdrop-blur-xl px-6 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:border-white/35 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 to-white/10 border border-white/40 flex items-center justify-center text-white shrink-0 shadow-[0_4px_16px_rgba(255,192,61,0.15)]">
                                <Lock size={18} strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Secure Registration</p>
                                <p className="text-white/75 text-xs mt-0.5">Your profile data is encrypted and verified.</p>
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
                                    <span className="text-[0.7rem] font-bold text-[#a1804a] dark:text-[#ffc966] tracking-widest uppercase">Elite Access</span>
                                </div>
                            </div>
                            <h2 className="font-display text-[2.3rem] font-bold text-[#0a0f19] dark:text-white mb-3 tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                                Build Your Identity
                            </h2>
                            <p className="text-[0.87rem] text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                                Create your verified legal profile and join the digital vault.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="w-full space-y-6">
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    type="button"
                                    onClick={() => setRole('client')}
                                    className={`relative group p-5 border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 rounded-xl overflow-hidden ${role === 'client'
                                        ? 'border-[#ffc966] bg-gradient-to-br from-[#ffc966]/15 to-[#64c8ff]/5 dark:from-[#ffc966]/20 dark:to-[#64c8ff]/10 shadow-[0_10px_30px_rgba(255,201,102,0.2)]'
                                        : 'border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-[#ffc966]/50 dark:hover:border-[#ffc966]/40'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#ffc966]/0 via-white/0 to-[#ffc966]/0 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                                    <div className={`text-[#0a0f19] dark:text-white transition-all ${role === 'client' ? 'scale-110' : ''}`}>
                                        <User size={28} strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center relative z-10">
                                        <span className="block text-[0.5rem] font-bold tracking-[0.15em] text-gray-500 dark:text-gray-400 uppercase mb-1">I am a</span>
                                        <span className="block font-display font-bold text-[0.95rem] text-[#0a0f19] dark:text-white">Client</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('lawyer')}
                                    className={`relative group p-5 border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 rounded-xl overflow-hidden ${role === 'lawyer'
                                        ? 'border-[#ffc966] bg-gradient-to-br from-[#ffc966]/15 to-[#64c8ff]/5 dark:from-[#ffc966]/20 dark:to-[#64c8ff]/10 shadow-[0_10px_30px_rgba(255,201,102,0.2)]'
                                        : 'border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-[#ffc966]/50 dark:hover:border-[#ffc966]/40'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#ffc966]/0 via-white/0 to-[#ffc966]/0 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                                    <div className={`text-[#0a0f19] dark:text-white transition-all ${role === 'lawyer' ? 'scale-110' : ''}`}>
                                        <Scale size={28} strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center relative z-10">
                                        <span className="block text-[0.5rem] font-bold tracking-[0.15em] text-gray-500 dark:text-gray-400 uppercase mb-1">I am a</span>
                                        <span className="block font-display font-bold text-[0.95rem] text-[#0a0f19] dark:text-white">Professional</span>
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
                                        <label className="block text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-1">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={8}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                {register.isPending ? <Loader size="sm" /> : (
                                    <>
                                        Initialize Access <ArrowRight size={16} strokeWidth={2.5} />
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
                                disabled={isGoogleSubmitting || !role || isGoogleLawyerLoading || !!googleLawyerToken}
                                className="w-full py-[13px] px-5 rounded-xl border border-gray-300/80 dark:border-white/20 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-[#0a0f19] dark:text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-[0.78rem] tracking-wide"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.57c1.92-1.77 3.03-4.38 3.03-7.49 0-.72-.06-1.41-.2-2.08H12z" />
                                    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.3-2.57c-.92.62-2.1.98-3.31.98-2.54 0-4.7-1.72-5.47-4.03l-3.41 2.64A9.99 9.99 0 0012 22z" />
                                    <path fill="#4A90E2" d="M6.53 13.94A6.01 6.01 0 016.22 12c0-.67.11-1.33.31-1.94L3.12 7.42A10 10 0 002 12c0 1.61.39 3.14 1.12 4.58l3.41-2.64z" />
                                    <path fill="#FBBC05" d="M12 6.03c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 3.02 14.69 2 12 2A9.99 9.99 0 003.12 7.42l3.41 2.64c.77-2.31 2.93-4.03 5.47-4.03z" />
                                </svg>
                                {isGoogleSubmitting ? 'Connecting to Google...' : 'Sign Up With Google'}
                            </button>

                            {!role && (
                                <p className="text-[0.72rem] text-amber-700 dark:text-amber-300 text-center">
                                    Select Client or Professional first to continue.
                                </p>
                            )}

                            {role === 'lawyer' && !googleLawyerToken && (
                                <p className="text-[0.72rem] text-amber-700 dark:text-amber-300 text-center">
                                    Professional with Google requires one more step: continue with Google, then complete all required profile fields.
                                </p>
                            )}

                            {googleLawyerToken && (
                                <p className="text-[0.72rem] text-emerald-700 dark:text-emerald-300 text-center">
                                    Google account linked. Name and email are prefilled; complete the remaining professional details.
                                </p>
                            )}
                        </form>

                        <div className="mt-8 text-center pt-8 border-t border-gray-300/40 dark:border-white/15">
                            <span className="text-[0.75rem] text-gray-600 dark:text-gray-400 font-light">Already registered? </span>
                            <Link to="/login" className="text-[0.75rem] font-bold text-[#ffc966] hover:text-[#ffb84d] dark:hover:text-[#ffd480] transition-colors duration-200 uppercase tracking-wider ml-1">
                                Sign in now
                            </Link>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-10 border-t border-gray-300/40 dark:border-white/15 pt-8">
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#ffc966]/10 to-[#64c8ff]/10 group-hover:from-[#ffc966]/20 group-hover:to-[#64c8ff]/20 transition-all">
                                    <ShieldCheck size={18} className="text-gray-600 dark:text-gray-300 group-hover:text-[#ffc966] dark:group-hover:text-[#ffc966] transition-colors" />
                                </div>
                                <span className="text-[0.55rem] font-bold text-gray-600 dark:text-gray-400 tracking-widest uppercase group-hover:text-[#a1804a] dark:group-hover:text-[#ffc966] transition-colors">
                                    Verified Identity
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#ffc966]/10 to-[#64c8ff]/10 group-hover:from-[#ffc966]/20 group-hover:to-[#64c8ff]/20 transition-all">
                                    <Lock size={18} className="text-gray-600 dark:text-gray-300 group-hover:text-[#64c8ff] dark:group-hover:text-[#64c8ff] transition-colors" />
                                </div>
                                <span className="text-[0.55rem] font-bold text-gray-600 dark:text-gray-400 tracking-widest uppercase group-hover:text-[#a1804a] dark:group-hover:text-[#64c8ff] transition-colors">
                                    Encrypted Data
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Register
