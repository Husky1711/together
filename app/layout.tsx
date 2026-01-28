import type { Metadata } from 'next'
import { Inter, Playfair_Display, Dancing_Script } from 'next/font/google'
import './globals.css'
import NavigationWrapper from '@/components/Navigation/NavigationWrapper'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700'],
  variable: '--font-playfair' 
})
const dancing = Dancing_Script({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700'],
  variable: '--font-dancing' 
})

export const metadata: Metadata = {
  title: 'Our Love Story',
  description: 'A personalized Valentine\'s Day experience',
  manifest: '/manifest.json',
  themeColor: '#F4A6C1',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Our Love Story',
    description: 'A personalized Valentine\'s Day experience',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}>
      <body className="font-inter antialiased">
        <NavigationWrapper>
          {children}
        </NavigationWrapper>
      </body>
    </html>
  )
}
