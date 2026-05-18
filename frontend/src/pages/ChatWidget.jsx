import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, Maximize2, Minimize2, MessageSquare, MoreVertical } from 'lucide-react'
import { useMessages, useSendMessage } from '../hooks/useMessages'
import { useAuthStore } from '../store/authStore'
import { formatTime, getRelativeTime } from '../utils/formatDate'


const ChatWidget = ({ consultation, onClose, openSignal, minimizeToLauncher = true }) => {
  const { user } = useAuthStore()
  const { data: messages, isLoading } = useMessages(consultation.id)
  const sendMessage = useSendMessage()
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  const otherParty = user.id === consultation.client_id
    ? consultation.lawyer_profile?.user
    : consultation.client

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setIsMinimized(false)
  }, [openSignal])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!messageText.trim()) return

    await sendMessage.mutateAsync({
      consultationId: consultation.id,
      message: messageText,
      type: 'text',
    })

    setMessageText('')
  }

  if (isMinimized && minimizeToLauncher) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="px-6 py-3.5 bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] border-none rounded-sm shadow-xl flex items-center gap-3 hover:bg-black dark:hover:bg-gray-100 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-wide">Open Chat</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]"></span>
          </span>
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed z-50 bg-white dark:bg-dark-800 rounded-sm shadow-2xl border border-gray-200 dark:border-dark-600 flex flex-col overflow-hidden ${isMaximized ? 'inset-4 min-h-0' : 'bottom-6 right-6 w-[400px] h-[580px]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-[#0f172a] dark:bg-dark-900 border-b border-[#1e293b] dark:border-dark-600 text-white relative overflow-hidden">
        {/* Subtle gold accent line at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#fcd34d] to-[#D4AF37]"></div>

        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            <span className="font-serif text-xl font-bold text-[#D4AF37]">
              {otherParty?.name?.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-lg tracking-wide">{otherParty?.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
              </span>
              <span className="text-[10px] text-gray-300 tracking-wider uppercase font-semibold">Active Session</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <button
            type="button"
            onClick={() => setIsMaximized((s) => !s)}
            className="p-2 rounded-sm hover:bg-white/10 hover:text-white transition-colors"
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              if (minimizeToLauncher) {
                setIsMinimized(true)
              } else {
                onClose?.()
              }
            }}
            className="p-2 rounded-sm hover:bg-white/10 hover:text-white transition-colors"
            aria-label={minimizeToLauncher ? 'Minimize' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 dark:bg-dark-800">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-[#0f172a] dark:text-white" />
          </div>
        ) : messages?.length > 0 ? (
          messages.map((message) => {
            const isOwn = message.sender_id === user.id
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={message.id}
                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-5 py-3.5 rounded-sm shadow-sm border ${isOwn
                    ? 'bg-[#0f172a] dark:bg-dark-700 border-[#0f172a] dark:border-dark-600 rounded-br-none'
                    : 'bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 rounded-bl-none'
                    }`}
                >
                  <p className={`text-sm leading-relaxed ${isOwn ? 'text-white dark:text-white' : 'text-[#0f172a] dark:text-gray-100'}`}>{message.message}</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${isOwn ? 'text-[#0f172a] dark:text-gray-400' : 'text-gray-500'}`}>
                    {isOwn ? 'You' : otherParty?.name?.split(' ')[0]}
                  </p>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 flex items-center justify-center shadow-sm mb-2">
              <MessageSquare className="w-6 h-6 text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-serif text-lg">Secure Session</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs max-w-[200px] leading-relaxed">
              Your messages are protected by Royal Protocol encryption.
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write your message here..."
            className="flex-1 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-600 text-[#0f172a] dark:text-white px-5 py-3.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0f172a] dark:focus:ring-white transition-all text-sm placeholder-gray-400 shadow-inner"
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sendMessage.isPending}
            className="px-5 py-3.5 bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] rounded-sm hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center shadow-md font-semibold text-sm tracking-wide gap-2 group"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default ChatWidget
