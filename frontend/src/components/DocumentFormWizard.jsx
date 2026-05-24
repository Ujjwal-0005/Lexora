import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, CreditCard, Download, FileText, ShieldCheck } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Loader from './Loader'

export default function DocumentFormWizard() {
    const { typeId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const documentType = location.state?.documentType

    const [step, setStep] = useState(1)
    const [lawyers, setLawyers] = useState([])
    const [selectedLawyer, setSelectedLawyer] = useState(location.state?.selectedLawyer || null)
    const [formData, setFormData] = useState({})
    const [loading, setLoading] = useState(!documentType)
    const [error, setError] = useState(null)
    const [docType, setDocType] = useState(documentType)
    const [submitting, setSubmitting] = useState(false)
    const [documentRequest, setDocumentRequest] = useState(null)

    useEffect(() => {
        let isMounted = true

        const fetchDocumentType = async () => {
            if (docType?.field_definitions || !typeId) {
                setLoading(false)
                return
            }

            try {
                const response = await api.get(`/document-types/${typeId}`)
                const fetchedDocType = response.data.documentType || response.data
                if (isMounted) {
                    setDocType(fetchedDocType)
                    setLoading(false)
                }
            } catch (err) {
                console.error('Error fetching document type:', err)
                if (isMounted) {
                    setError('Failed to load document type')
                    setLoading(false)
                }
            }
        }

        fetchDocumentType()

        // Fetch lawyers offering this document type
        const fetchLawyers = async () => {
            try {
                const res = await api.get(`/document-types/${typeId}/lawyers`)
                setLawyers(res.data.lawyers || [])
            } catch (err) {
                console.error('Error fetching lawyers for document type:', err)
            }
        }

        if (typeId) fetchLawyers()

        return () => {
            isMounted = false
        }
    }, [docType?.field_definitions, typeId])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const validateStep = () => {
        if (!docType?.field_definitions) return true

        const requiredFields = docType.field_definitions.filter((field) => field.required)
        for (let field of requiredFields) {
            const value = formData[field.name]
            if (!value || String(value).trim() === '') {
                setError(`${field.label} is required`)
                return false
            }
        }

        setError(null)
        return true
    }

    const handleNextStep = () => {
        if (validateStep()) {
            setStep((prev) => prev + 1)
        }
    }

    const handlePreviousStep = () => {
        setStep((prev) => Math.max(1, prev - 1))
    }

    const handleSubmitForm = async () => {
        if (!validateStep()) return

        setSubmitting(true)
        try {
            if (!selectedLawyer) {
                setError('Please select a lawyer to handle this request')
                setSubmitting(false)
                return
            }

            const response = await api.post('/documents', {
                document_type_id: docType.id,
                lawyer_profile_id: selectedLawyer.id,
                custom_fields: formData,
            })

            setDocumentRequest(response.data.document)
            setStep(3)
        } catch (err) {
            console.error('Error creating document request:', err)
            const errorMsg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : err.response?.data?.message || 'Failed to create document request'
            setError(errorMsg)
        } finally {
            setSubmitting(false)
        }
    }

    const handlePayment = async () => {
        if (!documentRequest) return

        setSubmitting(true)
        try {
            await api.post('/payments/document', {
                document_request_id: documentRequest.id,
                payment_method: 'card',
            })
            // After payment we do not auto-generate - lawyer will accept and generate/upload.
            queryClient.invalidateQueries({ queryKey: ['documents'] })
            toast.success('Payment successful. Lawyer will prepare the document.')
            // Redirect to client documents list / detail
            navigate('/client/documents')
        } catch (err) {
            console.error('Error processing payment:', err)
            setError(err.response?.data?.message || 'Payment failed')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="card p-8 text-center">
                    <Loader />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading document...</p>
                </div>
            </div>
        )
    }

    if (!docType) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="card max-w-md p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                        <FileText className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Document type not found</p>
                    <button onClick={() => navigate('/client/documents')} className="mt-6 btn-primary">
                        Back to Documents
                    </button>
                </div>
            </div>
        )
    }

    const steps = ['Details', 'Review', 'Payment', 'Download']

    return (
        <div className="portal-page portal-appear space-y-10 max-w-5xl mx-auto py-8">
            <div className="portal-card-elevated p-7 md:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <button
                        onClick={() => navigate('/documents/browse')}
                        className="inline-flex items-center gap-3 text-xs font-bold tracking-widest uppercase text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Library
                    </button>
                    <h1 className="portal-page-title mt-1">
                        {docType.name}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium tracking-wide text-[color:var(--portal-muted)] leading-relaxed">
                        {docType.description}
                    </p>
                </div>

                <div className="portal-card flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#13213d,#2b4169)] text-[color:var(--portal-gold)] shadow-inner">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[color:var(--portal-muted)]">Lexora Protocol</p>
                        <p className="font-serif font-bold text-[color:var(--portal-text)] text-sm">Secure Generation</p>
                    </div>
                </div>
            </div>

            <div className="py-4">
                <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[color:var(--portal-border)] -z-10"></div>
                    {steps.map((label, index) => {
                        const number = index + 1
                        const active = step >= number
                        const current = step === number
                        return (
                            <div key={label} className="flex flex-col items-center gap-3 bg-transparent px-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full font-serif text-lg font-bold transition-all duration-500 shadow-sm ${active ? 'bg-[linear-gradient(150deg,#13213d,#2a3f67)] dark:bg-[linear-gradient(150deg,#d9ba79,#c99e4f)] text-[color:var(--portal-gold)] dark:text-[#15243b] border-2 border-[color:var(--portal-gold)]' : 'bg-white/70 dark:bg-black/30 border-2 border-[color:var(--portal-border)] text-[color:var(--portal-muted)]'}`}>
                                    {step > number ? <CheckCircle2 className="w-6 h-6" /> : number}
                                </div>
                                <span className={`text-[10px] uppercase tracking-widest font-bold ${current ? 'text-[color:var(--portal-text)]' : active ? 'text-[color:var(--portal-gold)]' : 'text-[color:var(--portal-muted)]'}`}>
                                    {label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="portal-card border border-red-500/20 bg-red-50 p-4 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    !selectedLawyer ? (
                        <LawyerSelect
                            key="select-lawyer"
                            lawyers={lawyers}
                            onSelect={(lawyer) => setSelectedLawyer(lawyer)}
                        />
                    ) : (
                        <FormStep key="form" docType={docType} formData={formData} onInputChange={handleInputChange} />
                    )
                )}

                {step === 2 && (
                    <ReviewStep
                        key="review"
                        docType={docType}
                        formData={formData}
                        price={selectedLawyer?.custom_price || docType.base_price}
                    />
                )}

                {step === 3 && (
                    <PaymentStep key="payment" price={documentRequest?.price || selectedLawyer?.custom_price || docType.base_price} />
                )}

                {step === 4 && documentRequest && (
                    <DownloadStep key="download" documentRequest={documentRequest} />
                )}
            </AnimatePresence>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-[color:var(--portal-border)]">
                <button
                    onClick={handlePreviousStep}
                    disabled={step === 1 || submitting}
                    className="portal-btn-ghost w-full sm:w-auto px-8 py-4 font-bold tracking-widest uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back
                </button>

                <div className="w-full sm:w-auto flex gap-3">
                    {step === 1 && (
                        <button onClick={handleNextStep} className="portal-btn-primary w-full sm:w-auto px-8 py-4 font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2">
                            Review Configuration <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                    )}

                    {step === 2 && (
                        <button
                            onClick={handleSubmitForm}
                            disabled={submitting}
                            className="portal-btn-primary w-full sm:w-auto px-8 py-4 font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? 'Processing...' : 'Proceed to Payment'} <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                    )}

                    {step === 3 && (
                        <button
                            onClick={handlePayment}
                            disabled={submitting}
                            className="portal-btn-primary w-full sm:w-auto px-8 py-4 font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <CreditCard className="w-4 h-4" />
                            {submitting ? 'Processing...' : 'Complete Secure Payment'}
                        </button>
                    )}

                    {step === 4 && (
                        <button onClick={() => navigate('/client/documents')} className="portal-btn-primary w-full sm:w-auto px-8 py-4 font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4" />
                            Access Vault
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function LawyerSelect({ lawyers, onSelect }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="portal-card p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[color:var(--portal-gold)] via-[#f3daad] to-[color:var(--portal-gold)]"></div>
            <h2 className="font-serif text-2xl font-bold text-[color:var(--portal-text)] border-b border-[color:var(--portal-border)] pb-4 mb-6">Select Legal Representative</h2>
            {lawyers.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-sm font-semibold tracking-wide text-gray-500 uppercase">No representations available at the moment</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {lawyers.map((l) => (
                        <div key={l.id} className="group portal-card p-6 hover:border-[color:var(--portal-border-strong)] transition-all flex flex-col justify-between">
                            <div className="flex items-start gap-5 mb-6">
                                <div className="w-16 h-16 rounded-xl bg-[linear-gradient(150deg,#13213d,#2a3f67)] flex items-center justify-center border border-[color:var(--portal-border-strong)] shadow-inner transition-colors shrink-0">
                                    <span className="font-serif text-2xl font-bold text-[color:var(--portal-gold)]">{l.user?.name?.charAt(0)}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-serif font-bold text-lg text-[color:var(--portal-text)]">{l.user?.name}</h3>
                                    <p className="text-xs text-[color:var(--portal-muted)] mt-2 line-clamp-2 leading-relaxed">{l.bio}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-[color:var(--portal-border)] flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-[color:var(--portal-muted)]">Consultation Rate</span>
                                    <span className="font-bold text-lg text-[color:var(--portal-gold)]">₹{Number(l.custom_price ?? 0).toLocaleString('en-IN') || '—'}</span>
                                </div>
                                <button onClick={() => onSelect(l)} className="portal-btn-ghost px-6 py-2.5 text-xs font-bold uppercase tracking-widest">Select</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}

function FormStep({ docType, formData, onInputChange }) {
    if (!docType?.field_definitions || docType.field_definitions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="portal-card p-8"
            >
                <p className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Loading configuration...</p>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="portal-card p-8 md:p-12 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 right-0 h-1 bg-[color:var(--portal-gold)]"></div>
            <h2 className="font-serif text-2xl font-bold text-[color:var(--portal-text)] border-b border-[color:var(--portal-border)] pb-4 mb-8">Document Configuration</h2>

            <div className="space-y-8">
                {docType.field_definitions?.map((field) => (
                    <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                    >
                        <label className="block text-xs font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-3">
                            {field.label}
                            {field.required && <span className="ml-1 text-[#D4AF37]">*</span>}
                        </label>

                        {field.type === 'textarea' ? (
                            <textarea
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={onInputChange}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                rows="4"
                                className="portal-input w-full px-5 py-4 resize-none text-sm"
                            />
                        ) : field.type === 'date' ? (
                            <input
                                type="date"
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={onInputChange}
                                className="portal-input w-full px-5 py-4 text-sm dark-date-picker"
                            />
                        ) : field.type === 'number' ? (
                            <input
                                type="number"
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={onInputChange}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                className="portal-input w-full px-5 py-4 text-sm"
                            />
                        ) : field.type === 'email' ? (
                            <input
                                type="email"
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={onInputChange}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                className="portal-input w-full px-5 py-4 text-sm"
                            />
                        ) : (
                            <input
                                type="text"
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={onInputChange}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                className="portal-input w-full px-5 py-4 text-sm"
                            />
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

function ReviewStep({ docType, formData, price }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="portal-card p-8 relative overflow-hidden"
        >
            <h2 className="font-serif text-2xl font-bold text-[color:var(--portal-text)] border-b border-[color:var(--portal-border)] pb-4 mb-8">Review Configuration</h2>

            <div className="portal-card p-6 md:p-8 mb-8">
                <div className="grid gap-8 sm:grid-cols-2">
                    {docType.field_definitions?.map((field) => (
                        <motion.div
                            key={field.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="border-b border-[color:var(--portal-border)] pb-4"
                        >
                            <p className="text-[10px] font-bold tracking-widest uppercase text-[color:var(--portal-muted)] mb-2">{field.label}</p>
                            <p className="font-medium text-sm text-[color:var(--portal-text)]">{formData[field.name] || '(Not provided)'}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="portal-card-elevated p-6 md:p-8 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-l-4 border-[color:var(--portal-gold)] gap-4">
                <div>
                    <p className="text-[10px] tracking-widest uppercase font-bold text-[color:var(--portal-muted)] mb-2">Selected Lawyer Fee</p>
                    <p className="font-serif text-3xl text-[color:var(--portal-gold)] font-bold">₹{Number(price || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="sm:text-right max-w-xs">
                    <p className="text-xs tracking-wide text-[color:var(--portal-muted)] font-medium leading-relaxed">
                        Proceed to securely process your payment and assign the selected attorney.
                    </p>
                </div>
            </div>
        </motion.div>
    )
}

function PaymentStep({ price }) {
    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
    })

    const handleCardInputChange = (e) => {
        const { name, value } = e.target
        setCardData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="portal-card p-8 relative overflow-hidden"
        >
            <h2 className="font-serif text-2xl font-bold text-[color:var(--portal-text)] border-b border-[color:var(--portal-border)] pb-4 mb-8">Secure Payment Gateway</h2>

            <div className="portal-card-elevated mb-10 p-8 rounded-2xl shadow-2xl relative overflow-hidden flex justify-between items-center">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <p className="text-[10px] tracking-widest uppercase font-bold text-[color:var(--portal-muted)] mb-2">Selected Lawyer Fee</p>
                    <p className="text-4xl font-serif font-bold text-[color:var(--portal-gold)]">₹{price.toLocaleString('en-IN')}</p>
                </div>
                <div className="relative z-10">
                    <CreditCard className="w-12 h-12 text-[color:var(--portal-muted)]" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-3">Cardholder Name</label>
                    <input
                        type="text"
                        name="cardholderName"
                        value={cardData.cardholderName}
                        onChange={handleCardInputChange}
                        placeholder="John Doe"
                        className="portal-input w-full px-5 py-4 text-sm"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-3">Card Number</label>
                    <input
                        type="text"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleCardInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="portal-input w-full px-5 py-4 text-sm tracking-widest"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-3">Expiry Date</label>
                    <input
                        type="text"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleCardInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="portal-input w-full px-5 py-4 text-sm tracking-widest"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold tracking-wider uppercase text-[color:var(--portal-muted)] mb-3">CVV</label>
                    <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardInputChange}
                        placeholder="123"
                        maxLength="3"
                        className="portal-input w-full px-5 py-4 text-sm tracking-widest"
                    />
                </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3 text-[10px] tracking-widest uppercase font-bold text-[color:var(--portal-muted)]">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Secure 256-bit Encrypted Demo
            </div>
        </motion.div>
    )
}

function DownloadStep({ documentRequest }) {
    const downloadUrl = documentRequest.generated_file_path
        ? `http://localhost:8000/storage/${documentRequest.generated_file_path}`
        : null

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="portal-card-elevated p-8 relative overflow-hidden text-center py-16"
        >
            <div className="absolute top-0 left-0 right-0 h-1 bg-[color:var(--portal-gold)]"></div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
                <div className="w-24 h-24 rounded-xl bg-[linear-gradient(150deg,#13213d,#2a3f67)] border-2 border-[color:var(--portal-gold)] flex items-center justify-center mx-auto mb-8 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5"></div>
                    <CheckCircle2 className="w-12 h-12 text-[color:var(--portal-gold)]" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-[color:var(--portal-text)] mb-3">Request Confirmed</h2>
                <p className="text-[color:var(--portal-muted)] font-semibold tracking-wide text-sm mb-10 max-w-md mx-auto leading-relaxed">
                    Your request has been forwarded. The attorney will prepare your binding document and upload it to your secure vault.
                </p>
            </motion.div>

            {downloadUrl ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-10"
                >
                    <a
                        href={downloadUrl}
                        download={`document-${documentRequest.id}.pdf`}
                        className="portal-btn-primary inline-flex items-center gap-3 px-8 py-4 font-bold tracking-widest uppercase text-xs"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF Copy
                    </a>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10 rounded-xl border border-[color:var(--portal-border)] bg-white/45 dark:bg-[color:var(--portal-gold)]/8 p-5 max-w-md mx-auto"
                >
                    <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--portal-text)] dark:text-[color:var(--portal-gold)]">
                        Pending Lawyer Generation
                    </p>
                </motion.div>
            )}

            <div className="portal-card max-w-md mx-auto p-6 text-left shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-[color:var(--portal-border)]">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[color:var(--portal-muted)]">Document Trace ID</span>
                    <span className="font-bold text-[color:var(--portal-text)] text-sm">DOC-{documentRequest.id}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[color:var(--portal-muted)]">Execution Status</span>
                    <span className="font-bold text-[color:var(--portal-gold)] text-sm uppercase">{documentRequest.status}</span>
                </div>
            </div>
        </motion.div>
    )
}
