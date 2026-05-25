import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, CheckCircle, User, AlertCircle, Clock, ShieldCheck, MessageSquare, Activity, Inbox, User2, CalendarClock } from 'lucide-react'
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

    const isAdminView = isAdmin()

    return (
        <div className={isAdminView ? 'admin-page space-y-8' : 'lawyer-help-ticket-page pt-[100px] lp-premium-page max-w-4xl mx-auto pb-20 font-sans'}>
            {isAdminView ? (
                <>
                    <button onClick={() => navigate('/help')} className="flex items-center gap-2 text-sm font-bold text-[color:var(--admin-muted)] uppercase tracking-widest hover:text-[color:var(--admin-text)] transition-colors">
                        <ArrowLeft size={16} /> Back to Support Logs
                    </button>

                    <div className="grid xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-8 space-y-6">
                            <div className="admin-panel">
                                <div className="admin-panel-header flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="admin-panel-subtitle">Support Thread</p>
                                        <h1 className="admin-panel-title mt-1 text-[1.9rem]">{ticket.subject}</h1>
                                        <p className="admin-metric-subtext mt-2">Ticket ID: #{ticket.id.toString().padStart(6, '0')}</p>
                                    </div>

                                    {isAdminView && ticket.status === 'open' && (
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => resolveTicket(false)} className="admin-btn-ghost px-4 py-2">
                                                Close
                                            </button>
                                            <button onClick={() => resolveTicket(true)} className="admin-btn-primary px-4 py-2 flex items-center gap-2">
                                                <ShieldCheck size={14} /> Close & Notify
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="admin-panel-body">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="rounded-2xl border border-[color:var(--admin-border)] p-4" style={{ background: 'var(--admin-surface)' }}>
                                            <div className="flex items-center gap-2 text-[color:var(--admin-muted)] text-[10px] font-bold uppercase tracking-widest mb-2"><Activity className="w-4 h-4 text-[color:var(--admin-accent)]" />Status</div>
                                            <p className="text-sm font-semibold text-[color:var(--admin-text)]">{ticket.status}</p>
                                        </div>
                                        <div className="rounded-2xl border border-[color:var(--admin-border)] p-4" style={{ background: 'var(--admin-surface)' }}>
                                            <div className="flex items-center gap-2 text-[color:var(--admin-muted)] text-[10px] font-bold uppercase tracking-widest mb-2"><User2 className="w-4 h-4 text-[color:var(--admin-accent)]" />Requester</div>
                                            <p className="text-sm font-semibold text-[color:var(--admin-text)]">{ticket.user?.name || 'Unknown'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-[color:var(--admin-border)] p-4" style={{ background: 'var(--admin-surface)' }}>
                                            <div className="flex items-center gap-2 text-[color:var(--admin-muted)] text-[10px] font-bold uppercase tracking-widest mb-2"><CalendarClock className="w-4 h-4 text-[color:var(--admin-accent)]" />Created</div>
                                            <p className="text-sm font-semibold text-[color:var(--admin-text)]">{new Date(ticket.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {ticket.replies.map((r, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.08 }}
                                                key={r.id}
                                                className={`flex flex-col ${r.is_admin ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className="flex items-center gap-2 mb-2 px-1">
                                                    <span className="text-xs font-bold text-[color:var(--admin-muted)] uppercase tracking-widest">
                                                        {r.is_admin ? 'Admin' : (r.user?.name || 'User')}
                                                    </span>
                                                    <span className="text-[0.65rem] text-[color:var(--admin-muted)] font-medium">
                                                        • {new Date(r.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className={`p-4 rounded-2xl max-w-[85%] border ${r.is_admin
                                                    ? 'border-[color:var(--admin-border-strong)]'
                                                    : 'border-[color:var(--admin-border)]'
                                                    }`} style={{ background: r.is_admin ? 'linear-gradient(145deg, var(--admin-accent), var(--admin-accent-soft))' : 'var(--admin-surface)' }}>
                                                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${r.is_admin ? 'text-white' : 'text-[color:var(--admin-text)]'}`}>{r.message}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {ticket.status === 'closed' && (
                                        <div className="mt-8 p-4 border border-emerald-300/40 bg-emerald-50/70 dark:bg-emerald-500/10 dark:border-emerald-400/30 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-3">
                                            <CheckCircle size={18} />
                                            <p className="text-sm font-medium">This inquiry has been resolved and closed by administration.</p>
                                        </div>
                                    )}

                                    {(!ticket.status || ticket.status !== 'closed' || isAdminView) && (
                                        <form onSubmit={reply} className="mt-10 pt-8 border-t border-[color:var(--admin-border)]">
                                            <label className="block text-[0.65rem] font-bold text-[color:var(--admin-muted)] uppercase tracking-widest mb-3">
                                                New Transmission
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    value={message}
                                                    onChange={e => setMessage(e.target.value)}
                                                    className="admin-textarea resize-none"
                                                    rows={4}
                                                    placeholder="Type your message here..."
                                                    required
                                                />
                                            </div>
                                            <div className="flex justify-end mt-4">
                                                <button
                                                    disabled={submitting}
                                                    className="admin-btn-primary px-6 py-3 flex justify-center items-center gap-2 disabled:opacity-50"
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
                        </div>

                        <div className="xl:col-span-4 space-y-6">
                            <div className="admin-panel sticky top-6">
                                <div className="admin-panel-header">
                                    <p className="admin-panel-subtitle">Requester</p>
                                    <h2 className="admin-panel-title mt-1">User Details</h2>
                                </div>
                                <div className="admin-panel-body space-y-4">
                                    {ticket.user ? (
                                        <div className="rounded-2xl border border-[color:var(--admin-border)] p-4 flex items-start gap-4" style={{ background: 'var(--admin-surface)' }}>
                                            <div className="w-12 h-12 rounded-2xl bg-[linear-gradient(145deg,var(--admin-accent),var(--admin-accent-soft))] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                                                {ticket.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[color:var(--admin-muted)] uppercase tracking-widest mb-1">Identity</p>
                                                <p className="font-semibold text-[color:var(--admin-text)]">{ticket.user.name}</p>
                                                <p className="text-sm text-[color:var(--admin-muted)]">{ticket.user.email}</p>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="rounded-2xl border border-[color:var(--admin-border)] p-4" style={{ background: 'var(--admin-surface)' }}>
                                        <div className="flex items-center gap-2 mb-2 text-[color:var(--admin-accent)]">
                                            <Inbox className="w-4 h-4" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Thread Type</p>
                                        </div>
                                        <p className="text-sm font-semibold text-[color:var(--admin-text)] capitalize">{ticket.type}</p>
                                    </div>

                                    <div className="rounded-2xl border border-[color:var(--admin-border)] p-4" style={{ background: 'var(--admin-surface)' }}>
                                        <div className="flex items-center gap-2 mb-2 text-[color:var(--admin-accent)]">
                                            <Clock size={14} />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Operational Note</p>
                                        </div>
                                        <p className="text-sm text-[color:var(--admin-muted)] leading-relaxed">Admin replies should stay concise, logged, and aligned with internal audit requirements.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <button onClick={() => navigate('/help')} className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-[#0f172a] dark:hover:text-white transition-colors mb-8">
                        <ArrowLeft size={16} /> Back to Support Logs
                    </button>

                    <div className="lp-surface bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 shadow-sm p-8 mb-8">
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

                            {ticket.status === 'open' && (
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

                        {ticket.user && (
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
                </>
            )}
        </div>
    )
}

export default HelpTicket
