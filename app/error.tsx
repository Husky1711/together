'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center md:ml-64">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-3xl font-playfair font-bold text-charcoal mb-4">
          Something went wrong!
        </h1>
        <p className="text-soft-gray font-inter mb-6">
          Don't worry, we can fix this. Try refreshing the page or go back home.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full bg-soft-rose text-white font-semibold hover:bg-blush-pink transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-white border-2 border-soft-rose text-soft-rose font-semibold hover:bg-soft-rose/10 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

