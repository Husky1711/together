'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface Photo {
  id: number
  src: string
  caption: string
  category: 'memories' | 'goals' | 'dreams'
}

// Sample photos - Replace with your actual photos
const photos: Photo[] = [
  {
    id: 1,
    src: '/images/photo1.jpg',
    caption: 'Our first date - I knew right then you were special',
    category: 'memories',
  },
  {
    id: 2,
    src: '/images/photo2.jpg',
    caption: 'That sunset we watched together - time stood still',
    category: 'memories',
  },
  {
    id: 3,
    src: '/images/photo3.jpg',
    caption: 'Dreaming of our next adventure together',
    category: 'dreams',
  },
  {
    id: 4,
    src: '/images/photo4.jpg',
    caption: 'Goals for 2025: More adventures, more memories',
    category: 'goals',
  },
  {
    id: 5,
    src: '/images/photo5.jpg',
    caption: 'Celebrating our first anniversary',
    category: 'memories',
  },
  {
    id: 6,
    src: '/images/photo6.jpg',
    caption: 'Planning our future together',
    category: 'goals',
  },
]

const categories = [
  { id: 'all', name: 'All', emoji: '📸' },
  { id: 'memories', name: 'Memories', emoji: '💕' },
  { id: 'goals', name: 'Goals', emoji: '🎯' },
  { id: 'dreams', name: 'Dreams', emoji: '✨' },
]

export default function PhotoGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const filteredPhotos =
    selectedCategory === 'all'
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory)

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-4">
          Our Gallery
        </h2>
        <p className="text-lg text-soft-gray font-inter">
          Capturing moments, creating memories
        </p>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap justify-center gap-4 mb-8"
        role="tablist"
        aria-label="Photo category filters"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            aria-pressed={selectedCategory === category.id}
            aria-label={`Filter by ${category.name}`}
            role="tab"
            className={`px-6 py-3 rounded-full font-inter font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-soft-rose focus:ring-offset-2 ${
              selectedCategory === category.id
                ? 'bg-soft-rose text-white shadow-md scale-105'
                : 'bg-white text-charcoal border-2 border-soft-rose/30 hover:border-soft-rose/60'
            }`}
          >
            <span className="mr-2" aria-hidden="true">{category.emoji}</span>
            {category.name}
          </button>
        ))}
      </motion.div>

      {/* Photo Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        role="grid"
        aria-label="Photo gallery"
      >
        <AnimatePresence mode="popLayout">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg group focus:outline-none focus:ring-2 focus:ring-soft-rose focus:ring-offset-2"
              onClick={() => setSelectedPhoto(photo)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelectedPhoto(photo)
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View photo: ${photo.caption}`}
            >
              {/* Placeholder for image - Replace with actual images */}
              <div className="w-full h-full bg-gradient-to-br from-soft-rose to-blush-pink flex items-center justify-center" role="img" aria-label="Photo placeholder">
                <span className="text-white text-4xl" aria-hidden="true">📷</span>
              </div>
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-white text-center px-4 font-inter text-sm">
                  {photo.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSelectedPhoto(null)
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-4xl w-full relative"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {/* Placeholder for image */}
              <div className="w-full aspect-video bg-gradient-to-br from-soft-rose to-blush-pink rounded-2xl flex items-center justify-center mb-4" role="img" aria-label={selectedPhoto.caption}>
                <span className="text-white text-6xl" aria-hidden="true">📷</span>
              </div>
              
              <p className="text-white text-center text-lg font-inter">
                {selectedPhoto.caption}
              </p>
              
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 text-white text-3xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-white rounded-full w-10 h-10 flex items-center justify-center"
                aria-label="Close photo viewer"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
