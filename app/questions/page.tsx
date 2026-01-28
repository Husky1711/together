'use client'

import PageContainer from '@/components/Layout/PageContainer'
import PageHeader from '@/components/Layout/PageHeader'
import InteractiveQA from '@/components/InteractiveQA'

export default function QuestionsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Fun Questions"
        description="Let's see what you think!"
        emoji="❓"
      />
      <InteractiveQA />
    </PageContainer>
  )
}

