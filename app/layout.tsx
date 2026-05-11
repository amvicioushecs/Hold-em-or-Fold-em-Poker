import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Righteous as V0_Font_Righteous } from 'next/font/google'

// Initialize fonts
const _righteous = V0_Font_Righteous({ subsets: ['latin'], weight: ["400"] })

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background" suppressHydrationWarning>
      <body className={`font-sans antialiased bg-background`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
