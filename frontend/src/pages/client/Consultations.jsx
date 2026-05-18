import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Star,
  ChevronDown,
  Filter
} from 'lucide-react'
import { useConsultations } from '../../hooks/useConsultations'
import { useMessages } from '../../hooks/useMessages'
import { formatDateTime, getRelativeTime, formatPrice } from '../../utils/formatDate'
import ChatWidget from '../ChatWidget'
import Loader from '../../components/Loader'

const ClientConsultations = () => {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [chatOpenSignal, setChatOpenSignal] = useState(0)

  const { data: consultations, isLoading } = useConsultations()

  const isMissedConsultation = (consultation) => {
    if (!consultation?.scheduled_at) return false
    if (!['pending', 'confirmed'].includes(consultation.status)) return false

    const start = new Date(consultation.scheduled_at)
    const durationMinutes = Number(consultation.duration) || 30
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

    return end < new Date()
  }

  const filteredConsultations = consultations?.data?.filter((c) => {
    if (activeTab === 'upcoming') return ['pending', 'confirmed'].includes(c.status) && !isMissedConsultation(c)
    if (activeTab === 'missed') return isMissedConsultation(c)
    if (activeTab === 'completed') return c.status === 'completed'
    if (activeTab === 'cancelled') return c.status === 'cancelled'
    return true
  }) || []

  const getStatusBadge = (consultation) => {
    if (isMissedConsultation(consultation)) {
      return <span className="bg-rose-100 text-rose-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Missed</span>
    }

    const { status } = consultation

    switch (status) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Completed</span>
      case 'pending':
        return <span className="bg-[#fef3c7] text-[#92400e] px-3 py-1 text-xs font-bold uppercase tracking-wider">Pending</span>
      case 'cancelled':
        return <span className="bg-red-100 text-red-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Cancelled</span>
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Confirmed</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">{status}</span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-2">Secure Sessions</h2>
          <h1 className="text-3xl font-serif font-bold text-[#0f172a] dark:text-white">My Consultations</h1>
        </div>
        <Link
          to="/lawyers"
          className="bg-[#0f172a] dark:bg-white dark:hover:bg-slate-600 dark:hover:text-white text-white dark:text-[#0f172a] hover:bg-black py-3 px-6 flex items-center gap-2 transition-colors rounded-sm shadow-md"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-semibold">Book New Session</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-dark-600">
        {['upcoming', 'missed', 'completed', 'cancelled', 'all'].map((tab) => (
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
          {filteredConsultations.map((consultation, index) => {
            const isMissed = isMissedConsultation(consultation)

            return (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-sm bg-[#0f172a] text-white flex items-center justify-center shadow-inner">
                      <span className="font-serif text-2xl font-bold">
                        {consultation.lawyer_profile?.user?.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-xl text-[#0f172a] dark:text-white mb-2">
                        {consultation.lawyer_profile?.user?.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDateTime(consultation.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {consultation.duration} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(consultation)}
                    <span className="font-bold text-[#0f172a] dark:text-white text-lg">{formatPrice(consultation.fee)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-dark-600">
                  {consultation.status === 'confirmed' && consultation.meeting_link && !isMissed && (
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
                    onClick={() => {
                      setSelectedConsultation(consultation)
                      setChatOpenSignal((s) => s + 1)
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-dark-500 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors rounded-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </button>

                  {consultation.status === 'completed' && !consultation.review && (
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#fef3c7] text-[#92400e] font-semibold text-sm hover:bg-orange-100 transition-colors rounded-sm">
                      <Star className="w-4 h-4" />
                      Leave Review
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-sm rounded-sm">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-6" />
          <h3 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white mb-2">No consultations found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm font-medium">
            You don't have any {activeTab} consultations at this time. Book a session with our elite partners to get started.
          </p>
          <Link
            to="/lawyers"
            className="bg-[#0f172a] hover:bg-black text-white py-3 px-8 transition-colors rounded-sm shadow-md font-semibold text-sm mx-auto inline-flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Find a Lawyer
          </Link>
        </div>
      )}

      {/* Chat Widget */}
      {selectedConsultation && (
        <ChatWidget
          consultation={selectedConsultation}
          openSignal={chatOpenSignal}
          onClose={() => setSelectedConsultation(null)}
        />
      )}
    </div>
  )
}

export default ClientConsultations
