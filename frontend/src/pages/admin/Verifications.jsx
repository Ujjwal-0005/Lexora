import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, User, Award, Search, FileText, ChevronLeft, ChevronRight, X, ShieldCheck, GraduationCap, MapPin, Globe, Briefcase, Building2, BadgeCheck, Image as ImageIcon } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import { formatDate, formatPrice } from '../../utils/formatDate'
import Loader from '../../components/Loader'
import toast from 'react-hot-toast'

const DESIGNATION_OPTIONS = [
  { value: 'partner', label: 'Partner' },
  { value: 'managing associate', label: 'Managing Associate' },
  { value: 'special counsel', label: 'Special Counsel' },
  { value: 'equity partner', label: 'Equity Partner' },
  { value: 'senior partner', label: 'Senior Partner' },
]

const formatRoleLabel = (value) => {
  if (!value) return 'Pending Designation'
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getFallbackDesignation = (years = 0) => {
  if (years >= 20) return 'senior partner'
  if (years >= 15) return 'equity partner'
  if (years >= 10) return 'managing associate'
  if (years >= 7) return 'special counsel'
  return 'partner'
}

const asList = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return []
}

const asDocumentList = (value) => {
  if (!value) return []
  if (!Array.isArray(value)) return []
  return value.map((item) => {
    if (typeof item === 'string') {
      return { name: item, fee: null }
    }

    return {
      name: item?.name || 'Document',
      fee: item?.fee ?? item?.pivot?.custom_price ?? item?.base_price ?? null,
    }
  })
}

