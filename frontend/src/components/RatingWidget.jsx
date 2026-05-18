import { useState } from 'react'
import { Star } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

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
        onSuccess: () => {
            toast.success('Rating saved')
            queryClient.invalidateQueries(['ratings-summary'])
            queryClient.invalidateQueries(['ratings-distribution'])
            queryClient.invalidateQueries(['my-rating'])
        },
        onError: () => toast.error('Failed to save rating')
    })

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const res = await api.delete('/ratings/me')
            return res.data
        },
        onSuccess: () => {
            toast.success('Rating removed')
            queryClient.invalidateQueries(['ratings-summary'])
            queryClient.invalidateQueries(['ratings-distribution'])
            queryClient.invalidateQueries(['my-rating'])
        },
        onError: () => toast.error('Failed to remove rating')
    })

    const submitRating = (value) => {
        if (!user) return toast.error('Please sign in to rate')
        saveMutation.mutate({ rating: value })
    }

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
                                    className="p-1">
                                    <Star className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} />
                                </button>
                            )
                        })}
                    </div>

                    {user && myRating && (
                        <div className="mt-2 text-xs text-gray-500">
                            Your rating: <span className="font-bold text-[#0f172a]">{myRating.rating}</span>
                            <button onClick={() => deleteMutation.mutate()} className="ml-3 text-sm text-red-600">Remove</button>
                        </div>
                    )}
                </div>
            </div>

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
