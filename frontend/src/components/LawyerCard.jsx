import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Tilt } from 'react-tilt'
import { Star, MapPin, DollarSign, Briefcase } from 'lucide-react'
import { formatPrice } from '../utils/formatDate'

const LawyerCard = ({ lawyer, index = 0 }) => {
  const user = lawyer.user
  const profile = lawyer
  const isAvailable = profile.is_available !== false

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Tilt className="Tilt" options={{ max: 15, scale: 1.02 }}>
        <Link to={`/lawyer/${lawyer.id}`}>
          <div className={`glass dark:glass-dark rounded-xl p-6 transition-all duration-300 group ${isAvailable ? 'hover:shadow-xl hover:shadow-primary-500/10' : 'opacity-90 border border-amber-200/70 dark:border-amber-500/20'}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-amber-400 flex items-center justify-center">
                    <span className="text-2xl font-bold text-dark-900">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  {/* Availability pulse */}
                  {isAvailable && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-dark-800 animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                    {user?.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    <span>{profile.years_of_experience} years exp.</span>
                  </div>
                  <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${isAvailable ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                    {isAvailable ? 'Accepting Consultations' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div className="flex items-center  gap-1bg-primary-500/10 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-primary-500 fill-primary-500" />
                <span className="text-sm  font-semibold text-primary-500">
                  {profile.average_rating || 'New'}
                </span>
              </div>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.specializations?.slice(0, 3).map((spec) => (
                <span
                  key={spec.id}
                  className="px-3 py-1 text-xs font-medium bg-primary-500/10 text-primary-500 rounded-full"
                >
                  {spec.name}
                </span>
              ))}
              {profile.specializations?.length > 3 && (
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-dark-700 text-gray-500 rounded-full">
                  +{profile.specializations.length - 3}
                </span>
              )}
            </div>

            {/* Regions */}
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <MapPin className="w-4 h-4" />
              <span className="truncate">
                {profile.regions?.map((r) => r.city).join(', ')}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-600">
              <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                <DollarSign className="w-5 h-5 text-primary-500" />
                <span className="font-semibold">{formatPrice(profile.consultation_fee)}</span>
                <span className="text-sm text-gray-500">/hr</span>
              </div>
              <span className={`text-sm font-medium ${isAvailable ? 'text-primary-500 group-hover:underline' : 'text-amber-500'}`}>
                {isAvailable ? 'View Profile →' : 'Currently unavailable'}
              </span>
            </div>
          </div>
        </Link>
      </Tilt>
    </motion.div>
  )
}

export default LawyerCard
