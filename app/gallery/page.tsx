'use client'

import PageContainer from '@/components/Layout/PageContainer'
import PageHeader from '@/components/Layout/PageHeader'
import PhotoGallery from '@/components/PhotoGallery'

export default function GalleryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Our Gallery"
        description="Capturing moments, creating memories"
        emoji="📸"
      />
      <PhotoGallery />
    </PageContainer>
  )
}

