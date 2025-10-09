import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Manas Wellness',
  description: 'Manas Wellness - supporting mental health and community wellbeing',
  generator: 'v0.dev',
  icons: {
  icon: '/images/mwplogo.png.jpg',
  apple: '/images/mwplogo.png.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        {/* Fallback favicon links in case metadata icons aren't picked up by the browser */}
  <link rel="icon" href="/images/mwplogo.png.jpg" />
  <link rel="apple-touch-icon" href="/images/mwplogo.png.jpg" />
        <title>Manas Wellness</title>
      </head>
      <body>{children}</body>
    </html>
  )
}
