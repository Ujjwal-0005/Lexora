import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X
} from 'lucide-react'
import { useConsultations, useUpdateConsultationStatus } from '../../hooks/useConsultations'
import { formatDateTime, formatPrice } from '../../utils/formatDate'
import ChatWidget from '../ChatWidget'
import Loader from '../../components/Loader'
import toast from 'react-hot-toast'

const LawyerConsultations = () => {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [meetingLink, setMeetingLink] = useState('')
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [now, setNow] = useState(() => new Date())

  const { data: consultations, isLoading } = useConsultations()
  const updateStatus = useUpdateConsultationStatus()

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30 * 1000)
    return () => window.clearInterval(timer)
  }, [])

  const noShowGraceMs = 15 * 60 * 1000

  const filteredConsultations = consultations?.data?.filter((c) => {
    const scheduledTime = c.scheduled_at ? new Date(c.scheduled_at) : null
    const isPastSlot = scheduledTime && scheduledTime < now
    const isFutureSlot = scheduledTime && scheduledTime >= now
    const isOverdueWithinGrace = scheduledTime && isPastSlot && (now.getTime() - scheduledTime.getTime() <= noShowGraceMs)

    if (activeTab === 'upcoming') {
      return ['pending', 'confirmed'].includes(c.status) && (isFutureSlot || isOverdueWithinGrace)
    }
    if (activeTab === 'past') {
      return c.status === 'missed' || (isPastSlot && ['pending', 'confirmed'].includes(c.status) && !isOverdueWithinGrace)
    }
    if (activeTab === 'completed') return c.status === 'completed'
    if (activeTab === 'cancelled') return c.status === 'cancelled'
    if (activeTab === 'all') return true
    return true
  }) || []

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Completed</span>
      case 'pending':
        return <span className="bg-[#fef3c7] text-[#92400e] px-3 py-1 text-xs font-bold uppercase tracking-wider">Pending</span>
      case 'cancelled':
        return <span className="bg-red-100 text-red-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Cancelled</span>
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Confirmed</span>
      case 'missed':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">No Show</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">{status}</span>
    }
  }

  const handleConfirm = async (id) => {
    const consultation = filteredConsultations.find(c => c.id === id)
    setSelectedConsultation(consultation)
    setMeetingLink(consultation?.meeting_link || '')
    setShowMeetingModal(true)
  }

  const handleSubmitMeetingLink = async (consultationId) => {
    if (!consultationId) {
      toast.error('No consultation selected')
      return
    }
    try {
      await updateStatus.mutateAsync({
        id: consultationId,
        status: 'confirmed',
        meetingLink: meetingLink,
      })
      setShowMeetingModal(false)
      setSelectedConsultation(null)
      setMeetingLink('')
      toast.success('Consultation confirmed!')
    } catch (error) {
      toast.error('Failed to confirm consultation')
    }
  }

  const handleComplete = async (id) => {
    try {
      await updateStatus.mutateAsync({
        id: id,
        status: 'completed',
      })
      toast.success('Consultation marked as completed!')
    } catch (error) {
      toast.error('Failed to complete consultation')
    }
  }

  const handleNoShow = async (id) => {
    try {
      await updateStatus.mutateAsync({
        id,
        status: 'missed',
      })
      toast.success('Consultation moved to past as no-show')
    } catch (error) {
      toast.error('Failed to mark no-show')
    }
  }

  const isReadonlyTab = ['past', 'completed', 'cancelled', 'all'].includes(activeTab)

  return (
    <div className="lawyer-consultations-page lp-premium-page max-w-7xl mx-auto space-y-10 pb-20 font-sans">
      <div className="lp-page-hero flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-2">Practice Management</h2>
          <h1 className="text-3xl font-serif font-bold text-[#0f172a] dark:text-white">My Consultations</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="lp-tabs-wrap flex gap-6 border-b border-gray-200 dark:border-dark-600">
        {['upcoming', 'past', 'completed', 'cancelled', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 font-semibold text-sm capitalize transition-colors border-b-2 -mb-[1px] ${activeTab === tab
              ? 'border-[#0f172a] text-[#0f172a] dark:border-white dark:text-white'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-20"><Loader /></div>
      ) : filteredConsultations.length > 0 ? (
        <div className="grid gap-6">
          {filteredConsultations.map((consultation, index) => (
            <motion.div
              key={consultation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="lp-surface bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-sm bg-[#0f172a] text-white flex items-center justify-center shadow-inner">
                    <span className="font-serif text-2xl font-bold">
                      {consultation.client?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#0f172a] dark:text-white mb-2">
                      {consultation.client?.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 font-medium mb-3">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDateTime(consultation.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {consultation.duration} min
                      </span>
                    </div>
                    {consultation.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-dark-700 p-3 rounded-sm border border-gray-100 dark:border-dark-600">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Note:</span> {consultation.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(consultation.status)}
                  <span className="font-bold text-[#0f172a] dark:text-white text-lg">{formatPrice(consultation.fee)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-dark-600">
                {!isReadonlyTab && consultation.status === 'pending' && new Date(consultation.scheduled_at) >= now && (
                  <>
                    <button
                      onClick={() => handleConfirm(consultation.id)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#0f172a] text-white font-semibold text-sm hover:bg-black transition-colors rounded-sm shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Session
                    </button>
                    <button
                      onClick={() => updateStatus.mutateAsync({ id: consultation.id, status: 'cancelled' })}
                      className="flex items-center gap-2 px-6 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm transition-colors rounded-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </button>
                  </>
                )}

                {!isReadonlyTab && consultation.status === 'confirmed' && new Date(consultation.scheduled_at) >= now && (
                  <>
                    {consultation.meeting_link && (
                      <a
                        href={consultation.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#d97706] text-white font-semibold text-sm hover:bg-[#b45309] transition-colors rounded-sm shadow-sm"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </a>
                    )}
                    <button
                      onClick={() => handleComplete(consultation.id)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#0f172a] text-white font-semibold text-sm hover:bg-black transition-colors rounded-sm shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Complete
                    </button>
                  </>
                )}

                {!isReadonlyTab && ['pending', 'confirmed'].includes(consultation.status) && new Date(consultation.scheduled_at) < now && (
                  <button
                    onClick={() => handleNoShow(consultation.id)}
                    className="flex items-center gap-2 px-6 py-2.5 border border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold text-sm transition-colors rounded-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    User not connected
                  </button>
                )}

                <button
                  onClick={() => setSelectedConsultation(consultation)}
                  className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-dark-500 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors rounded-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat with Client
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="lp-surface text-center py-20 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-sm rounded-sm">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-6" />
          <h3 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white mb-2">No consultations found</h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm font-medium">
            You don't have any {activeTab} consultations at this time.
          </p>
        </div>
      )}

      {/* Meeting Link Modal */}
      <AnimatePresence>
        {showMeetingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="lp-surface bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-sm p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white">Meeting Details</h3>
                <button onClick={() => setShowMeetingModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-500 text-sm font-medium mb-6">
                Provide a secure video meeting link (Zoom, Google Meet, Teams) for the client to join at the scheduled time.
              </p>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-gray-50 dark:bg-dark-700 mb-6 focus:outline-none focus:ring-2 focus:ring-[#0f172a]"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowMeetingModal(false)}
                  disabled={updateStatus.isPending}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!meetingLink.trim()) {
                      toast.error('Please enter a meeting link')
                      return
                    }

                    handleSubmitMeetingLink(selectedConsultation?.id)
                  }}
                  disabled={updateStatus.isPending}
                  className="flex-1 py-3 px-4 bg-[#0f172a] text-white font-semibold text-sm hover:bg-black transition-colors rounded-sm shadow-md"
                >
                  {updateStatus.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Confirming...
                    </span>
                  ) : (
                    'Confirm Session'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      {selectedConsultation && (
        <ChatWidget
          consultation={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
      )}
    </div>
  )
}

export default LawyerConsultations
