import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, FileText, Sparkles, ShieldCheck, Clock3, ChevronRight,
    Gavel, Briefcase, Home, Gift, PenTool, Users, Lock,
    Award, Receipt, BookOpen, Info
} from 'lucide-react'
import api from '../api/axios'
import Loader from './Loader'

const iconMap = {
    'gavel': Gavel,
    'handshake': Briefcase,
    'file-text': FileText,
    'home': Home,
    'gift': Gift,
    'file-alt': FileText,
    'scroll': FileText,
    'lock': Lock,
    'users': Users,
    'file-signature': PenTool,
    'certificate': Award,
    'file-check': ShieldCheck,
    'file-invoice-dollar': Receipt,
    'file-contract': BookOpen,
    'info-circle': Info,
}

const DocumentTypeSelection = () => {
    const navigate = useNavigate()
    const [documentTypes, setDocumentTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDocumentTypes = async () => {
            try {
                const response = await api.get('/document-types')
                setDocumentTypes(response.data.documentTypes || response.data || [])
            } catch (err) {
                console.error('Error fetching document types:', err)
                setError('Failed to load document types')
            } finally {
                setLoading(false)
            }
        }

        fetchDocumentTypes()
    }, [])

    const stats = useMemo(() => ([
        { label: 'Professional templates', value: '20+', icon: FileText },
        { label: 'Trusted formatting', value: 'Secure', icon: ShieldCheck },
        { label: 'Fast turnaround', value: '5 min', icon: Clock3 },
    ]), [])

    const handleSelectDocument = (documentType) => {
        navigate(`/documents/request/${documentType.id}`, { state: { documentType } })
    }

    const handleCustomRequest = () => {
        navigate('/documents/custom-request')
    }

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-dark-700 pb-6">
                <div>
                    <button
                        onClick={() => navigate('/client/documents')}
                        className="inline-flex items-center gap-3 text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-[#0f172a] dark:hover:text-[#D4AF37] transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Vault
                    </button>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0f172a] dark:text-white">
                        Document Library
                    </h1>
                    <p className="mt-4 text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                        Browse professionally drafted templates and customizable document foundations. Choose a document to begin a secure creation workflow with our legal team.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-dark-800 p-4 border border-gray-200 dark:border-dark-700 shadow-sm rounded-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#0f172a] text-[#D4AF37] shadow-inner border border-[#D4AF37]/20">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">System Status</p>
                        <p className="font-serif font-bold text-[#0f172a] dark:text-white text-sm">Online</p>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-800 rounded-sm p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl border border-gray-200 dark:border-dark-700 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay"></div>
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className={`flex-1 flex items-center gap-5 relative z-10 ${index !== stats.length - 1 ? 'md:border-r md:border-white/10' : ''}`}>
                            <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-sm flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 shadow-inner">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">{stat.label}</p>
                                <h3 className="text-xl font-serif font-bold text-[#0f172a] dark:text-white">{stat.value}</h3>
                            </div>
                        </div>
                    )
                })}
            </motion.div>

            {loading ? (
                <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 p-16 rounded-sm flex justify-center shadow-sm">
                    <Loader />
                </div>
            ) : error ? (
                <div className="bg-white dark:bg-dark-800 border border-red-500/20 p-16 text-center rounded-sm shadow-sm relative overflow-hidden">
                    <p className="text-red-600 font-bold uppercase tracking-widest text-xs relative z-10">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-8 py-3 bg-[#D4AF37] text-[#0f172a] text-xs font-bold uppercase tracking-widest hover:bg-[#b8941d] transition-colors rounded-sm shadow-md relative z-10"
                    >
                        Re-initialize
                    </button>
                </div>
            ) : documentTypes.length === 0 ? (
                <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 p-16 text-center rounded-sm shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]"></div>
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-sm bg-[#D4AF37]/10 text-[#D4AF37] shadow-inner border border-[#D4AF37]/20">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#0f172a] dark:text-white mb-3 relative z-10">No Documents Available</h2>
                    <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed relative z-10">
                        The document library is currently empty. Please check back later or contact support to request templates.
                    </p>
                    <button
                        onClick={handleCustomRequest}
                        className="mt-8 px-8 py-3 bg-[#0f172a] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors rounded-sm shadow-md relative z-10"
                    >
                        Create Custom Request
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                >
                    {documentTypes.map((docType, index) => {
                        const IconComponent = docType.icon && iconMap[docType.icon] ? iconMap[docType.icon] : FileText;
                        const displayFee = Number(docType.minimum_lawyer_fee ?? docType.base_price ?? 0)

                        return (
                            <motion.button
                                key={docType.id}
                                type="button"
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.06 }}
                                onClick={() => handleSelectDocument(docType)}
                                className="group relative bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 text-left rounded-sm p-8 hover:border-[#D4AF37] transition-all shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/10 overflow-hidden flex flex-col min-h-[340px]"
                            >
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl group-hover:bg-[#D4AF37]/15 transition-colors"></div>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-[#D4AF37] transition-colors z-20"></div>

                                <div className="relative z-10 flex items-start justify-between gap-4 mb-8">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-white/5 text-[#D4AF37] border border-white/10 group-hover:bg-[#D4AF37] group-hover:text-[#0f172a] transition-all shrink-0">
                                        <IconComponent className="w-8 h-8" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 group-hover:text-gray-300 transition-colors">From</span>
                                        <span className="font-serif text-xl font-bold text-[#0f172a] dark:text-white group-hover:text-[#D4AF37] transition-colors">
                                            ₹{displayFee.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="relative z-10 font-serif text-2xl font-bold text-[#0f172a] dark:text-white mb-3 group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-tight">
                                    {docType.name}
                                </h3>
                                <p className="relative z-10 flex-1 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 line-clamp-3 leading-relaxed font-medium transition-colors">
                                    {docType.description}
                                </p>

                                <div className="relative z-10 mt-8 pt-6 border-t border-white/10 group-hover:border-[#D4AF37]/30 flex items-center justify-between w-full transition-colors">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#D4AF37] transition-colors">
                                        Initiate Sequence
                                    </span>
                                    <span className="inline-flex h-10 w-10 items-center justify-center bg-white/5 text-white rounded-sm group-hover:bg-[#D4AF37] group-hover:text-[#0f172a] transition-all shadow-md">
                                        <ChevronRight className="w-5 h-5" />
                                    </span>
                                </div>
                            </motion.button>
                        )
                    })}
                </motion.div>
            )}

            <div className="relative overflow-hidden rounded-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 p-10 md:p-12 shadow-xl mt-12">
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-gray-50 dark:bg-white/5 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                        <h2 className="font-serif text-3xl font-bold text-[#0f172a] dark:text-white mb-3">
                            Require Architectural Guidance?
                        </h2>
                        <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 leading-relaxed">
                            Our document templates are modular and customizable. Choose a template above and our legal team will tailor it to your exact requirements.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/client/documents')}
                        className="px-8 py-4 bg-[#0f172a] text-white dark:bg-white dark:text-[#0f172a] text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-gray-100 transition-all rounded-sm shadow-lg shrink-0 flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                        Access Vault <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-sm bg-[#0f172a] text-white p-10 md:p-12 shadow-xl">
                <div className="absolute right-0 top-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-gray-400 mb-3 font-bold">Custom Workflow</p>
                        <h2 className="font-serif text-3xl font-bold text-white mb-3">
                            Need a document that is not in the library?
                        </h2>
                        <p className="text-sm font-medium tracking-wide text-gray-300 leading-relaxed">
                            Name the document, select a lawyer, and request a tailored drafting workflow with acceptance, fee quote, required fields, payment, and final PDF delivery.
                        </p>
                    </div>
                    <button
                        onClick={handleCustomRequest}
                        className="px-8 py-4 bg-[#D4AF37] text-[#0f172a] text-xs font-bold uppercase tracking-widest hover:bg-[#b8941d] transition-all rounded-sm shadow-lg shrink-0 flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                        Start Custom Request <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DocumentTypeSelection
