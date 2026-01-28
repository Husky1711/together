'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { personalization } from '@/lib/personalization'

type GoalCategory = 'travel' | 'home' | 'career' | 'health' | 'relationship' | 'financial' | 'personal' | 'adventure' | 'creative' | 'other'
type ProgressStatus = 'not-started' | 'in-progress' | 'achieved'
type ShapeType = 'square' | 'wide' | 'tall' | 'large'

interface VisionItem {
  id: number
  type: 'text' | 'image'
  content: string
  author: 'you' | 'her'
  timestamp: number
  imageUrl?: string
  category: GoalCategory
  status: ProgressStatus
  isPinned: boolean
  shape?: ShapeType
  targetDate?: string
}

const categories: { id: GoalCategory; name: string; emoji: string; color: string }[] = [
  { id: 'travel', name: 'Travel', emoji: '✈️', color: 'from-blue-400 to-cyan-400' },
  { id: 'home', name: 'Home', emoji: '🏠', color: 'from-amber-400 to-orange-400' },
  { id: 'career', name: 'Career', emoji: '💼', color: 'from-purple-400 to-pink-400' },
  { id: 'health', name: 'Health', emoji: '💪', color: 'from-green-400 to-emerald-400' },
  { id: 'relationship', name: 'Relationship', emoji: '💕', color: 'from-rose-400 to-pink-400' },
  { id: 'financial', name: 'Financial', emoji: '💰', color: 'from-yellow-400 to-amber-400' },
  { id: 'personal', name: 'Personal Growth', emoji: '🌟', color: 'from-indigo-400 to-purple-400' },
  { id: 'adventure', name: 'Adventure', emoji: '🏔️', color: 'from-teal-400 to-cyan-400' },
  { id: 'creative', name: 'Creative', emoji: '🎨', color: 'from-fuchsia-400 to-pink-400' },
  { id: 'other', name: 'Other', emoji: '✨', color: 'from-gray-400 to-slate-400' },
]

const statusOptions: { id: ProgressStatus; name: string; emoji: string; color: string }[] = [
  { id: 'not-started', name: 'Not Started', emoji: '⏳', color: 'bg-gray-200 text-gray-700' },
  { id: 'in-progress', name: 'In Progress', emoji: '🚀', color: 'bg-blue-200 text-blue-700' },
  { id: 'achieved', name: 'Achieved', emoji: '✅', color: 'bg-green-200 text-green-700' },
]

