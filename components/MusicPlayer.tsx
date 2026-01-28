'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { personalization } from '@/lib/personalization'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import {
    Song,
    Playlist,
    initDB,
    saveSong,
    getAllSongs,
    deleteSong,
    savePlaylist,
    getAllPlaylists,
    deletePlaylist,
    getPlaylistSongs,
    addSongToPlaylist,
    removeSongFromPlaylist,
    checkStorageQuota,
    getTotalStorageUsed,
    getSongAudioUrl,
    fileToSong,
    checkDuplicateInDatabase,
} from '@/lib/musicStorage'
import { createDefaultPlaylists } from '@/lib/musicDefaults'
import { extractAudioMetadata, extractMetadataFromFilename } from '@/lib/audioMetadata'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm']

type ViewMode = 'grid' | 'playlist' | 'upload' | 'create-playlist' | 'library'
type TabMode = 'playlists' | 'songs'

export default function MusicPlayer() {
    const { playSong, state: playerState } = useMusicPlayer()
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [songs, setSongs] = useState<Song[]>([])
    const [currentView, setCurrentView] = useState<ViewMode>('grid')
    const [activeTab, setActiveTab] = useState<TabMode>('playlists')
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
    const [playlistSongs, setPlaylistSongs] = useState<Song[]>([])
    const [highlightedSongId, setHighlightedSongId] = useState<string | null>(null)
    const [toastMessage, setToastMessage] = useState<{ message: string; playlists: string[] } | null>(null)
    const [storageInfo, setStorageInfo] = useState({ used: 0, quota: 0, percentage: 0, available: 0 })
    const [showStorageWarning, setShowStorageWarning] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    // Form states
    const [newPlaylistName, setNewPlaylistName] = useState('')
    const [newPlaylistEmoji, setNewPlaylistEmoji] = useState('💕')
    const [newPlaylistColor, setNewPlaylistColor] = useState('#F4A6C1')
    const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
    const [newPlaylistCoverImage, setNewPlaylistCoverImage] = useState<string | null>(null)
    const [newPlaylistCoverFile, setNewPlaylistCoverFile] = useState<File | null>(null)
    const [playlistCoverType, setPlaylistCoverType] = useState<'emoji' | 'image' | 'color'>('emoji')
    const [playlistCoverErrors, setPlaylistCoverErrors] = useState<string | null>(null)
    const [uploadSongTitle, setUploadSongTitle] = useState('')
    const [uploadSongArtist, setUploadSongArtist] = useState('')
    const [uploadSongFile, setUploadSongFile] = useState<File | null>(null)
    const [selectedPlaylistsForUpload, setSelectedPlaylistsForUpload] = useState<string[]>([])
    const [uploadAuthor, setUploadAuthor] = useState<'you' | 'her'>('you')
    const [extractedCoverImage, setExtractedCoverImage] = useState<string | null>(null)
    const [isExtractingMetadata, setIsExtractingMetadata] = useState(false)
    const [uploadErrors, setUploadErrors] = useState<{
        file?: string
        title?: string
        artist?: string
        general?: string
    }>({})

    // Initialize database and load data
    useEffect(() => {
        async function loadData() {
            try {
                await initDB()
                const [loadedPlaylists, loadedSongs] = await Promise.all([
                    getAllPlaylists(),
                    getAllSongs(),
                ])

                // Create default playlists if none exist
                if (loadedPlaylists.length === 0) {
                    const defaults = createDefaultPlaylists()
                    for (const playlist of defaults) {
                        await savePlaylist(playlist)
                    }
                    setPlaylists(defaults)
                } else {
                    setPlaylists(loadedPlaylists)
                }

                // Ensure all songs have audio URLs
                const songsWithUrls = loadedSongs.map((song) => {
                    if (!song.audioUrl) {
                        const audioUrl = getSongAudioUrl(song)
                        return { ...song, audioUrl }
                    }
                    return song
                })
                setSongs(songsWithUrls)

                // Clean up orphaned song IDs from playlists (songs that were deleted)
                const songIdsSet = new Set(songsWithUrls.map(song => song.id))
                let playlistsUpdated = false
                const cleanedPlaylists = []
                for (const playlist of loadedPlaylists) {
                    const validSongIds = playlist.songIds.filter(id => songIdsSet.has(id))
                    if (validSongIds.length !== playlist.songIds.length) {
                        // Update playlist with only valid song IDs
                        const updatedPlaylist = { ...playlist, songIds: validSongIds }
                        await savePlaylist(updatedPlaylist)
                        cleanedPlaylists.push(updatedPlaylist)
                        playlistsUpdated = true
                    } else {
                        cleanedPlaylists.push(playlist)
                    }
                }

                // Update playlists state (use cleaned version if any were updated)
                setPlaylists(playlistsUpdated ? cleanedPlaylists : loadedPlaylists)

                // Check storage quota
                const quota = await checkStorageQuota()
                setStorageInfo({ ...quota, available: quota.quota - quota.used })
                if (quota.percentage > 80) {
                    setShowStorageWarning(true)
                }
            } catch (error) {
                console.error('Error loading music data:', error)
            }
        }
        loadData()
    }, [])

    // Update storage info when songs change
    useEffect(() => {
        async function updateStorage() {
            const quota = await checkStorageQuota()
            setStorageInfo({ ...quota, available: quota.quota - quota.used })
            if (quota.percentage > 80) {
                setShowStorageWarning(true)
            }
        }
        updateStorage()
    }, [songs])

    // Load playlist songs when playlist is selected
    useEffect(() => {
        async function loadPlaylistSongs() {
            if (selectedPlaylist) {
                const playlistSongsList = await getPlaylistSongs(selectedPlaylist.id)
                // Ensure all songs have audio URLs (regenerate blob URLs if needed)
                const songsWithUrls = playlistSongsList.map((song) => {
                    if (!song.audioUrl) {
                        const audioUrl = getSongAudioUrl(song)
                        return { ...song, audioUrl }
                    }
                    return song
                })
                setPlaylistSongs(songsWithUrls)

                // Clean up orphaned song IDs (songs that were deleted but IDs still in playlist)
                if (playlistSongsList.length !== selectedPlaylist.songIds.length) {
                    const validSongIds = playlistSongsList.map(song => song.id)
                    const updatedPlaylist = {
                        ...selectedPlaylist,
                        songIds: validSongIds
                    }
                    await savePlaylist(updatedPlaylist)
                    // Update the playlist in state
                    setPlaylists(playlists.map(p => p.id === selectedPlaylist.id ? updatedPlaylist : p))
                    setSelectedPlaylist(updatedPlaylist)
                }
            }
        }
        loadPlaylistSongs()
    }, [selectedPlaylist, songs])

    // Handle song selection - use global player
    const handleSongSelect = (song: Song, index: number) => {
        if (selectedPlaylist) {
            // Ensure audio URL is available
            const songWithUrl = {
                ...song,
                audioUrl: song.audioUrl || getSongAudioUrl(song),
            }
            playSong(songWithUrl, selectedPlaylist, playlistSongs, index)
        }
    }

    // Playlist operations
    // Handle playlist cover image upload
    const handlePlaylistCoverImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setPlaylistCoverErrors(null)

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setPlaylistCoverErrors('Please select a valid image file (JPG, PNG, GIF, etc.)')
            return
        }

        // Validate file size (5MB max)
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
        if (file.size > MAX_IMAGE_SIZE) {
            setPlaylistCoverErrors('Image is too large. Maximum size is 5MB. Please compress the image.')
            return
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onload = (event) => {
            const base64String = event.target?.result as string
            setNewPlaylistCoverImage(base64String)
            setNewPlaylistCoverFile(file)
            setPlaylistCoverType('image')
        }
        reader.onerror = () => {
            setPlaylistCoverErrors('Failed to read image file. Please try again.')
        }
        reader.readAsDataURL(file)
    }

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return

        const newPlaylist: Playlist = {
            id: `playlist-${Date.now()}`,
            name: newPlaylistName,
            description: newPlaylistDescription,
            emoji: playlistCoverType === 'emoji' ? newPlaylistEmoji : undefined,
            color: playlistCoverType === 'color' ? newPlaylistColor : undefined,
            coverImage: playlistCoverType === 'image' ? (newPlaylistCoverImage || undefined) : undefined,
            createdAt: Date.now(),
            createdBy: uploadAuthor,
            songIds: [],
        }

        await savePlaylist(newPlaylist)
        setPlaylists([...playlists, newPlaylist])
        setNewPlaylistName('')
        setNewPlaylistDescription('')
        setNewPlaylistEmoji('💕')
        setNewPlaylistColor('#F4A6C1')
        setNewPlaylistCoverImage(null)
        setNewPlaylistCoverFile(null)
        setPlaylistCoverType('emoji')
        setPlaylistCoverErrors(null)
        setCurrentView('grid')
    }

    const handleDeletePlaylist = async (id: string) => {
        if (confirm('Are you sure you want to delete this playlist? Songs will not be deleted.')) {
            await deletePlaylist(id)
            setPlaylists(playlists.filter((p) => p.id !== id))
            if (selectedPlaylist?.id === id) {
                setSelectedPlaylist(null)
                setCurrentView('grid')
            }
        }
    }

    const handleOpenPlaylist = async (playlist: Playlist) => {
        setSelectedPlaylist(playlist)
        setCurrentView('playlist')
    }

    // File processing logic
    const processFile = async (file: File) => {
        setUploadErrors({})
        const errors: typeof uploadErrors = {}

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|m4a|wav|ogg|webm)$/i)) {
            errors.file = 'Please select a valid audio file (MP3, M4A, WAV, OGG, or WebM)'
            setUploadErrors(errors)
            return
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            errors.file = `File is too large. Maximum size is 15MB. Please compress the file.`
            setUploadErrors(errors)
            return
        }

        // Check storage quota
        if (storageInfo.available < file.size) {
            errors.file = 'Not enough storage space. Please delete some songs or free up space.'
            setUploadErrors(errors)
            return
        }

        // Check for duplicate file in database (database-first validation)
        // Note: We can't check title/artist here since they're not entered yet
        // This is a preliminary check based on file size and filename
        // Full duplicate check happens in handleUploadSong after metadata is entered
        const allSongsFromDB = await getAllSongs()
        const fileNameNormalized = file.name.toLowerCase().trim()
        const fileNameWithoutExt = fileNameNormalized.replace(/\.[^/.]+$/, '')
        
        const isDuplicateFile = allSongsFromDB.some(
            (song) => {
                if (song.fileSize === file.size) {
                    const songTitleNormalized = song.title.toLowerCase().trim()
                    return fileNameWithoutExt === songTitleNormalized ||
                        fileNameNormalized.includes(songTitleNormalized) ||
                        songTitleNormalized.includes(fileNameWithoutExt)
                }
                return false
            }
        )
        if (isDuplicateFile) {
            errors.file = 'This exact file has already been uploaded (same file size detected). You can add the existing song to multiple playlists without re-uploading.'
            setUploadErrors(errors)
            return
        }

        // Validate file is not empty
        if (file.size === 0) {
            errors.file = 'File is empty. Please select a valid audio file.'
            setUploadErrors(errors)
            return
        }

        setUploadSongFile(file)
        setIsExtractingMetadata(true)
        setExtractedCoverImage(null)
        setUploadErrors({})

        try {
            // Try to extract metadata from the file
            const metadata = await extractAudioMetadata(file)

            if (metadata) {
                if (metadata.title) setUploadSongTitle(metadata.title)
                if (metadata.artist) setUploadSongArtist(metadata.artist)
                if (metadata.coverImage) setExtractedCoverImage(metadata.coverImage)
            } else {
                const filenameMetadata = extractMetadataFromFilename(file.name)
                if (filenameMetadata.title) setUploadSongTitle(filenameMetadata.title)
                if (filenameMetadata.artist) setUploadSongArtist(filenameMetadata.artist)
            }
        } catch (error) {
            console.warn('Error extracting metadata:', error)
            const filenameMetadata = extractMetadataFromFilename(file.name)
            if (filenameMetadata.title) setUploadSongTitle(filenameMetadata.title)
            if (filenameMetadata.artist) setUploadSongArtist(filenameMetadata.artist)
        } finally {
            setIsExtractingMetadata(false)
        }
    }

    // File upload with metadata extraction
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            await processFile(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            await processFile(file)
        }
    }


    const handleUploadSong = async () => {
        setUploadErrors({})
        const errors: typeof uploadErrors = {}

        // Validate file is selected
        if (!uploadSongFile) {
            errors.file = 'Please select an audio file'
            setUploadErrors(errors)
            return
        }

        // Validate and sanitize title
        const sanitizedTitle = uploadSongTitle.trim()
        if (!sanitizedTitle) {
            errors.title = 'Song title is required'
        } else if (sanitizedTitle.length > 100) {
            errors.title = 'Song title must be 100 characters or less'
        } else if (sanitizedTitle.length < 1) {
            errors.title = 'Song title is too short'
        }

        // Validate and sanitize artist
        const sanitizedArtist = uploadSongArtist.trim()
        if (!sanitizedArtist) {
            errors.artist = 'Artist name is required'
        } else if (sanitizedArtist.length > 100) {
            errors.artist = 'Artist name must be 100 characters or less'
        } else if (sanitizedArtist.length < 1) {
            errors.artist = 'Artist name is too short'
        }

        // CRITICAL: Check for duplicate file in DATABASE (not React state)
        // This is the source of truth check to prevent duplicate uploads
        // Database-first validation ensures we catch duplicates even if state is stale
        const duplicateCheck = await checkDuplicateInDatabase(
            uploadSongFile,
            sanitizedTitle,
            sanitizedArtist
        )
        
        if (duplicateCheck.isDuplicate && duplicateCheck.duplicateSong) {
            errors.file = duplicateCheck.reason || 'This file has already been uploaded. You can add the existing song to multiple playlists without re-uploading.'
            setUploadErrors(errors)
            return
        }

        // Check for duplicate song in selected playlists (prevent same song in same playlist)
        if (selectedPlaylistsForUpload.length > 0) {
            const allSongsInSelectedPlaylists = await Promise.all(
                selectedPlaylistsForUpload.map(playlistId => getPlaylistSongs(playlistId))
            )
            const duplicatePlaylists: string[] = []

            for (let i = 0; i < selectedPlaylistsForUpload.length; i++) {
                const playlistId = selectedPlaylistsForUpload[i]
                const playlistSongs = allSongsInSelectedPlaylists[i]
                const isDuplicate = playlistSongs.some(
                    (song) => song.title.toLowerCase().trim() === sanitizedTitle.toLowerCase() &&
                        song.artist.toLowerCase().trim() === sanitizedArtist.toLowerCase()
                )
                if (isDuplicate) {
                    const playlist = playlists.find(p => p.id === playlistId)
                    duplicatePlaylists.push(playlist?.name || playlistId)
                }
            }

            if (duplicatePlaylists.length > 0) {
                errors.general = `This song is already in the following playlist(s): ${duplicatePlaylists.join(', ')}. Please uncheck them or select different playlists.`
                setUploadErrors(errors)
                return
            }
        }

        if (Object.keys(errors).length > 0) {
            setUploadErrors(errors)
            return
        }

        setIsUploading(true)
        setUploadProgress(0)
        setUploadErrors({})

        try {
            // Validate audio file is playable
            try {
                const testAudio = new Audio()
                const testUrl = URL.createObjectURL(uploadSongFile)
                testAudio.src = testUrl

                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Audio file validation timeout'))
                    }, 5000)

                    testAudio.addEventListener('loadedmetadata', () => {
                        clearTimeout(timeout)
                        URL.revokeObjectURL(testUrl)
                        resolve(null)
                    })

                    testAudio.addEventListener('error', (e) => {
                        clearTimeout(timeout)
                        URL.revokeObjectURL(testUrl)
                        reject(new Error('Invalid or corrupted audio file'))
                    })

                    testAudio.load()
                })
            } catch (error) {
                setUploadErrors({ general: 'Invalid or corrupted audio file. Please select a valid audio file.' })
                setIsUploading(false)
                return
            }

            // Convert file to song format (with cover image if extracted)
            const newSong = await fileToSong(
                uploadSongFile,
                sanitizedTitle,
                sanitizedArtist,
                uploadAuthor,
                selectedPlaylistsForUpload,
                undefined, // notes
                extractedCoverImage || undefined // cover image
            )

            // Get audio duration
            if (newSong.audioUrl) {
                const audio = new Audio(newSong.audioUrl)
                await new Promise((resolve) => {
                    audio.addEventListener('loadedmetadata', () => {
                        newSong.duration = audio.duration
                        resolve(null)
                    })
                    audio.load()
                })
            }

            await saveSong(newSong)
            setSongs([...songs, newSong])

            // Add to selected playlists
            for (const playlistId of selectedPlaylistsForUpload) {
                await addSongToPlaylist(newSong.id, playlistId)
            }

            // Update playlists
            const updatedPlaylists = await getAllPlaylists()
            setPlaylists(updatedPlaylists)

            // Get playlist names for toast
            const addedToPlaylists = updatedPlaylists
                .filter(p => selectedPlaylistsForUpload.includes(p.id))
                .map(p => p.name)

            // Show success toast
            if (addedToPlaylists.length > 0) {
                setToastMessage({
                    message: `Song uploaded successfully!`,
                    playlists: addedToPlaylists
                })
                // Auto-hide toast after 5 seconds
                setTimeout(() => setToastMessage(null), 5000)
            }

            // Reset form
            setUploadSongTitle('')
            setUploadSongArtist('')
            setUploadSongFile(null)
            setSelectedPlaylistsForUpload([])
            setUploadAuthor('you')
            setExtractedCoverImage(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

            // Redirect to "All Songs" view and highlight the new song
            setActiveTab('songs')
            setCurrentView('library')
            setHighlightedSongId(newSong.id)
            // Remove highlight after 3 seconds
            setTimeout(() => setHighlightedSongId(null), 3000)
        } catch (error) {
            console.error('Error uploading song:', error)
            setUploadErrors({
                general: error instanceof Error ? error.message : 'Error uploading song. Please try again.'
            })
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const handleDeleteSong = async (songId: string) => {
        if (confirm('Are you sure you want to delete this song?')) {
            await deleteSong(songId)
            setSongs(songs.filter((s) => s.id !== songId))
            if (selectedPlaylist) {
                const updatedSongs = await getPlaylistSongs(selectedPlaylist.id)
                setPlaylistSongs(updatedSongs)
            }
        }
    }

    // Generate playlist cover (supports image, emoji, or color)
    const generatePlaylistCover = (playlist: Playlist) => {
        if (playlist.coverImage) {
            return `url(${playlist.coverImage})`
        }
        return `linear-gradient(135deg, ${playlist.color || '#F4A6C1'} 0%, ${playlist.color || '#E8979D'}80 100%)`
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / 1024 / 1024).toFixed(1) + ' MB'
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Storage Warning */}
            <AnimatePresence>
                {showStorageWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 glass rounded-2xl p-4 border-2 border-soft-rose/50"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-charcoal">Storage Almost Full</p>
                                <p className="text-sm text-soft-gray">
                                    {storageInfo.percentage.toFixed(1)}% used ({formatFileSize(storageInfo.used)} / {formatFileSize(storageInfo.quota)})
                                </p>
                            </div>
                            <button
                                onClick={() => setShowStorageWarning(false)}
                                className="text-soft-gray hover:text-charcoal"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        className="fixed top-4 sm:top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
                    >
                        <div className="glass rounded-2xl p-4 border-2 border-soft-rose/50 shadow-2xl">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <p className="font-semibold text-charcoal mb-1">✅ {toastMessage.message}</p>
                                    {toastMessage.playlists.length > 0 && (
                                        <div className="text-sm text-soft-gray">
                                            <span>Added to: </span>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {toastMessage.playlists.map((name, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            const playlist = playlists.find(p => p.name === name)
                                                            if (playlist) {
                                                                setActiveTab('playlists')
                                                                setCurrentView('playlist')
                                                                setSelectedPlaylist(playlist)
                                                                setToastMessage(null)
                                                            }
                                                        }}
                                                        className="px-2 py-1 rounded-lg bg-soft-rose/20 hover:bg-soft-rose/30 text-soft-rose font-medium transition-colors"
                                                    >
                                                        {name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setToastMessage(null)}
                                    className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full text-soft-gray hover:text-charcoal hover:bg-soft-rose/10 active:bg-soft-rose/20 flex items-center justify-center transition-colors"
                                    aria-label="Close notification"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Controls */}
            {(currentView === 'grid' || currentView === 'library') && (
                <div className="space-y-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="inline-block">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-charcoal">
                                    🎵 Our Music Library
                                </h2>
                                <p className="text-xs sm:text-sm md:text-base text-soft-gray mt-1 text-right">
                                    Songs that remind us of each other
                                </p>
                            </div>
                        </div>
                        
                        {/* Mobile: Card Style Buttons */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:hidden">
                            <motion.button
                                onClick={() => setCurrentView('create-playlist')}
                                whileTap={{ scale: 0.97 }}
                                className="group relative overflow-hidden glass rounded-2xl p-4 sm:p-5 border-2 border-soft-rose/20 hover:border-soft-rose/40 transition-all active:scale-[0.98]"
                                aria-label="Create Playlist"
                            >
                                {/* Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-soft-rose/10 to-blush-pink/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative flex flex-col items-center gap-2 sm:gap-3">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-soft-rose to-blush-pink flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                                        <span className="text-xl sm:text-2xl">➕</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs sm:text-sm font-semibold text-charcoal group-hover:text-soft-rose transition-colors leading-tight">
                                            Create Playlist
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                            
                            <motion.button
                                onClick={() => setCurrentView('upload')}
                                whileTap={{ scale: 0.97 }}
                                className="group relative overflow-hidden glass rounded-2xl p-4 sm:p-5 border-2 border-blush-pink/20 hover:border-blush-pink/40 transition-all active:scale-[0.98]"
                                aria-label="Upload Song"
                            >
                                {/* Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blush-pink/10 to-soft-rose/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative flex flex-col items-center gap-2 sm:gap-3">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blush-pink to-soft-rose flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                                        <span className="text-xl sm:text-2xl">📤</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs sm:text-sm font-semibold text-charcoal group-hover:text-blush-pink transition-colors leading-tight">
                                            Upload Song
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        </div>

                        {/* Desktop: Horizontal Elegant Buttons */}
                        <div className="hidden md:flex items-center gap-3 lg:gap-4">
                            <motion.button
                                onClick={() => setCurrentView('create-playlist')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center gap-3 px-5 lg:px-6 py-3 lg:py-3.5 rounded-xl bg-gradient-to-r from-soft-rose to-blush-pink text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                aria-label="Create Playlist"
                            >
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <span className="text-lg">➕</span>
                                </div>
                                <span className="text-sm lg:text-base">Create Playlist</span>
                            </motion.button>
                            
                            <motion.button
                                onClick={() => setCurrentView('upload')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center gap-3 px-5 lg:px-6 py-3 lg:py-3.5 rounded-xl bg-gradient-to-r from-blush-pink to-soft-rose text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                aria-label="Upload Song"
                            >
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <span className="text-lg">📤</span>
                                </div>
                                <span className="text-sm lg:text-base">Upload Song</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-1 sm:gap-2 border-b-2 border-soft-rose/20">
                        <button
                            onClick={() => {
                                setActiveTab('playlists')
                                setCurrentView('grid')
                            }}
                            className={`min-h-[44px] flex-1 sm:flex-none px-4 sm:px-6 py-3 font-semibold transition-colors relative text-sm sm:text-base ${activeTab === 'playlists'
                                ? 'text-soft-rose'
                                : 'text-soft-gray hover:text-charcoal'
                                }`}
                        >
                            Playlists
                            {activeTab === 'playlists' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-soft-rose"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('songs')
                                setCurrentView('library')
                            }}
                            className={`min-h-[44px] flex-1 sm:flex-none px-4 sm:px-6 py-3 font-semibold transition-colors relative text-sm sm:text-base ${activeTab === 'songs'
                                ? 'text-soft-rose'
                                : 'text-soft-gray hover:text-charcoal'
                                }`}
                        >
                            All Songs ({songs.length})
                            {activeTab === 'songs' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-soft-rose"
                                />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* All Songs Library View */}
            {currentView === 'library' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    {songs.length === 0 ? (
                        <div className="glass rounded-3xl p-12 text-center">
                            <p className="text-soft-gray text-lg mb-4">No songs uploaded yet</p>
                            <button
                                onClick={() => setCurrentView('upload')}
                                className="min-h-[44px] px-6 py-3 rounded-xl bg-soft-rose text-white font-semibold hover:bg-blush-pink active:bg-blush-pink/90 transition-colors"
                            >
                                Upload Your First Song
                            </button>
                        </div>
                    ) : (
                        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2 sm:space-y-3">
                            {songs.map((song, index) => (
                                <motion.div
                                    key={song.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: highlightedSongId === song.id ? [1, 1.02, 1] : 1
                                    }}
                                    transition={{
                                        delay: index * 0.03,
                                        scale: highlightedSongId === song.id ? { duration: 0.5, repeat: 2 } : {}
                                    }}
                                    className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${highlightedSongId === song.id
                                        ? 'bg-soft-rose text-white shadow-lg ring-4 ring-soft-rose/50'
                                        : playerState.currentSong?.id === song.id
                                            ? 'bg-soft-rose/20 text-charcoal'
                                            : 'bg-white active:bg-soft-rose/10'
                                        }`}
                                    onClick={() => {
                                        // Find which playlist(s) contain this song
                                        const containingPlaylists = playlists.filter(p => p.songIds.includes(song.id))
                                        
                                        if (containingPlaylists.length > 0) {
                                            // Play from first playlist
                                            const firstPlaylist = containingPlaylists[0]
                                            const playlistSongsList = songs.filter(s => firstPlaylist.songIds.includes(s.id))
                                            const songIndex = playlistSongsList.findIndex(s => s.id === song.id)
                                            if (songIndex !== -1) {
                                                playSong(song, firstPlaylist, playlistSongsList, songIndex)
                                            }
                                        } else {
                                            // Song is not in any playlist - create a temporary "All Songs" playlist
                                            const allSongsPlaylist: Playlist = {
                                                id: 'all-songs-temp',
                                                name: 'All Songs',
                                                emoji: '🎵',
                                                description: 'All uploaded songs',
                                                color: '#F4A6C1',
                                                songIds: songs.map(s => s.id),
                                                createdAt: Date.now(),
                                                createdBy: 'you' // Temporary playlist for playing songs not in any playlist
                                            }
                                            const songIndex = songs.findIndex(s => s.id === song.id)
                                            if (songIndex !== -1) {
                                                playSong(song, allSongsPlaylist, songs, songIndex)
                                            }
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                                        {/* Left: Cover & Info */}
                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                            {/* Cover Image or Placeholder */}
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-soft-rose to-blush-pink flex items-center justify-center">
                                                {song.coverImage ? (
                                                    <img
                                                        src={song.coverImage}
                                                        alt={song.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xl sm:text-2xl">🎵</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p
                                                        className={`font-semibold truncate flex-1 ${highlightedSongId === song.id || playerState.currentSong?.id === song.id
                                                            ? 'text-white'
                                                            : 'text-charcoal'
                                                            }`}
                                                    >
                                                        {song.title}
                                                    </p>
                                                    {playerState.currentSong?.id === song.id && (
                                                        <span className="text-lg sm:text-xl flex-shrink-0">🎵</span>
                                                    )}
                                                    {highlightedSongId === song.id && (
                                                        <span className="text-xs sm:text-sm flex-shrink-0">✨ New</span>
                                                    )}
                                                </div>
                                                <p
                                                    className={`text-xs sm:text-sm truncate ${highlightedSongId === song.id || playerState.currentSong?.id === song.id
                                                        ? 'text-white/80'
                                                        : 'text-soft-gray'
                                                        }`}
                                                >
                                                    {song.artist}
                                                    {song.duration && ` • ${formatTime(song.duration)}`}
                                                </p>
                                                {/* Show which playlists contain this song */}
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {playlists
                                                        .filter(p => p.songIds.includes(song.id))
                                                        .map(playlist => (
                                                            <button
                                                                key={playlist.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setActiveTab('playlists')
                                                                    setCurrentView('playlist')
                                                                    setSelectedPlaylist(playlist)
                                                                }}
                                                                className={`text-xs px-2 py-0.5 rounded-full transition-colors min-h-[20px] ${highlightedSongId === song.id || playerState.currentSong?.id === song.id
                                                                    ? 'bg-white/20 active:bg-white/30 text-white'
                                                                    : 'bg-soft-rose/20 active:bg-soft-rose/30 text-soft-rose'
                                                                    }`}
                                                            >
                                                                {playlist.emoji} {playlist.name}
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Delete Button */}
                                        <div className="flex items-center flex-shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteSong(song.id)
                                                }}
                                                className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-colors text-lg ${highlightedSongId === song.id || playerState.currentSong?.id === song.id
                                                    ? 'bg-white/10 hover:bg-white/20 text-white active:bg-white/30'
                                                    : 'bg-soft-rose/10 hover:bg-soft-rose/20 text-charcoal active:bg-soft-rose/30'
                                                    }`}
                                                aria-label="Delete song"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Playlist List View (Replaces Grid) */}
            {currentView === 'grid' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                >
                    {playlists.length === 0 ? (
                        <div className="glass rounded-3xl p-12 text-center">
                            <p className="text-soft-gray text-lg mb-4">No playlists yet</p>
                            <button
                                onClick={() => setCurrentView('create-playlist')}
                                className="min-h-[44px] px-6 py-3 rounded-xl bg-soft-rose text-white font-semibold hover:bg-blush-pink active:bg-blush-pink/90 transition-colors"
                            >
                                Create Your First Playlist
                            </button>
                        </div>
                    ) : (
                        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2 sm:space-y-3">
                            {playlists.map((playlist, index) => {
                                // Calculate actual songs count
                                const songCount = songs.filter(song => playlist.songIds.includes(song.id)).length

                                return (
                                    <motion.div
                                        key={playlist.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleOpenPlaylist(playlist)}
                                        className="p-4 sm:p-5 rounded-xl cursor-pointer transition-all bg-white hover:bg-soft-rose/10 active:bg-soft-rose/20"
                                    >
                                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                                            {/* Left: Icon & Info */}
                                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                {/* Improved Icon Container */}
                                                <div
                                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl sm:text-3xl shadow-sm bg-cover bg-center"
                                                    style={{ 
                                                        backgroundImage: playlist.coverImage ? `url(${playlist.coverImage})` : undefined,
                                                        background: playlist.coverImage ? undefined : generatePlaylistCover(playlist)
                                                    }}
                                                >
                                                    {!playlist.coverImage && (playlist.emoji || '🎵')}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-charcoal truncate text-base sm:text-lg">
                                                        {playlist.name}
                                                    </h3>
                                                    {playlist.description && (
                                                        <p className="text-xs sm:text-sm text-soft-gray mt-1.5 sm:mt-1 mb-1.5 sm:mb-0 line-clamp-1 sm:line-clamp-2">
                                                            {playlist.description}
                                                        </p>
                                                    )}
                                                    {/* Mobile: Stacked metadata, Desktop: Inline */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-soft-gray mt-1">
                                                        <span>{songCount} {songCount === 1 ? 'song' : 'songs'}</span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span>Created by {playlist.createdBy === 'you' ? personalization.yourName : personalization.herName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Actions */}
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <span className="text-soft-gray text-xl sm:text-2xl">
                                                    →
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeletePlaylist(playlist.id)
                                                    }}
                                                    className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-soft-rose/10 hover:bg-soft-rose/20 active:bg-soft-rose/30 text-soft-gray hover:text-red-500 active:text-red-600 flex items-center justify-center transition-colors"
                                                    title="Delete Playlist"
                                                    aria-label="Delete playlist"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Playlist Detail View */}
            {currentView === 'playlist' && selectedPlaylist && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    {/* Playlist Header */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <button
                            onClick={() => {
                                setCurrentView('grid')
                                setSelectedPlaylist(null)
                            }}
                            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-soft-rose/20 hover:bg-soft-rose/30 active:bg-soft-rose/40 text-soft-rose flex items-center justify-center text-lg"
                            aria-label="Back to playlists"
                        >
                            ←
                        </button>
                        <div
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex items-center justify-center text-2xl sm:text-4xl flex-shrink-0 bg-cover bg-center"
                            style={{ 
                                backgroundImage: selectedPlaylist.coverImage ? `url(${selectedPlaylist.coverImage})` : undefined,
                                background: selectedPlaylist.coverImage ? undefined : generatePlaylistCover(selectedPlaylist)
                            }}
                        >
                            {!selectedPlaylist.coverImage && (selectedPlaylist.emoji || '🎵')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-playfair font-bold text-charcoal truncate">
                                {selectedPlaylist.name}
                            </h2>
                            {selectedPlaylist.description && (
                                <p className="text-xs sm:text-sm text-soft-gray mt-1">
                                    {selectedPlaylist.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-soft-gray mt-1">
                                <span>{playlistSongs.length} {playlistSongs.length === 1 ? 'song' : 'songs'}</span>
                                <span>•</span>
                                <span>Created by {selectedPlaylist.createdBy === 'you' ? personalization.yourName : personalization.herName}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setCurrentView('upload')}
                            className="min-h-[44px] min-w-[44px] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-soft-rose text-white font-semibold hover:bg-blush-pink active:bg-blush-pink/90 transition-colors flex items-center justify-center flex-shrink-0"
                            aria-label="Add Song"
                            title="Add Song"
                        >
                            <span className="text-xl sm:text-2xl">📤</span>
                            <span className="hidden lg:inline ml-2 text-sm">Add Song</span>
                        </button>
                    </div>

                    {/* Song List */}
                    {playlistSongs.length === 0 ? (
                        <div className="glass rounded-3xl p-12 text-center">
                            <p className="text-soft-gray text-lg mb-4">No songs in this playlist yet</p>
                            <button
                                onClick={() => setCurrentView('upload')}
                                className="min-h-[44px] px-6 py-3 rounded-xl bg-soft-rose text-white font-semibold hover:bg-blush-pink active:bg-blush-pink/90 transition-colors"
                            >
                                Add Your First Song
                            </button>
                        </div>
                    ) : (
                        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2 sm:space-y-3">
                            {playlistSongs.map((song, index) => (
                                <motion.div
                                    key={song.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleSongSelect(song, index)}
                                    className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${playerState.currentSong?.id === song.id
                                        ? 'bg-soft-rose text-white'
                                        : 'bg-white active:bg-soft-rose/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                                        {/* Left: Song Info */}
                                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p
                                                        className={`font-semibold truncate flex-1 ${playerState.currentSong?.id === song.id ? 'text-white' : 'text-charcoal'
                                                            }`}
                                                    >
                                                        {song.title}
                                                    </p>
                                                    {playerState.currentSong?.id === song.id && (
                                                        <span className="text-lg sm:text-xl flex-shrink-0">🎵</span>
                                                    )}
                                                </div>
                                                <p
                                                    className={`text-xs sm:text-sm truncate ${playerState.currentSong?.id === song.id ? 'text-white/80' : 'text-soft-gray'
                                                        }`}
                                                >
                                                    {song.artist}
                                                    {song.duration && ` • ${formatTime(song.duration)}`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Delete Button */}
                                        <div className="flex items-center flex-shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteSong(song.id)
                                                }}
                                                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-lg"
                                                aria-label="Delete song"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Upload Song View - Senior Premium Design */}
            {currentView === 'upload' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full"
                >
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <button
                            onClick={() => {
                                if (selectedPlaylist) {
                                    setCurrentView('playlist')
                                } else if (activeTab === 'songs') {
                                    setCurrentView('library')
                                } else {
                                    setCurrentView('grid')
                                }
                            }}
                            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/50 hover:bg-white active:bg-white/80 text-soft-rose border-2 border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-sm hover:shadow-lg text-lg"
                            aria-label="Go back"
                        >
                            ←
                        </button>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-r from-charcoal via-soft-rose to-blush-pink">
                                Upload New Song
                            </h2>
                            <p className="text-xs sm:text-sm text-soft-gray mt-1 font-medium">Add a new memory to your collection 🎵</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Left Column - Hero Drop Zone */}
                        <div className="lg:col-span-7">
                            <motion.div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                animate={{
                                    scale: isDragging ? 1.02 : 1,
                                    borderColor: isDragging ? '#F4A6C1' : 'rgba(255, 255, 255, 0.3)',
                                    backgroundColor: isDragging ? 'rgba(244, 166, 193, 0.05)' : 'rgba(255, 255, 255, 0.4)',
                                }}
                                className={`relative h-full min-h-[280px] sm:min-h-[350px] lg:min-h-[600px] rounded-2xl sm:rounded-[3rem] border-4 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 overflow-hidden group ${uploadSongFile ? 'border-soft-rose' : 'border-white/30'
                                    }`}
                            >
                                {/* Holographic Background Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl -z-10" />
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-soft-rose/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blush-pink/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

                                {uploadSongFile ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center w-full max-w-md"
                                    >
                                        <div className="relative w-48 h-48 mx-auto mb-8">
                                            {/* Album Art / Preview */}
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-charcoal to-gray-800 animate-spin-slow shadow-2xl flex items-center justify-center border-4 border-black/10">
                                                {extractedCoverImage ? (
                                                    <img
                                                        src={extractedCoverImage}
                                                        alt="Cover"
                                                        className="w-full h-full object-cover rounded-full opacity-90"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-soft-rose rounded-full" />
                                                )}
                                            </div>
                                            {/* Center hole mimicking vinyl */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full z-10" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-charcoal mb-2 truncate px-4">
                                            {uploadSongFile.name}
                                        </h3>
                                        <p className="text-soft-gray mb-6 font-mono text-sm bg-white/40 inline-block px-3 py-1 rounded-full">
                                            {formatFileSize(uploadSongFile.size)}
                                        </p>

                                        <button
                                            onClick={() => {
                                                setUploadSongFile(null)
                                                setUploadSongTitle('')
                                                setUploadSongArtist('')
                                                setExtractedCoverImage(null)
                                                if (fileInputRef.current) fileInputRef.current.value = ''
                                            }}
                                            className="px-6 py-2 rounded-full bg-white/50 text-red-500 hover:bg-red-50 font-semibold transition-colors text-sm border border-red-100"
                                        >
                                            Remove File
                                        </button>
                                    </motion.div>
                                ) : (
                                    <div className="text-center space-y-6 max-w-sm pointer-events-none">
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-32 h-32 mx-auto bg-gradient-to-br from-soft-rose to-blush-pink rounded-3xl flex items-center justify-center shadow-2xl relative"
                                        >
                                            <span className="text-6xl filter drop-shadow-md">🎧</span>
                                            <div className="absolute -inset-4 border border-white/20 rounded-[2.5rem] opacity-50" />
                                        </motion.div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-charcoal mb-2">
                                                {isDragging ? 'Drop it like it\'s hot! 🔥' : 'Drag & Drop Song Here'}
                                            </h3>
                                            <p className="text-soft-gray">
                                                or click anywhere to browse your files
                                            </p>
                                        </div>

                                        <div className="pt-4 flex justify-center gap-3 text-sm text-soft-gray/60">
                                            <span className="px-3 py-1 bg-white/30 rounded-full">MP3</span>
                                            <span className="px-3 py-1 bg-white/30 rounded-full">WAV</span>
                                            <span className="px-3 py-1 bg-white/30 rounded-full">M4A</span>
                                        </div>
                                    </div>
                                )}

                                {/* Hidden File Input covering the area */}
                                {!uploadSongFile && (
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                )}
                            </motion.div>

                            {uploadErrors.file && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 text-center text-red-500 font-medium bg-red-50 py-2 rounded-xl"
                                >
                                    🚨 {uploadErrors.file}
                                </motion.p>
                            )}
                        </div>

                        {/* Right Column - Metadata Form */}
                        <div className="lg:col-span-5 flex flex-col justify-center">
                            <div className="glass rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 lg:p-10 border-2 border-white/40 shadow-xl relative overflow-hidden">
                                {/* Decorative background flow */}
                                <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-soft-rose/5 to-transparent pointer-events-none" />

                                <div className="space-y-6 relative z-10">
                                    {/* Song Details */}
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-2 ml-4">Title</label>
                                            <input
                                                type="text"
                                                placeholder="Enter song title..."
                                                value={uploadSongTitle}
                                                onChange={(e) => {
                                                    setUploadSongTitle(e.target.value)
                                                    if (uploadErrors.title) setUploadErrors({ ...uploadErrors, title: undefined })
                                                }}
                                                maxLength={100}
                                                className={`w-full min-h-[44px] px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/50 border-2 transition-all text-base sm:text-lg font-medium placeholder:text-gray-400 focus:bg-white focus:shadow-lg focus:outline-none ${uploadErrors.title ? 'border-red-300' : 'border-white/50 focus:border-soft-rose'
                                                    }`}
                                            />
                                            {uploadErrors.title && <p className="ml-4 mt-1 text-xs text-red-500">{uploadErrors.title}</p>}
                                        </div>

                                        <div className="relative group">
                                            <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-2 ml-4">Artist</label>
                                            <input
                                                type="text"
                                                placeholder="Enter artist name..."
                                                value={uploadSongArtist}
                                                onChange={(e) => {
                                                    setUploadSongArtist(e.target.value)
                                                    if (uploadErrors.artist) setUploadErrors({ ...uploadErrors, artist: undefined })
                                                }}
                                                maxLength={100}
                                                className={`w-full min-h-[44px] px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/50 border-2 transition-all text-base sm:text-lg font-medium placeholder:text-gray-400 focus:bg-white focus:shadow-lg focus:outline-none ${uploadErrors.artist ? 'border-red-300' : 'border-white/50 focus:border-soft-rose'
                                                    }`}
                                            />
                                            {uploadErrors.artist && <p className="ml-4 mt-1 text-xs text-red-500">{uploadErrors.artist}</p>}
                                        </div>
                                    </div>

                                    {/* Playlist Selection Chips */}
                                    <div className="pt-2">
                                        <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-3 ml-4">
                                            Add to Playlists
                                        </label>
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                                            {playlists.map((playlist) => {
                                                const isSelected = selectedPlaylistsForUpload.includes(playlist.id)
                                                return (
                                                    <motion.button
                                                        key={playlist.id}
                                                        whileTap={{ scale: 0.95 }}
                                                        whileHover={{ scale: 1.05 }}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSelectedPlaylistsForUpload(prev => prev.filter(id => id !== playlist.id))
                                                            } else {
                                                                setSelectedPlaylistsForUpload(prev => [...prev, playlist.id])
                                                            }
                                                        }}
                                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${isSelected
                                                            ? 'bg-soft-rose text-white shadow-md'
                                                            : 'bg-white/60 text-soft-gray hover:bg-white'
                                                            }`}
                                                    >
                                                        <span>{playlist.emoji}</span>
                                                        <span className="ml-2">{playlist.name}</span>
                                                    </motion.button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Author Selection Segmented Control */}
                                    <div className="pt-2">
                                        <div className="bg-white/40 p-1 rounded-2xl flex relative">
                                            {/* Selected Indicator */}
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    x: uploadAuthor === 'you' ? 0 : '100%'
                                                }}
                                                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm z-0"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setUploadAuthor('you')}
                                                className={`flex-1 py-3 text-center rounded-xl relative z-10 text-sm font-bold transition-colors ${uploadAuthor === 'you' ? 'text-charcoal' : 'text-soft-gray hover:text-charcoal/70'
                                                    }`}
                                            >
                                                {personalization.yourName} 🙋‍♂️
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUploadAuthor('her')}
                                                className={`flex-1 py-3 text-center rounded-xl relative z-10 text-sm font-bold transition-colors ${uploadAuthor === 'her' ? 'text-charcoal' : 'text-soft-gray hover:text-charcoal/70'
                                                    }`}
                                            >
                                                {personalization.herName} 🙋‍♀️
                                            </button>
                                        </div>
                                    </div>

                                    {/* Upload Button */}
                                    <div className="pt-4">
                                        <button
                                            onClick={handleUploadSong}
                                            disabled={isUploading || !uploadSongFile || !uploadSongTitle.trim() || !uploadSongArtist.trim()}
                                            className="w-full min-h-[44px] py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-soft-rose to-blush-pink text-white font-bold text-base sm:text-lg shadow-lg shadow-soft-rose/30 hover:shadow-xl hover:shadow-soft-rose/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {isUploading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Uploading...</span>
                                                </div>
                                            ) : (
                                                'Upload Song ✨'
                                            )}
                                        </button>
                                        {/* Error Message */}
                                        {uploadErrors.general && (
                                            <p className="mt-3 text-center text-sm text-red-500 bg-red-50 py-2 rounded-lg">{uploadErrors.general}</p>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Create Playlist View - Premium Redesign */}
            {currentView === 'create-playlist' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <button
                            onClick={() => setCurrentView('grid')}
                            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/50 hover:bg-white active:bg-white/80 text-soft-rose border-2 border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-sm hover:shadow-lg text-lg"
                            aria-label="Back to playlists"
                        >
                            ←
                        </button>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-r from-charcoal via-soft-rose to-blush-pink">
                                Create New Playlist
                            </h2>
                            <p className="text-xs sm:text-sm text-soft-gray mt-1 font-medium">Curate your perfect collection together 💕</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        {/* Left Column - Live Preview */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-6">
                                <div className="glass rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 border-2 border-white/40 shadow-xl relative overflow-hidden">
                                    {/* Decorative background */}
                                    <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-soft-rose/10 to-transparent pointer-events-none" />
                                    
                                    <div className="relative z-10">
                                        <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-4">
                                            Preview
                                        </label>
                                        
                                        {/* Playlist Preview Card */}
                                        <motion.div
                                            animate={{
                                                background: playlistCoverType === 'color' 
                                                    ? `linear-gradient(135deg, ${newPlaylistColor}15, ${newPlaylistColor}30)`
                                                    : 'linear-gradient(135deg, rgba(244, 166, 193, 0.15), rgba(244, 166, 193, 0.3))'
                                            }}
                                            className="rounded-2xl p-6 border-2 border-white/30 backdrop-blur-sm"
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                {/* Cover Display - Image, Emoji, or Color */}
                                                <motion.div
                                                    animate={{ scale: [1, 1.05, 1] }}
                                                    transition={{ duration: 0.3 }}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg overflow-hidden"
                                                    style={{ 
                                                        background: playlistCoverType === 'image' 
                                                            ? 'transparent'
                                                            : playlistCoverType === 'color'
                                                            ? `linear-gradient(135deg, ${newPlaylistColor}, ${newPlaylistColor}dd)`
                                                            : `linear-gradient(135deg, ${newPlaylistColor}, ${newPlaylistColor}dd)`
                                                    }}
                                                >
                                                    {playlistCoverType === 'image' && newPlaylistCoverImage ? (
                                                        <img 
                                                            src={newPlaylistCoverImage} 
                                                            alt="Playlist cover" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>{newPlaylistEmoji || '🎵'}</span>
                                                    )}
                                                </motion.div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg sm:text-xl font-bold text-charcoal truncate mb-1">
                                                        {newPlaylistName || 'Your Playlist Name'}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-soft-gray">
                                                        {newPlaylistDescription || 'Add a description...'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-4 border-t border-white/20">
                                                <span className="text-xs text-soft-gray">
                                                    Created by {uploadAuthor === 'you' ? personalization.yourName : personalization.herName}
                                                </span>
                                                <span className="text-xs text-soft-gray">0 songs</span>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Form */}
                        <div className="lg:col-span-7">
                            <div className="glass rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 lg:p-10 border-2 border-white/40 shadow-xl relative overflow-hidden">
                                {/* Decorative background */}
                                <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-soft-rose/5 to-transparent pointer-events-none" />
                                
                                <div className="space-y-6 relative z-10">
                                    {/* Playlist Name */}
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-2 ml-4">
                                            Playlist Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Our Romantic Songs, Date Night Vibes..."
                                            value={newPlaylistName}
                                            onChange={(e) => setNewPlaylistName(e.target.value)}
                                            maxLength={50}
                                            className="w-full min-h-[44px] px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/50 border-2 transition-all text-base sm:text-lg font-medium placeholder:text-gray-400 focus:bg-white focus:shadow-lg focus:outline-none border-white/50 focus:border-soft-rose"
                                        />
                                    </div>

                                    {/* Cover Selection - Tabs for Emoji/Image/Color */}
                                    <div>
                                        <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-3 ml-4">
                                            Playlist Cover
                                        </label>
                                        
                                        {/* Cover Type Selection Tabs */}
                                        <div className="bg-white/40 p-1 rounded-2xl flex mb-4 relative">
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    x: playlistCoverType === 'emoji' ? 0 : playlistCoverType === 'image' ? '33.333%' : '66.666%',
                                                    width: '33.333%'
                                                }}
                                                className="absolute top-1 left-1 bottom-1 bg-white rounded-xl shadow-sm z-0"
                                            />
                                            
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPlaylistCoverType('emoji')
                                                    setNewPlaylistCoverImage(null)
                                                    setNewPlaylistCoverFile(null)
                                                    setPlaylistCoverErrors(null)
                                                }}
                                                className={`flex-1 py-2.5 text-center rounded-xl relative z-10 text-xs sm:text-sm font-bold transition-colors ${
                                                    playlistCoverType === 'emoji' ? 'text-charcoal' : 'text-soft-gray hover:text-charcoal/70'
                                                }`}
                                            >
                                                Emoji
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPlaylistCoverType('image')
                                                    setNewPlaylistEmoji('')
                                                }}
                                                className={`flex-1 py-2.5 text-center rounded-xl relative z-10 text-xs sm:text-sm font-bold transition-colors ${
                                                    playlistCoverType === 'image' ? 'text-charcoal' : 'text-soft-gray hover:text-charcoal/70'
                                                }`}
                                            >
                                                Image
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPlaylistCoverType('color')
                                                    setNewPlaylistCoverImage(null)
                                                    setNewPlaylistCoverFile(null)
                                                    setNewPlaylistEmoji('')
                                                    setPlaylistCoverErrors(null)
                                                }}
                                                className={`flex-1 py-2.5 text-center rounded-xl relative z-10 text-xs sm:text-sm font-bold transition-colors ${
                                                    playlistCoverType === 'color' ? 'text-charcoal' : 'text-soft-gray hover:text-charcoal/70'
                                                }`}
                                            >
                                                Color
                                            </button>
                                        </div>

                                        {/* Emoji Selection */}
                                        {playlistCoverType === 'emoji' && (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="💕"
                                                    value={newPlaylistEmoji}
                                                    onChange={(e) => setNewPlaylistEmoji(e.target.value)}
                                                    maxLength={2}
                                                    className="w-full min-h-[44px] px-4 py-3 rounded-xl sm:rounded-2xl bg-white/50 border-2 border-white/50 focus:border-soft-rose focus:outline-none text-3xl text-center font-medium focus:bg-white focus:shadow-lg transition-all"
                                                />
                                                {/* Quick Emoji Picker */}
                                                <div className="flex flex-wrap gap-2">
                                                    {['💕', '🎵', '🎶', '💖', '🌹', '✨', '🎧', '💝', '🎤', '❤️', '💗', '🌺', '🌸', '🦋', '🌙'].map((emoji) => (
                                                        <button
                                                            key={emoji}
                                                            type="button"
                                                            onClick={() => setNewPlaylistEmoji(emoji)}
                                                            className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                                                                newPlaylistEmoji === emoji
                                                                    ? 'bg-soft-rose text-white scale-110 shadow-md'
                                                                    : 'bg-white/50 hover:bg-white text-charcoal hover:scale-105'
                                                            }`}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Image Upload */}
                                        {playlistCoverType === 'image' && (
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    {newPlaylistCoverImage ? (
                                                        <div className="relative">
                                                            <img 
                                                                src={newPlaylistCoverImage} 
                                                                alt="Playlist cover preview" 
                                                                className="w-full h-48 object-cover rounded-xl border-2 border-white/50"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setNewPlaylistCoverImage(null)
                                                                    setNewPlaylistCoverFile(null)
                                                                    setPlaylistCoverErrors(null)
                                                                    if (document.getElementById('playlist-cover-input')) {
                                                                        (document.getElementById('playlist-cover-input') as HTMLInputElement).value = ''
                                                                    }
                                                                }}
                                                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="block">
                                                            <div className="w-full h-48 rounded-xl border-2 border-dashed border-white/50 bg-white/30 hover:bg-white/40 transition-all cursor-pointer flex flex-col items-center justify-center gap-3">
                                                                <span className="text-4xl">📷</span>
                                                                <div className="text-center">
                                                                    <p className="text-sm font-semibold text-charcoal">Upload Cover Image</p>
                                                                    <p className="text-xs text-soft-gray mt-1">JPG, PNG, GIF (Max 5MB)</p>
                                                                </div>
                                                            </div>
                                                            <input
                                                                id="playlist-cover-input"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handlePlaylistCoverImageSelect}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                                {playlistCoverErrors && (
                                                    <p className="text-xs text-red-500 bg-red-50 py-2 px-3 rounded-lg">
                                                        {playlistCoverErrors}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Advanced Color Picker */}
                                        {playlistCoverType === 'color' && (
                                            <div className="space-y-4">
                                                {/* Gradient Color Presets */}
                                                <div>
                                                    <p className="text-xs text-soft-gray mb-2 ml-1">Gradient Presets</p>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {[
                                                            { colors: ['#F4A6C1', '#E8979D'], name: 'Rose Blush' },
                                                            { colors: ['#E8B4CB', '#F5C6D9'], name: 'Soft Pink' },
                                                            { colors: ['#DDA0DD', '#E6E6FA'], name: 'Lavender' },
                                                            { colors: ['#FFB6C1', '#FFC0CB'], name: 'Light Pink' },
                                                            { colors: ['#F0A3FF', '#DDA0DD'], name: 'Purple' },
                                                            { colors: ['#FFB3BA', '#FFDFBA'], name: 'Peach' },
                                                            { colors: ['#BAFFC9', '#BAE1FF'], name: 'Mint' },
                                                            { colors: ['#FFD3A5', '#FD9853'], name: 'Sunset' }
                                                        ].map((preset, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => setNewPlaylistColor(preset.colors[0])}
                                                                className={`group relative h-16 rounded-xl overflow-hidden transition-all ${
                                                                    newPlaylistColor === preset.colors[0]
                                                                        ? 'ring-4 ring-soft-rose scale-105 shadow-lg'
                                                                        : 'hover:scale-105 hover:ring-2 hover:ring-soft-rose/50'
                                                                }`}
                                                                style={{
                                                                    background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`
                                                                }}
                                                                title={preset.name}
                                                            >
                                                                {newPlaylistColor === preset.colors[0] && (
                                                                    <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black/20">
                                                                        ✓
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Solid Color Presets */}
                                                <div>
                                                    <p className="text-xs text-soft-gray mb-2 ml-1">Solid Colors</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            '#F4A6C1', '#E8979D', '#D4A574', '#C8A882', 
                                                            '#B89A7A', '#E8B4CB', '#F5C6D9', '#DDA0DD',
                                                            '#FFB6C1', '#FFC0CB', '#F0A3FF', '#FFB3BA'
                                                        ].map((color) => (
                                                            <button
                                                                key={color}
                                                                type="button"
                                                                onClick={() => setNewPlaylistColor(color)}
                                                                className={`w-10 h-10 rounded-lg transition-all ${
                                                                    newPlaylistColor === color
                                                                        ? 'ring-4 ring-soft-rose scale-110 shadow-lg'
                                                                        : 'hover:scale-105 hover:ring-2 hover:ring-soft-rose/50'
                                                                }`}
                                                                style={{ backgroundColor: color }}
                                                            >
                                                                {newPlaylistColor === color && (
                                                                    <span className="flex items-center justify-center h-full text-white text-sm">
                                                                        ✓
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Custom Color Picker */}
                                                <div className="flex items-center gap-3 p-3 bg-white/30 rounded-xl">
                                                    <input
                                                        type="color"
                                                        value={newPlaylistColor}
                                                        onChange={(e) => setNewPlaylistColor(e.target.value)}
                                                        className="w-12 h-12 rounded-lg border-2 border-white/50 cursor-pointer hover:border-soft-rose transition-colors"
                                                        title="Custom Color"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-xs font-semibold text-charcoal">Custom Color</p>
                                                        <p className="text-xs text-soft-gray">{newPlaylistColor.toUpperCase()}</p>
                                                    </div>
                                                    <div 
                                                        className="w-12 h-12 rounded-lg border-2 border-white/50"
                                                        style={{ backgroundColor: newPlaylistColor }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-2 ml-4">
                                            Description <span className="text-soft-gray/60 font-normal">(optional)</span>
                                        </label>
                                        <textarea
                                            placeholder="What makes this playlist special? Share the story behind it..."
                                            value={newPlaylistDescription}
                                            onChange={(e) => setNewPlaylistDescription(e.target.value)}
                                            maxLength={150}
                                            rows={3}
                                            className="w-full min-h-[100px] px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/50 border-2 border-white/50 focus:border-soft-rose focus:outline-none resize-none text-base font-medium placeholder:text-gray-400 focus:bg-white focus:shadow-lg transition-all"
                                        />
                                        <p className="text-xs text-soft-gray mt-1 ml-4">
                                            {newPlaylistDescription.length}/150 characters
                                        </p>
                                    </div>

                                    {/* Author Selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-3 ml-4">
                                            Created By
                                        </label>
                                        <div className="bg-white/40 p-1 rounded-2xl flex relative">
                                            {/* Selected Indicator */}
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    x: uploadAuthor === 'you' ? 0 : '100%'
                                                }}
                                                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm z-0"
                                            />
                                            
                                            <button
                                                type="button"
                                                onClick={() => setUploadAuthor('you')}
                                                className={`flex-1 py-3 text-center rounded-xl relative z-10 text-sm font-bold transition-colors ${
                                                    uploadAuthor === 'you' ? 'text-charcoal' : 'text-soft-gray hover:text-charcoal/70'
                                                }`}
                                            >
                                                {personalization.yourName} 🙋‍♂️
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUploadAuthor('her')}
                                                className={`flex-1 py-3 text-center rounded-xl relative z-10 text-sm font-bold transition-colors ${
                                                    uploadAuthor === 'her' ? 'text-charcoal' : 'text-soft-gray hover:text-charcoal/70'
                                                }`}
                                            >
                                                {personalization.herName} 🙋‍♀️
                                            </button>
                                        </div>
                                    </div>

                                    {/* Create Button */}
                                    <div className="pt-4">
                                        <motion.button
                                            onClick={handleCreatePlaylist}
                                            disabled={!newPlaylistName.trim()}
                                            whileHover={newPlaylistName.trim() ? { scale: 1.02 } : {}}
                                            whileTap={newPlaylistName.trim() ? { scale: 0.98 } : {}}
                                            className="w-full min-h-[44px] py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-soft-rose to-blush-pink text-white font-bold text-base sm:text-lg shadow-lg shadow-soft-rose/30 hover:shadow-xl hover:shadow-soft-rose/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            Create Playlist ✨
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

        </div>
    )
}
