import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Award, IndianRupee, Save, Plus, X, Eye, EyeOff, UploadCloud } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const LawyerSettings = () => {
    const { user, updateUser } = useAuthStore()
    const profile = user?.lawyerProfile || user?.lawyer_profile || {}
    const photoUrl = user?.photo_url || null

    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [documentTypes, setDocumentTypes] = useState([])
    const [profilePhoto, setProfilePhoto] = useState(null)
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState(photoUrl)

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: profile?.bio || '',
        consultation_fee: profile?.consultation_fee || '',
        consultation_fee_60: profile?.consultation_fee_60 || '',
        consultation_fee_90: profile?.consultation_fee_90 || '',
        years_of_experience: profile?.years_of_experience || '',
        license_number: profile?.license_number || '',
        bar_council_id: profile?.bar_council_id || '',
        is_available: profile?.is_available ?? true,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    const [educationRows, setEducationRows] = useState([{ degree: '', university: '' }])
    const [admissionsAwards, setAdmissionsAwards] = useState([])
    const [admissionsDraft, setAdmissionsDraft] = useState('')
    const [cities, setCities] = useState([])
    const [citiesDraft, setCitiesDraft] = useState('')
    const [coreCompetencies, setCoreCompetencies] = useState([])
    const [competencyDraft, setCompetencyDraft] = useState('')
    const [selectedPortalDocs, setSelectedPortalDocs] = useState([])
    const [customDocuments, setCustomDocuments] = useState([])
    const [customDocName, setCustomDocName] = useState('')
    const [customDocFee, setCustomDocFee] = useState('')

    useEffect(() => {
        const loadDocumentTypes = async () => {
            try {
                const response = await api.get('/document-types')
                setDocumentTypes(response.data?.documentTypes || [])
            } catch {
                setDocumentTypes([])
            }
        }

        loadDocumentTypes()
    }, [])

    useEffect(() => {
        if (!profilePhoto) {
            setPhotoPreviewUrl(photoUrl)
            return
        }

        const objectUrl = URL.createObjectURL(profilePhoto)
        setPhotoPreviewUrl(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [profilePhoto, photoUrl])

    useEffect(() => {
        const profileDocs = Array.isArray(profile?.document_expertise) ? profile.document_expertise : []
        const portalDocs = profileDocs.filter((doc) => doc.source !== 'custom')
        const customDocs = profileDocs.filter((doc) => doc.source === 'custom')

        if (Array.isArray(profile?.educational_qualifications) && profile.educational_qualifications.length > 0) {
            setEducationRows(profile.educational_qualifications)
        }

        setAdmissionsAwards(Array.isArray(profile?.admissions_awards) ? profile.admissions_awards : [])
        setAdmissionsDraft('')
        setCities(Array.isArray(profile?.cities) ? profile.cities : [])
        setCitiesDraft('')
        setCoreCompetencies(Array.isArray(profile?.core_competencies) ? profile.core_competencies : [])
        setCompetencyDraft('')
        setSelectedPortalDocs(portalDocs)
        setCustomDocuments(customDocs)
    }, [profile])

    const parseListInput = (value) => {
        return value
            .split(/[,\n]/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
            .filter((item, index, arr) => arr.findIndex((x) => x.toLowerCase() === item.toLowerCase()) === index)
    }

    const normalizedEducation = useMemo(() => {
        return educationRows
            .map((item) => ({ degree: item.degree.trim(), university: item.university.trim() }))
            .filter((item) => item.degree && item.university)
    }, [educationRows])

    const normalizedDocumentExpertise = useMemo(() => {
        const portalDocs = selectedPortalDocs
            .map((doc) => ({ name: doc.name, fee: Number(doc.fee), source: 'portal' }))
            .filter((doc) => doc.name && Number.isFinite(doc.fee) && doc.fee >= 0)

        const customDocs = customDocuments
            .map((doc) => ({ name: doc.name, fee: Number(doc.fee), source: 'custom' }))
            .filter((doc) => doc.name && Number.isFinite(doc.fee) && doc.fee >= 0)

        return [...portalDocs, ...customDocs]
    }, [selectedPortalDocs, customDocuments])

    const handleEducationChange = (index, key, value) => {
        setEducationRows((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
    }

    const addEducationRow = () => {
        setEducationRows((prev) => [...prev, { degree: '', university: '' }])
    }

    const removeEducationRow = (index) => {
        setEducationRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
    }

    const togglePortalDocument = (name, docType) => {
        setSelectedPortalDocs((prev) => {
            const exists = prev.find((item) => item.name === name)
            if (exists) {
                return prev.filter((item) => item.name !== name)
            }

            return [...prev, { name, fee: docType?.minimum_lawyer_fee || docType?.base_price || '', source: 'portal' }]
        })
    }

    const updatePortalDocumentFee = (name, fee) => {
        setSelectedPortalDocs((prev) => prev.map((item) => (item.name === name ? { ...item, fee } : item)))
    }

    const addCustomDocument = () => {
        const name = customDocName.trim()
        const fee = Number(customDocFee)

        if (!name) {
            toast.error('Custom document name is required.')
            return
        }

        if (!Number.isFinite(fee) || fee < 0) {
            toast.error('Custom document fee must be a valid amount.')
            return
        }

        const exists = [...selectedPortalDocs, ...customDocuments].some((doc) => doc.name.toLowerCase() === name.toLowerCase())
        if (exists) {
            toast.error('This document is already added.')
            return
        }

        setCustomDocuments((prev) => [...prev, { name, fee, source: 'custom' }])
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

    const handleProfileUpdate = async (e) => {
        e.preventDefault()

        if (!formData.name?.trim()) {
            toast.error('Name is required')
            return
        }

        setLoading(true)
        try {
            await api.put('/auth/profile', {
                name: formData.name.trim(),
                phone: formData.phone?.trim() || null,
            })

            const formPayload = new FormData()
            formPayload.append('_method', 'PUT')
            formPayload.append('years_of_experience', formData.years_of_experience || '')
            formPayload.append('consultation_fee', formData.consultation_fee || '')
            formPayload.append('consultation_fee_60', formData.consultation_fee_60 || '')
            formPayload.append('consultation_fee_90', formData.consultation_fee_90 || '')
            formPayload.append('bio', formData.bio || '')
            formPayload.append('is_available', formData.is_available ? '1' : '0')
            formPayload.append('educational_qualifications', JSON.stringify(normalizedEducation))
            formPayload.append('admissions_awards', JSON.stringify(admissionsAwards))
            formPayload.append('cities', JSON.stringify(cities))
            formPayload.append('core_competencies', JSON.stringify(coreCompetencies))
            formPayload.append('document_expertise', JSON.stringify(normalizedDocumentExpertise))

            if (profilePhoto) {
                formPayload.append('profile_photo', profilePhoto)
            }

            const lawyerResponse = await api.post('/auth/lawyer-profile', formPayload)

            updateUser(lawyerResponse.data?.user || {
                ...user,
                name: formData.name,
                phone: formData.phone,
                lawyerProfile: {
                    ...profile,
                    years_of_experience: formData.years_of_experience,
                    consultation_fee: formData.consultation_fee,
                    consultation_fee_60: formData.consultation_fee_60,
                    consultation_fee_90: formData.consultation_fee_90,
                    bio: formData.bio,
                    is_available: formData.is_available,
                    educational_qualifications: normalizedEducation,
                    admissions_awards: admissionsAwards,
                    cities,
                    core_competencies: coreCompetencies,
                    document_expertise: normalizedDocumentExpertise,
                },
            })

            setProfilePhoto(null)

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

        const rules = [
            { ok: formData.newPassword.length >= 8 },
            { ok: /[A-Z]/.test(formData.newPassword) },
            { ok: /[a-z]/.test(formData.newPassword) },
            { ok: /\d/.test(formData.newPassword) },
            { ok: /[^A-Za-z0-9]/.test(formData.newPassword) },
        ]
        const strength = rules.filter((r) => r.ok).length

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

    const getPasswordStrength = (password) => {
        const rules = [
            { key: 'length', ok: password?.length >= 8, label: '8+ characters' },
            { key: 'upper', ok: /[A-Z]/.test(password), label: 'Uppercase letter' },
            { key: 'lower', ok: /[a-z]/.test(password), label: 'Lowercase letter' },
            { key: 'number', ok: /\d/.test(password), label: 'Number' },
            { key: 'special', ok: /[^A-Za-z0-9]/.test(password), label: 'Special character' },
        ]
        return { rules, strength: rules.filter((r) => r.ok).length }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 font-sans">
            <div className="flex items-start justify-between border-b border-gray-200 dark:border-dark-600 pb-6">
                <div>
                    <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-2">Account Management</h2>
                    <h1 className="text-3xl font-serif font-bold text-[#0f172a] dark:text-white">Profile Settings</h1>
                </div>
                <button
                    type="button"
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="bg-[#0f172a] text-white hover:bg-black disabled:opacity-50 transition-colors rounded-sm shadow-md py-3 px-8 font-bold text-sm flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 p-8 rounded-sm shadow-sm"
                >
                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-dark-600">
                        <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-sm">
                            <Award className="w-6 h-6 text-[#0f172a] dark:text-white" />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white">Professional Credentials</h2>
                            <p className="text-sm text-gray-500 font-medium">Your public legal practice details</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-5 p-5 border border-gray-200 dark:border-dark-600 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-dark-900/70 dark:to-dark-800/70 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-28 h-28 rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 flex items-center justify-center shrink-0 shadow-sm">
                                    {photoPreviewUrl ? (
                                        <img src={photoPreviewUrl} alt={user?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-gray-400">{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Profile Photo</label>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                                        Upload a clear headshot for your public lawyer profile. PNG, JPG, and WEBP are supported.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <input
                                    id="lawyer-profile-photo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                                    className="sr-only"
                                />
                                <label
                                    htmlFor="lawyer-profile-photo"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0f172a] bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-black hover:shadow-lg cursor-pointer"
                                >
                                    <UploadCloud className="h-4 w-4" />
                                    Change Photo
                                </label>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {profilePhoto ? profilePhoto.name : 'No file selected yet'}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">License Number</label>
                                <input
                                    type="text"
                                    value={formData.license_number}
                                    disabled
                                    className="w-full p-3 border border-gray-200 dark:border-dark-600 rounded-sm bg-gray-50 dark:bg-dark-700 text-gray-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Bar Council ID</label>
                                <input
                                    type="text"
                                    value={formData.bar_council_id}
                                    disabled
                                    className="w-full p-3 border border-gray-200 dark:border-dark-600 rounded-sm bg-gray-50 dark:bg-dark-700 text-gray-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Years of Experience</label>
                                <input
                                    type="number"
                                    value={formData.years_of_experience}
                                    onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Consultation Fee (30 Min, INR)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.consultation_fee}
                                        onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                                        className="w-full p-3 pl-10 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Consultation Fee (60 Min, INR)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.consultation_fee_60}
                                        onChange={(e) => setFormData({ ...formData, consultation_fee_60: e.target.value })}
                                        className="w-full p-3 pl-10 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Consultation Fee (90 Min, INR)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.consultation_fee_90}
                                        onChange={(e) => setFormData({ ...formData, consultation_fee_90: e.target.value })}
                                        className="w-full p-3 pl-10 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Professional Biography</label>
                            <textarea
                                rows={5}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full p-4 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors resize-none leading-relaxed"
                                placeholder="Describe your expertise, experience, and legal philosophy..."
                            />
                        </div>

                        <div className="pt-2 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-4">Educational Qualifications</label>
                                <div className="space-y-3">
                                    {educationRows.map((item, index) => (
                                        <div key={index} className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
                                            <input
                                                type="text"
                                                value={item.degree}
                                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                placeholder="Degree (LLB, LLM, PhD)"
                                                className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                            />
                                            <input
                                                type="text"
                                                value={item.university}
                                                onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                                                placeholder="University"
                                                className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                            />
                                            <button type="button" onClick={() => removeEducationRow(index)} className="px-4 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-sm">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addEducationRow} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0f172a] dark:text-white">
                                    <Plus className="w-4 h-4" /> Add Qualification
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Admissions & Awards</label>
                                <div className="space-y-3 rounded-sm border border-gray-200 dark:border-dark-600 bg-gray-50/60 dark:bg-dark-900/50 p-4">
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
                                            className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                        />
                                        <button type="button" onClick={addAdmissionsAward} className="px-5 py-3 bg-[#0f172a] text-white font-bold text-sm rounded-sm">
                                            Add
                                        </button>
                                    </div>

                                    {admissionsAwards.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {admissionsAwards.map((item) => (
                                                <span key={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f172a] text-white text-xs font-semibold">
                                                    {item}
                                                    <button type="button" onClick={() => removeAdmissionsAward(item)} className="text-white/80 hover:text-white">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Cities You Serve</label>
                                <div className="space-y-3 rounded-sm border border-gray-200 dark:border-dark-600 bg-gray-50/60 dark:bg-dark-900/50 p-4">
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
                                            className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                        />
                                        <button type="button" onClick={addCity} className="px-5 py-3 bg-[#0f172a] text-white font-bold text-sm rounded-sm">
                                            Add
                                        </button>
                                    </div>

                                    {cities.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {cities.map((item) => (
                                                <span key={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f172a] text-white text-xs font-semibold">
                                                    {item}
                                                    <button type="button" onClick={() => removeCity(item)} className="text-white/80 hover:text-white">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-sm border border-gray-200 dark:border-dark-600 bg-gray-50/60 dark:bg-dark-900/50 p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Core Competencies</label>
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
                                            className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                        />
                                        <button type="button" onClick={addCoreCompetency} className="px-5 py-3 bg-[#0f172a] text-white font-bold text-sm rounded-sm">
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {coreCompetencies.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {coreCompetencies.map((item) => (
                                            <span key={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f172a] text-white text-xs font-semibold">
                                                {item}
                                                <button type="button" onClick={() => removeCoreCompetency(item)} className="text-white/80 hover:text-white">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border border-gray-200 dark:border-dark-600 rounded-sm p-5 bg-gray-50/60 dark:bg-dark-900/50 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Document Expertise & Fees</label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Select existing portal documents, set your fee, or add a custom document name.</p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                                    {documentTypes.map((docType) => {
                                        const current = selectedPortalDocs.find((item) => item.name === docType.name)
                                        const checked = !!current
                                        return (
                                            <div key={docType.id} className="border border-gray-200 dark:border-dark-600 rounded-sm p-3 bg-white dark:bg-dark-800">
                                                <label className="flex items-start gap-2 text-sm font-medium cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => togglePortalDocument(docType.name, docType)}
                                                        className="mt-1"
                                                    />
                                                    <span>{docType.name}</span>
                                                </label>
                                                {checked && (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={current?.fee ?? ''}
                                                        onChange={(e) => updatePortalDocumentFee(docType.name, e.target.value)}
                                                        placeholder="Fee"
                                                        className="mt-2 w-full p-2 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                                    />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="grid md:grid-cols-[1fr_140px_auto] gap-3">
                                    <input
                                        type="text"
                                        value={customDocName}
                                        onChange={(e) => setCustomDocName(e.target.value)}
                                        placeholder="Custom document name"
                                        className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        value={customDocFee}
                                        onChange={(e) => setCustomDocFee(e.target.value)}
                                        placeholder="Fee"
                                        className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                                    />
                                    <button type="button" onClick={addCustomDocument} className="px-5 py-3 bg-[#0f172a] text-white font-bold text-sm rounded-sm">
                                        Add
                                    </button>
                                </div>

                                {customDocuments.length > 0 && (
                                    <div className="space-y-2">
                                        {customDocuments.map((doc) => (
                                            <div key={doc.name} className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-sm text-sm">
                                                <span>{doc.name} - INR {doc.fee}</span>
                                                <button type="button" onClick={() => removeCustomDocument(doc.name)} className="text-red-600 hover:text-red-700">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 p-6 bg-gray-50 dark:bg-dark-700 rounded-sm flex items-center justify-between border border-gray-200 dark:border-dark-600">
                                <div>
                                    <p className="font-bold text-[#0f172a] dark:text-white">Platform Status</p>
                                    <p className="text-sm text-gray-500 mt-1">Accept new consultation requests</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                                    className={`relative w-14 h-7 rounded-full transition-colors flex items-center shadow-inner ${formData.is_available ? 'bg-green-500' : 'bg-gray-300 dark:bg-dark-600'}`}
                                >
                                    <span className={`absolute w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${formData.is_available ? 'translate-x-8' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 p-8 rounded-sm shadow-sm"
                >
                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-dark-600">
                        <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-sm">
                            <User className="w-6 h-6 text-[#0f172a] dark:text-white" />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white">Personal Information</h2>
                            <p className="text-sm text-gray-500 font-medium">Your private contact details</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full p-3 border border-gray-200 dark:border-dark-600 rounded-sm bg-gray-50 dark:bg-dark-700 text-gray-500 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] dark:focus:border-white transition-colors"
                            />
                        </div>
                    </div>
                </motion.div>
            </form>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 p-8 rounded-sm shadow-sm"
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

                            {formData.newPassword && (() => {
                                const { rules, strength } = getPasswordStrength(formData.newPassword)
                                const strengthLevels = [
                                    { min: 0, max: 1, label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-500' },
                                    { min: 2, max: 2, label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500' },
                                    { min: 3, max: 3, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
                                    { min: 4, max: 4, label: 'Good', color: 'bg-lime-500', textColor: 'text-lime-500' },
                                    { min: 5, max: 5, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-500' },
                                ]
                                const current = strengthLevels.find((s) => strength >= s.min && strength <= s.max)
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
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-[#0f172a] dark:text-gray-300 mb-2">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="input pl-12 pr-12 !rounded-sm bg-gray-50 border-gray-200 focus:border-[#0f172a] focus:ring-[#0f172a]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 py-3 px-6 rounded-sm shadow-sm font-semibold text-sm flex items-center gap-2 transition-colors">
                        <Lock className="w-4 h-4" />
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

export default LawyerSettings
