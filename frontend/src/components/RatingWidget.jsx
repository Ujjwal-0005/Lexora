import { useState } from 'react'
import { Star } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const SUMMARY_KEYS = [['ratings-summary'], ['ratings-summary-modal']]
const DISTRIBUTION_KEYS = [['ratings-distribution'], ['ratings-distribution-modal']]

const cloneDistribution = (distribution = {}) => {
    const next = {}
    for (let i = 1; i <= 5; i += 1) {
        next[i] = Number(distribution[i] ?? 0)
    }
    return next
}

const updateOptimisticRating = (queryClient, nextRating, previousRating) => {
    SUMMARY_KEYS.forEach((queryKey) => {
        const summary = queryClient.getQueryData(queryKey)
        if (!summary) return

        const count = Number(summary.count ?? 0)
        const average = Number(summary.average ?? 0)
        const normalizedPrevious = Number(previousRating ?? 0)

        let nextCount = count
        let nextAverage = average

        if (normalizedPrevious > 0) {
            nextAverage = count > 0 ? ((average * count) - normalizedPrevious + nextRating) / count : nextRating
        } else {
            nextCount = count + 1
            nextAverage = nextCount > 0 ? ((average * count) + nextRating) / nextCount : nextRating
        }

        queryClient.setQueryData(queryKey, {
            ...summary,
            count: nextCount,
            average: Number(nextAverage.toFixed(2)),
        })
    })

    DISTRIBUTION_KEYS.forEach((queryKey) => {
        const distribution = queryClient.getQueryData(queryKey)
        if (!distribution) return

        const nextDistribution = cloneDistribution(distribution)
        if (previousRating > 0) {
            nextDistribution[previousRating] = Math.max(0, (Number(nextDistribution[previousRating] ?? 0) || 0) - 1)
        }
        nextDistribution[nextRating] = (Number(nextDistribution[nextRating] ?? 0) || 0) + 1
        queryClient.setQueryData(queryKey, nextDistribution)
    })

    queryClient.setQueryData(['my-rating'], { rating: nextRating })
}

const rollbackOptimisticRating = (queryClient, snapshot) => {
    SUMMARY_KEYS.forEach((queryKey) => {
        if (snapshot?.[JSON.stringify(queryKey)]) {
            queryClient.setQueryData(queryKey, snapshot[JSON.stringify(queryKey)])
        }
    })

    DISTRIBUTION_KEYS.forEach((queryKey) => {
        if (snapshot?.[JSON.stringify(queryKey)]) {
            queryClient.setQueryData(queryKey, snapshot[JSON.stringify(queryKey)])
        }
    })

    if (snapshot?.myRating !== undefined) {
        queryClient.setQueryData(['my-rating'], snapshot.myRating)
    }
}

