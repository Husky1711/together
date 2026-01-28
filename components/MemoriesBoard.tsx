'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { personalization } from '@/lib/personalization'

interface Memory {
  id: number
  type: 'text' | 'image' | 'voice'
  content: string
  author: 'you' | 'her'
  timestamp: number
  imageUrl?: string
  audioUrl?: string
  date?: string
  shape?: 'square' | 'wide' | 'tall' | 'large'
}

export default function MemoriesBoard() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formType, setFormType] = useState<'text' | 'image' | 'voice'>('text')
  const [textContent, setTextContent] = useState('')
  const [memoryDate, setMemoryDate] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Sample memories for demonstration
  const sampleMemories: Memory[] = [
    {
      id: 1,
      type: 'image',
      content: 'Our first date at the coffee shop',
      author: 'you',
      timestamp: new Date('2023-06-20').getTime(),
      date: '2023-06-20',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGNEE2QzEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFOThBN0QiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIj7wn5KvPC90ZXh0Pjwvc3ZnPg==',
      shape: 'wide',
    },
    {
      id: 2,
      type: 'text',
      content: 'The moment I knew you were special. Your smile, your laugh, everything about you made my heart skip a beat. I still remember how nervous I was, but you made it so easy. 💕',
      author: 'her',
      timestamp: new Date('2023-07-15').getTime(),
      date: '2023-07-15',
      shape: 'wide',
    },
    {
      id: 3,
      type: 'image',
      content: 'Sunset at the beach',
      author: 'you',
      timestamp: new Date('2023-08-10').getTime(),
      date: '2023-08-10',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNEOEE1NzQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFOThBN0QiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIj7wn5KvPC90ZXh0Pjwvc3ZnPg==',
      shape: 'tall',
    },
    {
      id: 4,
      type: 'text',
      content: 'Remember when we got lost in the city and ended up finding the best pizza place? That was the best "mistake" ever! 🍕',
      author: 'her',
      timestamp: new Date('2023-09-05').getTime(),
      date: '2023-09-05',
      shape: 'wide',
    },
    {
      id: 5,
      type: 'image',
      content: 'Celebrating our first month together',
      author: 'you',
      timestamp: new Date('2023-07-15').getTime(),
      date: '2023-07-15',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGNEE2QzEiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI0U5OEE3RCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0Q0QTU3NCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0iQXJpYWwiPvCfkq88L3RleHQ+PC9zdmc+',
      shape: 'large',
    },
    {
      id: 6,
      type: 'text',
      content: 'Every morning I wake up grateful that you\'re in my life. You make everything better just by being you. 🌅',
      author: 'you',
      timestamp: new Date('2023-10-20').getTime(),
      date: '2023-10-20',
      shape: 'wide',
    },
    {
      id: 7,
      type: 'image',
      content: 'Movie night memories',
      author: 'her',
      timestamp: new Date('2023-11-12').getTime(),
      date: '2023-11-12',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNFOThBN0QiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNEE2QzEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIj7wn5KvPC90ZXh0Pjwvc3ZnPg==',
      shape: 'square',
    },
    {
      id: 8,
      type: 'text',
      content: 'The way you laugh at my jokes even when they\'re not funny. That\'s true love right there! 😂',
      author: 'her',
      timestamp: new Date('2023-12-01').getTime(),
      date: '2023-12-01',
      shape: 'wide',
    },
    {
      id: 9,
      type: 'image',
      content: 'Our first trip together',
      author: 'you',
      timestamp: new Date('2024-01-15').getTime(),
      date: '2024-01-15',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNEOEE1NzQiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI0U5OEE3RCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0Y0QTZDMSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0iQXJpYWwiPvCfkq88L3RleHQ+PC9zdmc+',
      shape: 'wide',
    },
    {
      id: 10,
      type: 'text',
      content: 'You make ordinary moments feel extraordinary. Just being with you is enough to make my day perfect. ✨',
      author: 'you',
      timestamp: new Date('2024-02-05').getTime(),
      date: '2024-02-05',
      shape: 'wide',
    },
    {
      id: 11,
      type: 'image',
      content: 'Valentine\'s Day surprise',
      author: 'her',
      timestamp: new Date('2024-02-14').getTime(),
      date: '2024-02-14',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGNEE2QzEiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI0U5OEE3RCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0Q0QTU3NCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0iQXJpYWwiPvCfkq88L3RleHQ+PC9zdmc+',
      shape: 'tall',
    },
    {
      id: 12,
      type: 'text',
      content: 'I love how we can talk for hours about nothing and everything at the same time. Time flies when I\'m with you. ⏰💕',
      author: 'you',
      timestamp: new Date('2024-02-10').getTime(),
      date: '2024-02-10',
      shape: 'wide',
    },
    {
      id: 13,
      type: 'image',
      content: 'Cooking together for the first time',
      author: 'her',
      timestamp: new Date('2023-10-05').getTime(),
      date: '2023-10-05',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNFOThBN0QiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNEE2QzEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIj7wn5KvPC90ZXh0Pjwvc3ZnPg==',
      shape: 'square',
    },
    {
      id: 14,
      type: 'text',
      content: 'Your hugs are my favorite place in the world. They make everything okay. 🤗',
      author: 'her',
      timestamp: new Date('2023-11-20').getTime(),
      date: '2023-11-20',
      shape: 'wide',
    },
    {
      id: 15,
      type: 'image',
      content: 'Dancing in the rain',
      author: 'you',
      timestamp: new Date('2023-09-25').getTime(),
      date: '2023-09-25',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNEOEE1NzQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNEE2QzEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIj7wn5KvPC90ZXh0Pjwvc3ZnPg==',
      shape: 'wide',
    },
  ]

  // Load memories from localStorage or use samples
  useEffect(() => {
    const savedMemories = localStorage.getItem('memories-board-items')
    if (savedMemories) {
      try {
        const parsed = JSON.parse(savedMemories)
        if (parsed.length > 0) {
          setMemories(parsed)
          return
        }
      } catch (e) {
        console.error('Error loading memories:', e)
      }
    }
    // If no saved memories or empty, use sample data
    setMemories(sampleMemories)
  }, [])

  // Save memories to localStorage
  useEffect(() => {
    localStorage.setItem('memories-board-items', JSON.stringify(memories))
  }, [memories])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Microphone access denied. Please allow microphone access to record voice notes.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const getRandomShape = (): 'square' | 'wide' | 'tall' | 'large' => {
    const shapes: ('square' | 'wide' | 'tall' | 'large')[] = ['square', 'wide', 'tall', 'large']
    return shapes[Math.floor(Math.random() * shapes.length)]
  }

  const handleSubmit = (e: React.FormEvent, author: 'you' | 'her') => {
    e.preventDefault()
    
    if (formType === 'text' && textContent.trim()) {
      const newMemory: Memory = {
        id: Date.now(),
        type: 'text',
        content: textContent.trim(),
        author,
        timestamp: Date.now(),
        date: memoryDate || undefined,
        shape: 'wide',
      }
      setMemories([newMemory, ...memories])
      setTextContent('')
      setMemoryDate('')
      setShowAddForm(false)
    } else if (formType === 'image' && imagePreview) {
      const newMemory: Memory = {
        id: Date.now(),
        type: 'image',
        content: imageFile?.name || 'Memory photo',
        author,
        timestamp: Date.now(),
        imageUrl: imagePreview,
        date: memoryDate || undefined,
        shape: getRandomShape(),
      }
      setMemories([newMemory, ...memories])
      setImageFile(null)
      setImagePreview('')
      setMemoryDate('')
      setShowAddForm(false)
    } else if (formType === 'voice' && audioUrl) {
      const newMemory: Memory = {
        id: Date.now(),
        type: 'voice',
        content: `Voice note (${recordingTime}s)`,
        author,
        timestamp: Date.now(),
        audioUrl: audioUrl,
        date: memoryDate || undefined,
        shape: 'square',
      }
      setMemories([newMemory, ...memories])
      setAudioBlob(null)
      setAudioUrl('')
      setRecordingTime(0)
      setMemoryDate('')
      setShowAddForm(false)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      setMemories(memories.filter(memory => memory.id !== id))
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Sort memories by date (newest first)
  const sortedMemories = [...memories].sort((a, b) => b.timestamp - a.timestamp)

  // Get shape classes
  const getShapeClasses = (shape: string, type: string) => {
    if (type === 'image') {
      switch (shape) {
        case 'wide':
          return 'col-span-1 md:col-span-2 aspect-[2/1]'
        case 'tall':
          return 'col-span-1 aspect-[1/1.5]'
        case 'large':
          return 'col-span-1 md:col-span-2 aspect-[4/3]'
        default:
          return 'col-span-1 aspect-square'
      }
    }
    return 'col-span-1 md:col-span-2'
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Floating Add Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddForm(!showAddForm)}
        className="fixed bottom-24 md:bottom-8 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-soft-rose to-blush-pink text-white text-3xl shadow-2xl hover:shadow-soft-rose/50 transition-all focus:outline-none focus:ring-4 focus:ring-soft-rose/30"
        aria-label="Add memory"
      >
        {showAddForm ? '✕' : '+'}
      </motion.button>

      {/* Add Memory Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-playfair font-bold text-charcoal">Add Memory</h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="w-10 h-10 rounded-full bg-soft-rose/10 text-soft-rose hover:bg-soft-rose hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Type Selector */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { type: 'text', icon: '📝', label: 'Text' },
                    { type: 'image', icon: '🖼️', label: 'Photo' },
                    { type: 'voice', icon: '🎤', label: 'Voice' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => {
                        setFormType(item.type as 'text' | 'image' | 'voice')
                        if (item.type === 'voice' && !isRecording && !audioUrl) {
                          startRecording()
                        }
                      }}
                      className={`py-4 rounded-xl font-semibold transition-all ${
                        formType === item.type
                          ? 'bg-gradient-to-r from-soft-rose to-blush-pink text-white shadow-lg scale-105'
                          : 'bg-soft-rose/10 text-charcoal hover:bg-soft-rose/20'
                      }`}
                    >
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="text-sm">{item.label}</div>
                    </button>
                  ))}
                </div>

                {/* Form Content */}
                <form
                  onSubmit={(e) => {
                    const author = (e.nativeEvent as any).submitter?.value === 'you' ? 'you' : 'her'
                    handleSubmit(e, author)
                  }}
                  className="space-y-4"
                >
                  {formType === 'text' && (
                    <>
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Write about a special moment, memory, or experience you shared..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border-2 border-soft-rose/30 focus:border-soft-rose focus:outline-none resize-none"
                        required
                      />
                    </>
                  )}

                  {formType === 'image' && (
                    <>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                          required
                        />
                        <label
                          htmlFor="image-upload"
                          className="block w-full px-6 py-12 border-2 border-dashed border-soft-rose/30 rounded-xl text-center cursor-pointer hover:border-soft-rose hover:bg-soft-rose/5 transition-all"
                        >
                          <div className="text-4xl mb-2">📷</div>
                          <div className="text-soft-gray font-inter">
                            {imagePreview ? 'Change Photo' : 'Click to upload photo'}
                          </div>
                        </label>
                      </div>
                      {imagePreview && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4"
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-xl shadow-lg"
                          />
                        </motion.div>
                      )}
                    </>
                  )}

                  {formType === 'voice' && (
                    <div className="space-y-4">
                      {!audioUrl && (
                        <div className="text-center py-8 bg-gradient-to-br from-soft-rose/10 to-blush-pink/10 rounded-xl">
                          {isRecording ? (
                            <div>
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-20 h-20 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                              >
                                <span className="text-white text-3xl">🎤</span>
                              </motion.div>
                              <p className="text-charcoal font-semibold text-xl mb-2">
                                {formatTime(recordingTime)}
                              </p>
                              <button
                                type="button"
                                onClick={stopRecording}
                                className="px-6 py-3 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                              >
                                Stop Recording
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="text-5xl mb-4">🎤</div>
                              <p className="text-soft-gray mb-4">Click "Voice" above to start recording</p>
                              <button
                                type="button"
                                onClick={startRecording}
                                className="px-6 py-3 rounded-full bg-soft-rose text-white font-semibold hover:bg-blush-pink transition-colors"
                              >
                                Start Recording
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {audioUrl && (
                        <div className="bg-gradient-to-br from-soft-rose/10 to-blush-pink/10 rounded-xl p-6">
                          <audio src={audioUrl} controls className="w-full" />
                          <button
                            type="button"
                            onClick={() => {
                              setAudioUrl('')
                              setAudioBlob(null)
                              setRecordingTime(0)
                            }}
                            className="mt-4 text-sm text-soft-gray hover:text-soft-rose"
                          >
                            Record Again
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date Input */}
                  <input
                    type="date"
                    value={memoryDate}
                    onChange={(e) => setMemoryDate(e.target.value)}
                    placeholder="When did this happen? (optional)"
                    className="w-full px-4 py-3 rounded-xl border-2 border-soft-rose/30 focus:border-soft-rose focus:outline-none"
                  />

                  {/* Author Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      value="you"
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-soft-rose to-blush-pink text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Add as {personalization.yourName}
                    </button>
                    <button
                      type="submit"
                      value="her"
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blush-pink to-rose-gold text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Add as {personalization.herName}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Memories Grid - Masonry Layout */}
      {sortedMemories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 glass rounded-3xl"
        >
          <div className="text-6xl mb-4">💕</div>
          <p className="text-soft-gray text-lg mb-2">
            No memories yet. Start capturing your special moments together!
          </p>
          <p className="text-soft-gray text-sm">
            Click the + button to add your first memory
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <AnimatePresence>
            {sortedMemories.map((memory, index) => {
              const shapeClasses = getShapeClasses(memory.shape || 'square', memory.type)
              const authorColor = memory.author === 'you' ? 'soft-rose' : 'blush-pink'
              
              return (
                <motion.div
                  key={memory.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`${shapeClasses} group relative`}
                >
                  <div className={`h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative ${
                    memory.type === 'image' ? 'bg-gradient-to-br from-soft-rose/20 to-blush-pink/20' : 'glass'
                  }`}>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(memory.id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shadow-lg"
                      aria-label="Delete memory"
                    >
                      ×
                    </button>

                    {/* Author Badge */}
                    <div className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg ${
                      memory.author === 'you' ? 'bg-soft-rose' : 'bg-blush-pink'
                    }`}>
                      {memory.author === 'you' ? personalization.yourName : personalization.herName}
                    </div>

                    {/* Memory Content */}
                    {memory.type === 'text' && (
                      <div className="h-full p-6 flex flex-col justify-between">
                        <p className="text-charcoal font-inter whitespace-pre-wrap flex-1">
                          {memory.content}
                        </p>
                        <div className="mt-4 pt-4 border-t border-soft-rose/20">
                          <div className="flex items-center gap-2 text-xs text-soft-gray">
                            {memory.date && (
                              <>
                                <span>📅 {new Date(memory.date).toLocaleDateString()}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>{new Date(memory.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {memory.type === 'image' && memory.imageUrl && (
                      <div className="h-full relative">
                        <img
                          src={memory.imageUrl}
                          alt={memory.content}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          {memory.content !== 'Memory photo' && (
                            <p className="text-white text-sm font-inter mb-2">{memory.content}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-white/80">
                            {memory.date && (
                              <>
                                <span>📅 {new Date(memory.date).toLocaleDateString()}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>{new Date(memory.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {memory.type === 'voice' && memory.audioUrl && (
                      <div className="h-full p-6 flex flex-col justify-center items-center">
                        <div className="text-6xl mb-4">🎤</div>
                        <p className="text-charcoal font-inter text-center mb-4">
                          {memory.content}
                        </p>
                        <audio src={memory.audioUrl} controls className="w-full mb-4" />
                        <div className="text-xs text-soft-gray text-center">
                          {memory.date && (
                            <>
                              <span>📅 {new Date(memory.date).toLocaleDateString()}</span>
                              <span> • </span>
                            </>
                          )}
                          <span>{new Date(memory.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
