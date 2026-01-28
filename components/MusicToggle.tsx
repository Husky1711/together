'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface MusicToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export default function MusicToggle({ enabled, onToggle }: MusicToggleProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onToggle(!enabled)}
      className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-2xl hover:bg-white transition-colors"
      aria-label={enabled ? 'Mute music' : 'Play music'}
    >
      {enabled ? '🔊' : '🔇'}
    </motion.button>
  )
}

