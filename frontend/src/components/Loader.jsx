import { motion } from 'framer-motion'

const Loader = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} border-4 border-primary-500/30 border-t-primary-500 rounded-full`}
      />
    </div>
  )
}

export const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-dark-900 flex items-center justify-center z-50">
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export default Loader
