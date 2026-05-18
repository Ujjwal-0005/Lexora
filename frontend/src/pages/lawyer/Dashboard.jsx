import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  DollarSign,
  Star,
  Users,
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
        <div className="relative overflow-hidden shadow-2xl flex items-end min-h-[240px] bg-gradient-to-br from-[#0f172a] via-[#1f2937] to-[#334155] p-0 border border-white/10">
          {/* Decorative top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fbbf24] via-[#94a3b8] to-transparent"></div>

          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#94a3b8] rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-[#fbbf24] rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>

          {/* Premium badge */}
          <div className="absolute top-5 right-5 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full z-10 shadow-sm">
            <Award className="w-4 h-4 text-[#fbbf24]" />
            <span className="text-[11px] font-bold text-white uppercase tracking-[0.22em]">Professional</span>
          </div>

          <div className="relative z-10 w-full p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-11 h-11 bg-gradient-to-br from-[#fbbf24] to-[#94a3b8] rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/10">
                <Briefcase className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-[0.32em]">Bar Association</p>
                <h3 className="font-serif text-[24px] leading-none font-bold text-white mt-0.5">Credentials</h3>
              </div>
            </div>

            {/* Credentials Grid */}
            <div className="space-y-2 mb-4">
              {/* License Number */}
              <div className="flex items-start gap-2.5 bg-white/8 backdrop-blur-sm border border-white/10 p-2.5 rounded-xl hover:bg-white/12 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <Shield className="w-4 h-4 text-[#fbbf24] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-[0.24em] mb-0.5">Bar License</p>
                  <p className="font-serif text-[15px] font-bold text-white/95 drop-shadow-sm leading-tight">{profile?.license_number || 'Pending Verification'}</p>
                </div>
              </div>

              {/* Bar Council ID */}
              <div className="flex items-start gap-2.5 bg-white/8 backdrop-blur-sm border border-white/10 p-2.5 rounded-xl hover:bg-white/12 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <ShieldCheck className="w-4 h-4 text-[#fbbf24] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-[0.24em] mb-0.5">Bar Council ID</p>
                  <p className="font-serif text-[15px] font-bold text-white/95 drop-shadow-sm leading-tight">{profile?.bar_council_id || 'Pending Verification'}</p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-start gap-2.5 bg-white/8 backdrop-blur-sm border border-white/10 p-2.5 rounded-xl hover:bg-white/12 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <Award className="w-4 h-4 text-[#fbbf24] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-[0.24em] mb-0.5">Years of Experience</p>
                  <p className="font-serif text-[15px] font-bold text-white/95 drop-shadow-sm leading-tight">{profile?.years_of_experience || 0} <span className="text-[10px] font-medium text-white/75">Years</span></p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Link to="/lawyer/settings" className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#fbbf24] to-[#94a3b8] font-extrabold text-[10px] uppercase tracking-[0.28em] rounded-xl drop-shadow-sm hover:shadow-lg hover:scale-105 transition-all" style={{ color: '#111827' }}>
              <Settings className="w-3.5 h-3.5" />
              Update Credentials
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Next Session Card - Premium Match */}
        <div className="relative overflow-hidden min-h-[240px] shadow-2xl bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#1e293b] p-0 flex flex-col justify-between border border-white/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fbbf24] via-[#cbd5e1] to-transparent"></div>
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-8 right-8 w-56 h-56 bg-[#cbd5e1] rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-[#fbbf24] rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 p-6 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#fbbf24] mb-1.5">
                  Next Session Schedule
                </p>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[9px] font-bold uppercase tracking-[0.22em] text-white/90 shadow-sm">
                  <Clock className="w-2.5 h-2.5 text-[#fbbf24]" />
                  Auto-synced
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shadow-sm">
                <Calendar className="w-4 h-4 text-[#fbbf24]" />
              </div>
            </div>

            {nextConsultation ? (
              <>
                <h3 className="font-serif text-[24px] font-bold text-white mb-2 leading-tight drop-shadow-sm">
                  {formatDateTime(nextConsultation.scheduled_at).split(' at ')[0]},<br />
                  {formatDateTime(nextConsultation.scheduled_at).split(' at ')[1]}
                </h3>
                <div className="mb-4 space-y-1.5">
                  <p className="text-white/80 font-medium text-xs">
                    Client: {nextConsultation.client?.name}
                  </p>
                  <p className="text-white/70 text-[10px] tracking-wide">
                    {nextConsultation.duration} min consultation • {formatPrice(nextConsultation.fee)}
                  </p>
                </div>
                <Link to="/lawyer/consultations" className="inline-flex items-center gap-2 w-max px-3 py-2 rounded-xl bg-white text-[#0f172a] font-bold text-[10px] uppercase tracking-[0.28em] hover:bg-[#f8fafc] transition-all shadow-lg hover:shadow-xl" style={{ color: '#111827' }}>
                  Manage Queue
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <h3 className="font-serif text-[24px] font-bold text-white mb-2 leading-tight drop-shadow-sm">
                  No upcoming sessions
                </h3>
                <p className="text-white/75 font-medium mb-4 max-w-sm text-xs">
                  Your schedule is clear.
                </p>
                <Link to="/lawyer/settings" className="inline-flex items-center gap-2 w-max px-3 py-2 rounded-xl bg-[#fbbf24] font-extrabold text-[10px] uppercase tracking-[0.28em] drop-shadow-sm hover:bg-[#fde68a] transition-all shadow-lg hover:shadow-xl" style={{ color: '#111827' }}>
                  Update Availability
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LawyerDashboard