export default function RatingWidget({ compact = false }) {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()
    const [hover, setHover] = useState(0)

    const { data: summary } = useQuery({
        queryKey: ['ratings-summary'],
        queryFn: async () => {
            const res = await api.get('/ratings/summary')
            return res.data
        }
    })

    const { data: distribution } = useQuery({
        queryKey: ['ratings-distribution'],
        queryFn: async () => {
            const res = await api.get('/ratings/distribution')
            return res.data.distribution
        }
    })

    const { data: myRating } = useQuery({
        queryKey: ['my-rating'],
        queryFn: async () => {
            const res = await api.get('/ratings/me')
            return res.data.rating
        },
        enabled: !!user
    })

    const saveMutation = useMutation({
        mutationFn: async ({ rating }) => {
            const res = await api.post('/ratings', { rating })
            return res.data
        },
        onMutate: async ({ rating }) => {
            await Promise.all([
                ...SUMMARY_KEYS.map((queryKey) => queryClient.cancelQueries({ queryKey })),
                ...DISTRIBUTION_KEYS.map((queryKey) => queryClient.cancelQueries({ queryKey })),
                queryClient.cancelQueries({ queryKey: ['my-rating'] }),
            ])

            const snapshot = {
                myRating: queryClient.getQueryData(['my-rating']),
            }

            SUMMARY_KEYS.forEach((queryKey) => {
                snapshot[JSON.stringify(queryKey)] = queryClient.getQueryData(queryKey)
            })

            DISTRIBUTION_KEYS.forEach((queryKey) => {
                snapshot[JSON.stringify(queryKey)] = queryClient.getQueryData(queryKey)
            })

            const previousRating = snapshot.myRating?.rating ?? 0
            updateOptimisticRating(queryClient, rating, previousRating)

            return { snapshot }
        },
        onSuccess: () => {
            toast.success('Rating saved')
            queryClient.invalidateQueries({ queryKey: ['ratings-summary'] })
            queryClient.invalidateQueries({ queryKey: ['ratings-summary-modal'] })
            queryClient.invalidateQueries({ queryKey: ['ratings-distribution'] })
            queryClient.invalidateQueries({ queryKey: ['ratings-distribution-modal'] })
            queryClient.invalidateQueries({ queryKey: ['my-rating'] })
        },
        onError: (_error, _variables, context) => {
            rollbackOptimisticRating(queryClient, context?.snapshot)
            toast.error('Failed to save rating')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const res = await api.delete('/ratings/me')
            return res.data
        },
        onMutate: async () => {
            await Promise.all([
                ...SUMMARY_KEYS.map((queryKey) => queryClient.cancelQueries({ queryKey })),
                ...DISTRIBUTION_KEYS.map((queryKey) => queryClient.cancelQueries({ queryKey })),
                queryClient.cancelQueries({ queryKey: ['my-rating'] }),
            ])

            const snapshot = {
                myRating: queryClient.getQueryData(['my-rating']),
            }

            SUMMARY_KEYS.forEach((queryKey) => {
                snapshot[JSON.stringify(queryKey)] = queryClient.getQueryData(queryKey)
            })

            DISTRIBUTION_KEYS.forEach((queryKey) => {
                snapshot[JSON.stringify(queryKey)] = queryClient.getQueryData(queryKey)
            })

            const previousRating = snapshot.myRating?.rating ?? 0

            if (previousRating > 0) {
                SUMMARY_KEYS.forEach((queryKey) => {
                    const summary = queryClient.getQueryData(queryKey)
                    if (!summary) return
                    const count = Number(summary.count ?? 0)
                    const average = Number(summary.average ?? 0)
                    const nextCount = Math.max(0, count - 1)
                    const nextAverage = nextCount > 0 ? ((average * count) - previousRating) / nextCount : 0
                    queryClient.setQueryData(queryKey, {
                        ...summary,
                        count: nextCount,
                        average: Number(nextAverage.toFixed(2)),
                    })
                })

                DISTRIBUTION_KEYS.forEach((queryKey) => {
                    const distribution = queryClient.getQueryData(queryKey)
                    if (!distribution) return
                    const nextDistribution = cloneDistribution(distribution)
                    nextDistribution[previousRating] = Math.max(0, (Number(nextDistribution[previousRating] ?? 0) || 0) - 1)
                    queryClient.setQueryData(queryKey, nextDistribution)
                })
            }

            queryClient.setQueryData(['my-rating'], null)

            return { snapshot }
        },
        onSuccess: () => {
            toast.success('Rating removed')
            queryClient.invalidateQueries({ queryKey: ['ratings-summary'] })
            queryClient.invalidateQueries({ queryKey: ['ratings-summary-modal'] })
            queryClient.invalidateQueries({ queryKey: ['ratings-distribution'] })
            queryClient.invalidateQueries({ queryKey: ['ratings-distribution-modal'] })
            queryClient.invalidateQueries({ queryKey: ['my-rating'] })
        },
        onError: (_error, _variables, context) => {
            rollbackOptimisticRating(queryClient, context?.snapshot)
            toast.error('Failed to remove rating')
        }
    })

    const submitRating = (value) => {
        if (!user) return toast.error('Please sign in to rate')
        saveMutation.mutate({ rating: value })
    }

    const isBusy = saveMutation.isPending || deleteMutation.isPending

    const avg = summary?.average ?? 0
    const count = summary?.count ?? 0

    return (
        <div className={`p-4 ${compact ? 'p-2' : ''} bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Platform Rating</p>
                    <p className="text-lg font-serif font-bold text-[#0f172a] dark:text-white">{avg.toFixed(2)} <span className="text-xs text-gray-500">/ 5</span></p>
                    <p className="text-xs text-gray-500">Based on {count} rating{count !== 1 ? 's' : ''}</p>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => {
                            const filled = myRating ? (myRating.rating >= n) : (hover >= n)
                            return (
                                <button
                                    key={n}
                                    onClick={() => submitRating(n)}
                                    onMouseEnter={() => setHover(n)}
                                    onMouseLeave={() => setHover(0)}
                                    disabled={isBusy}
                                    className="p-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Star className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} />
                                </button>
                            )
                        })}
                    </div>

                    {user && myRating && (
                        <div className="mt-2 text-xs text-gray-500">
                            Your rating: <span className="font-bold dark:text-slate-50 text-[#0f172a]">{myRating.rating}</span>
                            <button onClick={() => deleteMutation.mutate()} disabled={isBusy} className="ml-3 text-sm text-red-600 disabled:opacity-50 disabled:cursor-not-allowed">Remove</button>
                        </div>
                    )}
                </div>
            </div>

            {isBusy && (
                <p className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-[#0f172a]" />
                    Updating rating...
                </p>
            )}

            {/* Distribution */}
            {distribution && (
                <div className="mt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Rating Distribution</p>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((r) => {
                            const val = distribution[r] || 0
                            const percent = count > 0 ? Math.round((val / count) * 100) : 0
                            return (
                                <div key={r} className="flex items-center gap-3">
                                    <div className="w-6 text-xs">{r}★</div>
                                    <div className="flex-1 bg-gray-100 h-3 rounded-sm overflow-hidden">
                                        <div style={{ width: `${percent}%` }} className="bg-yellow-400 h-full"></div>
                                    </div>
                                    <div className="w-10 text-xs text-right">{val}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
