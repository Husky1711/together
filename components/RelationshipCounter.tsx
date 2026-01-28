'use client'

import { motion } from 'framer-motion'
import { personalization, getDaysTogether, getNextMilestone } from '@/lib/personalization'
import { useEffect, useState } from 'react'

interface TimeTogether {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function RelationshipCounter() {
  const [timeTogether, setTimeTogether] = useState<TimeTogether>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    calculateTimeTogether()

    // Update every second
    const interval = setInterval(calculateTimeTogether, 1000)
    return () => clearInterval(interval)
  }, [])

  function calculateTimeTogether() {
    const start = new Date(personalization.relationshipStartDate)
    const now = new Date()
    const diff = now.getTime() - start.getTime()

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    setTimeTogether({ days, hours, minutes, seconds })
  }

  const nextMilestone = getNextMilestone(personalization.milestones)
  const daysTogether = getDaysTogether(personalization.relationshipStartDate)

  // Check for milestones (100 days, 1 year, etc.)
  const milestones = [
    { days: 100, name: "100 Days Together", emoji: "💯" },
    { days: 365, name: "One Year Together", emoji: "🎉" },
    { days: 500, name: "500 Days Together", emoji: "🌟" },
    { days: 730, name: "Two Years Together", emoji: "💕" },
  ]

  const achievedMilestones = milestones.filter(m => daysTogether >= m.days)

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-4">
          Our Time Together
        </h2>
        <p className="text-lg text-soft-gray font-inter">
          Every moment counts, every second matters
        </p>
      </motion.div>

      {/* Counter Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-gradient-to-br from-soft-rose to-blush-pink rounded-3xl p-8 md:p-12 mb-8 shadow-lg"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: 'Days', value: timeTogether.days },
            { label: 'Hours', value: timeTogether.hours },
            { label: 'Minutes', value: timeTogether.minutes },
            { label: 'Seconds', value: timeTogether.seconds },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <motion.div
                key={item.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-4xl md:text-6xl font-playfair font-bold text-white mb-2"
              >
                {item.value.toLocaleString()}
              </motion.div>
              <div className="text-white/90 font-inter text-sm md:text-base">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Milestones */}
      {achievedMilestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-playfair font-semibold text-charcoal mb-4 text-center">
            Milestones Achieved
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {achievedMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.days}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-rose-gold text-white px-6 py-3 rounded-full font-inter font-medium shadow-md"
              >
                <span className="mr-2">{milestone.emoji}</span>
                {milestone.name}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Next Milestone */}
      {nextMilestone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-block glass rounded-2xl px-6 py-4">
            <p className="text-soft-gray font-inter mb-1">Next Milestone</p>
            <p className="text-xl font-playfair font-semibold text-charcoal">
              {nextMilestone.emoji} {nextMilestone.name}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

