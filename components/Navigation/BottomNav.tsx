'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', icon: '🏠', label: 'Home', name: 'home' },
  { path: '/memories', icon: '💕', label: 'Memories', name: 'memories' },
  { path: '/gallery', icon: '📸', label: 'Gallery', name: 'gallery' },
  { path: '/vision', icon: '✨', label: 'Vision', name: 'vision' },
  { path: '/music', icon: '🎵', label: 'Music', name: 'music' },
  { path: '/questions', icon: '❓', label: 'Q&A', name: 'questions' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-soft-rose/20 md:hidden">
      <div className="flex justify-around items-center h-16 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative group"
              prefetch={true}
              scroll={true}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-soft-rose' : 'text-soft-gray'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-soft-rose rounded-b-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

