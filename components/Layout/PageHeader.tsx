'use client'

import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  description?: string
  emoji?: string
}

export default function PageHeader({ title, description, emoji }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      {emoji && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-6xl mb-4"
        >
          {emoji}
        </motion.div>
      )}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-charcoal mb-4">
        {title}
      </h1>
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-soft-gray font-inter max-w-2xl mx-auto"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}

