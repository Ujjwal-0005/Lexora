import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { motion } from 'framer-motion'
import { MessageSquare, AlertCircle, ChevronRight, Send, HelpCircle, User, Activity, Clock3, ShieldCheck, BarChart3, Inbox } from 'lucide-react'
import Loader from '../components/Loader'

const Help = () => {
    const [tickets, setTickets] = useState([])
    const [faqs, setFaqs] = useState([])
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [type, setType] = useState('query')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [adminSearch, setAdminSearch] = useState('')
    const [adminStatusFilter, setAdminStatusFilter] = useState('all')
    const [adminTypeFilter, setAdminTypeFilter] = useState('all')
    const navigate = useNavigate()
    const { isAdmin } = useAuthStore()

    const load = async () => {
        try {
            setLoading(true)
            if (isAdmin()) {
                const res = await api.get('/admin/help')
                setTickets(res.data.data || res.data || [])
                setFaqs([])
            } else {
                const res = await api.get('/help')
                setTickets(res.data.tickets || [])
                setFaqs(res.data.faqs || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const submit = async (e) => {
        e.preventDefault()
        try {
            setSubmitting(true)
            const res = await api.post('/help', { subject, message, type })
            navigate(`/help/${res.data.ticket.id}`)
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    const adminTickets = useMemo(() => {
        return tickets
            .filter((ticket) => {
                const matchesSearch = !adminSearch.trim()
                    || ticket.subject?.toLowerCase().includes(adminSearch.toLowerCase())
                    || ticket.user?.name?.toLowerCase().includes(adminSearch.toLowerCase())
                    || ticket.user?.email?.toLowerCase().includes(adminSearch.toLowerCase())

                const matchesStatus = adminStatusFilter === 'all' || ticket.status === adminStatusFilter
                const matchesType = adminTypeFilter === 'all' || ticket.type === adminTypeFilter

                return matchesSearch && matchesStatus && matchesType
            })
            .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    }, [tickets, adminSearch, adminStatusFilter, adminTypeFilter])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f0f1f3] dark:bg-[#0a0e17]"><Loader /></div>
    }

    const openTickets = tickets.filter((ticket) => ticket.status === 'open').length
    const closedTickets = tickets.filter((ticket) => ticket.status === 'closed').length
    const complaintTickets = tickets.filter((ticket) => ticket.type === 'complaint').length
    const urgentTickets = tickets.filter((ticket) => ticket.type === 'complaint' && ticket.status === 'open').length
    const recentTicket = tickets[0] || null

    return (
        <div className={isAdmin() ? 'admin-page space-y-8 pt-[80px]' : 'lawyer-help-page pt-[100px] lp-premium-page max-w-7xl mx-auto pb-20 font-sans'}>
            {isAdmin() ? (
                <>
                    <div className="admin-page-header">
                        <p className="admin-page-kicker">Support Command Layer</p>
                        <h1 className="admin-page-title mb-3">Support Center</h1>
                        <p className="admin-page-subtitle">Manage user inquiries and platform compliance with a high-trust operational interface.</p>
                    </div>

                    <div className="grid xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="admin-metric-card">
                                    <p className="admin-metric-label">Open Tickets</p>
                                    <p className="admin-metric-value">{openTickets}</p>
                                    <p className="admin-metric-subtext">Awaiting response</p>
                                </div>
                                <div className="admin-metric-card">
                                    <p className="admin-metric-label">Closed Tickets</p>
                                    <p className="admin-metric-value">{closedTickets}</p>
                                    <p className="admin-metric-subtext">Resolved cases</p>
                                </div>
                                <div className="admin-metric-card">
                                    <p className="admin-metric-label">Complaints</p>
                                    <p className="admin-metric-value">{complaintTickets}</p>
                                    <p className="admin-metric-subtext">Compliance items</p>
                                </div>
                                <div className="admin-metric-card">
                                    <p className="admin-metric-label">Latest Activity</p>
                                    <p className="admin-metric-value">{recentTicket ? 'Live' : 'Idle'}</p>
                                    <p className="admin-metric-subtext">{recentTicket ? 'Most recent inquiry' : 'No active tickets'}</p>
                                </div>
                            </div>

                            <div className="admin-panel">
                                <div className="admin-panel-header flex items-center justify-between gap-3">
                                    <div>
                                        <p className="admin-panel-subtitle">Support Logs</p>
                                        <h2 className="admin-panel-title mt-1">Active Tickets</h2>
                                    </div>
                                    <span className="admin-pill">{adminTickets.length} visible</span>
                                </div>

                                <div className="px-6 pt-0 pb-5 border-b border-[color:var(--admin-border)] space-y-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3">
                                        <div className="relative">
                                            <input
                                                value={adminSearch}
                                                onChange={(event) => setAdminSearch(event.target.value)}
                                                placeholder="Search tickets, requester, or email"
                                                className="admin-input pl-4 pr-4"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {['all', 'open', 'closed'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setAdminStatusFilter(status)}
                                                    className={`admin-pill ${adminStatusFilter === status ? 'admin-pill-success' : ''}`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {['all', 'query', 'complaint'].map((kind) => (
                                            <button
                                                key={kind}
                                                onClick={() => setAdminTypeFilter(kind)}
                                                className={`admin-pill ${adminTypeFilter === kind ? 'admin-pill-alert' : ''}`}
                                            >
                                                {kind === 'all' ? 'All Types' : kind}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => {
                                                setAdminSearch('')
                                                setAdminStatusFilter('all')
                                                setAdminTypeFilter('all')
                                            }}
                                            className="admin-pill"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>

                                <div className="admin-panel-body">
                                    {adminTickets.length > 0 ? (
                                        <div className="space-y-3">
                                            {adminTickets.map((t, idx) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={t.id}
                                                    className="group rounded-2xl border border-[color:var(--admin-border)] p-4 cursor-pointer transition-all duration-300 hover:border-[color:var(--admin-border-strong)] hover:shadow-[var(--admin-shadow-sm)]"
                                                    style={{ background: 'var(--admin-surface)' }}
                                                    onClick={() => navigate(`/help/${t.id}`)}
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex items-start gap-4 min-w-0">
                                                            <div className={`p-3 rounded-xl border border-[color:var(--admin-border)] ${t.type === 'complaint' ? 'text-red-500' : 'text-[color:var(--admin-accent)]'}`} style={{ background: 'color-mix(in oklab, var(--admin-surface) 86%, transparent)' }}>
                                                                {t.type === 'complaint' ? <AlertCircle size={20} /> : <MessageSquare size={20} />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                    <h3 className="font-semibold text-[color:var(--admin-text)] text-base group-hover:text-[color:var(--admin-accent)] transition-colors truncate">{t.subject}</h3>
                                                                    <span className={`admin-pill ${t.status === 'open' ? 'admin-pill-alert' : 'admin-pill-success'}`}>{t.status}</span>
                                                                </div>
                                                                {isAdmin() && (
                                                                    <p className="text-xs text-[color:var(--admin-muted)] flex items-center gap-1">
                                                                        <User size={12} /> {t.user?.name} &lt;{t.user?.email}&gt;
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-[color:var(--admin-muted)] mt-2 font-medium flex items-center gap-2">
                                                                    <Clock3 size={12} /> {new Date(t.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} className="text-[color:var(--admin-muted)] group-hover:text-[color:var(--admin-accent)] transition-colors flex-shrink-0" />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="admin-empty-state">
                                            <Inbox size={40} className="mx-auto text-[color:var(--admin-muted)] mb-3" />
                                            <p className="font-medium text-[color:var(--admin-muted)] text-sm">No tickets match the current filters.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-4 space-y-6">
                            <div className="admin-panel sticky top-6">
                                <div className="admin-panel-header">
                                    <p className="admin-panel-subtitle">Operations</p>
                                    <h2 className="admin-panel-title mt-1">Overview</h2>
                                </div>
                                <div className="admin-panel-body space-y-4">
                                    <div className="rounded-2xl border border-[color:var(--admin-border)] p-4" style={{ background: 'var(--admin-surface)' }}>
                                        <div className="flex items-center gap-2 mb-2 text-[color:var(--admin-accent)]">
                                            <ShieldCheck className="w-4 h-4" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Priority</p>
                                        </div>
                                        <p className="text-sm font-semibold text-[color:var(--admin-text)]">{urgentTickets} urgent complaint{urgentTickets !== 1 ? 's' : ''}</p>
                                        <p className="text-xs text-[color:var(--admin-muted)] mt-1">Open complaints need immediate attention.</p>
                                    </div>

                                    <div className="rounded-2xl border border-[color:var(--admin-border)] p-4" style={{ background: 'var(--admin-surface)' }}>
                                        <div className="flex items-center gap-2 mb-2 text-[color:var(--admin-accent)]">
                                            <Activity className="w-4 h-4" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Status</p>
                                        </div>
                                        <p className="text-sm text-[color:var(--admin-text)] font-semibold">Support desk operating normally</p>
                                        <p className="text-xs text-[color:var(--admin-muted)] mt-1">Queries and complaints are tracked in real time.</p>
                                    </div>

                                    <div className="rounded-2xl border border-[color:var(--admin-border)] p-4" style={{ background: 'var(--admin-surface)' }}>
                                        <div className="flex items-center gap-2 mb-2 text-[color:var(--admin-accent)]">
                                            <BarChart3 className="w-4 h-4" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Ticket Mix</p>
                                        </div>
                                        <div className="space-y-2 text-sm text-[color:var(--admin-muted)]">
                                            <div className="flex justify-between"><span>Open</span><span className="font-semibold text-[color:var(--admin-text)]">{openTickets}</span></div>
                                            <div className="flex justify-between"><span>Closed</span><span className="font-semibold text-[color:var(--admin-text)]">{closedTickets}</span></div>
                                            <div className="flex justify-between"><span>Complaints</span><span className="font-semibold text-[color:var(--admin-text)]">{complaintTickets}</span></div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[color:var(--admin-border)] p-4" style={{ background: 'var(--admin-surface)' }}>
                                        <div className="flex items-center gap-2 mb-2 text-[color:var(--admin-accent)]">
                                            <ShieldCheck className="w-4 h-4" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Compliance Note</p>
                                        </div>
                                        <p className="text-sm text-[color:var(--admin-text)] font-semibold leading-relaxed">Admin replies should remain concise, documented, and audit-ready.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="lp-page-hero mb-10 ">
                        <h1 className="font-serif text-5xl font-bold text-[#0f172a] dark:text-white tracking-tight mb-3">
                            Support Center
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {isAdmin() ? 'Manage user inquiries and platform compliance.' : 'Professional assistance and query resolution.'}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="lp-surface bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white">
                                        {isAdmin() ? 'Active Tickets' : 'Your Inquiries'}
                                    </h2>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Support Logs
                                    </span>
                                </div>

                                {tickets.length > 0 ? (
                                    <div className="space-y-4">
                                        {tickets.map((t, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={t.id}
                                                className="group p-5 border border-gray-100 dark:border-gray-800 hover:border-[#a1804a] dark:hover:border-[#a1804a] transition-all cursor-pointer bg-gray-50 dark:bg-[#151f32]"
                                                onClick={() => navigate(`/help/${t.id}`)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`p-2 rounded-sm ${t.type === 'complaint' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-[#0f172a]/5 text-[#0f172a] dark:bg-white/5 dark:text-gray-300'}`}>
                                                            {t.type === 'complaint' ? <AlertCircle size={20} /> : <MessageSquare size={20} />}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-[#0f172a] dark:text-white text-base group-hover:text-[#a1804a] transition-colors">{t.subject}</h3>
                                                            {isAdmin() && (
                                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                    <User size={12} /> {t.user?.name} &lt;{t.user?.email}&gt;
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                                                {new Date(t.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-3">
                                                        <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${t.status === 'open'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                            }`}>
                                                            {t.status}
                                                        </span>
                                                        <ChevronRight size={16} className="text-gray-400 group-hover:text-[#a1804a] transition-colors" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center border border-dashed border-gray-200 dark:border-gray-800">
                                        <HelpCircle size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                                        <p className="text-gray-500 font-medium text-sm">No tickets found in the system.</p>
                                    </div>
                                )}
                            </div>

                            {!isAdmin() && faqs.length > 0 && (
                                <div className="lp-surface bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 shadow-sm p-8">
                                    <h2 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white mb-6">Common Questions</h2>
                                    <div className="space-y-6">
                                        {faqs.map((f, idx) => (
                                            <div key={idx} className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                                                <h3 className="font-bold text-[#0f172a] dark:text-gray-200 text-sm mb-2">{f.q}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isAdmin() && (
                            <div className="lg:col-span-1">
                                <div className="lp-surface bg-[#0f172a] text-white p-8 shadow-xl sticky top-6">
                                    <h2 className="font-serif text-2xl font-bold text-[#d97706] mb-2">New Inquiry</h2>
                                    <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed">
                                        Submit a query or complaint to our administrators. We respond within 24 hours.
                                    </p>

                                    <form onSubmit={submit} className="space-y-5">
                                        <div>
                                            <label className="block text-[0.65rem] font-bold text-gray-400 tracking-widest uppercase mb-2">
                                                Subject
                                            </label>
                                            <input
                                                value={subject}
                                                onChange={e => setSubject(e.target.value)}
                                                placeholder="Brief summary"
                                                className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:ring-0 focus:border-[#a1804a] transition-colors placeholder-gray-600 outline-none rounded-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[0.65rem] font-bold text-gray-400 tracking-widest uppercase mb-2">
                                                Category
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={type}
                                                    onChange={e => setType(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:ring-0 focus:border-[#a1804a] transition-colors outline-none rounded-sm appearance-none"
                                                >
                                                    <option value="query" className="bg-[#0f172a]">Query</option>
                                                    <option value="complaint" className="bg-[#0f172a]">Complaint</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[0.65rem] font-bold text-gray-400 tracking-widest uppercase mb-2">
                                                Message details
                                            </label>
                                            <textarea
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                                rows={5}
                                                placeholder="Describe your issue..."
                                                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:ring-0 focus:border-[#a1804a] transition-colors placeholder-gray-600 outline-none rounded-sm resize-none"
                                                required
                                            />
                                        </div>

                                        <button
                                            disabled={submitting}
                                            className="w-full bg-[#a1804a] hover:bg-[#8e703e] text-white text-[0.75rem] font-bold tracking-[0.1em] uppercase py-3 mt-2 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-md hover:shadow-lg rounded-sm"
                                        >
                                            {submitting ? <Loader size="sm" /> : (
                                                <>
                                                    Submit Ticket <Send size={14} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default Help
