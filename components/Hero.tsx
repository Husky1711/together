'use client'

import { motion } from 'framer-motion'
import { personalization } from '@/lib/personalization'
import { useEffect, useState } from 'react'

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
  }, [])

  // Floating hearts animation
  const hearts = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 gradient-bg opacity-90" />
      
      {/* Floating Hearts */}
      {mounted && hearts.map((i) => {
        const randomX = Math.random() * dimensions.width
        const randomY = dimensions.height + 50
        const randomScale = Math.random() * 0.5 + 0.5
        const randomDuration = Math.random() * 3 + 2
        const randomDelay = Math.random() * 2
        const randomRotate = Math.random() * 360
        
        return (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-30"
            initial={{
              x: randomX,
              y: randomY,
              scale: randomScale,
            }}
            animate={{
              y: -100,
              x: randomX + (Math.random() - 0.5) * 200,
              rotate: randomRotate,
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
              ease: "linear",
            }}
          >
            💕
          </motion.div>
        )
      })}

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={mounted ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-white mb-6"
            aria-label={`For ${personalization.herName}`}
          >
            For {personalization.herName} <span aria-hidden="true">💕</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 font-inter mb-8"
          >
            {personalization.heroMessage}
          </motion.p>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <motion.button
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center text-white/80 cursor-pointer bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-2"
              onClick={() => {
                document.getElementById('counter')?.scrollIntoView({ behavior: 'smooth' })
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  document.getElementById('counter')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              aria-label="Scroll to explore more content"
            >
              <span className="text-sm mb-2 font-inter">Scroll to explore</span>
              <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </motion.svg>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

