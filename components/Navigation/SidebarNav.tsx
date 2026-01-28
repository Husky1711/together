'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

const navItems = [
  { path: '/', icon: '🏠', label: 'Home', name: 'home' },
  { path: '/memories', icon: '💕', label: 'Memories', name: 'memories' },
  { path: '/gallery', icon: '📸', label: 'Gallery', name: 'gallery' },
  { path: '/vision', icon: '✨', label: 'Vision Board', name: 'vision' },
  { path: '/music', icon: '🎵', label: 'Music', name: 'music' },
  { path: '/questions', icon: '❓', label: 'Questions', name: 'questions' },
  { path: '/timeline', icon: '📅', label: 'Timeline', name: 'timeline' },
]

export default function SidebarNav() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-white/95 backdrop-blur-md border-r-2 border-soft-rose/20 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo/Header */}
      <div className="p-6 border-b border-soft-rose/10">
        {!isCollapsed && (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-playfair font-bold text-soft-rose"
          >
            Our Story
          </motion.h2>
        )}
        {isCollapsed && (
          <div className="text-3xl text-center">💕</div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-6 py-4 mx-2 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-soft-rose to-blush-pink text-white shadow-md'
                  : 'text-charcoal hover:bg-soft-rose/10'
              }`}
              prefetch={true}
              scroll={true}
            >
              <span className="text-2xl mr-4">{item.icon}</span>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 border-t border-soft-rose/10 text-soft-gray hover:text-soft-rose transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className="text-2xl">{isCollapsed ? '→' : '←'}</span>
      </button>
    </aside>
  )
}

