'use client'

import { motion } from 'framer-motion'
import { Heart, Clock, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface HeartbeatButtonProps {
  lastHeartbeat: Date
  thresholdDays: number
  onPulse: () => Promise<void>
  isLoading?: boolean
}

export function HeartbeatButton({
  lastHeartbeat,
  thresholdDays,
  onPulse,
  isLoading = false,
}: HeartbeatButtonProps) {
  const [isPulsing, setIsPulsing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Calculate time remaining
  const now = new Date()
  const threshold = new Date(lastHeartbeat)
  threshold.setDate(threshold.getDate() + thresholdDays)
  const msRemaining = threshold.getTime() - now.getTime()
  const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24))
  const hoursRemaining = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  // Determine urgency level
  const isUrgent = daysRemaining < 7
  const isCritical = daysRemaining < 3
  const isDead = msRemaining <= 0

  const handlePulse = async () => {
    if (isLoading || isPulsing) return
    
    setIsPulsing(true)
    try {
      await onPulse()
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } finally {
      setIsPulsing(false)
    }
  }

  // Dynamic styles based on state
  const getButtonStyles = () => {
    if (isDead) {
      return 'bg-red-500/10 border-red-500/50 cursor-not-allowed'
    }
    if (isCritical) {
      return 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 animate-pulse'
    }
    if (isUrgent) {
      return 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20'
    }
    return 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
  }

  const getIconColor = () => {
    if (isDead || isCritical) return 'text-red-400'
    if (isUrgent) return 'text-orange-400'
    return 'text-emerald-400'
  }

  const getTextColor = () => {
    if (isDead || isCritical) return 'text-red-400'
    if (isUrgent) return 'text-orange-400'
    return 'text-emerald-400'
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* The Heartbeat Button */}
      <motion.button
        onClick={handlePulse}
        disabled={isLoading || isDead}
        className={`relative w-48 h-48 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${getButtonStyles()}`}
        whileHover={!isDead ? { scale: 1.05 } : {}}
        whileTap={!isDead ? { scale: 0.95 } : {}}
      >
        {/* Glow effect */}
        <div className={`absolute inset-8 rounded-full blur-2xl opacity-40 ${
          isDead || isCritical ? 'bg-red-500' : isUrgent ? 'bg-orange-500' : 'bg-emerald-500'
        }`} />
        
        {/* Icon */}
        <motion.div
          animate={isPulsing ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <Heart 
            className={`w-20 h-20 transition-colors ${getIconColor()}`}
            fill={isDead ? 'currentColor' : 'none'}
          />
        </motion.div>

        {/* Success overlay */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm"
          >
            <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">
              Life Extended
            </span>
          </motion.div>
        )}
      </motion.button>

      {/* Status text */}
      <div className="text-center space-y-3">
        {isDead ? (
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-wider text-sm">Vault Released</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest">Time Remaining</span>
            </div>
            <div className={`text-4xl font-display font-bold ${getTextColor()}`}>
              {daysRemaining}d {hoursRemaining}h
            </div>
          </>
        )}
      </div>

      {/* Instructions */}
      {!isDead && (
        <p className="text-sm text-zinc-600 text-center max-w-xs">
          Press to confirm you're alive and reset the timer
        </p>
      )}
    </div>
  )
}
