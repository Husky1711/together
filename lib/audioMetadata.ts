// Audio Metadata Extraction Utility
// Extracts metadata (title, artist, album, cover image) from audio files

import { parseBlob } from 'music-metadata'

export interface ExtractedMetadata {
  title?: string
  artist?: string
  album?: string
  coverImage?: string // Base64 data URL
  genre?: string
  year?: number
  track?: number
  duration?: number
}

/**
 * Extract metadata from an audio file
 * @param file - The audio file to extract metadata from
 * @returns Extracted metadata or null if extraction fails
 */
export async function extractAudioMetadata(file: File): Promise<ExtractedMetadata | null> {
  try {
    // Parse metadata from the file
    const metadata = await parseBlob(file)

    const extracted: ExtractedMetadata = {}

    // Extract title
    if (metadata.common.title) {
      extracted.title = metadata.common.title.trim()
    }

    // Extract artist
    if (metadata.common.artist) {
      extracted.artist = metadata.common.artist.trim()
    }

    // Extract album
    if (metadata.common.album) {
      extracted.album = metadata.common.album.trim()
    }

    // Extract genre
    if (metadata.common.genre && metadata.common.genre.length > 0) {
      extracted.genre = Array.isArray(metadata.common.genre)
        ? metadata.common.genre[0]
        : metadata.common.genre
    }

    // Extract year
    if (metadata.common.year) {
      extracted.year = metadata.common.year
    }

    // Extract track number
    if (metadata.common.track?.no) {
      extracted.track = metadata.common.track.no
    }

    // Extract duration
    if (metadata.format.duration) {
      extracted.duration = metadata.format.duration
    }

    // Extract cover image
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0]
      if (picture.data) {
        try {
          // Convert picture data to base64 data URL
          const uint8Array = new Uint8Array(picture.data)
          let binary = ''
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i])
          }
          const base64 = btoa(binary)
          const mimeType = picture.format || 'image/jpeg'
          extracted.coverImage = `data:${mimeType};base64,${base64}`
        } catch (error) {
          console.warn('Error converting cover image to base64:', error)
        }
      }
    }

    // Return metadata if we extracted at least title or artist
    if (extracted.title || extracted.artist) {
      return extracted
    }

    return null
  } catch (error) {
    console.warn('Error extracting metadata from file:', error)
    // Return null if extraction fails (file might not have metadata)
    return null
  }
}

/**
 * Extract filename-based metadata as fallback
 * Common patterns: "Artist - Title.mp3", "Title - Artist.mp3", "Title.mp3"
 */
export function extractMetadataFromFilename(filename: string): Partial<ExtractedMetadata> {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '') // Remove extension
  
  // Try "Artist - Title" pattern
  if (nameWithoutExt.includes(' - ')) {
    const parts = nameWithoutExt.split(' - ')
    if (parts.length >= 2) {
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join(' - ').trim(),
      }
    }
  }

  // Try "Title - Artist" pattern
  if (nameWithoutExt.includes(' – ')) {
    const parts = nameWithoutExt.split(' – ')
    if (parts.length >= 2) {
      return {
        title: parts[0].trim(),
        artist: parts.slice(1).join(' – ').trim(),
      }
    }
  }

  // If no pattern matches, use filename as title
  return {
    title: nameWithoutExt.trim(),
  }
}

