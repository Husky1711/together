'use client'

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { Song, Playlist, getSongAudioUrl, getSong, getPlaylist, getPlaylistSongs } from '@/lib/musicStorage'

interface MusicPlayerState {
  // Current song
  currentSong: Song | null
  currentPlaylist: Playlist | null
  playlistSongs: Song[]
  currentIndex: number

  // Playback state
  isPlaying: boolean
  progress: number // 0-100
  volume: number // 0-1
  duration: number

  // Player UI state
  isMinimized: boolean
  isVisible: boolean // false when no song

  // Controls
  shuffle: boolean
  repeat: 'none' | 'one' | 'all'
}

interface MusicPlayerContextType {
  state: MusicPlayerState
  playSong: (song: Song, playlist: Playlist, songs: Song[], index: number) => void
  togglePlay: () => void
  nextSong: () => void
  previousSong: () => void
  setVolume: (volume: number) => void
  setProgress: (progress: number) => void
  toggleMinimize: () => void
  stop: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  audioRef: React.RefObject<HTMLAudioElement>
}

const initialState: MusicPlayerState = {
  currentSong: null,
  currentPlaylist: null,
  playlistSongs: [],
  currentIndex: 0,
  isPlaying: false,
  progress: 0,
  volume: 1,
  duration: 0,
  isMinimized: true,
  isVisible: false,
  shuffle: false,
  repeat: 'none',
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined)

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MusicPlayerState>(initialState)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Load state from localStorage on mount and regenerate blob URLs
  useEffect(() => {
    const restoreState = async () => {
      try {
        const saved = localStorage.getItem('music-player-state')
        if (saved) {
          const parsed = JSON.parse(saved)
          // Only restore if recent (within 24 hours)
          if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            const restoredState = parsed.state
            
            // If there's a current song, fetch it from IndexedDB to get fileData
            if (restoredState.currentSong?.id) {
              try {
                const songFromDB = await getSong(restoredState.currentSong.id)
                if (songFromDB && songFromDB.fileData) {
                  // Regenerate blob URL from fileData
                  const freshAudioUrl = getSongAudioUrl(songFromDB)
                  if (freshAudioUrl) {
                    restoredState.currentSong = {
                      ...songFromDB,
                      audioUrl: freshAudioUrl,
                    }
                  } else {
                    console.error('Failed to regenerate blob URL for restored song')
                    // Clear the song if we can't regenerate the URL
                    restoredState.currentSong = null
                    restoredState.currentPlaylist = null
                    restoredState.playlistSongs = []
                  }
                } else {
                  console.error('Song not found in IndexedDB:', restoredState.currentSong.id)
                  // Clear the song if not found
                  restoredState.currentSong = null
                  restoredState.currentPlaylist = null
                  restoredState.playlistSongs = []
                }
              } catch (error) {
                console.error('Error fetching song from IndexedDB:', error)
                // Clear the song on error
                restoredState.currentSong = null
                restoredState.currentPlaylist = null
                restoredState.playlistSongs = []
              }
            }
            
            // If there's a playlist, fetch it and its songs
            if (restoredState.currentPlaylist?.id) {
              try {
                const playlistFromDB = await getPlaylist(restoredState.currentPlaylist.id)
                if (playlistFromDB) {
                  restoredState.currentPlaylist = playlistFromDB
                  
                  // Fetch playlist songs with fresh blob URLs
                  const songsFromDB = await getPlaylistSongs(playlistFromDB.id)
                  restoredState.playlistSongs = songsFromDB.map(song => ({
                    ...song,
                    audioUrl: getSongAudioUrl(song) || song.audioUrl || '',
                  }))
                }
              } catch (error) {
                console.error('Error fetching playlist from IndexedDB:', error)
              }
            }
            
            setState((prev) => ({
              ...prev,
              ...restoredState,
              isPlaying: false, // Don't auto-play
              isVisible: restoredState.currentSong !== null,
              isMinimized: true, // Always start minimized
            }))
          }
        }
      } catch (error) {
        console.error('Error loading music player state:', error)
      }
    }
    
    restoreState()
  }, [])

  // Save state to localStorage (debounced)
  const saveState = useCallback(
    (() => {
      let timeout: NodeJS.Timeout
      return (newState: MusicPlayerState) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          try {
            localStorage.setItem(
              'music-player-state',
              JSON.stringify({
                state: {
                  ...newState,
                  isPlaying: false, // Don't save playing state
                },
                timestamp: Date.now(),
              })
            )
          } catch (error) {
            console.error('Error saving music player state:', error)
          }
        }, 500) // Debounce 500ms
      }
    })(),
    []
  )

  // Update state and save
  const updateState = useCallback(
    (updates: Partial<MusicPlayerState>) => {
      setState((prev) => {
        const newState = { ...prev, ...updates }
        saveState(newState)
        return newState
      })
    },
    [saveState]
  )

  // Play song
  const playSong = useCallback(
    async (song: Song, playlist: Playlist, songs: Song[], index: number) => {
      // Always regenerate blob URL to ensure it's fresh
      let audioUrl = getSongAudioUrl(song)
      
      // If no URL, try using existing one
      if (!audioUrl && song.audioUrl) {
        audioUrl = song.audioUrl
      }

      if (!audioUrl) {
        console.error('No audio URL available for song:', song)
        alert('Unable to play song. Audio file may be corrupted or missing. Please try re-uploading the song.')
        return
      }

      const songWithUrl = {
        ...song,
        audioUrl,
      }

      updateState({
        currentSong: songWithUrl,
        currentPlaylist: playlist,
        playlistSongs: songs,
        currentIndex: index,
        isPlaying: false, // Set to false first, will be true after play starts
        isVisible: true,
        isMinimized: true,
        progress: 0,
      })

      // Set audio source and play
      if (audioRef.current) {
        try {
          // Clear previous source first
          audioRef.current.pause()
          audioRef.current.src = ''
          audioRef.current.load()
          
          // Small delay to ensure cleanup
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Set new source
          audioRef.current.src = audioUrl
          audioRef.current.volume = state.volume
          audioRef.current.load() // Load the new source
          
          // Wait for audio to be ready
          await new Promise((resolve, reject) => {
            if (!audioRef.current) {
              reject(new Error('Audio element not found'))
              return
            }

            const audio = audioRef.current
            let resolved = false

            const handleCanPlay = () => {
              if (resolved) return
              resolved = true
              audio.removeEventListener('canplay', handleCanPlay)
              audio.removeEventListener('canplaythrough', handleCanPlayThrough)
              audio.removeEventListener('error', handleError)
              audio.removeEventListener('loadstart', handleLoadStart)
              resolve(null)
            }

            const handleCanPlayThrough = () => {
              if (resolved) return
              resolved = true
              audio.removeEventListener('canplay', handleCanPlay)
              audio.removeEventListener('canplaythrough', handleCanPlayThrough)
              audio.removeEventListener('error', handleError)
              audio.removeEventListener('loadstart', handleLoadStart)
              resolve(null)
            }

            const handleError = (e: Event) => {
              if (resolved) return
              resolved = true
              audio.removeEventListener('canplay', handleCanPlay)
              audio.removeEventListener('canplaythrough', handleCanPlayThrough)
              audio.removeEventListener('error', handleError)
              audio.removeEventListener('loadstart', handleLoadStart)
              const error = audio.error
              console.error('Audio load error:', error?.code, error?.message, audioUrl)
              reject(new Error(`Audio load error: ${error?.message || 'Unknown error'}`))
            }

            const handleLoadStart = () => {
              console.log('Audio load started for:', song.title)
            }

            audio.addEventListener('canplay', handleCanPlay)
            audio.addEventListener('canplaythrough', handleCanPlayThrough)
            audio.addEventListener('error', handleError)
            audio.addEventListener('loadstart', handleLoadStart)

            // Timeout after 10 seconds
            setTimeout(() => {
              if (!resolved) {
                resolved = true
                audio.removeEventListener('canplay', handleCanPlay)
                audio.removeEventListener('canplaythrough', handleCanPlayThrough)
                audio.removeEventListener('error', handleError)
                audio.removeEventListener('loadstart', handleLoadStart)
                reject(new Error('Audio load timeout'))
              }
            }, 10000)
          })

          // Now play
          await audioRef.current.play()
          updateState({ isPlaying: true })
          console.log('Successfully started playing:', song.title)
        } catch (error: any) {
          console.error('Error playing audio:', error, { song: song.title, audioUrl })
          updateState({ isPlaying: false, isVisible: false })
          alert(`Unable to play audio: ${error.message || 'Unknown error'}. Please check the file format and try again.`)
        }
      } else {
        console.error('Audio element not found')
        updateState({ isPlaying: false, isVisible: false })
      }
    },
    [state.volume, updateState]
  )

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (!state.currentSong) return

    if (state.isPlaying) {
      audioRef.current?.pause()
      updateState({ isPlaying: false })
    } else {
      // Check if audio element has a valid source
      const audio = audioRef.current
      if (!audio) return
      
      // If no src or src is invalid, regenerate blob URL and set it
      if (!audio.src || audio.src === '' || audio.src.startsWith('blob:') && audio.error) {
        const freshAudioUrl = getSongAudioUrl(state.currentSong)
        if (freshAudioUrl) {
          // Revoke old URL if it exists
          if (audio.src && audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(audio.src)
          }
          
          audio.src = freshAudioUrl
          audio.load()
          
          // Wait for audio to be ready
          try {
            await new Promise((resolve, reject) => {
              const handleCanPlay = () => {
                audio.removeEventListener('canplay', handleCanPlay)
                audio.removeEventListener('error', handleError)
                resolve(null)
              }
              
              const handleError = () => {
                audio.removeEventListener('canplay', handleCanPlay)
                audio.removeEventListener('error', handleError)
                reject(new Error('Audio load error'))
              }
              
              audio.addEventListener('canplay', handleCanPlay)
              audio.addEventListener('error', handleError)
              
              // Timeout after 5 seconds
              setTimeout(() => {
                audio.removeEventListener('canplay', handleCanPlay)
                audio.removeEventListener('error', handleError)
                reject(new Error('Audio load timeout'))
              }, 5000)
            })
          } catch (error) {
            console.error('Error loading audio:', error)
            alert('Unable to play song. Please try selecting it again.')
            return
          }
          
          // Update state with fresh URL
          updateState({
            currentSong: {
              ...state.currentSong,
              audioUrl: freshAudioUrl,
            },
          })
        } else {
          console.error('Failed to regenerate blob URL')
          alert('Unable to play song. Audio file may be corrupted. Please try re-uploading the song.')
          return
        }
      }
      
      // Now play
      try {
        await audio.play()
        updateState({ isPlaying: true })
      } catch (error) {
        console.error('Error playing audio:', error)
        updateState({ isPlaying: false })
      }
    }
  }, [state.currentSong, state.isPlaying, updateState])

  // Next song
  const nextSong = useCallback(() => {
    if (state.playlistSongs.length === 0) return

    let nextIndex: number
    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * state.playlistSongs.length)
    } else {
      nextIndex = (state.currentIndex + 1) % state.playlistSongs.length
    }

    const nextSong = state.playlistSongs[nextIndex]
    playSong(nextSong, state.currentPlaylist!, state.playlistSongs, nextIndex)
  }, [state, playSong])

  // Previous song
  const previousSong = useCallback(() => {
    if (state.playlistSongs.length === 0) return

    let prevIndex: number
    if (state.shuffle) {
      prevIndex = Math.floor(Math.random() * state.playlistSongs.length)
    } else {
      prevIndex = (state.currentIndex - 1 + state.playlistSongs.length) % state.playlistSongs.length
    }

    const prevSong = state.playlistSongs[prevIndex]
    playSong(prevSong, state.currentPlaylist!, state.playlistSongs, prevIndex)
  }, [state, playSong])

  // Set volume
  const setVolume = useCallback(
    (volume: number) => {
      if (audioRef.current) {
        audioRef.current.volume = volume
      }
      updateState({ volume })
    },
    [updateState]
  )

  // Set progress
  const setProgress = useCallback(
    (progress: number) => {
      if (audioRef.current && audioRef.current.duration) {
        audioRef.current.currentTime = (progress / 100) * audioRef.current.duration
      }
      updateState({ progress })
    },
    [updateState]
  )

  // Toggle minimize
  const toggleMinimize = useCallback(() => {
    updateState({ isMinimized: !state.isMinimized })
  }, [state.isMinimized, updateState])

  // Stop
  const stop = useCallback(() => {
    audioRef.current?.pause()
    updateState({
      isPlaying: false,
      isVisible: false,
      currentSong: null,
      currentPlaylist: null,
      playlistSongs: [],
      currentIndex: 0,
      progress: 0,
    })
  }, [updateState])

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    updateState({ shuffle: !state.shuffle })
  }, [state.shuffle, updateState])

  // Toggle repeat
  const toggleRepeat = useCallback(() => {
    const nextRepeat: 'none' | 'one' | 'all' =
      state.repeat === 'none' ? 'one' : state.repeat === 'one' ? 'all' : 'none'
    updateState({ repeat: nextRepeat })
  }, [state.repeat, updateState])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (audio.duration > 0) {
        const progress = (audio.currentTime / audio.duration) * 100
        setState((prev) => ({ ...prev, progress }))
      }
    }

    const handleLoadedMetadata = () => {
      setState((prev) => ({ ...prev, duration: audio.duration }))
    }

    const handleEnded = () => {
      if (state.repeat === 'one') {
        audio.currentTime = 0
        audio.play()
      } else if (state.repeat === 'all' || state.currentIndex < state.playlistSongs.length - 1) {
        nextSong()
      } else {
        stop()
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [state.repeat, state.currentIndex, state.playlistSongs.length, nextSong, stop])

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume
    }
  }, [])

  const value: MusicPlayerContextType = {
    state,
    playSong,
    togglePlay,
    nextSong,
    previousSong,
    setVolume,
    setProgress,
    toggleMinimize,
    stop,
    toggleShuffle,
    toggleRepeat,
    audioRef,
  }

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider')
  }
  return context
}

