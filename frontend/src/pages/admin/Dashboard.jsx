import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Scale,
  FileText,
  DollarSign,
  Star,
  Clock,
  ArrowRight,
  Activity,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import { formatPrice } from '../../utils/formatDate'
import Loader from '../../components/Loader'
import { Link } from 'react-router-dom'


const AdminDashboard = () => {
  const [activityPage, setActivityPage] = useState(1)
  const RECORDS_PER_PAGE = 4

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard')
      return response.data
    },
  })

  const stats = dashboardData?.stats || {}
  const recentActivity = dashboardData?.recent_activity || []

  // Ensure avg rating is numeric before calling toFixed
  const avgRating = (() => {
    const raw = stats.site_average_rating ?? stats.average_rating ?? 0
    const num = Number(raw)
    return Number.isNaN(num) ? '0.0' : num.toFixed(1)
  })()

  const statCards = [
    {
      icon: Users,
      label: 'TOTAL USERS',
      value: stats.total_users || 0,
      subtext: `${stats.total_clients || 0} clients, ${stats.total_lawyers || 0} lawyers`,
      color: 'text-[#0f172a]'
    },
    {
      icon: Scale,
      label: 'CONSULTATIONS',
      value: stats.total_consultations || 0,
      subtext: `${stats.completed_consultations || 0} completed successfully`,
      color: 'text-[#0f172a]'
    },
    {
      icon: FileText,
      label: 'DOCUMENTS',
      value: stats.total_documents || 0,
      subtext: 'System generated documents',
      color: 'text-[#0f172a]'
    },
    {
      icon: Star,
      label: 'AVG RATING',
      value: avgRating,
      subtext: `Based on ${stats.site_ratings_count || stats.total_reviews || 0} ratings`,
      color: 'text-[#0f172a]'
    },
  ]

  const quickActions = [
    {
      title: 'Pending Verifications',
      count: stats.pending_verifications || 0,
      link: '/admin/verifications',
      icon: Clock,
      color: 'text-[#d97706]'
    },
    {
      title: 'User Roster',
      count: stats.total_users || 0,
      link: '/admin/users',
      icon: Users,
      color: 'text-[#0f172a]'
    },
  ]

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header mb-8">
        <p className="admin-page-kicker">Strategic Oversight Layer</p>
        <h1 className="admin-page-title mb-3">
          Enterprise Command Intelligence
        </h1>
        <p className="admin-page-subtitle">
          Institutional health and administrative performance metrics.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="admin-metric-card"
            >
              <div className="flex justify-between items-start mb-5">
                <p className="admin-metric-label w-2/3 leading-tight">{stat.label}</p>
                <div className="p-2.5 rounded-xl border border-[color:var(--admin-border)]" style={{ background: 'var(--admin-surface)' }}>
                  <Icon className="w-4 h-4 text-[color:var(--admin-muted)]" strokeWidth={1.8} />
                </div>
              </div>
              <div>
                <h3 className="admin-metric-value mb-2">
                  {stat.value}
                </h3>
                <p className="admin-metric-subtext flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[color:var(--admin-accent-soft)]" />
                  {stat.subtext}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>



      <div className="grid xl:grid-cols-12 gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-8">
          <div className="admin-panel">
            <div className="admin-panel-header flex items-center justify-between gap-3">
              <h2 className="admin-panel-title">Recent Activity</h2>
              <span className="admin-panel-subtitle">
                System Audit Log
              </span>
            </div>
            <div className="admin-panel-body">

              {isLoading ? (
                <div className="py-10"><Loader /></div>
              ) : recentActivity.length > 0 ? (
                <>
                  <div className="space-y-5 mb-6">
                    {(() => {
                      const startIdx = (activityPage - 1) * RECORDS_PER_PAGE
                      const endIdx = startIdx + RECORDS_PER_PAGE
                      const paginatedActivity = recentActivity.slice(startIdx, endIdx)
                      const totalPages = Math.ceil(recentActivity.length / RECORDS_PER_PAGE)

                      return (
                        <>
                          {paginatedActivity.map((activity, idx) => (
                            <div
                              key={activity.id}
                              className={`rounded-2xl border border-[color:var(--admin-border)] px-4 py-4 flex items-start gap-4 ${idx !== paginatedActivity.length - 1 ? '' : ''}`}
                              style={{ background: 'var(--admin-surface)' }}
                            >
                              <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg"
                                style={{
                                  background: 'linear-gradient(145deg, var(--admin-accent) 0%, var(--admin-accent-soft) 100%)',
                                  boxShadow: '0 10px 26px var(--admin-glow)',
                                }}
                              >
                                <span className="text-white font-semibold text-base">
                                  {activity.admin?.name?.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1.5 gap-2">
                                  <p className="font-semibold text-[color:var(--admin-text)] text-sm">{activity.admin?.name}</p>
                                  <span className="text-[11px] text-[color:var(--admin-muted)] font-medium whitespace-nowrap ml-2">
                                    {new Date(activity.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-[color:var(--admin-muted)] mb-2 leading-relaxed">
                                  Executed <span className="font-semibold text-[color:var(--admin-text)]">{activity.action.replace(/_/g, ' ').toUpperCase()}</span>
                                  {activity.target_user && ` on ${activity.target_user.name}`}
                                </p>
                                {activity.notes && (
                                  <p className="text-xs text-[color:var(--admin-muted)] p-2.5 rounded-xl border border-[color:var(--admin-border)]" style={{ background: 'var(--admin-surface)' }}>
                                    {activity.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </>
                      )
                    })()}
                  </div>

                  {/* Pagination Controls */}
                  {(() => {
                    const totalPages = Math.ceil(recentActivity.length / RECORDS_PER_PAGE)
                    return (
                      <div className="flex items-center justify-between pt-5 border-t border-[color:var(--admin-border)]">
                        <p className="text-xs text-[color:var(--admin-muted)] font-medium">
                          Showing {Math.min((activityPage - 1) * RECORDS_PER_PAGE + 1, recentActivity.length)} - {Math.min(activityPage * RECORDS_PER_PAGE, recentActivity.length)} of {recentActivity.length}
                        </p>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => setActivityPage(Math.max(1, activityPage - 1))}
                            disabled={activityPage === 1}
                            className="admin-btn-ghost px-2.5 py-2 disabled:opacity-45"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1.5 text-xs font-bold text-[color:var(--admin-text)]">
                            {activityPage} / {totalPages}
                          </span>
                          <button
                            onClick={() => setActivityPage(Math.min(totalPages, activityPage + 1))}
                            disabled={activityPage === totalPages}
                            className="admin-btn-ghost px-2.5 py-2 disabled:opacity-45"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                </>
              ) : (
                <div className="admin-empty-state py-10 text-center">
                  <p className="font-medium">No recent activity detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & System Status - Enhanced */}
        <div className="xl:col-span-4 relative overflow-hidden admin-panel">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[color:var(--admin-glow)] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl" style={{ background: 'var(--admin-glow)' }}></div>
          </div>

          {/* Content */}
          <div className="relative p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[color:var(--admin-text)]">Service Oversight</h2>
                <p className="text-xs text-[color:var(--admin-muted)] uppercase tracking-widest mt-2">Real-time platform intelligence</p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(145deg, var(--admin-accent) 0%, var(--admin-accent-soft) 100%)',
                  boxShadow: '0 10px 26px var(--admin-glow)',
                }}
              >
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="group relative overflow-hidden rounded-2xl border border-[color:var(--admin-border)] hover:border-[color:var(--admin-border-strong)] p-4 transition-all duration-300"
                    style={{ background: 'var(--admin-surface)' }}
                  >
                    {/* Gradient border on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[color:var(--admin-glow)] to-transparent opacity-0 group-hover:opacity-25 transition-opacity duration-300 rounded-2xl"></div>

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl border border-[color:var(--admin-border-strong)] transition-all duration-300" style={{ background: 'rgba(84, 126, 214, 0.2)' }}>
                          <Icon className="w-5 h-5 text-[color:var(--admin-text)]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--admin-text)] transition-all duration-300">{action.title}</p>
                          <p className="text-xs text-[color:var(--admin-muted)] mt-1">
                            <span className="font-bold text-[color:var(--admin-text)]">{action.count}</span> item{action.count !== 1 ? 's' : ''} pending
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`admin-pill ${action.count > 0
                          ? 'admin-pill-alert'
                          : 'admin-pill-success'
                          }`}>
                          {action.count > 0 ? 'ACTION' : 'OK'}
                        </div>
                        <ArrowRight className="w-4 h-4 text-[color:var(--admin-accent)] group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Platform Status - Enhanced */}
            <div className="mt-10 pt-8 border-t border-[color:var(--admin-border)]">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[color:var(--admin-muted)] uppercase tracking-widest">Platform Status</p>
                  <span className="admin-pill admin-pill-success">Operational</span>
                </div>

                {/* Status indicator with animation */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[color:var(--admin-success)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[color:var(--admin-success)] shadow-lg"></span>
                    </span>
                    <span className="text-sm font-bold text-[color:var(--admin-text)] tracking-wide">
                      All Systems Operational
                    </span>
                  </div>
                </div>

                {/* Performance metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="border border-[color:var(--admin-border)] rounded-xl p-3" style={{ background: 'var(--admin-surface)' }}>
                    <p className="text-[10px] text-[color:var(--admin-muted)] uppercase tracking-widest font-bold mb-1">Response Time</p>
                    <p className="text-lg font-bold text-[color:var(--admin-text)]">142ms</p>
                  </div>
                  <div className="border border-[color:var(--admin-border)] rounded-xl p-3" style={{ background: 'var(--admin-surface)' }}>
                    <p className="text-[10px] text-[color:var(--admin-muted)] uppercase tracking-widest font-bold mb-1">Uptime</p>
                    <p className="text-lg font-bold text-[color:var(--admin-text)]">99.98%</p>
                  </div>
                </div>
              </div>

              {/* Health bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-[color:var(--admin-muted)] uppercase tracking-widest">System Health</p>
                  <p className="text-xs font-bold text-[color:var(--admin-accent)]">98%</p>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden border border-[color:var(--admin-border)]" style={{ background: 'var(--admin-surface)' }}>
                  <div className="bg-gradient-to-r from-[color:var(--admin-accent-soft)] to-[color:var(--admin-accent)] w-[98%] h-full rounded-full shadow-lg shadow-[color:var(--admin-glow)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
