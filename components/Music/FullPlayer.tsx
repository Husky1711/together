'use client'

import { motion } from 'framer-motion'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'

export default function FullPlayer() {
  const {
    state,
    togglePlay,
    nextSong,
    previousSong,
    setVolume,
    setProgress,
    toggleMinimize,
    stop,
    toggleShuffle,
    toggleRepeat,
  } = useMusicPlayer()

  if (!state.currentSong) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = state.duration > 0 ? (state.progress / 100) * state.duration : 0

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setProgress(percentage)
  }

  const playerContent = (
    <div className="flex flex-col h-full">
      {/* Unified Header - Always at Top */}
      <div className="flex items-center justify-between w-full mb-6 md:mb-10 flex-shrink-0">
        <button
          onClick={toggleMinimize}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-soft-rose/20 hover:bg-soft-rose/30 text-soft-rose flex items-center justify-center text-xl md:text-2xl font-bold transition-all hover:scale-110"
          aria-label="Minimize"
        >
          −
        </button>
        <h3 className="text-lg md:text-2xl font-playfair font-semibold text-charcoal">Now Playing</h3>
        <button
          onClick={stop}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-soft-rose/20 hover:bg-soft-rose/30 text-soft-rose flex items-center justify-center text-xl md:text-2xl font-bold transition-all hover:scale-110"
          aria-label="Stop"
        >
          ✕
        </button>
      </div>

      {/* Main Content Area - Side by Side on Desktop */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center md:gap-16 lg:gap-24 min-h-0">
        {/* Left Side: Artwork */}
        <div className="w-full md:w-auto flex flex-col items-center justify-center space-y-6 flex-shrink-0 mb-6 md:mb-0">
          <div className="relative">
            {state.currentSong.coverImage ? (
              <img
                src={state.currentSong.coverImage}
                alt={`${state.currentSong.title} cover`}
                className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-3xl object-cover shadow-lg transition-all duration-300"
              />
            ) : (
              <div
                className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-3xl flex items-center justify-center text-8xl md:text-8xl lg:text-9xl shadow-lg transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${state.currentPlaylist?.color || '#F4A6C1'} 0%, ${state.currentPlaylist?.color || '#E8979D'}80 100%)`,
                }}
              >
                <div className="animate-float">
                  {state.currentPlaylist?.emoji || '🎵'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Info & Controls */}
        <div className="w-full md:flex-1 max-w-xl space-y-6 md:space-y-8 flex flex-col justify-center">
          {/* Song Info */}
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-playfair font-bold text-charcoal line-clamp-2 leading-tight">
              {state.currentSong.title}
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-soft-gray truncate">{state.currentSong.artist}</p>
            {state.currentPlaylist && (
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soft-rose/10 text-sm md:text-base text-soft-gray mt-1">
                <span>{state.currentPlaylist.emoji}</span>
                <span>{state.currentPlaylist.name}</span>
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <div
              className="w-full h-2 md:h-3 bg-soft-rose/20 rounded-full cursor-pointer mb-2 group"
              onClick={handleProgressClick}
            >
              <motion.div
                className="h-full bg-soft-rose rounded-full relative"
                style={{ width: `${state.progress}%` }}
                transition={{ duration: 0.1 }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
            <div className="flex justify-between text-xs md:text-sm text-soft-gray font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(state.duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center md:justify-start gap-4 md:gap-8">
            <button
              onClick={toggleShuffle}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 text-lg md:text-xl ${state.shuffle
                  ? 'bg-soft-rose text-white shadow-md scale-105'
                  : 'bg-soft-rose/10 text-soft-rose hover:bg-soft-rose/20'
                }`}
              aria-label="Shuffle"
            >
              🔀
            </button>
            <button
              onClick={previousSong}
              disabled={state.playlistSongs.length <= 1}
              className="w-14 h-14 rounded-full bg-white border-2 border-soft-rose/20 text-soft-rose hover:bg-soft-rose hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl md:text-2xl shadow-sm hover:shadow-md"
              aria-label="Previous song"
            >
              ⏮️
            </button>
            <button
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-soft-rose to-blush-pink text-white hover:shadow-xl hover:scale-105 transition-all text-4xl flex items-center justify-center shadow-lg"
              aria-label={state.isPlaying ? 'Pause' : 'Play'}
            >
              {state.isPlaying ? '⏸️' : '▶️'}
            </button>
            <button
              onClick={nextSong}
              disabled={state.playlistSongs.length <= 1}
              className="w-14 h-14 rounded-full bg-white border-2 border-soft-rose/20 text-soft-rose hover:bg-soft-rose hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl md:text-2xl shadow-sm hover:shadow-md"
              aria-label="Next song"
            >
              ⏭️
            </button>
            <button
              onClick={toggleRepeat}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 text-lg md:text-xl ${state.repeat !== 'none'
                  ? 'bg-soft-rose text-white shadow-md scale-105'
                  : 'bg-soft-rose/10 text-soft-rose hover:bg-soft-rose/20'
                }`}
              aria-label="Repeat"
            >
              {state.repeat === 'one' ? '🔂' : '🔁'}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4 bg-white/50 p-3 rounded-2xl border border-soft-rose/10">
            <span className="text-soft-gray text-lg">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 min-w-0 h-2 bg-soft-rose/20 rounded-lg appearance-none cursor-pointer accent-soft-rose"
            />
            <span className="text-soft-gray text-sm font-medium w-10 text-right">
              {Math.round(state.volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: Overlay backdrop - Only when not minimized */}
      {!state.isMinimized && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={toggleMinimize} />
      )}

      {/* Desktop: Overlay backdrop - Only when not minimized */}
      {!state.isMinimized && (
        <div className="hidden md:block fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={toggleMinimize} />
      )}

      {/* Mobile: Full Player Overlay */}
      <motion.div
        initial={{ opacity: 0, y: '100%', scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: '100%', scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="md:hidden fixed z-50 bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass border-t-2 border-soft-rose/20 backdrop-blur-md h-full overflow-y-auto rounded-t-3xl">
          <div className="max-w-4xl mx-auto px-6 py-6">{playerContent}</div>
        </div>
      </motion.div>

      {/* Desktop: Overlay Bottom Expanded - Full Width with scroll */}
      <motion.div
        initial={{ opacity: 0, y: '100%', scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: '100%', scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="hidden md:flex fixed z-50 bottom-0 left-64 right-0 justify-center items-end pb-0 safe-area-bottom pointer-events-none"
      >
        {/* Desktop Container Wrapper */}
        <div
          className="w-full max-w-5xl mx-auto px-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="glass border-t-2 border-x-2 border-soft-rose/20 backdrop-blur-md rounded-t-3xl shadow-2xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="w-full px-8 py-8 lg:px-12 lg:py-10">
              {playerContent}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
