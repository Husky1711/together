'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import PageContainer from '@/components/Layout/PageContainer'
import PageHeader from '@/components/Layout/PageHeader'
import RelationshipCounter from '@/components/RelationshipCounter'
import MusicToggle from '@/components/MusicToggle'
import { personalization, getDaysTogether } from '@/lib/personalization'
import { useEffect, useState } from 'react'

interface QuickStat {
  label: string
  value: string | number
  icon: string
  color: string
}

export default function Home() {
  const [stats, setStats] = useState<QuickStat[]>([])

  useEffect(() => {
    const daysTogether = getDaysTogether(personalization.relationshipStartDate)
    
    // Load recent activity from localStorage
    const memories = JSON.parse(localStorage.getItem('memories-board-items') || '[]')
    const visionItems = JSON.parse(localStorage.getItem('vision-board-items') || '[]')
    const songs = JSON.parse(localStorage.getItem('music-playlist') || '[]')

    setStats([
      {
        label: 'Days Together',
        value: daysTogether,
        icon: '💕',
        color: 'from-soft-rose to-blush-pink',
      },
      {
        label: 'Memories',
        value: memories.length,
        icon: '📝',
        color: 'from-blush-pink to-rose-gold',
      },
      {
        label: 'Vision Items',
        value: visionItems.length,
        icon: '✨',
        color: 'from-rose-gold to-soft-rose',
      },
      {
        label: 'Songs',
        value: songs.length || 3,
        icon: '🎵',
        color: 'from-soft-rose to-blush-pink',
      },
    ])
  }, [])

  const navCards = [
    {
      path: '/memories',
      icon: '💕',
      title: 'Memories',
      description: 'Our shared moments',
      color: 'from-soft-rose to-blush-pink',
    },
    {
      path: '/gallery',
      icon: '📸',
      title: 'Gallery',
      description: 'Photo collection',
      color: 'from-blush-pink to-rose-gold',
    },
    {
      path: '/vision',
      icon: '✨',
      title: 'Vision Board',
      description: '2025 goals & dreams',
      color: 'from-rose-gold to-soft-rose',
    },
    {
      path: '/music',
      icon: '🎵',
      title: 'Music',
      description: 'Our playlist',
      color: 'from-soft-rose to-blush-pink',
    },
    {
      path: '/questions',
      icon: '❓',
      title: 'Questions',
      description: 'Fun Q&A',
      color: 'from-blush-pink to-rose-gold',
    },
    {
      path: '/timeline',
      icon: '📅',
      title: 'Timeline',
      description: 'Our story',
      color: 'from-rose-gold to-soft-rose',
    },
  ]

  const [musicEnabled, setMusicEnabled] = useState(false)

  return (
    <>
      <MusicToggle enabled={musicEnabled} onToggle={setMusicEnabled} />
      <PageContainer>
      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center justify-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-charcoal mb-6"
          >
            For {personalization.herName} <span className="text-soft-rose">💕</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-soft-gray font-inter mb-8"
          >
            {personalization.heroMessage}
          </motion.p>
        </motion.div>
      </section>

      {/* Quick Stats Dashboard */}
      <section className="mb-16">
        <PageHeader title="Quick Stats" description="Our relationship at a glance" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg`}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-playfair font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-inter opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Relationship Counter */}
      <section className="mb-16">
        <RelationshipCounter />
      </section>

      {/* Navigation Cards */}
      <section>
        <PageHeader title="Explore" description="Navigate to different sections" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navCards.map((card, index) => (
            <motion.div
              key={card.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Link href={card.path}>
                <div className={`bg-gradient-to-br ${card.color} rounded-3xl p-8 text-white shadow-lg h-full flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl`}>
                  <div>
                    <div className="text-5xl mb-4">{card.icon}</div>
                    <h3 className="text-2xl font-playfair font-bold mb-2">{card.title}</h3>
                    <p className="text-white/80 font-inter">{card.description}</p>
                  </div>
                  <div className="mt-6 text-right">
                    <span className="text-2xl">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </PageContainer>
    </>
  )
}