// Sample vision items for demonstration - Rich data with images and varied content
const sampleItems: VisionItem[] = [
  {
    id: 1,
    type: 'image',
    content: 'Dream Home Inspiration',
    author: 'her',
    timestamp: new Date('2024-11-15').getTime(),
    category: 'home',
    status: 'in-progress',
    isPinned: true,
    shape: 'large',
    targetDate: '2026-12-31',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkE1NzQiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI0U4OTc5RCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0Y0QTZDMSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjQwJSIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0iQXJpYWwiPvCfjK48L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIj5PdXIgRHJlYW0gSG9tZTwvdGV4dD48L3N2Zz4=',
  },
  {
    id: 2,
    type: 'text',
    content: 'Take a romantic trip to Paris together - walk along the Seine, visit the Eiffel Tower at sunset, and create unforgettable memories in the City of Love',
    author: 'you',
    timestamp: new Date('2024-12-01').getTime(),
    category: 'travel',
    status: 'not-started',
    isPinned: true,
    shape: 'wide',
    targetDate: '2025-06-01',
  },
  {
    id: 3,
    type: 'image',
    content: 'Fitness Goals Together',
    author: 'you',
    timestamp: new Date('2024-12-05').getTime(),
    category: 'health',
    status: 'in-progress',
    isPinned: false,
    shape: 'tall',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0QURBNTAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMEI5ODEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIj7wn5KpPC90ZXh0Pjwvc3ZnPg==',
  },
  {
    id: 4,
    type: 'text',
    content: 'Save up for our dream home - a cozy place with a garden where we can grow old together',
    author: 'her',
    timestamp: new Date('2024-12-05').getTime(),
    category: 'home',
    status: 'in-progress',
    isPinned: true,
    shape: 'wide',
    targetDate: '2026-12-31',
  },
  {
    id: 5,
    type: 'text',
    content: 'Start a fitness journey together - morning runs, healthy meals, and supporting each other every step of the way',
    author: 'you',
    timestamp: new Date('2024-12-10').getTime(),
    category: 'health',
    status: 'in-progress',
    isPinned: false,
    shape: 'square',
  },
  {
    id: 6,
    type: 'image',
    content: 'Career Growth',
    author: 'her',
    timestamp: new Date('2024-12-12').getTime(),
    category: 'career',
    status: 'in-progress',
    isPinned: false,
    shape: 'square',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNBMDRGRkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRjEwQkYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIj7wn5KpPC90ZXh0Pjwvc3ZnPg==',
  },
  {
    id: 7,
    type: 'text',
    content: 'Learn a new language together - maybe French for our Paris trip!',
    author: 'her',
    timestamp: new Date('2024-12-15').getTime(),
    category: 'personal',
    status: 'not-started',
    isPinned: false,
    shape: 'tall',
  },
  {
    id: 8,
    type: 'text',
    content: 'Plan monthly date nights - keep the spark alive with new experiences and adventures',
    author: 'you',
    timestamp: new Date('2024-12-20').getTime(),
    category: 'relationship',
    status: 'in-progress',
    isPinned: true,
    shape: 'wide',
  },
  {
    id: 9,
    type: 'image',
    content: 'Adventure Awaits',
    author: 'you',
    timestamp: new Date('2024-12-22').getTime(),
    category: 'adventure',
    status: 'not-started',
    isPinned: false,
    shape: 'wide',
    targetDate: '2025-08-01',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxNEE5ODciLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzJERENBRCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzE0QTk4NyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0iQXJpYWwiPvCfjKk8L3RleHQ+PC9zdmc+',
  },
  {
    id: 10,
    type: 'text',
    content: 'Build an emergency fund together - financial security for our future',
    author: 'her',
    timestamp: new Date('2024-12-25').getTime(),
    category: 'financial',
    status: 'in-progress',
    isPinned: false,
    shape: 'square',
  },
  {
    id: 11,
    type: 'text',
    content: 'Start a side business together - something we\'re both passionate about',
    author: 'you',
    timestamp: new Date('2024-12-28').getTime(),
    category: 'career',
    status: 'not-started',
    isPinned: false,
    shape: 'square',
    targetDate: '2025-12-31',
  },
  {
    id: 12,
    type: 'image',
    content: 'Creative Projects',
    author: 'her',
    timestamp: new Date('2024-12-30').getTime(),
    category: 'creative',
    status: 'in-progress',
    isPinned: false,
    shape: 'tall',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRjEwQkYiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI0UwMTBGRiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGMTA2RiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0iQXJpYWwiPvCfkqg8L3RleHQ+PC9zdmc+',
  },
  {
    id: 13,
    type: 'text',
    content: 'Cook together every Sunday - try new recipes and make it our special tradition',
    author: 'you',
    timestamp: new Date('2025-01-02').getTime(),
    category: 'relationship',
    status: 'achieved',
    isPinned: false,
    shape: 'square',
  },
  {
    id: 14,
    type: 'text',
    content: 'Read 12 books together this year - one book per month and discuss our thoughts',
    author: 'her',
    timestamp: new Date('2025-01-05').getTime(),
    category: 'personal',
    status: 'in-progress',
    isPinned: false,
    shape: 'wide',
    targetDate: '2025-12-31',
  },
  {
    id: 15,
    type: 'image',
    content: 'Travel Bucket List',
    author: 'you',
    timestamp: new Date('2025-01-08').getTime(),
    category: 'travel',
    status: 'not-started',
    isPinned: true,
    shape: 'large',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MEE1RkYiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzE3QjJGRiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzYwQTVGRiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjQwJSIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0iQXJpYWwiPvCfkq48L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIj5UcmF2ZWwgRHJlYW1zPC90ZXh0Pjwvc3ZnPg==',
  },
  {
    id: 16,
    type: 'text',
    content: 'Get a pet together - maybe a cute dog or cat to complete our family',
    author: 'her',
    timestamp: new Date('2025-01-10').getTime(),
    category: 'home',
    status: 'not-started',
    isPinned: false,
    shape: 'square',
    targetDate: '2025-06-01',
  },
  {
    id: 17,
    type: 'text',
    content: 'Meditate together every morning - start our days with peace and mindfulness',
    author: 'you',
    timestamp: new Date('2025-01-12').getTime(),
    category: 'health',
    status: 'in-progress',
    isPinned: false,
    shape: 'tall',
  },
  {
    id: 18,
    type: 'text',
    content: 'Invest in stocks together - learn about finance and build wealth as a team',
    author: 'her',
    timestamp: new Date('2025-01-15').getTime(),
    category: 'financial',
    status: 'not-started',
    isPinned: false,
    shape: 'square',
  },
  {
    id: 19,
    type: 'image',
    content: 'Relationship Goals',
    author: 'you',
    timestamp: new Date('2025-01-18').getTime(),
    category: 'relationship',
    status: 'in-progress',
    isPinned: true,
    shape: 'wide',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRjEwNkYiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI0Y0QTZDMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0U5OEE3RCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0iQXJpYWwiPvCfkq08L3RleHQ+PC9zdmc+',
  },
  {
    id: 20,
    type: 'text',
    content: 'Volunteer together at a local charity - give back to the community as a couple',
    author: 'her',
    timestamp: new Date('2025-01-20').getTime(),
    category: 'other',
    status: 'not-started',
    isPinned: false,
    shape: 'square',
  },
]

