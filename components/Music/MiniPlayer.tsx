'use client'

import { motion } from 'framer-motion'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'

export default function MiniPlayer() {
  const { state, togglePlay, nextSong, toggleMinimize, stop } = useMusicPlayer()

  if (!state.currentSong) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = state.duration > 0 ? (state.progress / 100) * state.duration : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={toggleMinimize}
      className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40 md:z-50 safe-area-bottom"
    >
      <div className="glass border-t-2 border-soft-rose/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Thumbnail/Cover Image */}
            {state.currentSong.coverImage ? (
              <img
                src={state.currentSong.coverImage}
                alt={`${state.currentSong.title} cover`}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-soft-rose to-blush-pink flex items-center justify-center text-2xl flex-shrink-0">
                {state.currentPlaylist?.emoji || '🎵'}
              </div>
            )}

            {/* Song Info */}
            <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <p className="font-semibold text-charcoal truncate text-sm">
                {state.currentSong.title}
              </p>
              <p className="text-xs text-soft-gray truncate">
                {state.currentSong.artist}
                {state.duration > 0 && ` • ${formatTime(currentTime)} / ${formatTime(state.duration)}`}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlay()
                }}
                className="w-10 h-10 rounded-full bg-soft-rose text-white hover:bg-blush-pink transition-colors flex items-center justify-center flex-shrink-0"
                aria-label={state.isPlaying ? 'Pause' : 'Play'}
              >
                {state.isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextSong()
                }}
                className="w-10 h-10 rounded-full bg-soft-rose/20 hover:bg-soft-rose/30 text-soft-rose transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Next song"
              >
                ⏭️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  stop()
                }}
                className="w-8 h-8 rounded-full hover:bg-white/20 text-soft-gray transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Stop"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-1 bg-soft-rose/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-soft-rose rounded-full"
              style={{ width: `${state.progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

