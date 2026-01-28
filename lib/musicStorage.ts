// IndexedDB Storage Utility for Music System
// Handles audio file storage and playlist metadata

const DB_NAME = 'valentines-music'
const DB_VERSION = 1
const STORE_SONGS = 'songs'
const STORE_PLAYLISTS = 'playlists'

export interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration?: number // in seconds
  fileData?: ArrayBuffer // Audio file stored in IndexedDB as ArrayBuffer
  fileType?: string // MIME type of the file
  audioUrl?: string // Blob URL for playback (generated on load)
  uploadedBy: 'you' | 'her'
  uploadedAt: number
  playlistIds: string[]
  notes?: string
  coverImage?: string
  fileSize?: number // in bytes
}

export interface Playlist {
  id: string
  name: string
  description?: string
  emoji?: string
  color?: string
  createdAt: number
  createdBy: 'you' | 'her'
  songIds: string[] // References to song IDs
  coverImage?: string
}

// Initialize IndexedDB
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create songs store
      if (!db.objectStoreNames.contains(STORE_SONGS)) {
        const songsStore = db.createObjectStore(STORE_SONGS, { keyPath: 'id' })
        songsStore.createIndex('uploadedAt', 'uploadedAt', { unique: false })
        songsStore.createIndex('uploadedBy', 'uploadedBy', { unique: false })
      }

      // Create playlists store
      if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
        const playlistsStore = db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id' })
        playlistsStore.createIndex('createdAt', 'createdAt', { unique: false })
        playlistsStore.createIndex('createdBy', 'createdBy', { unique: false })
      }
    }
  })
}

// Storage Quota Management
export async function checkStorageQuota(): Promise<{
  used: number
  quota: number
  percentage: number
  available: number
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    const used = estimate.usage || 0
    const quota = estimate.quota || 0
    const percentage = quota > 0 ? (used / quota) * 100 : 0
    const available = quota - used

    return { used, quota, percentage, available }
  }
  return { used: 0, quota: 0, percentage: 0, available: 0 }
}

// Song Operations
export async function saveSong(song: Song): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_SONGS], 'readwrite')
    const store = transaction.objectStore(STORE_SONGS)
    const request = store.put(song)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Helper to convert File to Song format
export async function fileToSong(
  file: File,
  title: string,
  artist: string,
  uploadedBy: 'you' | 'her',
  playlistIds: string[] = [],
  notes?: string,
  coverImage?: string
): Promise<Song> {
  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()
  
  // Ensure we have a valid MIME type
  let fileType = file.type
  if (!fileType || fileType === 'application/octet-stream') {
    // Try to detect from file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      'mp3': 'audio/mpeg',
      'm4a': 'audio/mp4',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'webm': 'audio/webm',
    }
    fileType = mimeTypes[extension || ''] || 'audio/mpeg'
    console.log('Detected MIME type:', fileType, 'from extension:', extension)
  }
  
  // Create blob URL for immediate playback
  const blob = new Blob([arrayBuffer], { type: fileType })
  const audioUrl = URL.createObjectURL(blob)

  console.log('Created song:', {
    title,
    fileType,
    fileSize: file.size,
    arrayBufferSize: arrayBuffer.byteLength,
    blobSize: blob.size,
  })

  return {
    id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    artist,
    fileData: arrayBuffer,
    fileType,
    audioUrl,
    uploadedBy,
    uploadedAt: Date.now(),
    playlistIds,
    notes,
    coverImage,
    fileSize: file.size,
  }
}

// Helper to get audio URL from song (creates blob URL if not exists)
export function getSongAudioUrl(song: Song): string {
  // Always regenerate blob URL to ensure it's fresh and valid
  if (song.fileData) {
    try {
      // Ensure fileData is an ArrayBuffer
      let arrayBuffer: ArrayBuffer
      const fileData = song.fileData as any
      
      if (fileData instanceof ArrayBuffer) {
        arrayBuffer = fileData
      } else {
        // Try to convert to ArrayBuffer
        console.warn('Converting fileData to ArrayBuffer for song:', song.id)
        try {
          if (fileData instanceof Uint8Array) {
            arrayBuffer = fileData.buffer.slice(0) as ArrayBuffer
          } else if (Array.isArray(fileData)) {
            arrayBuffer = new Uint8Array(fileData).buffer
          } else {
            // Last resort: try to convert object
            const values = Object.values(fileData)
            arrayBuffer = new Uint8Array(values as number[]).buffer
          }
        } catch (e) {
          console.error('Failed to convert fileData to ArrayBuffer:', e)
          return ''
        }
      }
      
      // Determine MIME type
      let mimeType = song.fileType || 'audio/mpeg'
      
      // If no fileType, default to MP3
      if (!song.fileType) {
        mimeType = 'audio/mpeg'
        console.warn('No fileType specified, defaulting to audio/mpeg for song:', song.id)
      }
      
      // Create blob with proper MIME type
      const blob = new Blob([arrayBuffer], { type: mimeType })
      
      // Verify blob size matches expected
      if (song.fileSize && blob.size !== song.fileSize) {
        console.warn(`Blob size mismatch: expected ${song.fileSize}, got ${blob.size} for song:`, song.id)
      }
      
      const url = URL.createObjectURL(blob)
      console.log('Created blob URL for song:', song.title, 'Size:', blob.size, 'Type:', mimeType)
      return url
    } catch (error) {
      console.error('Error creating blob URL:', error, {
        songId: song.id,
        songTitle: song.title,
        hasFileData: !!song.fileData,
        fileDataType: typeof song.fileData,
        fileType: song.fileType,
      })
      return ''
    }
  }
  
  console.error('Song missing fileData:', {
    id: song.id,
    title: song.title,
    hasFileData: !!song.fileData,
    fileType: song.fileType,
  })
  return ''
}