const AdminVerifications = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLawyer, setSelectedLawyer] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showAuditLogModal, setShowAuditLogModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedDesignation, setSelectedDesignation] = useState('')
  const queryClient = useQueryClient()

  const { data: dashboardData } = useQuery({
    queryKey: ['admin-verification-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard')
      return response.data
    },
  })

  const stats = dashboardData?.stats || {}

  const { data: lawyers, isLoading } = useQuery({
    queryKey: ['pending-verifications', currentPage, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const pagedResponse = await api.get(`/admin/pending-verifications?${params.toString()}`)
      return pagedResponse.data.lawyers
    },
  })

  const { data: auditLogs, isLoading: isLoadingAuditLogs } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const response = await api.get('/admin/logs')
      return response.data.logs
    },
    enabled: showAuditLogModal,
  })

  const verifyLawyer = useMutation({
    mutationFn: async ({ userId, designation }) => {
      const response = await api.post(`/admin/verify/${userId}`, { designation })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-verifications'])
      toast.success('Lawyer verified successfully!')
      setShowModal(false)
      setSelectedLawyer(null)
      setSelectedDesignation('')
    },
    onError: () => {
      toast.error('Failed to verify lawyer')
    },
  })

  const rejectLawyer = useMutation({
    mutationFn: async ({ userId, reason }) => {
      const response = await api.post(`/admin/reject/${userId}`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-verifications'])
      toast.success('Lawyer application rejected')
      setRejectionReason('')
      setShowModal(false)
      setSelectedLawyer(null)
      setSelectedDesignation('')
    },
  })

  useEffect(() => {
    if (!selectedLawyer) {
      setSelectedDesignation('')
      return
    }

    const profile = selectedLawyer.lawyer_profile || {}
    // Do not pre-fill a fallback designation for pending applicants.
    // Admin should explicitly choose the designation before verification.
    setSelectedDesignation(profile.designation || '')
  }, [selectedLawyer])

  const activeApplications = lawyers?.data || []
  const totalPages = lawyers?.last_page || 1
  const totalApplications = lawyers?.total || 0

  const openDossier = (lawyer) => {
    setSelectedLawyer(lawyer)
    setShowModal(true)
    setRejectionReason('')
  }

  const openAuditLog = () => {
    setShowAuditLogModal(true)
  }

  return (
    <div className="admin-page space-y-8">
      <div className="admin-page-header">
        <p className="admin-page-kicker">Credential Validation Authority</p>
        <h1 className="admin-page-title mb-3">Verification Queue</h1>
        <p className="admin-page-subtitle">
          Maintain the integrity of the Lexora network. Review and validate legal
          credentials for new professional applicants with administrative precision.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="admin-metric-card">
          <p className="admin-metric-label">Pending Reviews</p>
          <h3 className="admin-metric-value">
            {totalApplications}
          </h3>
        </div>
        <div className="admin-metric-card">
          <p className="admin-metric-label">Total Verified</p>
          <h3 className="admin-metric-value text-emerald-600 dark:text-emerald-400">
            {stats.total_verified_lawyers || 0}
          </h3>
        </div>
        <div className="admin-metric-card">
          <p className="admin-metric-label">Average Uptime</p>
          <h3 className="admin-metric-value text-[color:var(--admin-accent)]">
            99.98%
          </h3>
        </div>
      </div>

      {/* Table Section */}
      <div className="admin-panel">
        <div className="admin-panel-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="admin-panel-title">Active Applications</h2>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--admin-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search by name or ID..."
              className="admin-input w-full sm:w-64 !pl-11"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20"><Loader /></div>
        ) : activeApplications.length > 0 ? (
          <div className="overflow-x-auto admin-panel-body pt-0 px-0 pb-0">
            <table className="admin-data-table text-left">
              <thead>
                <tr>
                  <th className="w-1/4">Professional</th>
                  <th className="w-1/5">Identifiers</th>
                  <th className="w-1/5">Credentials</th>
                  <th className="w-1/6">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeApplications.map((lawyer, index) => (
                  <motion.tr
                    key={lawyer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="transition-colors"
                  >
                    <td>
                      <div className="flex items-center gap-4">
                        {lawyer.photo_url ? (
                          <img
                            src={lawyer.photo_url}
                            alt={lawyer.name}
                            className="w-10 h-12 rounded-xl object-cover flex-shrink-0 border border-[color:var(--admin-border)]"
                          />
                        ) : (
                          <div className="w-10 h-12 rounded-xl bg-[linear-gradient(145deg,var(--admin-accent),var(--admin-accent-soft))] flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[color:var(--admin-text)] text-sm">{lawyer.name}, Esq.</p>
                          <p className="text-xs text-[color:var(--admin-muted)]">{formatRoleLabel(lawyer.lawyer_profile?.designation)}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-bold text-[color:var(--admin-text)] text-xs mb-1">#RL {lawyer.id.toString().padStart(4, '0')}</p>
                      <p className="text-[11px] text-[color:var(--admin-muted)]">Joined {formatDate(lawyer.created_at)}</p>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[color:var(--admin-text)] border border-[color:var(--admin-border)] uppercase tracking-wider" style={{ background: 'var(--admin-surface)' }}>
                          {lawyer.lawyer_profile?.educational_qualifications?.length > 0 ? 'Profile Complete' : 'Basic Review'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[color:var(--admin-text)] border border-[color:var(--admin-border)] uppercase tracking-wider" style={{ background: 'var(--admin-surface)' }}>
                          BAR {lawyer.lawyer_profile?.bar_council_id || 'PENDING'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-pill admin-pill-alert inline-block">
                        Pending Review
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-6">
                        <button
                          onClick={() => {
                            openDossier(lawyer)
                          }}
                          className="text-[11px] font-bold text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] uppercase tracking-wider transition-colors"
                        >
                          Request Info
                        </button>
                        <button
                          onClick={() => {
                            openDossier(lawyer)
                          }}
                          className="admin-btn-primary px-5 py-2 text-xs"
                        >
                          Verify
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Pagination/Footer */}
            <div className="p-6 border-t border-[color:var(--admin-border)] flex items-center justify-between" style={{ background: 'var(--admin-surface)' }}>
              <p className="text-[11px] text-[color:var(--admin-muted)] font-medium">
                Showing {Math.min((currentPage - 1) * 10 + 1, totalApplications)} - {Math.min(currentPage * 10, totalApplications)} of {totalApplications} applicants
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="admin-btn-ghost p-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-[color:var(--admin-text)]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="admin-btn-ghost p-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-empty-state">
            <ShieldCheck className="w-12 h-12 text-[color:var(--admin-muted)] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[color:var(--admin-text)] mb-2">No Pending Verifications</h3>
            <p className="text-[color:var(--admin-muted)] font-medium text-sm">All applicants have been reviewed and processed.</p>
          </div>
        )}
      </div>

      {/* Compliance Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[color:var(--admin-border)]" style={{ background: 'var(--admin-surface-strong)', boxShadow: 'var(--admin-shadow-md)' }}>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl" style={{ background: 'var(--admin-glow)' }}></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl" style={{ background: 'rgba(99, 136, 214, 0.2)' }}></div>
        </div>
        <div className="relative z-10 p-10 flex flex-col gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold text-[color:var(--admin-muted)] uppercase tracking-[0.25em] mb-3">Compliance Standard 4.0</p>
            <h2 className="text-3xl font-bold text-[color:var(--admin-text)] mb-3">Focused legal review, clear approval trail.</h2>
            <p className="text-[color:var(--admin-muted)] text-sm leading-relaxed max-w-2xl">
              The verification process is built around the essentials: bar identity, admin-assigned designation, and a permanent audit trail. Nothing extra, nothing noisy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="border border-[color:var(--admin-border)] rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'var(--admin-surface)' }}>
              <BadgeCheck className="w-5 h-5 text-[color:var(--admin-accent)] flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--admin-muted)]">Designation</p>
                <p className="text-sm font-semibold text-[color:var(--admin-text)]">Assigned by admin</p>
              </div>
            </div>
            <div className="border border-[color:var(--admin-border)] rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'var(--admin-surface)' }}>
              <ShieldCheck className="w-5 h-5 text-[color:var(--admin-accent)] flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--admin-muted)]">Audit Trail</p>
                <p className="text-sm font-semibold text-[color:var(--admin-text)]">Logged permanently</p>
              </div>
            </div>
            <div className="border border-[color:var(--admin-border)] rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'var(--admin-surface)' }}>
              <Building2 className="w-5 h-5 text-[color:var(--admin-accent)] flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--admin-muted)]">Compliance</p>
                <p className="text-sm font-semibold text-[color:var(--admin-text)]">KYC + Bar check</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-[color:var(--admin-border)] pt-5">
            <p className="text-xs text-[color:var(--admin-muted)] uppercase tracking-widest font-bold">Ready for internal or regulatory review</p>
            <button
              onClick={openAuditLog}
              className="admin-btn-primary text-sm px-6 py-2.5 inline-block w-max"
            >
              Review Audit Log
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showModal && selectedLawyer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 admin-modal-backdrop z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="admin-modal-panel max-w-5xl w-full p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[color:var(--admin-text)]">Applicant Dossier</h2>
                  <p className="text-sm text-[color:var(--admin-muted)] uppercase tracking-widest mt-1 font-bold">Confidential Review</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedLawyer(null)
                    setSelectedDesignation('')
                  }}
                  className="text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const profile = selectedLawyer.lawyer_profile || {}
                const photoUrl = selectedLawyer.photo_url || null
                const education = asList(profile.educational_qualifications)
                const admissions = asList(profile.admissions_awards)
                const cities = asList(profile.cities)
                const competencies = asList(profile.core_competencies)
                const documentExpertise = asDocumentList(profile.document_expertise)
                // Show pending designation if none has been assigned yet.
                const designationValue = selectedDesignation || profile.designation || null

                return (
                  <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-8 mb-8">
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm p-5">
                        <div className="flex items-start gap-4">
                          {photoUrl ? (
                            <img src={photoUrl} alt={selectedLawyer.name} className="w-20 h-24 object-cover rounded-sm border border-gray-200 dark:border-dark-600" />
                          ) : (
                            <div className="w-20 h-24 rounded-sm bg-[#0f172a] flex items-center justify-center text-white font-serif text-2xl font-bold">
                              {selectedLawyer.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Full Legal Name</p>
                            <p className="font-serif font-bold text-[#0f172a] dark:text-white text-lg leading-tight">{selectedLawyer.name}</p>
                            <p className="text-sm text-gray-500 mt-2 break-all">{selectedLawyer.email}</p>
                            <div className="mt-3 inline-flex items-center gap-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider text-[#0f172a] dark:text-white">
                              <BadgeCheck className="w-4 h-4 text-[#b48641]" />
                              {formatRoleLabel(designationValue)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">License Number</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{profile.license_number || '—'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Bar Council ID</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{profile.bar_council_id || '—'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Experience</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{profile.years_of_experience || 0} years</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Consultation Fee</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{formatPrice(profile.consultation_fee || 0)}/30 min</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                        <label className="block text-[10px] font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">
                          Assign Designation
                        </label>
                        <select
                          value={selectedDesignation}
                          onChange={(e) => setSelectedDesignation(e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-800 focus:outline-none focus:border-[#b48641] transition-colors text-sm"
                        >
                          {DESIGNATION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">This designation will be shown on lawyer cards and profile pages after approval.</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                          <div className="flex items-center gap-2 mb-3 text-[#b48641]">
                            <GraduationCap className="w-4 h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Academic Credentials</p>
                          </div>
                          <div className="space-y-3">
                            {education.length > 0 ? education.map((item, index) => (
                              <div key={`${item.university || item.degree || index}`} className="border-b border-gray-200 dark:border-dark-600 pb-3 last:border-b-0 last:pb-0">
                                <p className="font-medium text-sm text-gray-900 dark:text-white">{item.university || 'Institution'}</p>
                                <p className="text-xs text-gray-500">{item.degree || item}</p>
                              </div>
                            )) : <p className="text-sm text-gray-500">No academic credentials provided.</p>}
                          </div>
                        </div>

                        <div className="p-5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                          <div className="flex items-center gap-2 mb-3 text-[#b48641]">
                            <Award className="w-4 h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Admissions & Awards</p>
                          </div>
                          <div className="space-y-3">
                            {admissions.length > 0 ? admissions.map((item, index) => (
                              <div key={`${item}-${index}`} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                              </div>
                            )) : <p className="text-sm text-gray-500">No admissions or awards listed.</p>}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                          <div className="flex items-center gap-2 mb-3 text-[#b48641]">
                            <Globe className="w-4 h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Core Competencies</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {competencies.length > 0 ? competencies.map((item, index) => (
                              <span key={`${item}-${index}`} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                {item}
                              </span>
                            )) : <p className="text-sm text-gray-500">No competencies entered.</p>}
                          </div>
                        </div>

                        <div className="p-5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                          <div className="flex items-center gap-2 mb-3 text-[#b48641]">
                            <MapPin className="w-4 h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Cities Covered</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {cities.length > 0 ? cities.map((item, index) => (
                              <span key={`${item}-${index}`} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                {item}
                              </span>
                            )) : <p className="text-sm text-gray-500">No cities listed.</p>}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                          <div className="flex items-center gap-2 mb-3 text-[#b48641]">
                            <FileText className="w-4 h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Document Expertise</p>
                          </div>
                          <div className="space-y-3">
                            {documentExpertise.length > 0 ? documentExpertise.map((item, index) => (
                              <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-dark-600 pb-3 last:border-b-0 last:pb-0">
                                <p className="text-sm text-gray-700 dark:text-gray-300">{item.name}</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.fee ? formatPrice(item.fee) : '—'}</p>
                              </div>
                            )) : <p className="text-sm text-gray-500">No document pricing has been added.</p>}
                          </div>
                        </div>

                        <div className="p-5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                          <div className="flex items-center gap-2 mb-3 text-[#b48641]">
                            <Briefcase className="w-4 h-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Consultation Pricing</p>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm text-gray-700 dark:text-gray-300">30 Minutes</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(profile.consultation_fee || 0)}</p>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm text-gray-700 dark:text-gray-300">60 Minutes</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(profile.consultation_fee_60 || (profile.consultation_fee || 0) * 1.5)}</p>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm text-gray-700 dark:text-gray-300">90 Minutes</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(profile.consultation_fee_90 || (profile.consultation_fee || 0) * 2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Biography / Statement</p>
                        <p className="font-medium text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {profile.bio || 'No biography provided.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Rejection Reason */}
              <div className="mb-8">
                <label className="block text-[10px] font-bold text-[#0f172a] dark:text-gray-300 uppercase tracking-widest mb-2">
                  Rejection Justification (Required for denial)
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="admin-textarea resize-none"
                  placeholder="State compliance violations or missing credentials..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => rejectLawyer.mutate({
                    userId: selectedLawyer.id,
                    reason: rejectionReason,
                  })}
                  disabled={!rejectionReason || rejectLawyer.isPending}
                  className="flex-1 border border-red-300/60 bg-red-100/70 hover:bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 dark:border-red-400/40 font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  Deny Application
                </button>
                <button
                  onClick={() => verifyLawyer.mutate({
                    userId: selectedLawyer.id,
                    designation: selectedDesignation,
                  })}
                  disabled={verifyLawyer.isPending}
                  className="flex-[2] admin-btn-primary py-3 disabled:opacity-50"
                >
                  {verifyLawyer.isPending ? 'Verifying...' : 'Approve & Verify Credentials'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audit Log Modal */}
      <AnimatePresence>
        {showAuditLogModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 admin-modal-backdrop z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="admin-modal-panel max-w-5xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex justify-between items-start px-8 pt-8 pb-6 border-b border-[color:var(--admin-border)]">
                <div>
                  <h2 className="text-2xl font-bold text-[color:var(--admin-text)]">Recent Activity</h2>
                  <p className="text-sm text-[color:var(--admin-muted)] uppercase tracking-widest mt-1 font-bold">System Audit Log</p>
                </div>
                <button
                  onClick={() => setShowAuditLogModal(false)}
                  className="text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(90vh-110px)]">
                {isLoadingAuditLogs ? (
                  <div className="py-20">
                    <Loader />
                  </div>
                ) : auditLogs?.data?.length > 0 ? (
                  <div className="space-y-5">
                    {auditLogs.data.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-5 pb-5 border-b border-[color:var(--admin-border)] last:border-b-0 last:pb-0">
                        <div className="w-10 h-10 rounded-xl bg-[linear-gradient(145deg,var(--admin-accent),var(--admin-accent-soft))] flex items-center justify-center flex-shrink-0 shadow-inner mt-1">
                          <span className="text-white font-bold text-lg">
                            {activity.admin?.name?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-4 mb-1">
                            <p className="font-bold text-[color:var(--admin-text)] text-sm">{activity.admin?.name}</p>
                            <span className="text-xs text-[color:var(--admin-muted)] font-medium whitespace-nowrap">
                              {new Date(activity.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-[color:var(--admin-muted)] mb-2 leading-relaxed">
                            Executed <span className="font-semibold text-[color:var(--admin-text)]">{activity.action.replace(/_/g, ' ').toUpperCase()}</span>
                            {activity.target_user && ` on ${activity.target_user.name}`}
                          </p>
                          {activity.notes && (
                            <p className="text-xs text-[color:var(--admin-muted)] p-2.5 rounded-xl border border-[color:var(--admin-border)]" style={{ background: 'var(--admin-surface)' }}>
                              {activity.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <ShieldCheck className="w-12 h-12 text-[color:var(--admin-muted)] mx-auto mb-4" />
                    <p className="text-[color:var(--admin-muted)] font-medium">No recent activity detected.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminVerifications
