'use client'

import { ReactNode } from 'react'
import SidebarNav from './SidebarNav'
import BottomNav from './BottomNav'
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext'
import GlobalMusicPlayer from '@/components/Music/GlobalMusicPlayer'

interface NavigationWrapperProps {
  children: ReactNode
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  return (
    <MusicPlayerProvider>
      <SidebarNav />
      {children}
      <BottomNav />
      <GlobalMusicPlayer />
    </MusicPlayerProvider>
  )
}

