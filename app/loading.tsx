'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center md:ml-64">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-soft-rose border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-soft-gray font-inter">Loading...</p>
      </motion.div>
    </div>
  )
}