export async function getSong(id: string): Promise<Song | null> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_SONGS], 'readonly')
    const store = transaction.objectStore(STORE_SONGS)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllSongs(): Promise<Song[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_SONGS], 'readonly')
    const store = transaction.objectStore(STORE_SONGS)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function deleteSong(id: string): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_SONGS], 'readwrite')
    const store = transaction.objectStore(STORE_SONGS)
    const request = store.delete(id)

    request.onsuccess = () => {
      // Revoke blob URL to free memory
      getSong(id).then((song) => {
        if (song?.audioUrl) {
          URL.revokeObjectURL(song.audioUrl)
        }
      })
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

// Playlist Operations
export async function savePlaylist(playlist: Playlist): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite')
    const store = transaction.objectStore(STORE_PLAYLISTS)
    const request = store.put(playlist)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getPlaylist(id: string): Promise<Playlist | null> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PLAYLISTS], 'readonly')
    const store = transaction.objectStore(STORE_PLAYLISTS)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PLAYLISTS], 'readonly')
    const store = transaction.objectStore(STORE_PLAYLISTS)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite')
    const store = transaction.objectStore(STORE_PLAYLISTS)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Get songs for a playlist
export async function getPlaylistSongs(playlistId: string): Promise<Song[]> {
  const playlist = await getPlaylist(playlistId)
  if (!playlist) return []

  const allSongs = await getAllSongs()
  return allSongs.filter((song) => playlist.songIds.includes(song.id))
}

// Add song to playlist
export async function addSongToPlaylist(songId: string, playlistId: string): Promise<void> {
  const playlist = await getPlaylist(playlistId)
  if (!playlist) throw new Error('Playlist not found')

  if (!playlist.songIds.includes(songId)) {
    playlist.songIds.push(songId)
    await savePlaylist(playlist)
  }

  // Also update song's playlistIds
  const song = await getSong(songId)
  if (song && !song.playlistIds.includes(playlistId)) {
    song.playlistIds.push(playlistId)
    await saveSong(song)
  }
}

// Remove song from playlist
export async function removeSongFromPlaylist(songId: string, playlistId: string): Promise<void> {
  const playlist = await getPlaylist(playlistId)
  if (!playlist) throw new Error('Playlist not found')

  playlist.songIds = playlist.songIds.filter((id) => id !== songId)
  await savePlaylist(playlist)

  // Also update song's playlistIds
  const song = await getSong(songId)
  if (song) {
    song.playlistIds = song.playlistIds.filter((id) => id !== playlistId)
    await saveSong(song)
  }
}

// Get total storage used by songs
export async function getTotalStorageUsed(): Promise<number> {
  const songs = await getAllSongs()
  return songs.reduce((total, song) => total + (song.fileSize || 0), 0)
}

// Check for duplicate file in database (database-first validation)
// This is the source of truth check, not relying on React state
export async function checkDuplicateInDatabase(
  file: File,
  title: string,
  artist: string
): Promise<{ isDuplicate: boolean; duplicateSong?: Song; reason?: string }> {
  try {
    // Fetch ALL songs from database (not from state)
    const allSongs = await getAllSongs()
    
    // Normalize inputs for comparison
    const fileNameNormalized = file.name.toLowerCase().trim()
    const fileNameWithoutExt = fileNameNormalized.replace(/\.[^/.]+$/, '')
    const titleNormalized = title.toLowerCase().trim()
    const artistNormalized = artist.toLowerCase().trim()
    
    // Check for duplicates using multiple strategies
    for (const song of allSongs) {
      const songTitleNormalized = song.title.toLowerCase().trim()
      const songArtistNormalized = song.artist.toLowerCase().trim()
      
      // PRIMARY CHECK: Metadata match (Title + Artist)
      // This catches same song regardless of file source/encoding
      // Even if file size is different, same song should be detected
      const metadataMatches = 
        titleNormalized === songTitleNormalized &&
        artistNormalized === songArtistNormalized
      
      if (metadataMatches) {
        return {
          isDuplicate: true,
          duplicateSong: song,
          reason: `Same song already exists: "${song.title}" by ${song.artist}. The same song (same title and artist) cannot be uploaded multiple times, even if the file is different.`
        }
      }
      
      // SECONDARY CHECK: Exact file match (file size + filename)
      // This catches the exact same file being uploaded again
      if (song.fileSize === file.size) {
        const filenameMatches = 
          fileNameWithoutExt === songTitleNormalized ||
          fileNameNormalized.includes(songTitleNormalized) ||
          songTitleNormalized.includes(fileNameWithoutExt)
        
        if (filenameMatches) {
          return {
            isDuplicate: true,
            duplicateSong: song,
            reason: 'Exact file already uploaded (same file size and filename). This is the same file that was previously uploaded.'
          }
        }
      }
    }
    
    // No duplicate found
    return { isDuplicate: false }
  } catch (error) {
    console.error('Error checking for duplicates in database:', error)
    // If database check fails, return false to allow upload (fail-safe)
    // But log the error for monitoring
    return { isDuplicate: false }
  }
}

