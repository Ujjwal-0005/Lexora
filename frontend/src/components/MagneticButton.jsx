import { motion } from 'framer-motion'
import { useRef, useState } from 'react'

const MagneticButton = ({ children, className = '' }) => {
  const ref = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()

    // Calculate distance from center with reduced multiplier to prevent buttons from moving too far
    let x = (clientX - left - width / 2) * 0.15
    let y = (clientY - top - height / 2) * 0.15

    // Constrain movement to prevent buttons from disappearing off-screen
    const maxMovement = Math.min(width, height) * 0.3
    x = Math.max(Math.min(x, maxMovement), -maxMovement)
    y = Math.max(Math.min(y, maxMovement), -maxMovement)

    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 15, mass: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default MagneticButton
