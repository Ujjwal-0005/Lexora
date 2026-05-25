import { X, Star, Activity, ShieldCheck, BarChart3, Users2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import RatingWidget from './RatingWidget'
import { useAuthStore } from '../store/authStore'

export default function RateModal({ open, onClose }) {
    const { isAdmin, isLawyer, isClient } = useAuthStore()
    const adminView = isAdmin()
    const lawyerView = isLawyer()
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
    const maxDistribution = Math.max(...[5, 4, 3, 2, 1].map((r) => Number(liveDistribution[r] || 0)), 1)

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className={`absolute inset-0 ${adminView ? 'bg-black/80' : lawyerView ? 'bg-[#050913]/72 backdrop-blur-sm' : 'bg-black/25'}`} onClick={onClose} />

            <div className={`relative z-[61] w-full max-w-5xl rounded-2xl overflow-hidden ${clientView
                ? 'portal-card-elevated border border-[color:var(--portal-border)] shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
                : lawyerView
                    ? 'portal-card-elevated border border-[color:var(--portal-border-strong)] shadow-[0_26px_72px_rgba(15,23,42,0.28)] lawyer-rating-modal'
                    : 'admin-modal-panel'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between gap-4 p-6 ${clientView
                    ? 'bg-[linear-gradient(140deg,#121f39_0%,#1f335a_55%,#152846_100%)] border-b border-[color:var(--portal-border)]'
                    : lawyerView
                        ? 'lawyer-rating-modal-header border-b border-[color:var(--portal-border-strong)]'
                        : 'bg-[linear-gradient(145deg,color-mix(in_oklab,var(--admin-surface-strong)_92%,transparent)_0%,color-mix(in_oklab,var(--admin-surface)_88%,transparent)_100%)] border-b border-[color:var(--admin-border)]'
                    }`}>
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${clientView
                            ? 'bg-white/10 border border-white/20'
                            : lawyerView
                                ? 'lawyer-rating-mark'
                                : 'bg-[linear-gradient(145deg,var(--admin-accent),var(--admin-accent-soft))] text-white border border-white/10'
                            }`}>
                            <Star className={`w-6 h-6 ${clientView ? 'text-[color:var(--portal-gold)]' : lawyerView ? 'text-[color:var(--portal-gold)]' : 'text-white'}`} />
                        </div>
                        <div className="min-w-0">
                            <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${clientView ? 'text-white/70' : lawyerView ? 'text-[color:var(--portal-gold)]' : 'text-[color:var(--admin-muted)]'}`}>{lawyerView ? 'Law Firm Intelligence' : 'Platform Intelligence'}</p>
                            <h3 className={`text-2xl font-bold ${clientView ? 'text-white' : lawyerView ? 'text-[color:var(--portal-text)]' : 'text-[color:var(--admin-text)]'}`}>{lawyerView ? 'Lawyer Ratings Dossier' : 'Ratings Command Center'}</h3>
                            <p className={`text-sm ${clientView ? 'text-white/70' : lawyerView ? 'text-[color:var(--portal-muted)]' : 'text-[color:var(--admin-muted)]'}`}>{lawyerView ? 'A restrained, premium summary tuned to the lawyer portal aesthetic' : 'Executive overview of trust signals, distribution, and system sentiment'}</p>
                        </div>
                    </div>

                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${clientView ? 'text-white hover:opacity-90 bg-white/8 border border-white/15' : lawyerView ? 'text-[color:var(--portal-text)] bg-[color:var(--portal-surface)] border border-[color:var(--portal-border)] hover:border-[color:var(--portal-border-strong)]' : 'bg-[color:var(--admin-surface)] border border-[color:var(--admin-border)] text-[color:var(--admin-text)]'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className={`${clientView
                    ? 'bg-[color:var(--portal-surface-elevated)] p-6'
                    : lawyerView
                        ? 'lawyer-rating-modal-body p-6'
                        : 'bg-[linear-gradient(180deg,color-mix(in_oklab,var(--admin-surface-strong)_96%,transparent)_0%,color-mix(in_oklab,var(--admin-surface)_90%,transparent)_100%)] p-6'
                    }`}>
                    {adminView ? (
                        <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6 items-start">
                            <div className="admin-metric-card relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[color:var(--admin-glow)] blur-3xl" />
                                    <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-[rgba(31,74,164,0.14)] blur-3xl" />
                                </div>

                                <div className="relative flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <p className="admin-metric-label">Average Rating</p>
                                        <p className="admin-metric-value mt-3 text-[clamp(2.8rem,4vw,4rem)] leading-none">
                                            {averageRating.toFixed(2)}
                                        </p>
                                        <p className="admin-metric-subtext mt-2">Based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}</p>
                                    </div>

                                    <div className="rounded-2xl border border-[color:var(--admin-border)] px-3 py-2 bg-[color:var(--admin-surface)] text-[color:var(--admin-text)] shadow-sm">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[color:var(--admin-muted)]">
                                            <Activity className="w-4 h-4 text-[color:var(--admin-accent)]" />
                                            Live
                                        </div>
                                        <p className="mt-2 text-sm font-semibold">Trusted signal</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-[color:var(--admin-border)] p-4 bg-[color:var(--admin-surface)]">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--admin-muted)] mb-2">
                                            <ShieldCheck className="w-4 h-4 text-[color:var(--admin-accent)]" />
                                            Stability
                                        </div>
                                        <p className="text-2xl font-bold text-[color:var(--admin-text)]">High</p>
                                        <p className="text-xs text-[color:var(--admin-muted)] mt-1">Consistent user feedback</p>
                                    </div>
                                    <div className="rounded-2xl border border-[color:var(--admin-border)] p-4 bg-[color:var(--admin-surface)]">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--admin-muted)] mb-2">
                                            <Users2 className="w-4 h-4 text-[color:var(--admin-accent)]" />
                                            Volume
                                        </div>
                                        <p className="text-2xl font-bold text-[color:var(--admin-text)]">{totalRatings}</p>
                                        <p className="text-xs text-[color:var(--admin-muted)] mt-1">Total submitted ratings</p>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-panel border border-[color:var(--admin-border)]">
                                <div className="admin-panel-header flex items-center justify-between gap-3">
                                    <div>
                                        <p className="admin-panel-subtitle">Distribution</p>
                                        <h4 className="admin-panel-title mt-1">Feedback profile</h4>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[color:var(--admin-muted)]">
                                        <BarChart3 className="w-4 h-4 text-[color:var(--admin-accent)]" />
                                        System sentiment
                                    </div>
                                </div>
                                <div className="admin-panel-body space-y-3">
                                    {[5, 4, 3, 2, 1].map((r) => {
                                        const val = Number(liveDistribution[r] || 0)
                                        const percent = totalRatings > 0 ? Math.round((val / totalRatings) * 100) : 0
                                        const barWidth = Math.max(6, Math.round((val / maxDistribution) * 100))

                                        return (
                                            <div key={r} className="grid grid-cols-[44px_minmax(0,1fr)_42px] items-center gap-3">
                                                <div className="text-sm font-semibold text-[color:var(--admin-text)]">{r}★</div>
                                                <div className="h-3 rounded-full overflow-hidden border border-[color:var(--admin-border)]" style={{ background: 'var(--admin-surface)' }}>
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${barWidth}%`, background: 'linear-gradient(90deg, var(--admin-accent-soft) 0%, var(--admin-accent) 100%)' }}
                                                    />
                                                </div>
                                                <div className="text-right text-sm font-semibold text-[color:var(--admin-text)]">{val}</div>
                                                <div className="col-start-2 -mt-2 text-[11px] text-[color:var(--admin-muted)]">{percent}% of total</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : ratingEnabled ? (
                        <div className={lawyerView ? 'max-w-4xl mx-auto grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start' : 'max-w-3xl mx-auto'}>
                            {lawyerView && (
                                <div className="portal-card-elevated p-6 border border-[color:var(--portal-border-strong)] lawyer-rating-sidecar">
                                    <div className="flex items-center gap-2 mb-4 text-[color:var(--portal-gold)]">
                                        <ShieldCheck className="w-4 h-4" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.28em]">Lawyer Portal</p>
                                    </div>
                                    <h4 className="text-2xl font-bold text-[color:var(--portal-text)] leading-tight">Refined trust signals for the legal workspace</h4>
                                    <p className="mt-3 text-sm leading-7 text-[color:var(--portal-muted)]">
                                        Review client feedback through a restrained, premium interface aligned with the lawyer portal ambience.
                                    </p>
                                    <div className="mt-5 grid gap-3">
                                        <div className="rounded-2xl border border-[color:var(--portal-border)] bg-[color:var(--portal-surface)] px-4 py-3">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--portal-muted)]">Average rating</p>
                                            <p className="mt-1 text-3xl font-bold text-[color:var(--portal-text)]">{averageRating.toFixed(2)}</p>
                                        </div>
                                        <div className="rounded-2xl border border-[color:var(--portal-border)] bg-[color:var(--portal-surface)] px-4 py-3">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--portal-muted)]">Total responses</p>
                                            <p className="mt-1 text-2xl font-bold text-[color:var(--portal-text)]">{totalRatings}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={clientView ? 'portal-card p-6 border border-[color:var(--portal-border)]' : lawyerView ? 'portal-card-elevated p-6 border border-[color:var(--portal-border-strong)] lawyer-rating-widget' : 'card p-6'}>
                                <RatingWidget />
                            </div>
                            <p className={`mt-4 text-xs text-center ${clientView ? 'text-[color:var(--portal-muted)]' : lawyerView ? 'lg:col-span-2 text-[color:var(--portal-muted)]' : 'text-gray-500 dark:text-gray-400'}`}>
                                {lawyerView ? 'Your rating helps improve the platform.' : 'Your rating helps improve the platform. '}
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
