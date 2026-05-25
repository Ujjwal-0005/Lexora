import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Star,
  ArrowRight,
  Clock,
  BadgeCheck,
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

  const recentActivityItems = [
    ...(documents || []).map((document) => ({
      id: `doc-${document.id}`,
      type: 'document',
      title: document.document_type_name || document.documentType?.name || document.document_name || 'Document Request',
      subtitle: document.client?.name ? `Requested by ${document.client.name}` : 'Document activity',
      date: document.updated_at || document.created_at,
      status: document.status,
      raw: document,
    })),
    ...(consultations?.data || []).map((consultation) => ({
      id: `con-${consultation.id}`,
      type: 'consultation',
      title: `Consultation with ${consultation.client?.name || 'Client'}`,
      subtitle: consultation.subject || consultation.description || consultation.notes || 'Consultation activity',
      date: consultation.updated_at || consultation.scheduled_at || consultation.created_at,
      status: consultation.status,
      raw: consultation,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

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
      note: 'Calendar health',
      tone: 'from-[#fff8e7] via-[#ffffff] to-[#f8fafc]',
      darkTone: 'dark:from-dark-700 dark:via-dark-800 dark:to-dark-700',
      borderTone: 'border-[#e7dcc6] dark:border-dark-600',
      iconTone: 'bg-[#fff3d4] text-[#9a3412] dark:bg-[#fbbf24]/15 dark:text-[#fbbf24]'
    },
    {
      icon: CheckCircle2,
      label: 'COMPLETED CASES',
      value: completedConsultations.length,
      trend: 'Total successful closures',
      note: 'Execution strength',
      tone: 'from-[#f8fafc] via-[#ffffff] to-[#eef2ff]',
      darkTone: 'dark:from-dark-700 dark:via-dark-800 dark:to-dark-700',
      borderTone: 'border-[#dbe2f0] dark:border-dark-600',
      iconTone: 'bg-[#ecfdf5] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
    },
    {
      icon: FileText,
      label: 'EARNINGS',
      value: formatPrice(totalEarnings),
      trend: 'Total revenue generated',
      note: 'Revenue outlook',
      tone: 'from-[#fffaf0] via-[#ffffff] to-[#f9fafb]',
      darkTone: 'dark:from-dark-700 dark:via-dark-800 dark:to-dark-700',
      borderTone: 'border-[#eadfca] dark:border-dark-600',
      iconTone: 'bg-[#fef3c7] text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
    },
    {
      icon: Star,
      label: 'AVERAGE RATING',
      value: profile?.average_rating || 'N/A',
      trend: 'Client satisfaction score',
      note: 'Trust index',
      tone: 'from-[#f8fafc] via-[#ffffff] to-[#f5f3ff]',
      darkTone: 'dark:from-dark-700 dark:via-dark-800 dark:to-dark-700',
      borderTone: 'border-[#dce3ef] dark:border-dark-600',
      iconTone: 'bg-[#eef2ff] text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
    },
  ]

  const nextConsultation = upcomingConsultations.length > 0 ? upcomingConsultations[0] : null;

  const credentialItems = [
    {
      icon: Shield,
      label: 'Bar License',
      value: profile?.license_number || 'Pending Verification',
      meta: 'State registration identifier',
      status: profile?.license_number ? 'Verified' : 'Pending review',
      highlight: !!profile?.license_number,
    },
    {
      icon: ShieldCheck,
      label: 'Bar Council ID',
      value: profile?.bar_council_id || 'Pending Verification',
      meta: 'National council compliance record',
      status: profile?.bar_council_id ? 'Validated' : 'Awaiting submission',
      highlight: !!profile?.bar_council_id,
    },
    {
      icon: Award,
      label: 'Years of Experience',
      value: `${profile?.years_of_experience || 0} Years`,
      meta: 'Measured active legal practice',
      status: 'Active standing',
      highlight: true,
    },
  ]

  const getSessionUrgency = (scheduledAt) => {
    const sessionDate = new Date(scheduledAt)
    const hoursUntil = (sessionDate.getTime() - Date.now()) / (1000 * 60 * 60)

    if (hoursUntil <= 24) {
      return {
        label: 'Priority Window',
        style: 'border-[#f59e0b]/35 bg-[#fffbeb] text-[#92400e] dark:border-[#fbbf24]/35 dark:bg-[#2f2208] dark:text-[#fcd34d] dark:shadow-[0_8px_20px_rgba(0,0,0,0.28)]'
      }
    }

    if (hoursUntil <= 72) {
      return {
        label: 'Approaching',
        style: 'border-[#94a3b8]/35 bg-[#f8fafc] text-[#334155] dark:border-[#64748b]/45 dark:bg-[#182131] dark:text-[#cbd5e1] dark:shadow-[0_8px_20px_rgba(0,0,0,0.26)]'
      }
    }

    return {
      label: 'Planned Ahead',
      style: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/35 dark:bg-[#11281f] dark:text-emerald-300 dark:shadow-[0_8px_20px_rgba(0,0,0,0.26)]'
    }
  }

  const nextSessionParts = nextConsultation
    ? formatDateTime(nextConsultation.scheduled_at).split(' at ')
    : []
  const nextSessionDate = nextSessionParts[0] || 'Schedule Pending'
  const nextSessionTime = nextSessionParts[1] || 'Time to be assigned'
  const urgency = nextConsultation ? getSessionUrgency(nextConsultation.scheduled_at) : null

  const getActivityPresentation = (type, status) => {
    if (type === 'document') {
      if (['completed', 'delivered'].includes(status)) {
        return {
          iconWrap: 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-500/10',
          iconColor: 'text-emerald-700 dark:text-emerald-300',
          chip: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300',
          title: 'Document Completed',
        }
      }

      if (['review', 'in_progress', 'paid', 'accepted', 'client_info_submitted'].includes(status)) {
        return {
          iconWrap: 'border-[#d6c8a8] bg-[#fff8e7] dark:border-[#fbbf24]/30 dark:bg-[#fbbf24]/12',
          iconColor: 'text-[#9a3412] dark:text-[#fbbf24]',
          chip: 'border-[#e7dcc6] bg-[#fff8e7] text-[#92400e] dark:border-[#fbbf24]/30 dark:bg-[#fbbf24]/12 dark:text-[#fbbf24]',
          title: 'Document In Progress',
        }
      }

      if (status === 'rejected') {
        return {
          iconWrap: 'border-rose-200 bg-rose-50 dark:border-rose-400/30 dark:bg-rose-500/10',
          iconColor: 'text-rose-700 dark:text-rose-300',
          chip: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300',
          title: 'Document Rejected',
        }
      }

      return {
        iconWrap: 'border-slate-200 bg-slate-50 dark:border-dark-500 dark:bg-dark-700',
        iconColor: 'text-slate-500 dark:text-slate-300',
        chip: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-300',
        title: 'Document Requested',
      }
    }

    if (status === 'completed') {
      return {
        iconWrap: 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-500/10',
        iconColor: 'text-emerald-700 dark:text-emerald-300',
        chip: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        title: 'Session Completed'
      }
    }

    if (status === 'confirmed') {
      return {
        iconWrap: 'border-[#d6c8a8] bg-[#fff8e7] dark:border-[#fbbf24]/30 dark:bg-[#fbbf24]/12',
        iconColor: 'text-[#9a3412] dark:text-[#fbbf24]',
        chip: 'border-[#e7dcc6] bg-[#fff8e7] text-[#92400e] dark:border-[#fbbf24]/30 dark:bg-[#fbbf24]/12 dark:text-[#fbbf24]',
        title: 'Confirmed Appointment'
      }
    }

    if (status === 'cancelled') {
      return {
        iconWrap: 'border-rose-200 bg-rose-50 dark:border-rose-400/30 dark:bg-rose-500/10',
        iconColor: 'text-rose-700 dark:text-rose-300',
        chip: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300',
        title: 'Cancelled Session'
      }
    }

    return {
      iconWrap: 'border-slate-200 bg-slate-50 dark:border-dark-500 dark:bg-dark-700',
      iconColor: 'text-slate-500 dark:text-slate-300',
      chip: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-300',
      title: 'Pending Confirmation'
    }
  }

  return (
    <div className="relative mx-auto max-w-7xl pb-20 font-sans">
      <div className="pointer-events-none absolute inset-x-0 -top-12 -z-10 h-64 bg-[radial-gradient(circle_at_15%_30%,rgba(212,175,55,0.18),transparent_48%),radial-gradient(circle_at_85%_15%,rgba(15,23,42,0.10),transparent_45%)] dark:bg-[radial-gradient(circle_at_18%_25%,rgba(251,191,36,0.14),transparent_45%),radial-gradient(circle_at_82%_18%,rgba(56,189,248,0.10),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.62)_0%,rgba(2,6,23,0)_100%)]"></div>

      {/* Header */}
      <div className="relative mb-10 overflow-hidden rounded-[2rem] border border-[#e7dcc6] bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.22),_transparent_42%),linear-gradient(135deg,#fffdf8_0%,#f8fafc_55%,#eef2f7_100%)] px-7 py-8 shadow-[0_24px_62px_rgba(15,23,42,0.10)] dark:border-[#334155]/65 dark:bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_42%),linear-gradient(150deg,#020617_0%,#0b1326_52%,#111827_100%)] dark:shadow-[0_30px_76px_rgba(2,6,23,0.52)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.34),rgba(255,255,255,0))] dark:bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.08),rgba(255,255,255,0))]"></div>
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#fbbf24] to-transparent"></div>
        <div className="pointer-events-none absolute -right-16 -top-14 h-40 w-40 rounded-full bg-[#fbbf24]/20 blur-3xl dark:bg-[#fbbf24]/18"></div>

        <div className="relative z-10">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.34em] text-[#9a3412] dark:text-[#fbbf24]">Lawyer Dashboard</p>
          <h1 className="mb-3 font-serif text-5xl font-bold tracking-tight text-[#0f172a] dark:text-white">
            Practice Overview
          </h1>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            Professional health, revenue flow, and consultation performance in one composed command center.
          </p>
        </div>
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
              className={`group relative overflow-hidden rounded-[1.7rem] border bg-gradient-to-br p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(15,23,42,0.13)] ${stat.borderTone} ${stat.tone} ${stat.darkTone}`}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#d4af37]/10 blur-2xl dark:bg-[#fbbf24]/10"></div>
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#94a3b8] to-transparent"></div>

              <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="w-2/3">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300 tracking-[0.24em] uppercase leading-tight">{stat.label}</p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af] dark:text-slate-400">{stat.note}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-dark-500 ${stat.iconTone}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.7} />
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="font-serif text-[2.15rem] font-bold text-[#111827] dark:text-white mb-3 leading-none">
                  {stat.value}
                </h3>
                <p className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-dark-500 dark:bg-dark-700/70 dark:text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
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
          <div className="group relative overflow-hidden rounded-[2rem] border border-[#e7dcc6] bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.16),_transparent_42%),linear-gradient(145deg,#fffcf3_0%,#f9fafc_46%,#f3f4f6_100%)] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_30px_85px_rgba(15,23,42,0.14)] dark:border-dark-600 dark:bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.12),_transparent_42%),linear-gradient(145deg,rgba(15,23,42,0.98)_0%,rgba(17,24,39,0.95)_46%,rgba(15,23,42,0.98)_100%)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.30),rgba(255,255,255,0))] dark:bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.04),rgba(255,255,255,0))]"></div>
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#94a3b8] to-transparent"></div>
            <div className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-[#fbbf24]/10 blur-3xl dark:bg-[#fbbf24]/12"></div>

            <div className="relative z-10 flex items-center justify-between mb-8 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#b45309] dark:text-[#fbbf24] mb-2">Activity Intelligence</p>
                <h2 className="font-serif text-[31px] font-bold text-[#111827] dark:text-white leading-none">Recent Activity</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  Executive-grade timeline of your latest consultation and document movement.
                </p>
              </div>
              <Link to="/lawyer/consultations" className="inline-flex items-center gap-2 rounded-full border border-[#e7dcc6] bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a3412] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#d6c8a8] hover:bg-[#fff8e7] dark:border-dark-500 dark:bg-dark-700/80 dark:text-[#fbbf24] dark:hover:border-[#fbbf24]/30 dark:hover:bg-dark-700">
                View All Records
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="relative z-10 py-12"><Loader /></div>
            ) : recentActivityItems.length > 0 ? (
              <div className="relative z-10 space-y-4">
                {recentActivityItems.slice(0, 4).map((item, idx) => {
                  const activity = getActivityPresentation(item.type, item.status)
                  const ActivityIcon = item.type === 'document'
                    ? FileText
                    : item.status === 'completed'
                      ? CheckCircle2
                      : item.status === 'confirmed'
                        ? Calendar
                        : Clock

                  return (
                    <div
                      key={item.id}
                      className="group/item relative rounded-2xl border border-[#e5e7eb] bg-white/78 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d6c8a8] hover:shadow-[0_16px_30px_rgba(15,23,42,0.10)] dark:border-dark-600 dark:bg-dark-800/78 dark:hover:border-[#fbbf24]/20 dark:hover:bg-dark-700/85 dark:hover:shadow-[0_16px_30px_rgba(0,0,0,0.24)]"
                    >
                      {idx !== 3 && (
                        <div className="pointer-events-none absolute left-[2.1rem] top-[3.9rem] bottom-[-1.15rem] w-px bg-gradient-to-b from-[#e7dcc6] to-transparent dark:from-dark-500"></div>
                      )}

                      <div className="flex gap-4">
                        <div className="mt-0.5">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${activity.iconWrap}`}>
                            <ActivityIcon className={`w-5 h-5 ${activity.iconColor}`} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-serif text-[19px] font-bold text-[#111827] dark:text-white leading-tight">
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-400 whitespace-nowrap">
                              {formatDateTime(item.date)}
                            </span>
                          </div>

                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {item.type === 'document'
                              ? `${activity.title}. ${item.subtitle}${item.raw?.price ? ` • Fee ${formatPrice(item.raw.price)}` : ''}`
                              : `${activity.title}. Client booked a ${item.raw?.duration}-minute session with a professional fee of ${formatPrice(item.raw?.fee)}`
                            }
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${activity.chip}`}>
                              {item.status}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-400">
                              {item.type === 'document' ? 'Document flow record' : 'Case flow record'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="relative z-10 py-12 text-center">
                <h3 className="font-serif text-[24px] font-bold text-[#111827] dark:text-white">No recent activity detected</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  Once consultations begin, this timeline will surface your most relevant engagement updates.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Area (1/3): Practice Management */}
        <div className="group relative overflow-hidden rounded-[2rem] border border-[#334155]/65 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.10),_transparent_45%),linear-gradient(155deg,#020617_0%,#0b1326_42%,#111827_100%)] text-white p-8 shadow-[0_30px_90px_rgba(2,6,23,0.55)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_36px_105px_rgba(2,6,23,0.62)] flex flex-col">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.08),rgba(255,255,255,0))]"></div>
          {/* removed yellow top-right aurora */}
          <div className="pointer-events-none absolute -bottom-16 -left-12 w-60 h-60 rounded-full bg-[#0ea5e9]/12 blur-3xl"></div>

          <div className="relative z-10 flex h-full flex-col">
            {/* Rating widget removed from dashboard; use sidebar Rate us modal */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.34em] text-[#fbbf24]">Dashboard Controls</p>
                <h2 className="font-serif text-[29px] font-bold text-white leading-none">Practice Management</h2>
                <p className="mt-2 text-sm text-slate-300">Concierge shortcuts for your legal operations workflow.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-md">
                <ShieldCheck className="w-5 h-5 text-[#fbbf24]" />
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <Link to="/lawyer/consultations" className="group/link flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_10px_22px_rgba(2,6,23,0.26)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-[#fbbf24]/35 hover:bg-white/[0.13] hover:shadow-[0_16px_28px_rgba(2,6,23,0.36)]">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-200 transition-colors group-hover/link:text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <Calendar className="w-4 h-4 text-[#fbbf24]" />
                  </span>
                  <span className="tracking-wide">My Schedule</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 transition-all group-hover/link:translate-x-0.5 group-hover/link:text-[#fbbf24]" />
              </Link>

              <Link to="/lawyer/documents" className="group/link flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_10px_22px_rgba(2,6,23,0.26)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-[#fbbf24]/35 hover:bg-white/[0.13] hover:shadow-[0_16px_28px_rgba(2,6,23,0.36)]">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-200 transition-colors group-hover/link:text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <FileText className="w-4 h-4 text-[#fbbf24]" />
                  </span>
                  <span className="tracking-wide">Document Drafts</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 transition-all group-hover/link:translate-x-0.5 group-hover/link:text-[#fbbf24]" />
              </Link>

              <Link to="/lawyer/settings" className="group/link flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_10px_22px_rgba(2,6,23,0.26)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-[#fbbf24]/35 hover:bg-white/[0.13] hover:shadow-[0_16px_28px_rgba(2,6,23,0.36)]">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-200 transition-colors group-hover/link:text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <Settings className="w-4 h-4 text-[#fbbf24]" />
                  </span>
                  <span className="tracking-wide">Profile Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 transition-all group-hover/link:translate-x-0.5 group-hover/link:text-[#fbbf24]" />
              </Link>
            </div>

            <div className="mt-10 rounded-2xl border border-white/12 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-lg">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">Availability Status</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="relative flex h-3 w-3">
                  {profile?.is_available && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>}
                  <span className={`relative inline-flex h-3 w-3 rounded-full ${profile?.is_available ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                </span>
                <span className="text-sm font-semibold text-white tracking-wide">
                  {profile?.is_available ? 'Accepting Consultations' : 'Currently Unavailable'}
                </span>
              </div>
              <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className={`h-full ${profile?.is_available ? 'bg-gradient-to-r from-emerald-400 via-emerald-300 to-[#fbbf24]' : 'bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300'} w-full`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2 Cards */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="group relative overflow-hidden rounded-[2rem] border border-[#e7dcc6] bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.20),_transparent_44%),linear-gradient(135deg,#fffcf3_0%,#f8fafc_52%,#f2f4f7_100%)] shadow-[0_28px_80px_rgba(15,23,42,0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_36px_100px_rgba(15,23,42,0.16)] dark:border-dark-600 dark:bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.15),_transparent_44%),linear-gradient(135deg,rgba(15,23,42,0.98)_0%,rgba(17,24,39,0.95)_52%,rgba(15,23,42,0.98)_100%)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.35),rgba(255,255,255,0))] dark:bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.05),rgba(255,255,255,0))]"></div>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#fbbf24] to-[#94a3b8]"></div>
          <div className="absolute -top-16 -right-10 h-44 w-44 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/15 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-14 h-56 w-56 rounded-full bg-[#0f172a]/8 blur-3xl pointer-events-none dark:bg-[#fbbf24]/10"></div>

          <div className="relative z-10 flex h-full flex-col p-6 lg:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.36em] text-[#b45309] dark:text-[#fbbf24] mb-2">Bar Association Credentials</p>
                <h3 className="font-serif text-[29px] font-bold text-[#111827] leading-none dark:text-white">Professional Identity</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-300">
                  A premium legal identity card designed to express trust, authority, and verified standing.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eadfca] bg-white/75 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-dark-600 dark:bg-dark-700/80">
                <Briefcase className="h-5 w-5 text-[#b45309] dark:text-[#fbbf24]" strokeWidth={1.8} />
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-[#e7dcc6] bg-white/65 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-dark-600 dark:bg-dark-800/75 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_14px_28px_rgba(0,0,0,0.26)]">
              <div className="grid gap-3">
                {credentialItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className={`group/item relative flex items-start gap-3 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 ${item.highlight
                        ? 'border-[#e7d8b4] bg-gradient-to-r from-[#fff9ea] via-[#fffefa] to-[#ffffff] shadow-[0_14px_34px_rgba(180,83,9,0.11)] dark:border-[#fbbf24]/25 dark:from-[#2b2414] dark:via-dark-800 dark:to-dark-700 dark:shadow-[0_14px_34px_rgba(0,0,0,0.28)]'
                        : 'border-[#e5e7eb] bg-white/85 shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:border-[#d6c8a8] hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] dark:border-dark-600 dark:bg-dark-800/85 dark:hover:border-[#fbbf24]/20 dark:hover:bg-dark-700/85 dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.24)]'
                        }`}
                    >
                      <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${item.highlight ? 'border-[#fbbf24]/45 bg-[#fff7db] dark:border-[#fbbf24]/25 dark:bg-[#fbbf24]/12' : 'border-slate-200 bg-slate-50 dark:border-dark-600 dark:bg-dark-700'}`}>
                        <Icon className={`h-4 w-4 ${item.highlight ? 'text-[#9a3412] dark:text-[#fbbf24]' : 'text-slate-500 dark:text-slate-300'}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#9a3412] dark:text-[#fbbf24]">{item.label}</p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${item.highlight
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300'
                            : 'border border-slate-200 bg-slate-50 text-slate-500 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-300'
                            }`}>
                            <BadgeCheck className="h-3 w-3" />
                            {item.status}
                          </span>
                        </div>
                        <p className="font-serif text-[15px] font-bold text-[#111827] dark:text-white leading-snug break-words">
                          {item.value}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {item.meta}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/lawyer/settings"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white shadow-[0_18px_34px_rgba(15,23,42,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#111c35] hover:to-[#273449] dark:from-[#fbbf24] dark:to-[#f59e0b] dark:text-[#0f172a] dark:shadow-[0_18px_34px_rgba(0,0,0,0.34)] dark:hover:from-[#f8d974] dark:hover:to-[#fbbf24]"
              >
                <Settings className="h-3.5 w-3.5" />
                Update Credentials
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-300" />
                Verified professional profile
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2rem] border border-[#e7dcc6] bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(212,175,55,0.12),_transparent_40%),linear-gradient(145deg,#fffcf3_0%,#f7fafc_48%,#f3f4f6_100%)] shadow-[0_28px_80px_rgba(15,23,42,0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_36px_100px_rgba(15,23,42,0.16)] dark:border-dark-600 dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.22),_transparent_40%),linear-gradient(145deg,rgba(15,23,42,0.98)_0%,rgba(17,24,39,0.95)_48%,rgba(15,23,42,0.98)_100%)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.30),rgba(255,255,255,0))] dark:bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.04),rgba(255,255,255,0))]"></div>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4af37] via-[#94a3b8] to-[#d4af37]"></div>
          <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-[#0f172a]/10 blur-3xl pointer-events-none dark:bg-[#fbbf24]/10"></div>
          <div className="absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-[#fbbf24]/12 blur-3xl pointer-events-none dark:bg-[#0f172a]/50"></div>

          <div className="relative z-10 flex h-full flex-col p-6 lg:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.36em] text-[#b45309] dark:text-[#fbbf24] mb-2">Next Session Schedule</p>
                <h3 className="font-serif text-[29px] font-bold text-[#111827] leading-none dark:text-white">Executive Agenda</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-300">
                  A composed scheduling brief with refined hierarchy for immediate focus on your next client commitment.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eadfca] bg-white/75 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-dark-600 dark:bg-dark-700/80">
                <Calendar className="h-5 w-5 text-[#b45309] dark:text-[#fbbf24]" />
              </div>
            </div>

            <div className="rounded-[1.45rem] border border-[#ddd9cc] bg-white/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_28px_rgba(15,23,42,0.07)] backdrop-blur-xl transition-all duration-300 hover:border-[#d4c6a7] dark:border-[#334155]/70 dark:bg-[linear-gradient(150deg,rgba(8,14,28,0.96)_0%,rgba(13,23,42,0.94)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_42px_rgba(0,0,0,0.42)] dark:hover:border-[#fbbf24]/28">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e7dcc6] bg-[#fff8e7]/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.24em] text-[#92400e] shadow-sm dark:border-[#fbbf24]/30 dark:bg-[#2a200c] dark:text-[#fcd34d]">
                  <Clock className="h-3 w-3 text-[#b45309] dark:text-[#fbbf24]" />
                  Auto-synced
                </div>
                <div className="h-10 w-10 rounded-full border border-[#e7dcc6] bg-gradient-to-br from-[#fff9ea] to-white flex items-center justify-center shadow-sm dark:border-[#475569]/60 dark:from-[#162033] dark:to-[#0f172a] dark:shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                  <ShieldCheck className="h-4 w-4 text-[#b45309] dark:text-[#fbbf24]" />
                </div>
              </div>

              {nextConsultation ? (
                <>
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="rounded-2xl border border-[#d6e0ed] bg-gradient-to-b from-[#f8fbff] to-[#edf2f9] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-[#3b4a61] dark:from-[#192337] dark:to-[#111a2b] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">Session Date</p>
                      <p className="mt-1 font-serif text-lg font-bold text-[#111827] dark:text-white">{nextSessionDate}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] ${urgency?.style}`}>
                      <BadgeCheck className="h-3 w-3" />
                      {urgency?.label}
                    </span>
                  </div>

                  <h4 className="font-serif text-[28px] font-bold leading-tight text-[#111827] dark:text-white">
                    {nextSessionTime}
                  </h4>

                  <div className="mt-5 rounded-2xl border border-[#e5e7eb] bg-white/75 p-4 shadow-sm dark:border-[#334155]/70 dark:bg-[#0f1a2e]/88 dark:shadow-[0_14px_30px_rgba(0,0,0,0.32)]">
                    <div className="space-y-3 border-l-2 border-[#e7dcc6] pl-4 dark:border-[#fbbf24]/35">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">Client Brief</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{nextConsultation.client?.name || 'Client name pending'}</p>
                      </div>
                      <div className="h-px w-full bg-gradient-to-r from-[#e7dcc6] to-transparent dark:from-[#475569]"></div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>{nextConsultation.duration} min consultation</span>
                        <span className="text-slate-300 dark:text-slate-400">•</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{formatPrice(nextConsultation.fee)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      to="/lawyer/consultations"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white shadow-[0_18px_34px_rgba(15,23,42,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#111c35] hover:to-[#273449] dark:border dark:border-[#fbbf24]/35 dark:from-[#0b1324] dark:to-[#1b263b] dark:text-[#f8e3a3] dark:shadow-[0_20px_38px_rgba(0,0,0,0.42)] dark:hover:from-[#111c31] dark:hover:to-[#253451]"
                    >
                      Manage Queue
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-400">
                      Prepared for the next client
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-serif text-[26px] font-bold text-[#111827] leading-tight dark:text-white">
                    No upcoming sessions
                  </h4>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-300">
                    Your calendar is currently open. Activate new availability to maintain a premium and predictable booking flow.
                  </p>

                  <div className="mt-5 rounded-2xl border border-dashed border-[#d4c6a7] bg-[#fffaf0]/70 px-4 py-3 text-xs text-[#7c6b46] dark:border-[#fbbf24]/30 dark:bg-[#fbbf24]/8 dark:bg-slate-800 dark:text-[#f5d88f]">
                    Executive note: Keep at least one priority slot visible to attract high-intent consultations.
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      to="/lawyer/settings"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#b45309] to-[#9a3412] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white shadow-[0_16px_32px_rgba(180,83,9,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#9a3412] hover:to-[#7c2d12] dark:border dark:border-[#fbbf24]/35 dark:from-[#1f2a40] dark:to-[#111827] dark:text-[#f8e3a3] dark:shadow-[0_18px_34px_rgba(0,0,0,0.4)] dark:hover:from-[#263451] dark:hover:to-[#1a2436]"
                    >
                      Update Availability
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-400">
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
