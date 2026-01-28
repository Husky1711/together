'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  const pathname = usePathname()

  return (
    <main className={`min-h-screen bg-warm-white pb-32 md:pb-0 md:ml-64 ${className} relative`}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-0"
      >
        {children}
      </motion.div>
    </main>
  )
}

