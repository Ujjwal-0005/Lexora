import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import { formatDate, formatPrice } from '../../utils/formatDate'
import Loader from '../../components/Loader'

const ClientDocuments = () => {
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
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

  const getAdvocateName = (doc) => {
    return doc.advocate_name || doc.lawyerProfile?.user?.name || 'Unassigned advocate'
  }

  const getDocumentTypeLabel = (doc) => {
    return doc.document_type_name || doc.documentType?.name || 'Document'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-2">Legal Vault</h2>
          <h1 className="text-3xl font-serif font-bold text-[#0f172a] dark:text-white">My Documents</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {totalDocuments} document{totalDocuments === 1 ? '' : 's'} managed in your secure vault
          </p>
        </div>
        <button
          onClick={handleGenerateDocument}
          className="bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] hover:bg-black dark:hover:bg-gray-100 py-3 px-6 flex items-center gap-2 transition-colors rounded-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-semibold">Generate Document</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20"><Loader /></div>
        ) : documents.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-800/50">
                    <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider w-4/12">Document Details</th>
                    <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider w-3/12">Advocate</th>
                    <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider w-2/12">Status</th>
                    <th className="py-5 px-8 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-right w-3/12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                  {paginatedDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors group">
                      <td className="py-6 px-8">
                        <div className="flex items-start gap-4">
                          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-bold text-[#0f172a] dark:text-white text-sm mb-1">{getDocumentTypeLabel(doc)}</p>
                            <p className="text-xs text-gray-500 font-medium">Req: {formatDate(doc.created_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {getAdvocateName(doc)}
                      </td>
                      <td className="py-6 px-8">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {doc.generated_file_path && (doc.status === 'completed' || doc.status === 'delivered') ? (
                            <button
                              onClick={() => handleDownload(doc.id, doc.documentType?.slug || 'document')}
                              disabled={downloading === doc.id}
                              className="text-[#d97706] hover:text-[#b45309] p-2 hover:bg-orange-50 rounded-full transition-colors flex items-center justify-center disabled:opacity-50"
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
                          <span className="text-sm font-semibold text-[#0f172a] dark:text-white ml-2">{formatPrice(doc.price)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-4 px-8 py-5 border-t border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-800/50 flex-wrap">
              <p className="text-sm text-gray-500 font-medium">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, documents.length)} of {documents.length} documents
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-sm border border-gray-200 dark:border-dark-600 text-sm font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-[#0f172a] dark:text-white">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-sm border border-gray-200 dark:border-dark-600 text-sm font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 px-6">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-6" />
            <h3 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white mb-2">Vault Empty</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm font-medium">
              Access premium templates for contracts, NDAs, and international legal frameworks to populate your secure vault.
            </p>
            <button
              onClick={handleGenerateDocument}
              className="bg-[#0f172a] hover:bg-black text-white py-3 px-8 transition-colors rounded-sm shadow-md font-semibold text-sm mx-auto flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate First Document
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientDocuments

