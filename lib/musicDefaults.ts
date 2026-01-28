// Default Playlist Templates
import { Playlist } from './musicStorage'

export const defaultPlaylists: Omit<Playlist, 'id' | 'createdAt' | 'songIds'>[] = [
  {
    name: 'Our Romantic Songs',
    description: 'Slow, intimate songs that remind us of each other',
    emoji: '💕',
    color: '#F4A6C1', // Soft Rose
    createdBy: 'you',
  },
  {
    name: 'Our Journey Songs',
    description: 'Songs marking our milestones together',
    emoji: '🎉',
    color: '#E8979D', // Blush Pink
    createdBy: 'you',
  },
  {
    name: 'Date Night',
    description: 'Perfect songs for our dates',
    emoji: '🌅',
    color: '#D4A574', // Rose Gold
    createdBy: 'you',
  },
  {
    name: 'Road Trip',
    description: 'Upbeat songs for our adventures',
    emoji: '🚗',
    color: '#F4A6C1',
    createdBy: 'you',
  },
  {
    name: 'Chill Vibes',
    description: 'Relaxing background music',
    emoji: '🌙',
    color: '#E8979D',
    createdBy: 'you',
  },
]

export function createDefaultPlaylists(): Playlist[] {
  return defaultPlaylists.map((template, index) => ({
    ...template,
    id: `default-${index + 1}`,
    createdAt: Date.now() - (defaultPlaylists.length - index) * 1000,
    songIds: [],
  }))
}

