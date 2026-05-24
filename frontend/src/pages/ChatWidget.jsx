import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Send, Loader2, Maximize2, Minimize2, MessageSquare } from 'lucide-react'
import { useMessages, useSendMessage } from '../hooks/useMessages'
import { useAuthStore } from '../store/authStore'
import { formatTime } from '../utils/formatDate'


const ChatWidget = ({ consultation, onClose, openSignal, minimizeToLauncher = true }) => {
  const { user } = useAuthStore()
  const { data: messages, isLoading } = useMessages(consultation.id)
  const sendMessage = useSendMessage()
  const [messageText, setMessageText] = useState('')
  const messagesContainerRef = useRef(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  const otherParty = user.id === consultation.client_id
    ? consultation.lawyer_profile?.user
    : consultation.client

  const scrollToBottom = () => {
    const container = messagesContainerRef.current
    if (!container) return

    container.scrollTop = container.scrollHeight
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="portal-btn-primary relative px-6 py-3.5 rounded-full border-[color:var(--portal-border-strong)] flex items-center gap-3"
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed z-50 portal-card-elevated rounded-2xl flex flex-col overflow-hidden ${isMaximized
        ? 'inset-2 sm:inset-4 min-h-0'
        : 'bottom-32 right-6 left-4 sm:left-auto sm:w-[430px] h-[52vh] sm:h-[420px] max-h-[calc(100vh-1rem)]'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-[linear-gradient(140deg,#121f39_0%,#1f335a_55%,#152846_100%)] dark:bg-[linear-gradient(140deg,#131f35_0%,#1c2f54_55%,#132542_100%)] border-b border-[color:var(--portal-border)] text-white relative overflow-hidden">
        {/* Subtle gold accent line at the top */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[color:var(--portal-gold)] via-[#f3d89f] to-[color:var(--portal-gold)]"></div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[color:var(--portal-gold)]/15 blur-3xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
            <span className="font-serif text-xl font-bold text-[color:var(--portal-gold)]">
              {otherParty?.name?.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-lg tracking-wide">{otherParty?.name}</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/65 font-semibold mt-0.5 truncate max-w-[180px]">
              {consultation?.subject || 'Consultation channel'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--portal-gold)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--portal-gold)]"></span>
              </span>
              <span className="text-[10px] text-white/70 tracking-wider uppercase font-semibold">Active Session</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-1 text-white/70">
          <button
            type="button"
            onClick={() => setIsMaximized((s) => !s)}
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
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
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            aria-label={minimizeToLauncher ? 'Minimize' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-[radial-gradient(circle_at_top,rgba(199,156,66,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.55),rgba(246,248,252,0.6))] dark:bg-[radial-gradient(circle_at_top,rgba(199,156,66,0.10),transparent_30%),linear-gradient(180deg,rgba(10,15,26,0.55),rgba(7,12,22,0.7))]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-[color:var(--portal-text)]" />
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
                  className={`max-w-[86%] px-5 py-3.5 rounded-2xl shadow-sm border backdrop-blur-sm ${isOwn
                    ? 'bg-[linear-gradient(145deg,#13213c,#253d67)] dark:bg-[linear-gradient(145deg,#c8a15a,#b98d3a)] border-[color:var(--portal-border-strong)] rounded-br-md'
                    : 'bg-white/80 dark:bg-black/35 border-[color:var(--portal-border)] rounded-bl-md'
                    }`}
                >
                  <p className={`text-sm leading-relaxed ${isOwn ? 'text-white dark:text-[#18263e]' : 'text-[color:var(--portal-text)]'}`}>{message.message}</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${isOwn ? 'text-[color:var(--portal-muted)]' : 'text-[color:var(--portal-muted)]'}`}>
                    {isOwn ? 'You' : otherParty?.name?.split(' ')[0]}
                  </p>
                  <span className="w-1 h-1 rounded-full bg-[color:var(--portal-border-strong)]"></span>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[color:var(--portal-muted)]">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-black/40 border border-[color:var(--portal-border)] flex items-center justify-center shadow-sm mb-2">
              <MessageSquare className="w-6 h-6 text-[color:var(--portal-muted)]" />
            </div>
            <p className="text-[color:var(--portal-text)] font-serif text-lg">Secure Session</p>
            <p className="text-[color:var(--portal-muted)] text-xs max-w-[220px] leading-relaxed">
              Your messages are protected by Lexora Protocol encryption.
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white/65 dark:bg-black/30 border-t border-[color:var(--portal-border)]">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write your message here..."
            className="portal-input flex-1 px-5 py-3.5 text-sm placeholder:text-[color:var(--portal-muted)]"
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sendMessage.isPending}
            className="portal-btn-primary px-5 py-3.5 disabled:opacity-50 flex items-center justify-center shadow-md font-semibold text-sm tracking-wide gap-2 group"
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
