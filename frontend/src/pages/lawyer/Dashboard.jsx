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
        <div className="relative overflow-hidden rounded-[2rem] border border-[#e7dcc6] bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.14),_transparent_34%),linear-gradient(180deg,#fffdf8_0%,#f8fafc_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.10)] dark:border-dark-600 dark:bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.10),_transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(15,23,42,0.92)_100%)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af37] via-[#fbbf24] to-transparent"></div>
          <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-[#fbbf24]/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-[#0f172a]/5 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex h-full flex-col p-6 lg:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#b45309] dark:text-[#fbbf24] mb-2">Bar Association</p>
                <h3 className="font-serif text-[28px] font-bold text-[#0f172a] leading-none dark:text-white">Credentials</h3>
                <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-300">
                  Your professional registration presented with a calmer, more distinguished visual hierarchy.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e7dcc6] bg-white/80 shadow-sm backdrop-blur dark:border-dark-600 dark:bg-dark-700/80">
                <Briefcase className="h-5 w-5 text-[#b45309] dark:text-[#fbbf24]" strokeWidth={1.8} />
              </div>
            </div>

            <div className="grid gap-3">
              {credentialItems.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.label}
                    className={`group flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200 ${item.highlight
                      ? 'border-[#e7dcc6] bg-gradient-to-r from-[#fff7df] via-white to-[#fffdf8] shadow-[0_10px_30px_rgba(180,83,9,0.08)] dark:border-dark-600 dark:from-dark-700 dark:via-dark-800 dark:to-dark-700 dark:bg-dark-800 dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)]'
                      : 'border-[#e5e7eb] bg-white/80 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:border-dark-600 dark:bg-dark-800/80 dark:hover:bg-dark-700/80 dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)]'
                      }`}
                  >
                    <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${item.highlight ? 'border-[#fbbf24]/40 bg-[#fbbf24]/10 dark:border-[#fbbf24]/25 dark:bg-[#fbbf24]/10' : 'border-slate-200 bg-slate-50 dark:border-dark-600 dark:bg-dark-700'}`}>
                      <Icon className={`h-4 w-4 ${item.highlight ? 'text-[#b45309] dark:text-[#fbbf24]' : 'text-slate-500 dark:text-slate-300'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#b45309] dark:text-[#fbbf24] mb-1">{item.label}</p>
                      <p className="font-serif text-[15px] font-bold text-[#0f172a] dark:text-white leading-snug break-words">
                        {item.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/lawyer/settings"
                className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#111c35] dark:bg-[#fbbf24] dark:text-[#0f172a] dark:shadow-[0_14px_30px_rgba(0,0,0,0.28)] dark:hover:bg-[#f8d974]"
              >
                <Settings className="h-3.5 w-3.5" />
                Update Credentials
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400 dark:text-slate-400">
                Verified professional profile
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-[#e7dcc6] bg-[radial-gradient(circle_at_top_right,_rgba(15,23,42,0.10),_transparent_36%),linear-gradient(180deg,#fffdf8_0%,#f8fafc_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.10)] dark:border-dark-600 dark:bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.08),_transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(17,24,39,0.94)_100%)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af37] via-[#94a3b8] to-transparent"></div>
          <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-[#0f172a]/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-[#fbbf24]/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex h-full flex-col p-6 lg:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#b45309] dark:text-[#fbbf24] mb-2">Session Planning</p>
                <h3 className="font-serif text-[28px] font-bold text-[#0f172a] leading-none dark:text-white">Next Session Schedule</h3>
                <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-300">
                  A quieter, more elegant presentation of your next booking so it feels purposeful instead of loud.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e7dcc6] bg-white/80 shadow-sm backdrop-blur dark:border-dark-600 dark:bg-dark-700/80">
                <Calendar className="h-5 w-5 text-[#b45309] dark:text-[#fbbf24]" />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#e5e7eb] bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-dark-600 dark:bg-dark-800/80 dark:shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e7dcc6] bg-[#fff8e7] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.24em] text-[#92400e] dark:border-[#fbbf24]/20 dark:bg-[#fbbf24]/10 dark:text-[#fbbf24]">
                  <Clock className="h-3 w-3 text-[#b45309] dark:text-[#fbbf24]" />
                  Auto-synced
                </div>
                <div className="h-10 w-10 rounded-full border border-[#e7dcc6] bg-gradient-to-br from-[#fff8e7] to-white flex items-center justify-center dark:border-dark-600 dark:from-dark-700 dark:to-dark-800">
                  <ShieldCheck className="h-4 w-4 text-[#b45309] dark:text-[#fbbf24]" />
                </div>
              </div>

              {nextConsultation ? (
                <>
                  <h4 className="font-serif text-[24px] font-bold text-[#0f172a] leading-tight dark:text-white">
                    {formatDateTime(nextConsultation.scheduled_at).split(' at ')[0]}
                    <span className="block text-[#b45309] dark:text-[#fbbf24]">{formatDateTime(nextConsultation.scheduled_at).split(' at ')[1]}</span>
                  </h4>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                      Client: <span className="font-semibold text-slate-900 dark:text-white">{nextConsultation.client?.name}</span>
                    </p>
                    <p>
                      {nextConsultation.duration} min consultation <span className="text-slate-300 dark:text-slate-500">•</span> {formatPrice(nextConsultation.fee)}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      to="/lawyer/consultations"
                      className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#111c35] dark:bg-[#fbbf24] dark:text-[#0f172a] dark:shadow-[0_14px_30px_rgba(0,0,0,0.28)] dark:hover:bg-[#f8d974]"
                    >
                      Manage Queue
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400 dark:text-slate-400">
                      Ready for the next client
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-serif text-[24px] font-bold text-[#0f172a] leading-tight dark:text-white">
                    No upcoming sessions
                  </h4>
                  <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-300">
                    Your schedule is clear and calm. Use this space to open availability when needed.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      to="/lawyer/settings"
                      className="inline-flex items-center gap-2 rounded-full bg-[#b45309] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white shadow-[0_14px_30px_rgba(180,83,9,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#9a3412] dark:bg-[#fbbf24] dark:text-[#0f172a] dark:shadow-[0_14px_30px_rgba(0,0,0,0.28)] dark:hover:bg-[#f8d974]"
                    >
                      Update Availability
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400 dark:text-slate-400">
                      Keep your calendar current
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LawyerDashboard
