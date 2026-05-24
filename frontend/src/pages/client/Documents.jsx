import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  X,
  Send,
  CreditCard,
  Eye
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import { formatDate, formatPrice } from '../../utils/formatDate'
import Loader from '../../components/Loader'
import toast from 'react-hot-toast'

const ClientDocuments = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [downloading, setDownloading] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [submissionValues, setSubmissionValues] = useState({})
  const [showPaymentPanel, setShowPaymentPanel] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [paymentAmount, setPaymentAmount] = useState('')
  const itemsPerPage = 7

  // Fetch document requests
  const { data: documentsResponse, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await api.get('/documents')
      return response.data.documents
    },
  })

  const documents = Array.isArray(documentsResponse)
    ? documentsResponse
    : documentsResponse?.data || []

  const totalDocuments = documentsResponse?.total ?? documents.length
  const totalPages = Math.max(1, Math.ceil(documents.length / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDocuments = documents.slice(startIndex, startIndex + itemsPerPage)

  const handleDownload = async (docId, docType) => {
    setDownloading(docId)
    try {
      // Use the API download endpoint which streams the actual PDF
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob'
      })

      // Create blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${docType}-${docId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading document:', err)
      alert('Failed to download document: ' + (err.response?.data?.message || err.message))
    } finally {
      setDownloading(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <span className="bg-green-100 text-green-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Completed</span>
      case 'review':
        return <span className="bg-[#fef3c7] text-[#92400e] px-3 py-1 text-xs font-bold uppercase tracking-wider">Reviewing</span>
      case 'draft':
        return <span className="bg-[#0f172a] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">Draft</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">{status}</span>
    }
  }

  const handleGenerateDocument = () => {
    navigate('/documents/browse')
  }

  const handleCustomRequest = () => {
    navigate('/documents/custom-request')
  }

  const submitClientResponse = useMutation({
    mutationFn: async ({ id, custom_fields }) => {
      const response = await api.put(`/documents/${id}/client-response`, { custom_fields })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['lawyer-documents'] })
      setSubmissionValues({})
      setSelectedDocument(null)
      toast.success('Information sent to your lawyer')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit information')
    },
  })

  const payForDocument = useMutation({
    mutationFn: async (documentRequestId) => {
      const response = await api.post('/payments/document', {
        document_request_id: documentRequestId,
        payment_method: 'card',
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['lawyer-documents'] })
      setSubmissionValues({})
      setSelectedDocument(null)
      toast.success('Payment processed successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Payment failed')
    },
  })

  const handleOpenPayment = () => {
    setPaymentAmount(String(selectedDocument?.price || '0'))
    setPaymentMethod('card')
    setShowPaymentPanel(true)
  }

  const handleConfirmPayment = () => {
    // Validate amount matches lawyer quoted price
    const quoted = Number(selectedDocument?.price || 0)
    const entered = Number(paymentAmount || 0)
    if (isNaN(entered) || entered <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    if (entered !== quoted) {
      toast.error('Entered amount must match the lawyer quoted fee')
      return
    }

    payForDocument.mutate(selectedDocument.id)
  }

  const getAdvocateName = (doc) => {
    return (
      doc.advocate_name ||
      doc.lawyer_name ||
      doc.lawyerProfile?.user?.name ||
      doc.lawyer_profile?.user?.name ||
      doc.lawyer?.name ||
      'Unassigned advocate'
    )
  }

  const getDocumentTypeLabel = (doc) => {
    return doc.document_type_name || doc.documentType?.name || 'Document'
  }

  const getDisplayName = (doc) => {
    return doc.document_display_name || doc.document_name || getDocumentTypeLabel(doc)
  }

  const getWorkflowBadge = (status) => {
    switch (status) {
      case 'requested':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Requested</span>
      case 'accepted':
      case 'awaiting_client_info':
        return <span className="bg-sky-100 text-sky-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Need Your Info</span>
      case 'client_info_submitted':
      case 'awaiting_payment':
        return <span className="bg-violet-100 text-violet-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Payment Due</span>
      case 'paid':
        return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Paid</span>
      case 'completed':
      case 'delivered':
        return <span className="bg-green-100 text-green-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Completed</span>
      case 'rejected':
        return <span className="bg-red-100 text-red-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Rejected</span>
      default:
        return getStatusBadge(status)
    }
  }

  const requestedFields = useMemo(() => selectedDocument?.requested_fields || [], [selectedDocument])

  const missingRequired = useMemo(() => {
    if (!requestedFields || requestedFields.length === 0) return false
    return requestedFields.some((field, index) => {
      const key = field.key || field.name || field.label || `field_${index}`
      const val = submissionValues[key]
      return field.required && (!val || String(val).trim() === '')
    })
  }, [requestedFields, submissionValues])

  const handleOpenDetails = (doc) => {
    setSelectedDocument(doc)

    const initialValues = {}
    const sourceFields = doc.requested_fields || []
    sourceFields.forEach((field) => {
      const key = field.key || field.name || field.label
      if (key) {
        initialValues[key] = doc.custom_fields?.[key] ?? ''
      }
    })

    setSubmissionValues(initialValues)
  }

  const handleFieldChange = (key, value) => {
    setSubmissionValues((current) => ({ ...current, [key]: value }))
  }

  const canSubmitInfo = selectedDocument && ['requested', 'accepted', 'awaiting_client_info', 'pending'].includes(selectedDocument.status)
  const canPay = selectedDocument && ['awaiting_payment', 'client_info_submitted'].includes(selectedDocument.status) && Number(selectedDocument.price) > 0
  const canDownload = selectedDocument && selectedDocument.generated_file_path && ['completed', 'delivered'].includes(selectedDocument.status)

  return (
    <div className="portal-page portal-appear space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="portal-page-kicker mb-2">Legal Vault</h2>
          <h1 className="portal-page-title">My Documents</h1>
          <p className="text-sm text-[color:var(--portal-muted)] mt-2 font-medium">
            {totalDocuments} document{totalDocuments === 1 ? '' : 's'} managed in your secure vault
          </p>
        </div>
        <button
          onClick={handleGenerateDocument}
          className="portal-btn-primary py-3 px-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-semibold">Generate Document</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCustomRequest}
          className="portal-btn-ghost border-[color:var(--portal-border-strong)] py-3 px-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-semibold">Custom Request</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="portal-card overflow-hidden">
        {isLoading ? (
          <div className="py-20"><Loader /></div>
        ) : documents.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[color:var(--portal-border)] bg-white/30 dark:bg-black/15">
                    <th className="py-5 px-8 text-xs font-bold text-[color:var(--portal-text)] uppercase tracking-wider w-4/12">Document Details</th>
                    <th className="py-5 px-8 text-xs font-bold text-[color:var(--portal-text)] uppercase tracking-wider w-3/12">Advocate</th>
                    <th className="py-5 px-8 text-xs font-bold text-[color:var(--portal-text)] uppercase tracking-wider w-2/12">Status</th>
                    <th className="py-5 px-8 text-xs font-bold text-[color:var(--portal-text)] uppercase tracking-wider text-right w-3/12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--portal-border)]">
                  {paginatedDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/45 dark:hover:bg-white/[0.03] transition-colors group">
                      <td className="py-6 px-8">
                        <div className="flex items-start gap-4">
                          <FileText className="w-5 h-5 text-[color:var(--portal-muted)] mt-0.5" />
                          <div>
                            <p className="font-bold text-[color:var(--portal-text)] text-sm mb-1">{getDisplayName(doc)}</p>
                            <p className="text-xs text-[color:var(--portal-muted)] font-medium">Req: {formatDate(doc.created_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-sm text-[color:var(--portal-muted)] font-medium">
                        {getAdvocateName(doc)}
                      </td>
                      <td className="py-6 px-8">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenDetails(doc)}
                            className="text-[color:var(--portal-text)] p-2 hover:bg-white/60 dark:hover:bg-white/[0.08] rounded-full transition-colors flex items-center justify-center"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {doc.generated_file_path && (doc.status === 'completed' || doc.status === 'delivered') ? (
                            <button
                              onClick={() => handleDownload(doc.id, doc.documentType?.slug || 'document')}
                              disabled={downloading === doc.id}
                              className="text-[color:var(--portal-gold)] hover:text-[#b45309] p-2 hover:bg-orange-50 dark:hover:bg-white/[0.06] rounded-full transition-colors flex items-center justify-center disabled:opacity-50"
                              title="Download PDF"
                            >
                              {downloading === doc.id ? (
                                <div className="w-4 h-4 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          )}
                          <span className="text-sm font-semibold text-[color:var(--portal-text)] ml-2">{formatPrice(doc.price)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-4 px-8 py-5 border-t border-[color:var(--portal-border)] bg-white/35 dark:bg-black/15 flex-wrap">
              <p className="text-sm text-[color:var(--portal-muted)] font-medium">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, documents.length)} of {documents.length} documents
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="portal-btn-ghost px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-[color:var(--portal-text)]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="portal-btn-ghost px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 px-6">
            <FileText className="w-12 h-12 text-[color:var(--portal-muted)]/60 mx-auto mb-6" />
            <h3 className="font-serif text-xl font-bold text-[color:var(--portal-text)] mb-2">Vault Empty</h3>
            <p className="text-[color:var(--portal-muted)] mb-8 max-w-md mx-auto text-sm font-medium">
              Access premium templates for contracts, NDAs, and international legal frameworks to populate your secure vault.
            </p>
            <button
              onClick={handleGenerateDocument}
              className="portal-btn-primary py-3 px-8 mx-auto flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate First Document
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="portal-card-elevated w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-[color:var(--portal-border)] flex items-start justify-between gap-4 sticky top-0 bg-[color:var(--portal-surface-elevated)] z-10">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[color:var(--portal-muted)] mb-2">Request Details</p>
                  <h3 className="font-serif text-2xl font-bold text-[color:var(--portal-text)]">{getDisplayName(selectedDocument)}</h3>
                  <p className="text-sm text-[color:var(--portal-muted)] mt-2">Lawyer: {getAdvocateName(selectedDocument)}</p>
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-[color:var(--portal-muted)] hover:text-[color:var(--portal-text)] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <div className="flex flex-wrap items-center gap-3">
                  {getWorkflowBadge(selectedDocument.status)}
                  <span className="text-sm font-semibold text-[#0f172a] dark:text-white">{formatPrice(selectedDocument.price)}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-sm border border-gray-200 dark:border-dark-600">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Client Notes</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedDocument.request_notes || 'No notes provided'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-sm border border-gray-200 dark:border-dark-600">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Progress</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedDocument.status === 'requested' && 'Waiting for the lawyer to accept your request.'}
                      {selectedDocument.status === 'accepted' && 'The lawyer accepted your request and is preparing the required fields.'}
                      {selectedDocument.status === 'awaiting_client_info' && 'The lawyer has shared the required fields for you to fill.'}
                      {selectedDocument.status === 'client_info_submitted' && 'Your information has been sent. Payment is next.'}
                      {selectedDocument.status === 'awaiting_payment' && 'Payment is due before the lawyer can complete the document.'}
                      {selectedDocument.status === 'paid' && 'Payment received. The lawyer can now finalize the file.'}
                      {selectedDocument.status === 'completed' && 'The final PDF is ready to download.'}
                      {selectedDocument.status === 'rejected' && 'This request was rejected by the lawyer.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Requested Fields</h4>
                  {requestedFields.length > 0 ? (
                    <div className="grid gap-4">
                      {requestedFields.map((field, index) => {
                        const fieldKey = field.key || field.name || `field_${index}`
                        const label = field.label || fieldKey
                        const type = field.type || 'text'
                        return (
                          <div key={fieldKey} className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                              {label}
                              {field.required ? <span className="ml-1 text-[#d97706]">*</span> : null}
                            </label>
                            {type === 'textarea' ? (
                              <textarea
                                value={submissionValues[fieldKey] || ''}
                                onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                                rows="4"
                                className="w-full bg-slate-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 text-[#0f172a] dark:text-white px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0f172a] dark:focus:ring-[#D4AF37] text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            ) : (
                              <input
                                type={type === 'date' ? 'date' : type === 'number' ? 'number' : type === 'email' ? 'email' : 'text'}
                                value={submissionValues[fieldKey] || ''}
                                onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                                className="w-full bg-slate-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 text-[#0f172a] dark:text-white px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0f172a] dark:focus:ring-[#D4AF37] text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 dark:bg-dark-700 p-4 rounded-sm border border-dashed border-gray-300 dark:border-dark-600">
                      The lawyer has not yet defined the required fields.
                    </div>
                  )}
                </div>

                {selectedDocument.custom_fields && Object.keys(selectedDocument.custom_fields).length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Your Submitted Data</h4>
                    <div className="grid gap-3">
                      {Object.entries(selectedDocument.custom_fields).map(([key, value]) => (
                        <div key={key} className="flex items-start justify-between gap-4 bg-gray-50 dark:bg-dark-700 p-4 rounded-sm border border-gray-200 dark:border-dark-600">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{key.replace(/_/g, ' ')}</span>
                          <span className="text-sm text-gray-800 dark:text-gray-200 text-right break-words max-w-[60%]">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  {canSubmitInfo && (
                    <div className="flex-1">
                      <button
                        onClick={() => {
                          if (missingRequired) {
                            toast.error('Please fill all required fields before submitting')
                            return
                          }
                          submitClientResponse.mutate({ id: selectedDocument.id, custom_fields: submissionValues })
                        }}
                        disabled={submitClientResponse.isPending}
                        className="w-full bg-[#0f172a] text-white hover:bg-black py-3 px-4 rounded-sm transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        {submitClientResponse.isPending ? 'Sending...' : 'Submit Information'}
                      </button>
                      {missingRequired && (
                        <p className="text-xs text-red-600 mt-2">Please complete all required fields (*) before submitting.</p>
                      )}
                    </div>
                  )}
                  {canPay && !showPaymentPanel && (
                    <button
                      onClick={handleOpenPayment}
                      className="flex-1 bg-[#D4AF37] text-[#0f172a] hover:bg-[#b8941d] py-3 px-4 rounded-sm transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Lawyer Fee
                    </button>
                  )}

                  {showPaymentPanel && (
                    <div className="w-full p-5 bg-[color:var(--portal-surface-elevated)] border border-[color:var(--portal-border)] rounded-2xl shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-[color:var(--portal-muted)]">Service</p>
                          <p className="font-bold text-lg text-[color:var(--portal-text)]">Document Preparation Fee</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[color:var(--portal-muted)]">Amount</p>
                          <p className="text-2xl font-serif font-bold text-[color:var(--portal-text)]">₹{Number(paymentAmount || 0).toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs font-bold text-[color:var(--portal-muted)] uppercase tracking-widest mb-2">Enter Amount (must match quoted fee)</label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full p-3 rounded-xl border border-[color:var(--portal-border)] bg-white/85 dark:bg-dark-900 text-[color:var(--portal-text)] dark:text-white focus:outline-none focus:ring-2 focus:ring-[color:var(--portal-gold)]"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs font-bold text-[color:var(--portal-muted)] uppercase tracking-widest mb-2">Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'card', label: 'Card' },
                            { id: 'upi', label: 'UPI' },
                            { id: 'netbanking', label: 'Netbanking' },
                          ].map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setPaymentMethod(m.id)}
                              className={`py-2.5 rounded-xl border transition-colors ${paymentMethod === m.id
                                ? 'bg-[color:var(--portal-gold)]/25 text-[color:var(--portal-text)] dark:text-white border-[color:var(--portal-border-strong)] font-bold'
                                : 'bg-white/80 dark:bg-dark-900 text-[color:var(--portal-text)] dark:text-white border-[color:var(--portal-border)] hover:border-[color:var(--portal-border-strong)]'
                                }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowPaymentPanel(false)}
                          className="flex-1 py-3 bg-white/85 dark:bg-dark-900 text-[color:var(--portal-text)] dark:text-white border border-[color:var(--portal-border)] font-semibold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmPayment}
                          disabled={payForDocument.isPending}
                          className="flex-1 py-3 bg-[color:var(--portal-gold)] text-[#1a2237] font-semibold rounded-xl disabled:opacity-60"
                        >
                          {payForDocument.isPending ? 'Processing...' : `Pay ₹${Number(paymentAmount || 0).toLocaleString('en-IN')}`}
                        </button>
                      </div>
                    </div>
                  )}
                  {canDownload && (
                    <button
                      onClick={() => handleDownload(selectedDocument.id, selectedDocument.documentType?.slug || 'document')}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700 py-3 px-4 rounded-sm transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Final PDF
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ClientDocuments

