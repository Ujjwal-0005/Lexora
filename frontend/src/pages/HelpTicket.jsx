import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, CheckCircle, User, AlertCircle, Clock, ShieldCheck, MessageSquare } from 'lucide-react'
import Loader from '../components/Loader'

const HelpTicket = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [ticket, setTicket] = useState(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const { isAdmin } = useAuthStore()

    const load = async () => {
        try {
            if (isAdmin()) {
                const res = await api.get(`/admin/help/${id}`)
                setTicket(res.data)
            } else {
                const res = await api.get(`/help/${id}`)
                setTicket(res.data.ticket)
            }
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    useEffect(() => { load() }, [id])

    const reply = async (e) => {
        e.preventDefault()
        try {
            setSubmitting(true)
            if (isAdmin()) {
                await api.post(`/admin/help/${id}/reply`, { message })
            } else {
                await api.post(`/help/${id}/reply`, { message })
            }
            setMessage('')
            load()
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    const resolveTicket = async (sendMail = false) => {
        try {
            await api.post(`/admin/help/${id}/resolve`, { send_mail: sendMail ? 1 : 0 })
            toast.success('Complaint closed successfully')
            navigate('/help', { replace: true })
        } catch (e) { console.error(e) }
    }

    if (loading || !ticket) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader /></div>
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 font-sans">
            <button onClick={() => navigate('/help')} className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-[#0f172a] dark:hover:text-white transition-colors mb-8">
                <ArrowLeft size={16} /> Back to Support Logs
            </button>

            <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 shadow-sm p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1 ${ticket.type === 'complaint' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-[#0f172a]/5 text-[#0f172a] dark:bg-white/5 dark:text-gray-300'
                                }`}>
                                {ticket.type === 'complaint' ? <AlertCircle size={10} /> : <MessageSquare size={10} />}
                                {ticket.type}
                            </span>
                            <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1 ${ticket.status === 'open'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                {ticket.status === 'open' ? <Clock size={10} /> : <CheckCircle size={10} />}
                                {ticket.status}
                            </span>
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-[#0f172a] dark:text-white mb-2">{ticket.subject}</h1>
                        <p className="text-sm text-gray-500 font-medium">Ticket ID: #{ticket.id.toString().padStart(6, '0')}</p>
                    </div>

                    {isAdmin() && ticket.status === 'open' && (
                        <div className="flex items-center gap-3">
                            <button onClick={() => resolveTicket(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#0f172a] dark:text-white text-xs font-bold tracking-widest uppercase transition-colors rounded-sm">
                                Close
                            </button>
                            <button onClick={() => resolveTicket(true)} className="px-4 py-2 bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] hover:bg-gray-800 dark:hover:bg-gray-200 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 rounded-sm shadow-md">
                                <ShieldCheck size={14} /> Close & Notify
                            </button>
                        </div>
                    )}
                </div>

                {isAdmin() && ticket.user && (
                    <div className="mb-8 p-4 bg-gray-50 dark:bg-[#151f32] border border-gray-100 dark:border-gray-800 rounded-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-[#0f172a] dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-white font-serif font-bold text-lg">
                            {ticket.user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">User Details</p>
                            <p className="font-bold text-[#0f172a] dark:text-white text-sm">{ticket.user.name}</p>
                            <p className="text-xs text-gray-500">{ticket.user.email}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {ticket.replies.map((r, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={r.id}
                            className={`flex flex-col ${r.is_admin ? 'items-end' : 'items-start'}`}
                        >
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {r.is_admin ? 'Admin' : (r.user?.name || 'User')}
                                </span>
                                <span className="text-[0.65rem] text-gray-400 font-medium">
                                    • {new Date(r.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className={`p-4 rounded-sm max-w-[85%] ${r.is_admin
                                ? 'bg-[#0f172a] text-white shadow-md'
                                : 'bg-gray-100 dark:bg-[#151f32] text-[#0f172a] dark:text-gray-200 border border-gray-200 dark:border-gray-800'
                                }`}>
                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${r.is_admin ? 'text-white dark:text-white' : ''}`}>{r.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {!isAdmin() && ticket.status === 'closed' && (
                    <div className="mt-8 p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-sm flex items-center gap-3">
                        <CheckCircle size={18} />
                        <p className="text-sm font-medium">This inquiry has been resolved and closed by administration.</p>
                    </div>
                )}

                {(!ticket.status || ticket.status !== 'closed' || isAdmin()) && (
                    <form onSubmit={reply} className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                        <label className="block text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-3">
                            New Transmission
                        </label>
                        <div className="relative">
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm text-[#111827] dark:text-white focus:ring-1 focus:ring-[#a1804a] focus:border-[#a1804a] transition-all placeholder-gray-400 dark:placeholder-gray-600 outline-none rounded-sm resize-none"
                                rows={4}
                                placeholder="Type your message here..."
                                required
                            />
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                disabled={submitting}
                                className="bg-[#a1804a] hover:bg-[#8e703e] text-white text-[0.75rem] font-bold tracking-[0.1em] uppercase px-6 py-3 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-md hover:shadow-lg rounded-sm"
                            >
                                {submitting ? <Loader size="sm" /> : (
                                    <>Transmit Reply <Send size={14} /></>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default HelpTicket
