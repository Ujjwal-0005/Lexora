import { X, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import RatingWidget from './RatingWidget'
import { useAuthStore } from '../store/authStore'

export default function RateModal({ open, onClose }) {
    const { isAdmin, isLawyer, isClient } = useAuthStore()
    const adminView = isAdmin()
    const clientView = isClient()
    const ratingEnabled = isLawyer() || isClient()

    const { data: summary } = useQuery({
        queryKey: ['ratings-summary-modal'],
        enabled: open,
        queryFn: async () => {
            const res = await api.get('/ratings/summary')
            return res.data
        },
        staleTime: 1000 * 60 * 2,
    })

    const { data: distribution } = useQuery({
        queryKey: ['ratings-distribution-modal'],
        enabled: open,
        queryFn: async () => {
            const res = await api.get('/ratings/distribution')
            return res.data.distribution
        },
        staleTime: 1000 * 60 * 2,
    })

    if (!open) return null

    const totalRatings = Number(summary?.count ?? 0)
    const averageRating = Number(summary?.average ?? 0)
    const liveDistribution = distribution || {}

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className={`absolute inset-0 ${clientView ? 'bg-black/25' : 'bg-black/80'}`} onClick={onClose} />

            <div className={`relative z-[61] w-full max-w-4xl rounded-2xl overflow-hidden ${clientView
                ? 'portal-card-elevated border border-[color:var(--portal-border)] shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
                : 'shadow-2xl bg-white dark:bg-dark-800'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between gap-4 p-6 ${clientView
                    ? 'bg-[linear-gradient(140deg,#121f39_0%,#1f335a_55%,#152846_100%)] border-b border-[color:var(--portal-border)]'
                    : 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800'
                    }`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${clientView ? 'bg-white/10 border border-white/20' : 'bg-white/20'}`}>
                            <Star className={`w-6 h-6 ${clientView ? 'text-[color:var(--portal-gold)]' : 'text-white'}`} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-white">Rattings</h3>
                            <p className={`text-sm ${clientView ? 'text-white/70' : 'text-white/90'}`}>Platform feedback & distribution</p>
                        </div>
                    </div>

                    <button onClick={onClose} className={`text-white hover:opacity-90 p-2 rounded-full ${clientView ? 'bg-white/8 border border-white/15' : 'bg-white/10'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className={`${clientView ? 'bg-[color:var(--portal-surface-elevated)] p-6' : 'bg-white dark:bg-dark-800 p-6'}`}>
                    {adminView ? (
                        <div className="grid lg:grid-cols-2 gap-6 items-start">
                            <div className="card p-6">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Platform Rating</p>
                                        <p className="text-4xl font-serif font-bold text-[#0f172a] dark:text-white mt-2">
                                            {averageRating.toFixed(2)} <span className="text-sm text-gray-500">/ 5</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Rating Distribution</p>
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((r) => {
                                            const val = liveDistribution[r] || 0
                                            const percent = totalRatings > 0 ? Math.round((val / totalRatings) * 100) : 0
                                            return (
                                                <div key={r} className="flex items-center gap-3">
                                                    <div className="w-8 text-sm">{r}★</div>
                                                    <div className="flex-1 bg-gray-100 dark:bg-dark-700 h-3 rounded-sm overflow-hidden">
                                                        <div style={{ width: `${percent}%` }} className="bg-yellow-500 h-full rounded-sm"></div>
                                                    </div>
                                                    <div className="w-12 text-sm text-right text-gray-700 dark:text-gray-300">{val}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-lg bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-600">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Admin View</p>
                                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                                    <p>Admins can review overall ratings only.</p>
                                    <p className="text-gray-500">No rating submission is available here.</p>
                                    <div className="pt-3 border-t border-gray-200 dark:border-dark-600">
                                        <div className="flex justify-between">
                                            <span>Total ratings</span>
                                            <span className="font-semibold text-[#0f172a] dark:text-white">{totalRatings}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : ratingEnabled ? (
                        <div className="max-w-3xl mx-auto">
                            <div className={clientView ? 'portal-card p-6 border border-[color:var(--portal-border)]' : 'card p-6'}>
                                <RatingWidget />
                            </div>
                            <p className={`mt-4 text-xs text-center ${clientView ? 'text-[color:var(--portal-muted)]' : 'text-gray-500 dark:text-gray-400'}`}>
                                Your rating helps improve the platform. No extra insights are shown here.
                            </p>
                        </div>
                    ) : (
                        <div className="card p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Ratings are available to clients, lawyers, and administrators only.</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button onClick={onClose} className={clientView ? 'portal-btn-ghost px-5 py-2 rounded-lg' : 'px-5 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600'}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
