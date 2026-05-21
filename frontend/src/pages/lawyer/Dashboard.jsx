import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Star,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  Settings,
  FileText,
  ShieldCheck,
  Activity,
  Award,
  Briefcase,
  Shield
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useConsultations } from '../../hooks/useConsultations'
import { useAuthStore } from '../../store/authStore'
import { formatDateTime, formatPrice } from '../../utils/formatDate'
import Loader from '../../components/Loader'
import api from '../../api/axios'

const LawyerDashboard = () => {
  const { user } = useAuthStore()
  const { data: consultations, isLoading } = useConsultations()
  const { data: documentsResponse } = useQuery({
    queryKey: ['lawyer-documents'],
    queryFn: async () => {
      const response = await api.get('/lawyer/documents')
      return response.data.documents
    },
  })

  const documents = Array.isArray(documentsResponse)
    ? documentsResponse
    : documentsResponse?.data || []

  const profile = user?.lawyer_profile
  const now = new Date()

  const upcomingConsultations = consultations?.data?.filter(
    c => ['pending', 'confirmed'].includes(c.status) && new Date(c.scheduled_at) >= now
  )?.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)) || []

  const completedConsultations = consultations?.data?.filter(
    c => c.status === 'completed'
  ) || []

  const completedDocuments = documents?.filter(
    d => ['completed', 'delivered'].includes(d.status)
  ) || []

  const consultationEarnings = completedConsultations.reduce((sum, c) => sum + (Number(c.fee) || 0), 0)
  const documentEarnings = completedDocuments.reduce((sum, d) => {
    const price = Number(d.price)
    return sum + (Number.isFinite(price) ? price : 0)
  }, 0)
  const totalEarnings = consultationEarnings + documentEarnings

  const stats = [
    {
      icon: Calendar,
      label: 'UPCOMING SESSIONS',
      value: upcomingConsultations.length,
      trend: 'Scheduled for this week',
      color: 'text-[#0f172a]'
    },
    {
      icon: CheckCircle2,
      label: 'COMPLETED CASES',
      value: completedConsultations.length,
      trend: 'Total successful closures',
      color: 'text-[#0f172a]'
    },
    {
      icon: FileText,
      label: 'EARNINGS',
      value: formatPrice(totalEarnings),
      trend: 'Total revenue generated',
      color: 'text-[#0f172a]'
    },
    {
      icon: Star,
      label: 'AVERAGE RATING',
      value: profile?.average_rating || 'N/A',
      trend: 'Client satisfaction score',
      color: 'text-[#0f172a]'
    },
  ]

  const nextConsultation = upcomingConsultations.length > 0 ? upcomingConsultations[0] : null;

  const credentialItems = [
    {
      icon: Shield,
      label: 'Bar License',
      value: profile?.license_number || 'Pending Verification',
      highlight: false,
    },
    {
      icon: ShieldCheck,
      label: 'Bar Council ID',
      value: profile?.bar_council_id || 'Pending Verification',
      highlight: false,
    },
    {
      icon: Award,
      label: 'Years of Experience',
      value: `${profile?.years_of_experience || 0} Years`,
      highlight: true,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto pb-20 font-sans">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-5xl font-bold text-[#0f172a] tracking-tight mb-3">
          Practice Overview
        </h1>
        <p className="text-gray-500 font-medium">
          Professional health and consultation performance metrics.
        </p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-800 border-t-4 border-[#0f172a] shadow-sm p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-gray-500 tracking-widest uppercase w-2/3 leading-tight">{stat.label}</p>
                <div className="p-2 bg-gray-50 dark:bg-dark-700 rounded-sm">
                  <Icon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h3 className="font-serif text-4xl font-bold text-[#0f172a] dark:text-white mb-3">
                  {stat.value}
                </h3>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-green-600" />
                  {stat.trend}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Left Area (2/3): Recent Activity / Consultations */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white">Recent Activity</h2>
              <Link to="/lawyer/consultations" className="text-xs font-bold text-[#d97706] hover:text-[#b45309] uppercase tracking-wider transition-colors">
                View All Records
              </Link>
            </div>

            {isLoading ? (
              <div className="py-10"><Loader /></div>
            ) : consultations?.data?.length > 0 ? (
              <div className="space-y-6">
                {consultations.data.slice(0, 4).map((consultation, idx) => (
                  <div key={consultation.id} className={`flex gap-6 pb-6 ${idx !== 3 ? 'border-b border-gray-100 dark:border-dark-600' : ''}`}>
                    <div className="mt-1">
                      {consultation.status === 'completed' ? (
                        <div className="w-10 h-10 bg-green-100 flex items-center justify-center rounded-sm">
                          <CheckCircle2 className="w-5 h-5 text-green-700" />
                        </div>
                      ) : consultation.status === 'confirmed' ? (
                        <div className="w-10 h-10 bg-[#0f172a] flex items-center justify-center rounded-sm">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-dark-700 flex items-center justify-center rounded-sm">
                          <Clock className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-[#0f172a] dark:text-white text-sm">
                          Consultation with {consultation.client?.name}
                        </h4>
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">
                          {formatDateTime(consultation.scheduled_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                        Client booked a {consultation.duration}-minute session. Fee: {formatPrice(consultation.fee)}.
                      </p>
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm
                        ${consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                          consultation.status === 'confirmed' ? 'bg-[#fef3c7] text-[#92400e]' :
                            consultation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-[#0f172a] text-white'}`}
                      >
                        {consultation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-gray-500">No recent activity detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Area (1/3): Practice Management */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1f2937] text-white p-8 shadow-2xl border border-white/10 flex flex-col">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-20 right-0 w-56 h-56 bg-[#d97706] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#fbbf24] rounded-full blur-3xl"></div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fbbf24] via-[#d97706] to-transparent"></div>

          <div className="relative z-10">
            {/* Rating widget removed from dashboard; use sidebar Rate us modal */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#fbbf24] mb-2">Dashboard Controls</p>
                <h2 className="font-serif text-2xl font-bold text-white">Practice Management</h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-[#fbbf24]" />
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <Link to="/lawyer/consultations" className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all rounded-xl border border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-200 group-hover:text-white">
                  <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                    <Calendar className="w-4 h-4 text-[#fbbf24]" />
                  </span>
                  My Schedule
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link to="/lawyer/documents" className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all rounded-xl border border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-200 group-hover:text-white">
                  <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                    <FileText className="w-4 h-4 text-[#fbbf24]" />
                  </span>
                  Document Drafts
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link to="/lawyer/settings" className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all rounded-xl border border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-200 group-hover:text-white">
                  <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                    <Settings className="w-4 h-4 text-[#fbbf24]" />
                  </span>
                  Profile Settings
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Availability Status</p>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-inner">
                <div className="flex items-center gap-3 mb-3">
                  <span className="relative flex h-3 w-3">
                    {profile?.is_available && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${profile?.is_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </span>
                  <span className="text-sm font-bold text-white tracking-wide">
                    {profile?.is_available ? 'Accepting Consultations' : 'Currently Unavailable'}
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-6">
                  <div className="bg-[#d97706] w-full h-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2 Cards */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Professional Credentials Card - Premium Design */}
        <div className="relative overflow-hidden min-h-[260px] rounded-3xl border border-[#d7c8a7]/70 bg-gradient-to-br from-[#f7f1e5] via-[#efe4cd] to-[#d7c7a2] shadow-[0_20px_60px_rgba(15,23,42,0.16)] dark:border-white/10 dark:from-[#0f172a] dark:via-[#172033] dark:to-[#233046] dark:shadow-[0_22px_70px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-white/55 blur-3xl dark:bg-[#f5d28a]/10"></div>
            <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-[#b8892d]/18 blur-3xl dark:bg-[#f5d28a]/12"></div>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b8892d]/60 to-transparent dark:via-[#f5d28a]/55"></div>
          </div>

          <div className="relative z-10 flex h-full flex-col p-7 sm:p-8 text-[#111827] dark:text-white">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#b8892d]/20 bg-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8a6212] backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-[#f5d28a]">
                  <Award className="h-3.5 w-3.5" />
                  Bar Association Credentials
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827] text-white shadow-lg shadow-[#111827]/20 ring-1 ring-white/40 dark:bg-white dark:text-[#111827] dark:shadow-black/30 dark:ring-white/10">
                      <Briefcase className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#8a6212] dark:text-[#f5d28a]">Verified Practice Identity</p>
                      <h3 className="font-serif text-3xl font-bold text-[#111827] leading-none dark:text-white">Credentials</h3>
                    </div>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-[#4b5563] dark:text-white/70">
                    Your bar profile appears as a polished authority block, with premium spacing and quiet contrast for easier reading.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-[#b8892d]/20 bg-white/55 px-4 py-3 text-right backdrop-blur-sm shadow-sm dark:border-white/10 dark:bg-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a6212] mb-1 dark:text-[#f5d28a]">Standing</p>
                <p className="text-sm font-semibold text-[#111827] dark:text-white">Professional</p>
              </div>
            </div>

            <div className="grid gap-3 mb-6">
              <div className="flex items-start gap-3 rounded-2xl border border-[#d7c8a7]/70 bg-white/60 p-4 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-[#f5d28a] shadow-sm dark:bg-white/10 dark:text-[#f5d28a]">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a6212] mb-1 dark:text-[#f5d28a]">Bar License</p>
                  <p className="font-serif text-base font-bold text-[#111827] leading-tight break-words dark:text-white">
                    {profile?.license_number || 'Pending Verification'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-[#d7c8a7]/70 bg-white/60 p-4 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-[#f5d28a] shadow-sm dark:bg-white/10 dark:text-[#f5d28a]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a6212] mb-1 dark:text-[#f5d28a]">Bar Council ID</p>
                  <p className="font-serif text-base font-bold text-[#111827] leading-tight break-words dark:text-white">
                    {profile?.bar_council_id || 'Pending Verification'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-[#d7c8a7]/70 bg-white/60 p-4 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-[#f5d28a] shadow-sm dark:bg-white/10 dark:text-[#f5d28a]">
                  <Award className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a6212] mb-1 dark:text-[#f5d28a]">Years of Experience</p>
                  <p className="font-serif text-base font-bold text-[#111827] leading-tight dark:text-white">
                    {profile?.years_of_experience || 0} <span className="text-sm font-medium text-[#6b7280] dark:text-white/70">Years</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-[#b8892d]/20 pt-5 dark:border-white/10">
              <p className="text-xs font-medium text-[#6b7280] dark:text-white/60">
                Keep your professional identity current and presentation-ready.
              </p>
              <Link
                to="/lawyer/settings"
                className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white shadow-lg shadow-[#111827]/20 transition-all hover:-translate-y-0.5 hover:bg-[#0b1220] dark:bg-white dark:text-[#111827] dark:shadow-black/20 dark:hover:bg-[#f8fafc]"
              >
                Update Credentials
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Next Session Card - Premium Match */}
        <div className="relative overflow-hidden min-h-[260px] rounded-3xl border border-[#d7c8a7]/70 bg-gradient-to-br from-[#f7f1e5] via-[#efe4cd] to-[#d7c7a2] shadow-[0_20px_60px_rgba(15,23,42,0.16)] dark:border-white/10 dark:from-[#0a1120] dark:via-[#111c30] dark:to-[#1d2a42] dark:shadow-[0_22px_70px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-white/55 blur-3xl dark:bg-[#f5d28a]/10"></div>
            <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-[#b8892d]/18 blur-3xl dark:bg-[#f5d28a]/12"></div>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b8892d]/60 to-transparent dark:via-[#f5d28a]/55"></div>
          </div>

          <div className="relative z-10 flex h-full flex-col p-7 sm:p-8 text-[#111827] dark:text-white">
            <div className="flex items-start justify-between gap-4 mb-7">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#b8892d]/20 bg-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8a6212] backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-[#f5d28a] dark:shadow-[0_0_0_1px_rgba(245,210,138,0.08)]">
                  <Clock className="h-3.5 w-3.5" />
                  Next Session Schedule
                </div>
                <div>
                  <h3 className="font-serif text-3xl font-bold leading-tight text-[#111827] dark:text-[#f8fafc]">Your next appointment, elegantly staged.</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#4b5563] dark:text-white/62">
                    A refined snapshot of the next consultation, designed to feel calm, premium, and easy to scan at a glance.
                  </p>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#b8892d]/20 bg-white/55 backdrop-blur-sm shadow-sm dark:border-white/10 dark:bg-white/10 dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
                <Calendar className="h-5 w-5 text-[#8a6212] dark:text-[#f5d28a]" />
              </div>
            </div>

            <div className="mb-6 rounded-3xl border border-[#d7c8a7]/70 bg-white/60 p-5 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-white/10 dark:bg-[#121b2e] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              {nextConsultation ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="rounded-full bg-[#f5d28a]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a6212] dark:bg-[#f5d28a]/16 dark:text-[#f5d28a]">
                      Confirmed Queue
                    </span>
                    <span className="rounded-full border border-[#d7c8a7]/70 bg-white/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6b7280] dark:border-white/10 dark:bg-white/5 dark:text-white/62">
                      Auto-synced
                    </span>
                  </div>

                  <h4 className="font-serif text-2xl font-bold text-[#111827] leading-tight mb-3 dark:text-[#f8fafc]">
                    {formatDateTime(nextConsultation.scheduled_at).split(' at ')[0]}
                    <span className="block text-[#8a6212] dark:text-[#f5d28a]">{formatDateTime(nextConsultation.scheduled_at).split(' at ')[1]}</span>
                  </h4>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#d7c8a7]/70 bg-white/65 p-4 dark:border-white/10 dark:bg-[#1a2437] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a6212] mb-1 dark:text-[#f5d28a]/80">Client</p>
                      <p className="text-sm font-semibold text-[#111827] leading-tight dark:text-[#f8fafc]">{nextConsultation.client?.name}</p>
                    </div>
                    <div className="rounded-2xl border border-[#d7c8a7]/70 bg-white/65 p-4 dark:border-white/10 dark:bg-[#1a2437] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a6212] mb-1 dark:text-[#f5d28a]/80">Session</p>
                      <p className="text-sm font-semibold text-[#111827] leading-tight dark:text-[#f8fafc]">
                        {nextConsultation.duration} min · {formatPrice(nextConsultation.fee)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#f5d28a]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a6212] mb-4 dark:bg-white/8 dark:text-white/62">
                    Clear schedule
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-[#111827] leading-tight mb-2 dark:text-[#f8fafc]">
                    No upcoming sessions
                  </h4>
                  <p className="text-sm leading-6 text-[#4b5563] dark:text-white/65">
                    Your calendar is open. Use this space to keep availability polished and current.
                  </p>
                </>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-[#b8892d]/20 pt-5 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-medium text-[#6b7280] dark:text-white/60">
                <span className={`h-2.5 w-2.5 rounded-full ${profile?.is_available ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                {profile?.is_available ? 'Accepting consultations now' : 'Availability currently paused'}
              </div>
              <Link
                to={nextConsultation ? '/lawyer/consultations' : '/lawyer/settings'}
                className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#0b1220] dark:bg-[#f5d28a] dark:text-[#111827] dark:shadow-black/30 dark:hover:bg-[#ffe7a8]"
              >
                {nextConsultation ? 'Manage Queue' : 'Update Availability'}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LawyerDashboard
