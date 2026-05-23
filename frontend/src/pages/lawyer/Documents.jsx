import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Send,
  X,
  Activity,
  Plus,
  Trash2,
  CircleDollarSign,
  Mail
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import { formatDate, formatPrice } from '../../utils/formatDate'
import Loader from '../../components/Loader'
import toast from 'react-hot-toast'

const LawyerDocuments = () => {
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [downloading, setDownloading] = useState(null)
  const [quotePrice, setQuotePrice] = useState('')
  const [requestedFields, setRequestedFields] = useState([
    { id: 'field-full-name', key: 'full_name', label: 'Full Name', type: 'text', required: true },
  ])
  const queryClient = useQueryClient()

  const createRequestedField = (field = {}) => ({
    id: field.id || (window.crypto?.randomUUID ? window.crypto.randomUUID() : `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    key: field.key || field.name || '',
    label: field.label || field.key || '',
    type: field.type || 'text',
    required: Boolean(field.required),
  })

  // Fetch document requests assigned to this lawyer
  const { data: documentsResponse, isLoading } = useQuery({
    queryKey: ['lawyer-documents'],
    queryFn: async () => {
      const response = await api.get('/lawyer/documents')
      return response.data.documents
    },
  })

  const documents = Array.isArray(documentsResponse)
    ? documentsResponse
    : documentsResponse?.data || []

  const totalDocuments = documentsResponse?.total ?? documents.length

  const generateDocument = useMutation({
    mutationFn: async (documentId) => {
      const response = await api.post(`/documents/${documentId}/generate`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lawyer-documents'])
      queryClient.invalidateQueries(['documents'])
      toast.success('Document generated successfully!')
      setShowReviewModal(false)
    },
    onError: (error) => {
      console.error('Generate error:', error)
      toast.error(error.response?.data?.message || 'Failed to generate document')
    },
  })

  const updateRequest = useMutation({
    mutationFn: async ({ id, status, price, requested_fields }) => {
      const response = await api.put(`/lawyer/documents/${id}/status`, {
        status,
        price,
        requested_fields,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lawyer-documents'])
      queryClient.invalidateQueries(['documents'])
      toast.success('Request updated successfully')
      setShowReviewModal(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update request')
    },
  })

  const uploadFile = useMutation({
    mutationFn: async ({ id, file }) => {
      const form = new FormData()
      form.append('_method', 'PUT')
      form.append('status', 'completed')
      form.append('file', file)
      const response = await api.post(`/lawyer/documents/${id}/status`, form, {
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lawyer-documents'])
      queryClient.invalidateQueries(['documents'])
      toast.success('File uploaded and request completed')
      setShowReviewModal(false)
    },
    onError: (err) => {
      const validationErrors = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : null
      toast.error(validationErrors || err.response?.data?.message || 'Upload failed')
    },
  })

  const handleDownload = async (docId, docSlug) => {
    setDownloading(docId)
    try {
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${docSlug}-${docId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading document:', err)
      toast.error('Failed to download document')
    } finally {
      setDownloading(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'requested':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Requested</span>
      case 'completed':
      case 'delivered':
        return <span className="bg-green-100 text-green-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Completed</span>
      case 'in_progress':
        return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">In Progress</span>
      case 'awaiting_client_info':
        return <span className="bg-sky-100 text-sky-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Waiting Info</span>
      case 'client_info_submitted':
        return <span className="bg-violet-100 text-violet-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Info Submitted</span>
      case 'awaiting_payment':
        return <span className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Awaiting Payment</span>
      case 'paid':
        return <span className="bg-cyan-100 text-cyan-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Paid</span>
      case 'review':
        return <span className="bg-[#fef3c7] text-[#92400e] px-3 py-1 text-xs font-bold uppercase tracking-wider">Reviewing</span>
      case 'pending':
        return <span className="bg-orange-100 text-orange-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Pending</span>
      case 'accepted':
        return <span className="bg-cyan-100 text-cyan-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">Accepted</span>
      case 'draft':
        return <span className="bg-[#0f172a] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">Draft</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">{status}</span>
    }
  }

  useEffect(() => {
    if (!selectedDocument) {
      return
    }

    setQuotePrice(selectedDocument.price ? String(selectedDocument.price) : '')

    const nextFields = selectedDocument.requested_fields?.length
      ? selectedDocument.requested_fields.map((field, index) => createRequestedField({
        ...field,
        id: field.id || `field-${selectedDocument.id}-${index}`,
        key: field.key || field.name || `field_${index}`,
        label: field.label || field.key || `Field ${index + 1}`,
      }))
      : [createRequestedField({ id: 'field-full-name', key: 'full_name', label: 'Full Name', type: 'text', required: true })]

    setRequestedFields(nextFields)
  }, [selectedDocument])

  const actionableStatuses = ['requested', 'pending', 'review', 'accepted', 'awaiting_client_info', 'client_info_submitted', 'awaiting_payment', 'paid', 'in_progress']
  const pendingDocuments = documents?.filter(d => actionableStatuses.includes(d.status)) || []
  const completedDocuments = documents?.filter(d => ['completed', 'delivered'].includes(d.status)) || []
  const totalDocumentEarnings = completedDocuments.reduce((sum, doc) => {
    const price = Number(doc.price)
    return sum + (Number.isFinite(price) ? price : 0)
  }, 0)

  const isLibraryDocument = Boolean(selectedDocument?.document_type_id || selectedDocument?.documentType)
  const isCustomDocument = selectedDocument && !isLibraryDocument

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 font-sans">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-2">Legal Vault</h2>
          <h1 className="text-3xl font-serif font-bold text-[#0f172a] dark:text-white">Document Requests</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {totalDocuments} document{totalDocuments === 1 ? '' : 's'} assigned to your oversight
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-sm p-6 rounded-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Pending Requests</p>
          <h3 className="font-serif text-4xl font-bold text-[#0f172a] dark:text-white">{pendingDocuments.length}</h3>
        </div>
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-sm p-6 rounded-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Ready to Finalize</p>
          <h3 className="font-serif text-4xl font-bold text-[#0f172a] dark:text-white">{documents.filter((doc) => doc.status === 'paid').length}</h3>
        </div>
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-sm p-6 rounded-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Completed Files</p>
          <h3 className="font-serif text-4xl font-bold text-[#0f172a] dark:text-white">{completedDocuments.length}</h3>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-800 border-t-4 border-[#0f172a] shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase w-2/3 leading-tight">PENDING REVIEW</p>
            <div className="p-2 bg-gray-50 dark:bg-dark-700 rounded-sm">
              <AlertCircle className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-4xl font-bold text-[#0f172a] dark:text-white mb-3">
              {pendingDocuments.length}
            </h3>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-orange-600" />
              Awaiting your action
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 border-t-4 border-[#0f172a] shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase w-2/3 leading-tight">COMPLETED</p>
            <div className="p-2 bg-gray-50 dark:bg-dark-700 rounded-sm">
              <CheckCircle2 className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-4xl font-bold text-[#0f172a] dark:text-white mb-3">
              {completedDocuments.length}
            </h3>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-green-600" />
              Successfully delivered
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 border-t-4 border-[#0f172a] shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase w-2/3 leading-tight">TOTAL EARNINGS</p>
            <div className="p-2 bg-gray-50 dark:bg-dark-700 rounded-sm">
              <FileText className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-4xl font-bold text-[#0f172a] dark:text-white mb-3">
              {formatPrice(totalDocumentEarnings)}
            </h3>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#0f172a]" />
              From documents
            </p>
          </div>
        </div>
      </div>

      {/* Pending Documents */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-sm p-8">
        <h2 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white mb-8">Documents Awaiting Action</h2>

        {isLoading ? (
          <div className="py-10"><Loader /></div>
        ) : pendingDocuments.length > 0 ? (
          <div className="grid gap-6">
            {pendingDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-600 rounded-sm flex flex-col md:flex-row items-start justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#0f172a] dark:text-white mb-1">{doc.document_display_name || doc.documentType?.name || 'Document'}</h3>
                    <p className="text-sm text-gray-500 font-medium mb-2">
                      Requested by {doc.client?.name} • {formatDate(doc.created_at)}
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-bold text-[#0f172a] dark:text-white">₹{(doc.price || 0).toLocaleString('en-IN')}</p>
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDocument(doc)
                    setShowReviewModal(true)
                  }}
                  className="bg-[#0f172a] text-white hover:bg-black transition-colors rounded-sm shadow-md py-2.5 px-6 font-semibold text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <Edit3 className="w-4 h-4" />
                  Review Request
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No documents awaiting action</p>
        )}
      </div>

      {/* All Documents */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-200 dark:border-dark-600">
          <h2 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white">Document History</h2>
        </div>

        {isLoading ? (
          <div className="py-20"><Loader /></div>
        ) : documents?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-800/50">
                  <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider w-5/12">Document Details</th>
                  <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider w-3/12">Status</th>
                  <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-right w-4/12">Price & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                {documents.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors group">
                    <td className="py-6 px-8">
                      <div className="flex items-start gap-4">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-[#0f172a] dark:text-white text-sm mb-1">{doc.document_display_name || doc.documentType?.name || 'Document'}</p>
                          <p className="text-xs text-gray-500 font-medium">Client: {doc.client?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <span className="font-semibold text-sm text-[#0f172a] dark:text-white">₹{(doc.price || 0).toLocaleString('en-IN')}</span>
                        {doc.generated_file_path && (doc.status === 'completed' || doc.status === 'delivered') && (
                          <button
                            onClick={() => handleDownload(doc.id, doc.document_type_slug || doc.documentType?.slug || 'document')}
                            disabled={downloading === doc.id}
                            className="text-[#d97706] hover:text-[#b45309] p-2 hover:bg-orange-50 rounded-full transition-colors flex items-center justify-center disabled:opacity-50"
                            title="Download PDF"
                          >
                            {downloading === doc.id ? (
                              <div className="w-4 h-4 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Download className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 px-6">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-6" />
            <h3 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white mb-2">No Document History</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm font-medium">
              You haven't handled any document requests yet.
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-8 border-b border-gray-200 dark:border-dark-600 flex items-center justify-between sticky top-0 bg-white dark:bg-dark-800 z-10">
                <h2 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white">
                  Review: {selectedDocument.document_display_name || selectedDocument.documentType?.name || 'Document'}
                </h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  disabled={generateDocument.isPending}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Client Info */}
                <div>
                  <h3 className="font-bold text-[#0f172a] dark:text-white uppercase tracking-widest text-xs mb-3">Client Information</h3>
                  <div className="bg-gray-50 dark:bg-dark-700 p-4 border border-gray-200 dark:border-dark-600 rounded-sm">
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedDocument.client?.name}</p>
                    <p className="text-gray-500 text-sm">{selectedDocument.client?.email}</p>
                  </div>
                </div>

                {selectedDocument.status === 'requested' || selectedDocument.status === 'pending' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="w-4 h-4 text-[#0f172a] dark:text-white" />
                      <h3 className="font-bold text-[#0f172a] dark:text-white uppercase tracking-widest text-xs">Accept and Quote</h3>
                    </div>
                    <div className="grid gap-4">
                      <label className="block text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-widest">Quoted Fee</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-gray-50 dark:bg-dark-700 text-sm focus:outline-none"
                      />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-widest">Requested Fields</h4>
                          <button
                            type="button"
                            onClick={() => setRequestedFields((current) => [...current, createRequestedField({ key: '', label: '', type: 'text', required: false })])}
                            className="text-xs font-bold uppercase tracking-widest text-[#0f172a] dark:text-white flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add field
                          </button>
                        </div>

                        <div className="space-y-3">
                          {requestedFields.map((field, index) => (
                            <div key={field.id} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_90px_auto] items-center bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 p-3 rounded-sm">
                              <input
                                value={field.label}
                                onChange={(e) => setRequestedFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: e.target.value } : item))}
                                placeholder="Label"
                                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-800 text-sm"
                              />
                              <input
                                value={field.key}
                                onChange={(e) => setRequestedFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, key: e.target.value } : item))}
                                placeholder="key_name"
                                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-800 text-sm"
                              />
                              <select
                                value={field.type}
                                onChange={(e) => setRequestedFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, type: e.target.value } : item))}
                                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-800 text-sm"
                              >
                                <option value="text">Text</option>
                                <option value="textarea">Textarea</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="email">Email</option>
                              </select>
                              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 justify-center">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => setRequestedFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, required: e.target.checked } : item))}
                                />
                                Required
                              </label>
                              <button
                                type="button"
                                onClick={() => setRequestedFields((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                                className="text-red-500 hover:text-red-700 justify-self-end"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Form Data */}
                <div>
                  <h3 className="font-bold text-[#0f172a] dark:text-white uppercase tracking-widest text-xs mb-3">Form Data Provided</h3>
                  <div className="bg-gray-50 dark:bg-dark-700 p-6 border border-gray-200 dark:border-dark-600 rounded-sm space-y-4 max-h-40 overflow-y-auto">
                    {Object.entries(selectedDocument.custom_fields || {}).map(([key, value]) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 pb-4 border-b border-gray-200 dark:border-dark-600 last:border-0 last:pb-0">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide w-1/3">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-gray-900 dark:text-white sm:w-2/3 break-words">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between p-6 bg-[#fef3c7] border border-[#fde68a] rounded-sm">
                  <span className="font-bold text-[#92400e] tracking-widest uppercase text-xs">Service Fee</span>
                  <span className="text-2xl font-serif font-bold text-[#92400e]">
                    ₹{(selectedDocument.price || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedDocument.custom_fields && Object.keys(selectedDocument.custom_fields).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-[#0f172a] dark:text-white uppercase tracking-widest text-xs mb-3">Client Submitted Information</h3>
                    <div className="bg-gray-50 dark:bg-dark-700 p-6 border border-gray-200 dark:border-dark-600 rounded-sm space-y-4 max-h-48 overflow-y-auto">
                      {Object.entries(selectedDocument.custom_fields || {}).map(([key, value]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 pb-4 border-b border-gray-200 dark:border-dark-600 last:border-0 last:pb-0">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide w-1/3">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium text-gray-900 dark:text-white sm:w-2/3 break-words">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                {selectedDocument.generated_file_path && (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-sm">
                    <p className="text-green-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Document generated and delivered successfully.
                    </p>
                  </div>
                )}

                {!selectedDocument.generated_file_path && selectedDocument.status === 'paid' && isCustomDocument && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-widest">Manual Override: Upload Final PDF</label>
                    <input type="file" accept="application/pdf" id="upload-pdf" className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-gray-50 dark:bg-dark-700 text-sm focus:outline-none" />
                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                      <button
                        onClick={async () => {
                          const input = document.getElementById('upload-pdf')
                          if (!input || !input.files || input.files.length === 0) {
                            toast.error('Please pick a PDF file')
                            return
                          }
                          const file = input.files[0]
                          uploadFile.mutate({ id: selectedDocument.id, file })
                        }}
                        className="flex-1 py-3 px-4 border border-[#0f172a] text-[#0f172a] font-semibold text-sm hover:bg-[#0f172a] hover:text-white transition-colors rounded-sm"
                        disabled={uploadFile.isLoading}
                      >
                        {uploadFile.isLoading ? 'Uploading...' : 'Upload & Mark Complete'}
                      </button>
                    </div>
                  </div>
                )}

                {!selectedDocument.generated_file_path && selectedDocument.status === 'paid' && isLibraryDocument && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-sm border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-widest mb-2">Manual Upload (optional)</label>
                        <input type="file" accept="application/pdf" id="library-upload-pdf" className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-800 text-sm focus:outline-none" />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={async () => {
                            const input = document.getElementById('library-upload-pdf')
                            if (!input || !input.files || input.files.length === 0) {
                              toast.error('Please pick a PDF file')
                              return
                            }
                            const file = input.files[0]
                            uploadFile.mutate({ id: selectedDocument.id, file })
                          }}
                          className="flex-1 py-3 px-4 border border-[#0f172a] text-[#0f172a] font-semibold text-sm hover:bg-[#0f172a] hover:text-white transition-colors rounded-sm"
                          disabled={uploadFile.isPending}
                        >
                          {uploadFile.isPending ? 'Uploading...' : 'Upload Final PDF'}
                        </button>
                        <button
                          onClick={() => generateDocument.mutate(selectedDocument.id)}
                          disabled={generateDocument.isPending}
                          className="flex-1 py-3 px-4 bg-[#0f172a] text-white font-semibold text-sm hover:bg-black transition-colors rounded-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {generateDocument.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Auto-Generate System PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-8 border-t border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-800 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  disabled={generateDocument.isPending}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-white dark:hover:bg-dark-700 transition-colors rounded-sm disabled:opacity-50"
                >
                  Close
                </button>

                {(selectedDocument.status === 'requested' || selectedDocument.status === 'pending') && (
                  <button
                    onClick={() => updateRequest.mutate({
                      id: selectedDocument.id,
                      status: 'rejected',
                    })}
                    disabled={updateRequest.isPending}
                    className="flex-1 py-3 px-4 border border-red-300 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors rounded-sm disabled:opacity-50"
                  >
                    Reject
                  </button>
                )}

                {(selectedDocument.status === 'requested' || selectedDocument.status === 'pending') && (
                  <button
                    onClick={() => {
                      const fieldsToSend = requestedFields.filter((field) => field.label && field.key)
                      if (!fieldsToSend.length) {
                        toast.error('Please add at least one requested field before sending requirements')
                        return
                      }
                      const priceNum = Number(quotePrice)
                      if (isNaN(priceNum) || priceNum < 0) {
                        toast.error('Please enter a valid quoted fee')
                        return
                      }

                      updateRequest.mutate({
                        id: selectedDocument.id,
                        status: 'accepted',
                        price: quotePrice,
                        requested_fields: fieldsToSend,
                      })
                    }}
                    disabled={updateRequest.isPending}
                    className="flex-1 py-3 px-4 bg-[#0f172a] text-white font-semibold text-sm hover:bg-black transition-colors rounded-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Mail className="w-5 h-5" />
                    Accept and Send Requirements
                  </button>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LawyerDocuments
