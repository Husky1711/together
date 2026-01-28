'use client'

import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { getSongAudioUrl } from '@/lib/musicStorage'
import MiniPlayer from './MiniPlayer'
import FullPlayer from './FullPlayer'

export default function GlobalMusicPlayer() {
  const { state, audioRef } = useMusicPlayer()

  // Always render audio element (even when hidden) so it's always in DOM
  // Regenerate blob URL if needed (e.g., after page refresh)
  useEffect(() => {
    if (audioRef.current && state.currentSong) {
      const audio = audioRef.current
      let audioUrl = state.currentSong.audioUrl
      
      // If no URL or URL is invalid, regenerate from fileData
      if (!audioUrl || (audioUrl.startsWith('blob:') && audio.error)) {
        const freshUrl = getSongAudioUrl(state.currentSong)
        if (freshUrl) {
          // Revoke old URL if it exists
          if (audio.src && audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(audio.src)
          }
          audioUrl = freshUrl
        }
      }
      
      // Set audio source if URL is valid and different from current
      if (audioUrl && audio.src !== audioUrl) {
        // Revoke old URL if it exists
        if (audio.src && audio.src.startsWith('blob:') && audio.src !== audioUrl) {
          URL.revokeObjectURL(audio.src)
        }
        audio.src = audioUrl
        audio.load()
      }
    }
  }, [state.currentSong, audioRef])

  return (
    <>
      {/* Audio Element - Always present in DOM */}
      <audio ref={audioRef} className="hidden" />

      {/* Mini Player - Visible when playing and minimized */}
      {state.isVisible && state.currentSong && state.isMinimized && (
        <AnimatePresence>
          <MiniPlayer key="mini" />
        </AnimatePresence>
      )}

      {/* Full Player - Visible when playing and expanded */}
      {state.isVisible && state.currentSong && !state.isMinimized && (
        <AnimatePresence>
          <FullPlayer key="full" />
        </AnimatePresence>
      )}
    </>
  )
}

