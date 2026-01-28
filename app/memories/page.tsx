'use client'

import PageContainer from '@/components/Layout/PageContainer'
import PageHeader from '@/components/Layout/PageHeader'
import MemoriesBoard from '@/components/MemoriesBoard'

export default function MemoriesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Our Memories"
        description="Capture and share your favorite moments together"
        emoji="💕"
      />
      <MemoriesBoard />
    </PageContainer>
  )
}