export default function VisionBoard() {
  const [items, setItems] = useState<VisionItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>('all')
  const [formType, setFormType] = useState<'text' | 'image'>('text')
  const [textContent, setTextContent] = useState('')
  const [selectedCategoryForm, setSelectedCategoryForm] = useState<GoalCategory>('travel')
  const [selectedStatus, setSelectedStatus] = useState<ProgressStatus>('not-started')
  const [targetDate, setTargetDate] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [selectedAuthor, setSelectedAuthor] = useState<'you' | 'her'>('you')
  const [selectedItem, setSelectedItem] = useState<VisionItem | null>(null)

  // Load items from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('vision-board-items')
    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems)
        // If parsed array is empty or invalid, use sample data
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed)
        } else {
          // Empty array or invalid data, use sample items
          setItems(sampleItems)
          // Save sample items to localStorage
          localStorage.setItem('vision-board-items', JSON.stringify(sampleItems))
        }
      } catch (e) {
        console.error('Error loading vision board items:', e)
        // If error, use sample data
        setItems(sampleItems)
        localStorage.setItem('vision-board-items', JSON.stringify(sampleItems))
      }
    } else {
      // No saved data, use sample items
      setItems(sampleItems)
      localStorage.setItem('vision-board-items', JSON.stringify(sampleItems))
    }
  }, [])

  // Save items to localStorage (only if items exist and are not empty)
  useEffect(() => {
    // Only save if items array has content and is not the initial empty state
    if (items.length > 0) {
      localStorage.setItem('vision-board-items', JSON.stringify(items))
    }
  }, [items])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Maximum size is 5MB.')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getShapeClasses = (shape: ShapeType, type: 'text' | 'image'): string => {
    const baseClasses = 'relative'
    switch (shape) {
      case 'wide':
        return `${baseClasses} col-span-1 md:col-span-2`
      case 'tall':
        return `${baseClasses} row-span-2`
      case 'large':
        return `${baseClasses} col-span-1 md:col-span-2 row-span-2`
      default:
        return `${baseClasses} col-span-1`
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formType === 'text' && textContent.trim()) {
      // Randomly assign shape for visual variety
      const shapes: ShapeType[] = ['square', 'wide', 'tall', 'large']
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)]

      const newItem: VisionItem = {
        id: Date.now(),
        type: 'text',
        content: textContent.trim(),
        author: selectedAuthor,
        timestamp: Date.now(),
        category: selectedCategoryForm,
        status: selectedStatus,
        isPinned: false,
        shape: randomShape,
        targetDate: targetDate || undefined,
      }
      setItems([...items, newItem])
      resetForm()
    } else if (formType === 'image' && imagePreview) {
      const shapes: ShapeType[] = ['square', 'wide', 'tall', 'large']
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)]

      const newItem: VisionItem = {
        id: Date.now(),
        type: 'image',
        content: imageFile?.name || 'Image',
        author: selectedAuthor,
        timestamp: Date.now(),
        imageUrl: imagePreview,
        category: selectedCategoryForm,
        status: selectedStatus,
        isPinned: false,
        shape: randomShape,
        targetDate: targetDate || undefined,
      }
      setItems([...items, newItem])
      resetForm()
    }
  }

  const resetForm = () => {
    setTextContent('')
    setImageFile(null)
    setImagePreview('')
    setTargetDate('')
    setSelectedStatus('not-started')
    setSelectedCategoryForm('travel')
    setSelectedAuthor('you')
    setShowAddForm(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const handleTogglePin = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    ))
  }

  const handleStatusChange = (id: number, newStatus: ProgressStatus) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ))
  }

  // Filter items
  const filteredItems: VisionItem[] = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  // Sort: Pinned first, then by timestamp
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return b.timestamp - a.timestamp
  })

  const getCategoryInfo = (categoryId: GoalCategory) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1]
  }

  const getProgressPercentage = (status: ProgressStatus): number => {
    switch (status) {
      case 'not-started':
        return 0
      case 'in-progress':
        return 50
      case 'achieved':
        return 100
      default:
        return 0
    }
  }

  const handleItemClick = (item: VisionItem) => {
    setSelectedItem(item)
  }

  const handleCloseDetail = () => {
    setSelectedItem(null)
  }

  return (
    <div className="max-w-7xl mx-auto relative z-20">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 sm:mb-12"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-3 sm:mb-4">
          ✨ Our Vision Board
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-soft-gray font-inter">
          Dreams, goals, and plans we want to achieve together
        </p>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory('all' as GoalCategory | 'all')}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all min-h-[44px] ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-soft-rose to-blush-pink text-white shadow-lg scale-105'
                : 'bg-white/50 text-charcoal hover:bg-white/80 border-2 border-soft-rose/20'
            }`}
          >
            All Goals ({items.length})
          </button>
          {categories.map((category) => {
            const count = items.filter(item => item.category === category.id).length
            if (count === 0) return null
            return (
              <button
                key={category.id}
                  onClick={() => setSelectedCategory(category.id as GoalCategory | 'all')}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all min-h-[44px] flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                    : 'bg-white/50 text-charcoal hover:bg-white/80 border-2 border-soft-rose/20'
                }`}
              >
                <span>{category.emoji}</span>
                <span className="hidden sm:inline">{category.name}</span>
                <span className="text-xs">({count})</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Add Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mb-6 sm:mb-8"
      >
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-soft-rose to-blush-pink text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all min-h-[44px]"
        >
          {showAddForm ? '✕ Cancel' : '+ Add New Goal'}
        </motion.button>
      </motion.div>

      {/* Premium Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-6 sm:mb-8 shadow-xl border-2 border-white/40 overflow-hidden"
          >
            {/* Form Type Selection */}
            <div className="flex gap-3 sm:gap-4 mb-6">
              <button
                onClick={() => setFormType('text')}
                className={`flex-1 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all min-h-[44px] ${
                  formType === 'text'
                    ? 'bg-gradient-to-r from-soft-rose to-blush-pink text-white shadow-md'
                    : 'bg-white/50 text-charcoal border-2 border-soft-rose/30 hover:bg-white/80'
                }`}
              >
                📝 Text Goal
              </button>
              <button
                onClick={() => setFormType('image')}
                className={`flex-1 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all min-h-[44px] ${
                  formType === 'image'
                    ? 'bg-gradient-to-r from-soft-rose to-blush-pink text-white shadow-md'
                    : 'bg-white/50 text-charcoal border-2 border-soft-rose/30 hover:bg-white/80'
                }`}
              >
                🖼️ Image Goal
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Content Input */}
              {formType === 'text' ? (
                <div>
                  <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-2 ml-1">
                    Your Goal / Dream
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Describe your dream, goal, or plan for the future..."
                    rows={4}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-soft-rose/30 focus:border-soft-rose focus:outline-none resize-none text-sm sm:text-base bg-white/50 focus:bg-white transition-all min-h-[100px]"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-2 ml-1">
                    Upload Image
                  </label>
                  <div className="relative">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 sm:h-64 object-cover rounded-xl sm:rounded-2xl border-2 border-soft-rose/30"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('')
                            setImageFile(null)
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="block w-full h-48 sm:h-64 rounded-xl sm:rounded-2xl border-2 border-dashed border-soft-rose/30 bg-white/30 hover:bg-white/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3">
                        <span className="text-4xl sm:text-5xl">📷</span>
                        <div className="text-center">
                          <p className="text-sm sm:text-base font-semibold text-charcoal">Click to Upload Image</p>
                          <p className="text-xs sm:text-sm text-soft-gray mt-1">JPG, PNG, GIF (Max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required={formType === 'image'}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-3 ml-1">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategoryForm(category.id)}
                      className={`py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all min-h-[44px] flex flex-col items-center gap-1 ${
                        selectedCategoryForm === category.id
                          ? `bg-gradient-to-r ${category.color} text-white shadow-md scale-105`
                          : 'bg-white/50 text-charcoal border-2 border-soft-rose/20 hover:bg-white/80'
                      }`}
                    >
                      <span className="text-lg sm:text-xl">{category.emoji}</span>
                      <span className="hidden sm:inline">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-3 ml-1">
                  Progress Status
                </label>
                <div className="flex gap-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setSelectedStatus(status.id)}
                      className={`flex-1 py-3 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all min-h-[44px] ${
                        selectedStatus === status.id
                          ? `${status.color} shadow-md scale-105`
                          : 'bg-white/50 text-charcoal border-2 border-soft-rose/20 hover:bg-white/80'
                      }`}
                    >
                      <span className="text-base sm:text-lg">{status.emoji}</span>
                      <span className="hidden sm:inline ml-2">{status.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Date (Optional) */}
              <div>
                <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-2 ml-1">
                  Target Date <span className="text-soft-gray/60 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-soft-rose/30 focus:border-soft-rose focus:outline-none text-sm sm:text-base bg-white/50 focus:bg-white transition-all min-h-[44px]"
                />
              </div>

              {/* Author Selection */}
              <div>
                <label className="block text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-3 ml-1">
                  Created By
                </label>
                <div className="bg-white/40 p-1 rounded-2xl flex relative">
                  <motion.div
                    initial={false}
                    animate={{
                      x: selectedAuthor === 'you' ? 0 : '100%'
                    }}
                    className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm z-0"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedAuthor('you')}
                    className={`flex-1 py-3 text-center rounded-xl relative z-10 text-sm font-bold transition-colors min-h-[44px] ${
                      selectedAuthor === 'you' ? 'text-charcoal' : 'text-soft-gray hover:text-charcoal/70'
                    }`}
                  >
                    {personalization.yourName} 🙋‍♂️
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAuthor('her')}
                    className={`flex-1 py-3 text-center rounded-xl relative z-10 text-sm font-bold transition-colors min-h-[44px] ${
                      selectedAuthor === 'her' ? 'text-charcoal' : 'text-soft-gray hover:text-charcoal/70'
                    }`}
                  >
                    {personalization.herName} 🙋‍♀️
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={formType === 'text' ? !textContent.trim() : !imagePreview}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-soft-rose to-blush-pink text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[44px]"
              >
                Add Goal ✨
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vision Board Grid */}
      {sortedItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 sm:py-20 glass rounded-2xl sm:rounded-3xl"
        >
          <div className="text-6xl sm:text-7xl mb-4">✨</div>
          <p className="text-soft-gray text-base sm:text-lg mb-2">
            {selectedCategory === 'all' 
              ? 'Your vision board is empty. Start adding your dreams and goals!'
              : `No goals in this category yet. Add your first ${categories.find(c => c.id === selectedCategory)?.name || 'goal'}!`}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-soft-rose to-blush-pink text-white font-semibold hover:scale-105 transition-transform min-h-[44px]"
          >
            Add Your First Goal
          </button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr relative z-20"
          style={{ opacity: 1 }}
        >
          <AnimatePresence mode="popLayout">
            {sortedItems.map((item, index) => {
              const categoryInfo = getCategoryInfo(item.category)
              const statusInfo = statusOptions.find(s => s.id === item.status) || statusOptions[0]
              const shapeClasses = getShapeClasses(item.shape || 'square', item.type)
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  style={{ position: 'relative', zIndex: 20, opacity: 1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => handleItemClick(item)}
                  className={`${shapeClasses} group relative cursor-pointer z-20`}
                >
                  <div className={`h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative ${
                    item.type === 'image' 
                      ? `bg-gradient-to-br ${categoryInfo.color} bg-opacity-20` 
                      : 'bg-white'
                  } border-2 ${
                    item.isPinned 
                      ? 'border-yellow-400 shadow-yellow-400/30' 
                      : item.author === 'you' 
                        ? 'border-soft-rose/60' 
                        : 'border-blush-pink/60'
                  }`}>
                    {/* Pin Indicator */}
                    {item.isPinned && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm">📌</span>
                        </div>
                      </div>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shadow-lg flex items-center justify-center min-h-[44px] min-w-[44px]"
                      aria-label="Delete goal"
                    >
                      ✕
                    </button>

                    {/* Pin/Unpin Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTogglePin(item.id)
                      }}
                      className={`absolute ${item.isPinned ? 'top-3 right-14' : 'top-3 right-3'} z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shadow-lg flex items-center justify-center min-h-[44px] min-w-[44px] ${
                        item.isPinned 
                          ? 'bg-yellow-400 text-white' 
                          : 'bg-white/80 text-charcoal hover:bg-yellow-400 hover:text-white'
                      }`}
                      aria-label={item.isPinned ? 'Unpin goal' : 'Pin goal'}
                    >
                      {item.isPinned ? '📌' : '📍'}
                    </button>

                    {/* Category Badge */}
                    <div className={`absolute ${item.isPinned ? 'top-14' : 'top-3'} left-3 z-10 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg bg-gradient-to-r ${categoryInfo.color}`}>
                      {categoryInfo.emoji} {categoryInfo.name}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as ProgressStatus)}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border-0 outline-none cursor-pointer min-h-[44px] ${statusInfo.color}`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.emoji} {status.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Content */}
                    {item.type === 'text' ? (
                      <div className="h-full p-4 sm:p-6 flex flex-col justify-between bg-white">
                        <p className="text-charcoal font-inter text-sm sm:text-base mb-4 whitespace-pre-wrap flex-1 font-medium leading-relaxed">
                          {item.content}
                        </p>
                        <div className="space-y-2 pt-4 border-t border-soft-rose/20">
                          <div className="flex items-center justify-between text-xs text-charcoal/70 font-medium">
                            <span>
                              {item.author === 'you' ? personalization.yourName : personalization.herName}
                            </span>
                            {item.targetDate && (
                              <span className="text-soft-rose font-semibold">
                                🗓️ {new Date(item.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-charcoal/60">
                            {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        {item.imageUrl && (
                          <div className="flex-1 relative overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.content}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                              <p className="text-white text-sm sm:text-base font-semibold drop-shadow-lg">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm">
                          <div className="flex items-center justify-between text-xs text-charcoal">
                            <span>
                              {item.author === 'you' ? personalization.yourName : personalization.herName}
                            </span>
                            {item.targetDate && (
                              <span className="text-soft-rose">
                                🗓️ {new Date(item.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Detail View Modal - Only render when selectedItem exists */}
      {selectedItem && (
        <AnimatePresence mode="wait">
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleCloseDetail}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
            />
            
            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-full z-[60] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border-2 border-white/40 relative">
                {/* Close Button */}
                <button
                  onClick={handleCloseDetail}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 hover:bg-red-500 text-charcoal hover:text-white transition-all flex items-center justify-center shadow-lg z-10 min-h-[44px] min-w-[44px]"
                  aria-label="Close detail view"
                >
                  ✕
                </button>

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg bg-gradient-to-r ${getCategoryInfo(selectedItem.category).color}`}>
                      {getCategoryInfo(selectedItem.category).emoji} {getCategoryInfo(selectedItem.category).name}
                    </div>
                    {selectedItem.isPinned && (
                      <div className="px-3 py-1.5 rounded-full bg-yellow-400 text-white text-sm font-semibold shadow-lg">
                        📌 Pinned
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-playfair font-bold text-charcoal mb-3 pr-12">
                    {selectedItem.type === 'image' ? selectedItem.content : 'Goal Details'}
                  </h3>
                </div>

                {/* Image (if image type) */}
                {selectedItem.type === 'image' && selectedItem.imageUrl && (
                  <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.content}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-soft-rose/80 uppercase tracking-wider mb-3">
                    Goal Description
                  </h4>
                  <p className="text-base sm:text-lg text-charcoal font-inter whitespace-pre-wrap leading-relaxed">
                    {selectedItem.type === 'text' ? selectedItem.content : `This is an image goal: ${selectedItem.content}`}
                  </p>
                </div>

                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-soft-rose/80 uppercase tracking-wider">
                      Progress
                    </h4>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      statusOptions.find(s => s.id === selectedItem.status)?.color || 'bg-gray-200 text-gray-700'
                    }`}>
                      {statusOptions.find(s => s.id === selectedItem.status)?.emoji} {statusOptions.find(s => s.id === selectedItem.status)?.name}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage(selectedItem.status)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        selectedItem.status === 'achieved' 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                          : selectedItem.status === 'in-progress'
                          ? 'bg-gradient-to-r from-blue-400 to-cyan-500'
                          : 'bg-gradient-to-r from-gray-300 to-gray-400'
                      } shadow-lg`}
                    />
                  </div>
                  <p className="text-xs text-soft-gray mt-2 text-right">
                    {getProgressPercentage(selectedItem.status)}% Complete
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/30 rounded-xl p-4">
                    <p className="text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-2">
                      Created By
                    </p>
                    <p className="text-base font-semibold text-charcoal">
                      {selectedItem.author === 'you' ? personalization.yourName : personalization.herName}
                    </p>
                  </div>
                  
                  <div className="bg-white/30 rounded-xl p-4">
                    <p className="text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-2">
                      Created On
                    </p>
                    <p className="text-base font-semibold text-charcoal">
                      {new Date(selectedItem.timestamp).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  {selectedItem.targetDate && (
                    <div className="bg-white/30 rounded-xl p-4 sm:col-span-2">
                      <p className="text-xs font-bold text-soft-rose/80 uppercase tracking-wider mb-2">
                        Target Date
                      </p>
                      <p className="text-base font-semibold text-charcoal">
                        🗓️ {new Date(selectedItem.targetDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric',
                          weekday: 'long'
                        })}
                      </p>
                      {new Date(selectedItem.targetDate) < new Date() && selectedItem.status !== 'achieved' && (
                        <p className="text-xs text-red-500 mt-1">⚠️ Target date has passed</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTogglePin(selectedItem.id)
                      setSelectedItem({ ...selectedItem, isPinned: !selectedItem.isPinned })
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all min-h-[44px] ${
                      selectedItem.isPinned
                        ? 'bg-yellow-400 text-white hover:bg-yellow-500'
                        : 'bg-white/50 text-charcoal hover:bg-yellow-400 hover:text-white'
                    }`}
                  >
                    {selectedItem.isPinned ? '📌 Unpin Goal' : '📍 Pin Goal'}
                  </button>
                  
                  <select
                    value={selectedItem.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as ProgressStatus
                      handleStatusChange(selectedItem.id, newStatus)
                      setSelectedItem({ ...selectedItem, status: newStatus })
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 border-soft-rose/30 bg-white/50 text-charcoal focus:outline-none focus:border-soft-rose min-h-[44px]"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.emoji} {status.name}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Are you sure you want to delete this goal?')) {
                        handleDelete(selectedItem.id)
                        handleCloseDetail()
                      }
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-all min-h-[44px]"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        </AnimatePresence>
      )}
    </div>
  )
}
