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
    <div className="admin-page space-y-8">
      <div className="admin-page-header">
        <p className="admin-page-kicker">Identity Governance</p>
        <h1 className="admin-page-title mb-3">User Management</h1>
        <p className="admin-page-subtitle">
          Administrative control center for all platform identities. Modify access levels, review status, and maintain the integrity of the user base.
        </p>
      </div>

      {/* Table Section */}
      <div className="admin-panel">
        <div className="admin-panel-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="admin-panel-title">Active Users Directory</h2>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--admin-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search database..."
                className="admin-input !pl-11"
              />
            </div>
            <div className="relative min-w-[150px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--admin-muted)]" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="admin-select !pl-11 pr-8 appearance-none"
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
          <div className="overflow-x-auto admin-panel-body pt-0 px-0 pb-0">
            <table className="admin-data-table text-left">
              <thead>
                <tr>
                  <th className="w-[30%]">Identity</th>
                  <th className="w-[25%]">Authorization</th>
                  <th className="w-[20%]">Compliance</th>
                  <th className="w-[15%]">Inducted</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
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
                      className="transition-colors"
                    >
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl bg-[linear-gradient(145deg,var(--admin-accent),var(--admin-accent-soft))] text-white flex items-center justify-center flex-shrink-0 shadow-inner">
                            <span className="font-bold text-sm">
                              {user.name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-[color:var(--admin-text)] text-sm">{user.name}</p>
                            <p className="text-xs text-[color:var(--admin-muted)]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-[color:var(--admin-text)]">
                          {getRoleIcon(user.role)}
                          <span className="text-[11px] font-bold uppercase tracking-wider">{getRoleLabel(user.role)}</span>
                        </div>
                      </td>
                      <td>
                        {user.role === 'lawyer' ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.is_verified_by_admin
                            ? 'text-emerald-600 border-emerald-300 bg-emerald-100/60 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                            : 'text-amber-700 border-amber-300 bg-amber-100/70 dark:bg-amber-500/15 dark:border-amber-400/30 dark:text-amber-300'
                            }`}>
                            {user.is_verified_by_admin ? <CheckCircle2 className="w-3 h-3" /> : null}
                            {user.is_verified_by_admin ? 'Verified' : 'Pending Audit'}
                          </span>
                        ) : (
                          <span className="text-xs text-[color:var(--admin-muted)] font-medium">N/A</span>
                        )}
                      </td>
                      <td className="text-xs text-[color:var(--admin-muted)] font-medium">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowEditModal(true)
                            }}
                            className="text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] transition-colors p-1"
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
                            className="text-[color:var(--admin-muted)] hover:text-red-500 transition-colors p-1"
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
            <div className="p-6 border-t border-[color:var(--admin-border)] flex items-center justify-between" style={{ background: 'var(--admin-surface)' }}>
              <p className="text-[11px] text-[color:var(--admin-muted)] font-medium">
                Showing {Math.min((usersPage - 1) * RECORDS_PER_PAGE + 1, users.data.length)} - {Math.min(usersPage * RECORDS_PER_PAGE, users.data.length)} of {users.data.length} records
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                  disabled={usersPage === 1}
                  className="admin-btn-ghost p-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-[color:var(--admin-text)]">
                  {usersPage} / {Math.ceil(users.data.length / RECORDS_PER_PAGE)}
                </span>
                <button
                  onClick={() => setUsersPage(Math.min(Math.ceil(users.data.length / RECORDS_PER_PAGE), usersPage + 1))}
                  disabled={usersPage === Math.ceil(users.data.length / RECORDS_PER_PAGE)}
                  className="admin-btn-ghost p-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-empty-state">
            <User className="w-12 h-12 text-[color:var(--admin-muted)] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[color:var(--admin-text)] mb-2">No Records Found</h3>
            <p className="text-[color:var(--admin-muted)] font-medium text-sm">No users match your current filter parameters.</p>
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
            className="fixed inset-0 admin-modal-backdrop z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="admin-modal-panel max-w-md w-full p-8"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[color:var(--admin-text)]">Modify Identity</h2>
                  <p className="text-sm text-[color:var(--admin-muted)] uppercase tracking-widest mt-1 font-bold">Admin Override</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-[color:var(--admin-muted)] hover:text-[color:var(--admin-text)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-[10px] font-bold text-[color:var(--admin-muted)] uppercase tracking-widest mb-1.5">Full Legal Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    id="edit-name"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[color:var(--admin-muted)] uppercase tracking-widest mb-1.5">System Email (Immutable)</label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    disabled
                    className="admin-input opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[color:var(--admin-muted)] uppercase tracking-widest mb-1.5">Authorization Role</label>
                  <select
                    defaultValue={selectedUser.role}
                    id="edit-role"
                    className="admin-select"
                  >
                    <option value="client">Client</option>
                    <option value="lawyer">Lawyer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {selectedUser.role === 'lawyer' && (
                  <div className="p-4 border border-[color:var(--admin-border)] rounded-xl mt-2" style={{ background: 'var(--admin-surface)' }}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={selectedUser.is_verified_by_admin}
                        id="edit-verified"
                        className="w-4 h-4 rounded-sm border-gray-300 text-[#0f172a] focus:ring-[#0f172a]"
                      />
                      <div>
                        <span className="block text-sm font-bold text-[color:var(--admin-text)]">Admin Verified Status</span>
                        <span className="block text-[10px] text-[color:var(--admin-muted)] uppercase tracking-widest mt-0.5">Grants full platform access</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-[color:var(--admin-border)]">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 admin-btn-ghost"
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
                  className="flex-1 admin-btn-primary text-sm py-3 disabled:opacity-50"
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
