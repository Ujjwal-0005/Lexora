import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  FileText,
  MessageSquare,
  ArrowRight,
  Clock,
  Star,
  Scale,
  Bell,
  Download,
  PenTool,
  MoreHorizontal,
  Video
} from 'lucide-react'
import { useConsultations } from '../../hooks/useConsultations'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import { useUnreadCount, useUnreadMessages } from '../../hooks/useMessages'
import { formatDate, formatTime, formatPrice, getRelativeTime } from '../../utils/formatDate'
import { useAuthStore } from '../../store/authStore'
import Loader from '../../components/Loader'
import ChatWidget from '../ChatWidget'

const ClientDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const notificationRef = useRef(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activityPage, setActivityPage] = useState(1)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [chatOpenSignal, setChatOpenSignal] = useState(0)
  const activityItemsPerPage = 5
  const { data: consultations, isLoading } = useConsultations()
  const { data: documentsResponse } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await api.get('/documents')
      return response.data.documents
    },
  })

  const documents = Array.isArray(documentsResponse)
    ? documentsResponse
    : documentsResponse?.data || []
  const { data: unreadCount } = useUnreadCount()
  const { data: unreadMessages = [] } = useUnreadMessages()

  useEffect(() => {
    const handleOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const now = new Date()
  const upcomingConsultations = (consultations?.data || [])
    .filter(c => {
      const sched = c.scheduled_at ? new Date(c.scheduled_at) : null
      return sched && sched > now && ['pending', 'confirmed'].includes(c.status)
    })
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))

  const recentConsultations = consultations?.data?.slice(0, 5) || []

  const openChatFromNotification = (message) => {
    const consultation = (consultations?.data || []).find((c) => c.id === message.consultation_id)
    if (!consultation) {
      navigate('/client/consultations')
      return
    }

    setSelectedConsultation(consultation)
    setChatOpenSignal((s) => s + 1)
    setShowNotifications(false)
  }

  // Portfolio metrics (real data)
  const activeCases = consultations?.data?.filter(c => !['completed', 'cancelled'].includes(c.status)).length || 0
  const pendingReviewDocs = documents?.filter(d => ['review', 'pending'].includes(d.status)).length || 0
  const totalMinutes = consultations?.data?.reduce((sum, c) => sum + (c.duration_minutes || c.duration_min || 60), 0) || 0
  const totalHours = Math.round((totalMinutes / 60) || 0)

  const recentActivityItems = [
    ...(documents || []).map(d => ({
      id: `doc-${d.id}`,
      type: 'document',
      title: d.document_type_name || d.documentType?.name || 'Document',
      subtitle: d.reference || d.slug || '',
      date: d.updated_at || d.created_at,
      status: d.status,
      raw: d,
    })),
    ...(consultations?.data || []).map(c => ({
      id: `con-${c.id}`,
      type: 'consultation',
      title: c.subject || 'Consultation',
      subtitle: c.lawyer_profile?.user?.name || c.lawyer_name || '',
      date: c.updated_at || c.scheduled_at || c.created_at,
      status: c.status,
      raw: c,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalActivityPages = Math.max(1, Math.ceil(recentActivityItems.length / activityItemsPerPage))
  const activityStartIndex = (activityPage - 1) * activityItemsPerPage
  const paginatedActivityItems = recentActivityItems.slice(activityStartIndex, activityStartIndex + activityItemsPerPage)

  useEffect(() => {
    if (activityPage > totalActivityPages) {
      setActivityPage(totalActivityPages)
    }
  }, [activityPage, totalActivityPages])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-200/50 text-green-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Completed</span>
      case 'pending':
        return <span className="bg-[#fef3c7] text-[#92400e] px-3 py-1 text-xs font-bold uppercase tracking-wider">Awaiting Signature</span>
      case 'draft':
        return <span className="bg-[#0f172a] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">Draft</span>
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Confirmed</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">{status}</span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-2">Client Dashboard</h2>
          <h1 className="text-3xl font-serif font-bold text-[#0f172a] dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Client'}
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications((v) => !v)}
              className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {(unreadCount || 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-[360px] max-h-[420px] overflow-y-auto bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-sm shadow-xl z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-600 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#0f172a] dark:text-white">Notifications</h4>
                  <span className="text-xs text-gray-500">{unreadMessages.length} unread</span>
                </div>

                {unreadMessages.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-gray-500">No new messages from your lawyers.</div>
                ) : (
                  unreadMessages.map((message) => (
                    <button
                      key={message.id}
                      type="button"
                      onClick={() => openChatFromNotification(message)}
                      className="w-full text-left px-4 py-4 border-b border-gray-100 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-semibold text-[#0f172a] dark:text-white">
                          {message.sender?.name || 'Assigned Lawyer'}
                        </p>
                        <span className="text-[10px] font-bold text-[#0f172a] dark:text-white bg-gray-100 dark:bg-dark-600 px-2 py-0.5 rounded-full">
                          New
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                        {message.message || 'Sent you a message'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-2">
                        {message.created_at ? getRelativeTime(message.created_at) : 'Just now'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-right">
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-[#0f172a] dark:text-white">{user?.name || 'Sterling & Associates'}</p>
              <p className="text-xs text-gray-500">Tier: Premium Sovereign</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'S'}&background=0f172a&color=fff`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-stretch">
        {/* Left Column (Quick Actions & Portfolio) */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Action Card 1 */}
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 p-8 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#0f172a] flex items-center justify-center mb-6">
                    <Scale className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-serif font-bold text-xl text-[#0f172a] dark:text-white mb-3">Start New Consultation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Connect with a senior partner for immediate legal guidance and strategic planning.
                  </p>
                </div>
                <Link to="/lawyers" className="text-sm text-gray-500 group-hover:text-[#0f172a] dark:group-hover:text-white flex items-center gap-2 transition-colors mt-auto">
                  Initiate Secure Session <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Action Card 2 */}
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 p-8 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#fef3c7] flex items-center justify-center mb-6">
                    <FileText className="w-6 h-6 text-[#92400e]" />
                  </div>
                  <h4 className="font-serif font-bold text-xl text-[#0f172a] dark:text-white mb-3">Draft New Document</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Access our premium templates for contracts, NDAs, and international legal frameworks.
                  </p>
                </div>
                <Link to="/client/documents" className="text-sm text-gray-500 group-hover:text-[#0f172a] dark:group-hover:text-white flex items-center gap-2 transition-colors mt-auto">
                  Open Vault Templates <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Portfolio Progression */}
          <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 p-8">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-serif font-bold text-lg text-[#0f172a] dark:text-white">Portfolio Progression</h4>

            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Cases</p>
                <p className="font-serif font-bold text-2xl text-[#0f172a] dark:text-white">{activeCases}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pending Review</p>
                <p className="font-serif font-bold text-2xl text-[#0f172a] dark:text-white">{pendingReviewDocs}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Hours</p>
                <p className="font-serif font-bold text-2xl text-[#0f172a] dark:text-white">{totalHours}</p>
              </div>
            </div>


          </div>
        </div>

        {/* Right Column (Upcoming Schedule) */}
        <div>
          {/* Rating widget removed per UX: moved to sidebar modal */}
          <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">Upcoming Schedule</h3>

          <div className="bg-[#0f172a] text-white p-8 shadow-xl h-full">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader /></div>
            ) : (upcomingConsultations && upcomingConsultations.length > 0) ? (
              (() => {
                const consultation = upcomingConsultations[0]
                const meetingUrl = consultation.meeting_link || consultation.meeting_url || consultation.join_url || consultation.video_link
                return (
                  <div key={consultation.id} className="h-full flex flex-col">
                    <span className="inline-block bg-white/10 text-[#d97706] text-xs font-bold px-4 py-1.5 mb-8 tracking-wider uppercase border border-white/10 w-max">
                      Next Meeting
                    </span>

                    {/* show subject (small) and client's meeting description as prominent heading when available */}
                    <h4 className="font-serif text-lg font-semibold mb-2 leading-snug">{consultation.subject || 'Consultation'}</h4>
                    {(consultation.description || consultation.meeting_description || consultation.notes || consultation.client_note) && (
                      <div className="mb-6">
                        <p className="font-serif text-2xl font-bold leading-tight text-white">{(consultation.description || consultation.meeting_description || consultation.notes || consultation.client_note)}</p>
                      </div>
                    )}

                    <div className="space-y-5 mb-12">
                      <div className="flex items-center gap-4 text-gray-300 text-sm">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        {formatDate(consultation.scheduled_at)}
                      </div>
                      <div className="flex items-center gap-4 text-gray-300 text-sm">
                        <Clock className="w-5 h-5 text-gray-400" />
                        {formatTime(consultation.scheduled_at)}
                      </div>
                      <div className="flex items-center gap-4 text-gray-300 text-sm">
                        <Scale className="w-5 h-5 text-gray-400" />
                        {consultation.lawyer_profile?.user?.name || consultation.lawyer_name || 'Assigned Lawyer'}
                      </div>
                    </div>

                    <div className="mt-auto">
                      {meetingUrl ? (
                        <a
                          href={meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-4 px-4 flex items-center justify-center gap-2 transition-colors rounded-sm shadow-md"
                        >
                          <Video className="w-5 h-5" />
                          Join Secure Meeting
                        </a>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-[#9a3412] opacity-80 cursor-not-allowed text-white font-bold py-4 px-4 flex items-center justify-center gap-2 transition-colors rounded-sm shadow-md"
                        >
                          <Video className="w-5 h-5" />
                          Meeting link not available
                        </button>
                      )}
                    </div>
                  </div>
                )
              })()
            ) : (
              <div className="h-full flex flex-col">
                <span className="inline-block bg-white/10 text-[#d97706] text-xs font-bold px-4 py-1.5 mb-8 tracking-wider uppercase border border-white/10 w-max">
                  Next Meeting
                </span>

                <h4 className="font-serif text-2xl font-bold mb-8 leading-snug">No upcoming consultations</h4>

                <div className="space-y-5 mb-12">
                  <p className="text-gray-300">You have no scheduled consultations. Schedule a meeting with one of our lawyers to get started.</p>
                </div>

                <div className="mt-auto">
                  <Link to="/lawyers" className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-4 px-4 flex items-center justify-center gap-2 transition-colors rounded-sm shadow-md">
                    <Video className="w-5 h-5" />
                    Schedule a Consultation
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table (Documents + Consultations) */}
      <div>
        <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">Recent Activity</h3>
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-600">
                  <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider w-5/12">Activity</th>
                  <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider w-2/12">Date</th>
                  <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider w-3/12">Status</th>
                  <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-right w-2/12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                {paginatedActivityItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex items-start gap-4">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-[#0f172a] dark:text-white text-sm mb-1">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-sm  text-gray-600 dark:text-gray-400 font-medium">{formatDate(item.date)}</td>
                    <td className="py-6 px-8">{getStatusBadge(item.status)}</td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {item.type === 'document' ? (
                          (() => {
                            const docStatus = item.raw?.status
                            const canDownload = docStatus === 'completed' || docStatus === 'complete'
                            return canDownload ? (
                              <Link to={`/client/documents`} className="text-[#d97706] hover:text-[#b45309] p-2 hover:bg-orange-50 rounded-full transition-colors">
                                <Download className="w-4 h-4" />
                              </Link>
                            ) : (
                              <button disabled className="p-2 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed" title="Document not ready for download">
                                <Download className="w-4 h-4" />
                              </button>
                            )
                          })()
                        ) : (
                          (() => {
                            const status = item.raw?.status
                            const sched = item.raw?.scheduled_at ? new Date(item.raw.scheduled_at) : null
                            const hasPassed = sched && sched < now
                            const cannotJoin = ['completed', 'cancelled'].includes(status) || hasPassed
                            return !cannotJoin ? (
                              <Link to={`/client/consultations`} className="text-[#d97706] hover:text-[#b45309] text-sm font-semibold flex items-center justify-end gap-2 ml-auto hover:bg-orange-50 px-3 py-1.5 rounded-md transition-colors">
                                <Video className="w-3.5 h-3.5" /> Join
                              </Link>
                            ) : (
                              <button disabled className="text-gray-400 bg-gray-100 px-3 py-1.5 rounded-md flex items-center gap-2 cursor-not-allowed" title="Cannot join this consultation">
                                <Video className="w-3.5 h-3.5" /> Join
                              </button>
                            )
                          })()
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentActivityItems.length > 0 && (
            <div className="flex items-center justify-between gap-4 px-8 py-5 border-t border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-800/50 flex-wrap">
              <p className="text-sm text-gray-500 font-medium">
                Showing {activityStartIndex + 1} - {Math.min(activityStartIndex + activityItemsPerPage, recentActivityItems.length)} of {recentActivityItems.length} activities
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivityPage((page) => Math.max(1, page - 1))}
                  disabled={activityPage === 1}
                  className="px-4 py-2 rounded-sm border border-gray-200 dark:border-dark-600 text-sm font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-[#0f172a] dark:text-white">
                  {activityPage} / {totalActivityPages}
                </span>
                <button
                  onClick={() => setActivityPage((page) => Math.min(totalActivityPages, page + 1))}
                  disabled={activityPage === totalActivityPages}
                  className="px-4 py-2 rounded-sm border border-gray-200 dark:border-dark-600 text-sm font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-12 mt-16 flex flex-col md:flex-row justify-between gap-12">
        <div className="max-w-md">
          <h4 className="font-serif font-bold text-[#0f172a] dark:text-white mb-4 text-lg">Royal Law</h4>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Institutional Authority & Digital Speed. We provide the world's elite with unparalleled legal frameworks and secure sovereign counsel.
          </p>
        </div>
        <div className="flex gap-20">
          <div>
            <h5 className="text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-wider mb-6">Legal</h5>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li>
                <Link to="/privacy" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">Terms of Service</Link></li>
              <li>
                <Link to="/privacy" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">Privacy Policy</Link></li>
              <li>
                <Link to="/privacy" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">Regulatory Disclosure</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-wider mb-6">Account</h5>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><Link to="/privacy" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">Trust Badges</Link></li>
              <li><Link to="/help" className="hover:text-[#0f172a] dark:hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>
      </footer>
      <div className="pt-8 pb-4 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-gray-400 border-t border-gray-100 dark:border-dark-600">
        <p className="italic">© 2026 Royal Law. All Rights Reserved. Institutional Authority & Digital Speed.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Scale className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
          <Scale className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
          <Scale className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
        </div>
      </div>

      {selectedConsultation && (
        <ChatWidget
          consultation={selectedConsultation}
          openSignal={chatOpenSignal}
          minimizeToLauncher={false}
          onClose={() => setSelectedConsultation(null)}
        />
      )}
    </div>
  )
}

export default ClientDashboard
