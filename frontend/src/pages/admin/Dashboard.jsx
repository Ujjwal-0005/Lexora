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
    <div className="max-w-7xl mx-auto pb-20 font-sans">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-5xl font-bold text-[#0f172a] tracking-tight mb-3">
          Platform Oversight
        </h1>
        <p className="text-gray-500 font-medium">
          Institutional health and administrative performance metrics.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-800 border-t-4 border-[#0f172a] shadow-sm p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-gray-500 tracking-widest uppercase w-2/3 leading-tight">{stat.label}</p>
                <div className="p-2 bg-gray-50 dark:bg-dark-700 rounded-sm">
                  <Icon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h3 className="font-serif text-4xl font-bold text-[#0f172a] dark:text-white mb-3">
                  {stat.value}
                </h3>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#0f172a]" />
                  {stat.subtext}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>



      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold text-[#0f172a] dark:text-white">Recent Activity</h2>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                System Audit Log
              </span>
            </div>

            {isLoading ? (
              <div className="py-10"><Loader /></div>
            ) : recentActivity.length > 0 ? (
              <>
                <div className="space-y-6 mb-6">
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
                            className={`flex items-start gap-6 pb-6 ${idx !== paginatedActivity.length - 1 ? 'border-b border-gray-100 dark:border-dark-600' : ''}`}
                          >
                            <div className="w-10 h-10 rounded-sm bg-[#0f172a] flex items-center justify-center flex-shrink-0 shadow-inner mt-1">
                              <span className="text-white font-serif font-bold text-lg">
                                {activity.admin?.name?.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-[#0f172a] dark:text-white text-sm">{activity.admin?.name}</p>
                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">
                                  {new Date(activity.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                                Executed <span className="font-semibold text-gray-700 dark:text-gray-300">{activity.action.replace(/_/g, ' ').toUpperCase()}</span>
                                {activity.target_user && ` on ${activity.target_user.name}`}
                              </p>
                              {activity.notes && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-dark-700 p-2.5 rounded-sm border border-gray-100 dark:border-dark-600">
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
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-dark-600">
                      <p className="text-xs text-gray-500 font-medium">
                        Showing {Math.min((activityPage - 1) * RECORDS_PER_PAGE + 1, recentActivity.length)} - {Math.min(activityPage * RECORDS_PER_PAGE, recentActivity.length)} of {recentActivity.length}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActivityPage(Math.max(1, activityPage - 1))}
                          disabled={activityPage === 1}
                          className="p-2 border border-gray-200 dark:border-dark-600 rounded-sm hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <span className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                          {activityPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setActivityPage(Math.min(totalPages, activityPage + 1))}
                          disabled={activityPage === totalPages}
                          className="p-2 border border-gray-200 dark:border-dark-600 rounded-sm hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </>
            ) : (
              <div className="py-10 text-center">
                <p className="text-gray-500 font-medium">No recent activity detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & System Status - Enhanced */}
        <div className="relative overflow-hidden shadow-2xl rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-600/30">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">Service Oversight</h2>
                <p className="text-xs text-amber-200/60 uppercase tracking-widest mt-2">Real-time platform intelligence</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/50">
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
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 border border-amber-600/30 hover:border-amber-500/50 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
                  >
                    {/* Gradient border on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-400/0 to-amber-500/0 group-hover:from-amber-500/20 group-hover:via-amber-400/20 group-hover:to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-500/30 to-amber-600/30 rounded-lg border border-amber-500/40 group-hover:from-amber-500/50 group-hover:to-amber-600/50 transition-all duration-300">
                          <Icon className={`w-5 h-5 ${action.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-300 group-hover:to-amber-200 group-hover:bg-clip-text transition-all duration-300">{action.title}</p>
                          <p className="text-xs text-amber-200/60 mt-1">
                            <span className="font-bold text-amber-300">{action.count}</span> item{action.count !== 1 ? 's' : ''} pending
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${action.count > 0
                          ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                          : 'bg-green-500/30 text-green-300 border border-green-500/50'
                          }`}>
                          {action.count > 0 ? 'ACTION' : 'OK'}
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Platform Status - Enhanced */}
            <div className="mt-10 pt-8 border-t border-amber-600/30">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">Platform Status</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/50 font-bold">OPERATIONAL</span>
                </div>

                {/* Status indicator with animation */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-lg shadow-green-500/50"></span>
                    </span>
                    <span className="text-sm font-bold text-white tracking-wide">
                      All Systems Operational
                    </span>
                  </div>
                </div>

                {/* Performance metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 border border-amber-600/30 rounded-lg p-3">
                    <p className="text-[10px] text-amber-300/70 uppercase tracking-widest font-bold mb-1">Response Time</p>
                    <p className="text-lg font-bold text-white">142ms</p>
                  </div>
                  <div className="bg-white/5 border border-amber-600/30 rounded-lg p-3">
                    <p className="text-[10px] text-amber-300/70 uppercase tracking-widest font-bold mb-1">Uptime</p>
                    <p className="text-lg font-bold text-white">99.98%</p>
                  </div>
                </div>
              </div>

              {/* Health bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-amber-300/60 uppercase tracking-widest">System Health</p>
                  <p className="text-xs font-bold text-amber-400">98%</p>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-amber-600/30">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 w-[98%] h-full rounded-full shadow-lg shadow-amber-500/50"></div>
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
