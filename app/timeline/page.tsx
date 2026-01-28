'use client'

import { motion } from 'framer-motion'
import PageContainer from '@/components/Layout/PageContainer'
import PageHeader from '@/components/Layout/PageHeader'
import { personalization, getDaysTogether } from '@/lib/personalization'
import { useEffect, useState } from 'react'

interface TimelineEvent {
  date: string
  title: string
  description: string
  emoji: string
  type: 'milestone' | 'memory' | 'vision'
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    // Combine milestones, memories, and vision items into timeline
    const milestones = personalization.milestones.map(m => ({
      date: m.date,
      title: m.name,
      description: `A special milestone in our journey`,
      emoji: m.emoji,
      type: 'milestone' as const,
    }))

    const memories = JSON.parse(localStorage.getItem('memories-board-items') || '[]')
    const memoryEvents = memories
      .filter((m: any) => m.date)
      .map((m: any) => ({
        date: m.date,
        title: m.type === 'text' ? 'Memory' : 'Photo Memory',
        description: m.type === 'text' ? m.content.substring(0, 100) : m.content,
        emoji: m.type === 'text' ? '💭' : '📷',
        type: 'memory' as const,
      }))

    const visionItems = JSON.parse(localStorage.getItem('vision-board-items') || '[]')
    const visionEvents = visionItems
      .filter((v: any) => v.timestamp)
      .map((v: any) => ({
        date: new Date(v.timestamp).toISOString().split('T')[0],
        title: 'Vision Added',
        description: v.type === 'text' ? v.content.substring(0, 100) : 'New vision item',
        emoji: '✨',
        type: 'vision' as const,
      }))

    // Combine and sort by date
    const allEvents = [...milestones, ...memoryEvents, ...visionEvents]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setEvents(allEvents)
  }, [])

  const daysTogether = getDaysTogether(personalization.relationshipStartDate)
  const relationshipStart = new Date(personalization.relationshipStartDate)

  return (
    <PageContainer>
      <PageHeader
        title="Our Timeline"
        description="The story of us, from the beginning"
        emoji="📅"
      />

      {/* Timeline Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 mb-12 text-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-4xl mb-2">💕</div>
            <div className="text-3xl font-playfair font-bold text-charcoal mb-1">
              {daysTogether}
            </div>
            <div className="text-soft-gray font-inter">Days Together</div>
          </div>
          <div>
            <div className="text-4xl mb-2">📅</div>
            <div className="text-xl font-playfair font-bold text-charcoal mb-1">
              {relationshipStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-soft-gray font-inter">Started</div>
          </div>
          <div>
            <div className="text-4xl mb-2">🌟</div>
            <div className="text-3xl font-playfair font-bold text-charcoal mb-1">
              {events.length}
            </div>
            <div className="text-soft-gray font-inter">Moments</div>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-soft-rose via-blush-pink to-rose-gold transform md:-translate-x-1/2" />

        {/* Timeline Events */}
        <div className="space-y-12">
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass rounded-3xl"
            >
              <p className="text-soft-gray text-lg">
                Your timeline will appear here as you add memories and milestones! 💕
              </p>
            </motion.div>
          ) : (
            events.map((event, index) => (
              <motion.div
                key={`${event.date}-${index}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-soft-rose rounded-full border-4 border-white shadow-lg transform md:-translate-x-1/2 z-10" />

                {/* Event Card */}
                <div
                  className={`ml-12 md:ml-0 md:w-5/12 ${
                    index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`glass rounded-2xl p-6 shadow-lg ${
                      event.type === 'milestone'
                        ? 'border-l-4 border-rose-gold'
                        : event.type === 'memory'
                        ? 'border-l-4 border-soft-rose'
                        : 'border-l-4 border-blush-pink'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{event.emoji}</div>
                      <div className="flex-1">
                        <div className="text-sm text-soft-gray font-inter mb-1">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <h3 className="text-xl font-playfair font-bold text-charcoal mb-2">
                          {event.title}
                        </h3>
                        <p className="text-soft-gray font-inter">{event.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  )
}

