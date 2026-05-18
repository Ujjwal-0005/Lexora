import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, User, Trash2, Edit2, Shield, Scale, X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import Loader from '../../components/Loader'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [usersPage, setUsersPage] = useState(1)
  const RECORDS_PER_PAGE = 10
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (roleFilter) params.append('role', roleFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await api.get(`/admin/users?${params.toString()}`)
      return response.data.users
    },
  })

  const deleteUser = useMutation({
    mutationFn: async (userId) => {
      const response = await api.delete(`/admin/users/${userId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
      toast.success('User deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete user')
    },
  })

  const updateUser = useMutation({
    mutationFn: async ({ userId, data }) => {
      const response = await api.put(`/admin/users/${userId}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
      toast.success('User updated successfully')
      setShowEditModal(false)
      setSelectedUser(null)
    },
  })

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'lawyer':
        return <Scale className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'System Administrator'
      case 'lawyer':
        return 'Legal Professional'
      default:
        return 'Registered Client'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-dark-600 pb-8">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl font-bold text-[#0f172a] dark:text-white mb-3">User Management</h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            Administrative control center for all platform identities. Modify access levels, review status, and maintain the integrity of the user base.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-dark-800 shadow-sm border border-gray-200 dark:border-dark-600">
        <div className="p-8 border-b border-gray-200 dark:border-dark-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white">Active Users Directory</h2>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search database..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-transparent focus:border-gray-300 dark:focus:border-dark-500 rounded-sm text-sm focus:outline-none transition-colors"
              />
            </div>
            <div className="relative min-w-[150px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-gray-50 dark:bg-dark-700 border border-transparent focus:border-gray-300 dark:focus:border-dark-500 rounded-sm text-sm focus:outline-none transition-colors appearance-none"
              >
                <option value="">All Roles</option>
                <option value="client">Clients</option>
                <option value="lawyer">Lawyers</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20"><Loader /></div>
        ) : users?.data?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-600">
                  <th className="py-4 px-8 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-[30%]">IDENTITY</th>
                  <th className="py-4 px-8 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-[25%]">AUTHORIZATION</th>
                  <th className="py-4 px-8 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-[20%]">COMPLIANCE</th>
                  <th className="py-4 px-8 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-[15%]">INDUCTED</th>
                  <th className="py-4 px-8 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                {(() => {
                  const startIdx = (usersPage - 1) * RECORDS_PER_PAGE
                  const endIdx = startIdx + RECORDS_PER_PAGE
                  const paginatedUsers = users.data.slice(startIdx, endIdx)

                  return paginatedUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
                    >
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-sm bg-[#0f172a] text-white flex items-center justify-center flex-shrink-0 shadow-inner">
                            <span className="font-serif font-bold text-sm">
                              {user.name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-[#0f172a] dark:text-white text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          {getRoleIcon(user.role)}
                          <span className="text-[11px] font-bold uppercase tracking-wider">{getRoleLabel(user.role)}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        {user.role === 'lawyer' ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${user.is_verified_by_admin
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-[#fef3c7] text-[#92400e] dark:bg-yellow-900/30 dark:text-yellow-500'
                            }`}>
                            {user.is_verified_by_admin ? <CheckCircle2 className="w-3 h-3" /> : null}
                            {user.is_verified_by_admin ? 'Verified' : 'Pending Audit'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">N/A</span>
                        )}
                      </td>
                      <td className="py-5 px-8 text-xs text-gray-500 font-medium">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowEditModal(true)
                            }}
                            className="text-gray-400 hover:text-[#0f172a] transition-colors p-1"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('AUTHORIZATION REQUIRED: Are you sure you want to permanently delete this user from the system?')) {
                                deleteUser.mutate(user.id)
                              }
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                })()}
              </tbody>
            </table>

            {/* Footer with Pagination */}
            <div className="p-6 bg-gray-50 dark:bg-dark-800 border-t border-gray-200 dark:border-dark-600 flex items-center justify-between">
              <p className="text-[11px] text-gray-500 font-medium">
                Showing {Math.min((usersPage - 1) * RECORDS_PER_PAGE + 1, users.data.length)} - {Math.min(usersPage * RECORDS_PER_PAGE, users.data.length)} of {users.data.length} records
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                  disabled={usersPage === 1}
                  className="p-1.5 bg-white border border-gray-300 dark:border-dark-600 rounded-sm hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                  {usersPage} / {Math.ceil(users.data.length / RECORDS_PER_PAGE)}
                </span>
                <button
                  onClick={() => setUsersPage(Math.min(Math.ceil(users.data.length / RECORDS_PER_PAGE), usersPage + 1))}
                  disabled={usersPage === Math.ceil(users.data.length / RECORDS_PER_PAGE)}
                  className="p-1.5 bg-white border border-gray-300 dark:border-dark-600 rounded-sm hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 px-6">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-[#0f172a] dark:text-white mb-2">No Records Found</h3>
            <p className="text-gray-500 font-medium text-sm">No users match your current filter parameters.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
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
              className="bg-white dark:bg-dark-800 rounded-sm max-w-md w-full p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white">Modify Identity</h2>
                  <p className="text-sm text-gray-500 uppercase tracking-widest mt-1 font-bold">Admin Override</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Legal Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    id="edit-name"
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">System Email (Immutable)</label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    disabled
                    className="w-full p-3 border border-gray-200 dark:border-dark-600 rounded-sm bg-gray-50 dark:bg-dark-700 text-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Authorization Role</label>
                  <select
                    defaultValue={selectedUser.role}
                    id="edit-role"
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-sm bg-white dark:bg-dark-700 focus:outline-none focus:border-[#0f172a] transition-colors"
                  >
                    <option value="client">Client</option>
                    <option value="lawyer">Lawyer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {selectedUser.role === 'lawyer' && (
                  <div className="p-4 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-sm mt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={selectedUser.is_verified_by_admin}
                        id="edit-verified"
                        className="w-4 h-4 rounded-sm border-gray-300 text-[#0f172a] focus:ring-[#0f172a]"
                      />
                      <div>
                        <span className="block text-sm font-bold text-[#0f172a] dark:text-white">Admin Verified Status</span>
                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Grants full platform access</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-dark-600">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateUser.mutate({
                      userId: selectedUser.id,
                      data: {
                        name: document.getElementById('edit-name').value,
                        role: document.getElementById('edit-role').value,
                        is_verified_by_admin: document.getElementById('edit-verified')?.checked,
                      },
                    })
                  }}
                  disabled={updateUser.isPending}
                  className="flex-1 bg-[#0f172a] hover:bg-black text-white font-bold text-sm py-3 rounded-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {updateUser.isPending ? 'Committing...' : 'Commit Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminUsers
