import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { motion } from 'framer-motion'
import { MessageSquare, AlertCircle, ChevronRight, Send, HelpCircle, User } from 'lucide-react'
import Loader from '../components/Loader'

const Help = () => {
    const [tickets, setTickets] = useState([])
    const [faqs, setFaqs] = useState([])
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [type, setType] = useState('query')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f0f1f3] dark:bg-[#0a0e17]"><Loader /></div>
    }

    return (
        <div className="lawyer-help-page pt-[100px] lp-premium-page max-w-7xl mx-auto pb-20 font-sans">
            {/* Header */}
            <div className="lp-page-hero mb-10 ">
                <h1 className="font-serif text-5xl font-bold text-[#0f172a] dark:text-white tracking-tight mb-3">
                    Support Center
                </h1>
                <p className="text-gray-500 font-medium">
                    {isAdmin() ? 'Manage user inquiries and platform compliance.' : 'Professional assistance and query resolution.'}
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Ticket List */}
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

                    {/* FAQs for non-admins */}
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

                {/* Sidebar area */}
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
        </div>
    )
}

export default Help
