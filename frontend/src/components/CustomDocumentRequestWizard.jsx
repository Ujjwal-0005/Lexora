import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, FileText, Loader2, Mail, Sparkles, UserCheck } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const CustomDocumentRequestWizard = () => {
    const navigate = useNavigate()
    const [lawyers, setLawyers] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        document_name: '',
        request_notes: '',
        lawyer_profile_id: '',
    })

    useEffect(() => {
        let active = true

        const loadLawyers = async () => {
            try {
                const response = await api.get('/lawyers?per_page=100')
                const records = response.data.lawyers?.data || response.data.lawyers || []
                if (active) {
                    setLawyers(records)
                }
            } catch (err) {
                console.error('Failed to load lawyers:', err)
                if (active) {
                    setError('Unable to load lawyers right now')
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadLawyers()

        return () => {
            active = false
        }
    }, [])

    const selectedLawyer = useMemo(
        () => lawyers.find((lawyer) => String(lawyer.id) === String(formData.lawyer_profile_id)),
        [lawyers, formData.lawyer_profile_id]
    )

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((current) => ({ ...current, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!formData.document_name.trim()) {
            setError('Document name is required')
            return
        }

        if (!formData.lawyer_profile_id) {
            setError('Please select a lawyer')
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            await api.post('/documents', {
                document_name: formData.document_name,
                request_notes: formData.request_notes,
                lawyer_profile_id: Number(formData.lawyer_profile_id),
                custom_fields: [],
            })

            toast.success('Custom document request sent')
            navigate('/client/documents')
        } catch (err) {
            console.error('Custom request error:', err)
            const message = err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(', ') || 'Failed to create request'
            setError(message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="portal-page portal-appear max-w-6xl mx-auto space-y-10 pb-20">
            <div className="portal-card-elevated p-7 md:p-9 flex flex-col gap-6">
                <button
                    onClick={() => navigate('/documents/browse')}
                    className="inline-flex items-center gap-3 text-xs font-bold tracking-widest uppercase text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Library
                </button>

                <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--portal-gold)] mb-3">Custom Request</p>
                        <h1 className="portal-page-title leading-tight">
                            Request a lawyer-built document
                        </h1>
                        <p className="mt-4 text-sm font-medium tracking-wide text-[color:var(--portal-muted)] max-w-2xl leading-relaxed">
                            Name the document, choose the lawyer, and submit the request. The lawyer will review it, quote the fee, ask for the required data, and upload the final PDF when finished.
                        </p>
                    </div>

                    <div className="portal-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 bg-[linear-gradient(145deg,#13213d,#2b4169)] text-[color:var(--portal-gold)] rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[color:var(--portal-muted)]">Custom Workflow</p>
                                <p className="font-serif font-bold text-[color:var(--portal-text)]">Request Intake</p>
                            </div>
                        </div>
                        <p className="text-sm text-[color:var(--portal-muted)] leading-relaxed">
                            This route is for documents that do not fit a fixed template.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-sm text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="portal-card p-8 space-y-8"
                >
                    <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-3">
                            Document Name
                        </label>
                        <input
                            name="document_name"
                            value={formData.document_name}
                            onChange={handleChange}
                            placeholder="e.g. Rental Agreement Draft"
                            className="portal-input w-full px-5 py-4 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-3">
                            Notes for the Lawyer
                        </label>
                        <textarea
                            name="request_notes"
                            value={formData.request_notes}
                            onChange={handleChange}
                            placeholder="Add a short description of what you need and any special instructions"
                            rows="5"
                            className="portal-input w-full px-5 py-4 resize-none text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-3">
                            Select Lawyer
                        </label>
                        <select
                            name="lawyer_profile_id"
                            value={formData.lawyer_profile_id}
                            onChange={handleChange}
                            className="portal-input w-full px-5 py-4 text-sm"
                        >
                            <option value="">Choose a lawyer</option>
                            {lawyers.map((lawyer) => (
                                <option key={lawyer.id} value={lawyer.id}>
                                    {lawyer.user?.name || 'Lawyer'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/documents/browse')}
                            className="portal-btn-ghost px-6 py-3 font-semibold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="portal-btn-primary px-6 py-3 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                            {submitting ? 'Sending Request...' : 'Send Custom Request'}
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="space-y-6"
                >
                    <div className="portal-card-elevated p-6 rounded-2xl border-l-4 border-[color:var(--portal-gold)]">
                        <p className="text-[10px] uppercase tracking-widest text-[color:var(--portal-muted)] font-bold mb-3">Selected Lawyer</p>
                        {selectedLawyer ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="font-serif text-2xl font-bold text-[color:var(--portal-gold)]">{selectedLawyer.user?.name}</p>
                                    <p className="text-sm text-[color:var(--portal-muted)] mt-1">{selectedLawyer.designation || 'Lawyer'}</p>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[color:var(--portal-muted)]">
                                    <Building2 className="w-4 h-4" />
                                    <span>Profile ID {selectedLawyer.id}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[color:var(--portal-muted)]">
                                    <Mail className="w-4 h-4" />
                                    <span>{selectedLawyer.user?.email}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-[color:var(--portal-muted)]">Choose any verified lawyer to send your request directly.</p>
                        )}
                    </div>

                    <div className="portal-card p-6">
                        <h2 className="font-serif text-2xl font-bold text-[color:var(--portal-text)] mb-4">What happens next</h2>
                        <div className="space-y-4 text-sm text-[color:var(--portal-muted)] leading-relaxed">
                            <p>1. The lawyer receives your request and decides whether to accept it.</p>
                            <p>2. If accepted, the lawyer sends the exact fields they need and the document fee.</p>
                            <p>3. You fill the requested key-value data, pay the quoted amount, and wait for the final PDF.</p>
                        </div>
                    </div>

                    <div className="portal-card p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[color:var(--portal-muted)] mb-3">Reminder</h3>
                        <p className="text-sm text-[color:var(--portal-muted)] leading-relaxed">
                            This request is saved immediately to your document vault, so you can track acceptance, field requests, payment, and the final upload from the client portal.
                        </p>
                    </div>
                </motion.div>
            </form>
        </div>
    )
}

export default CustomDocumentRequestWizard