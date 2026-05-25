import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Manas Wellness Project | Mental Health Advocacy for South Asian Communities',
  description: 'A youth-led nonprofit dedicated to destigmatizing mental health in Indian and South Asian communities through education, advocacy, and open conversations.',
  keywords: ['mental health', 'South Asian', 'Indian', 'wellness', 'nonprofit', 'advocacy', 'youth-led'],
  authors: [{ name: 'Manas Wellness Project' }],
  openGraph: {
    title: 'Manas Wellness Project',
    description: 'Breaking barriers, building bridges for mental health in South Asian communities.',
    type: 'website',
  },
  icons: {
    icon: '/mwplogo.png.jpg',
    apple: '/mwplogo.png.jpg',
  },
}

export const viewport: Viewport = {
  themeColor: '#7BA89D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
