import React from "react"
/**
 * ROOT LAYOUT - The top-level layout component for the entire application
 * 
 * This layout wraps all pages and sets up:
 * - Global metadata (title, description, SEO)
 * - Global fonts and typography
 * - Analytics tracking via Vercel
 * - Global CSS styles
 * 
 * Every page in the application renders within this layout's children.
 */

import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Righteous as V0_Font_Righteous } from 'next/font/google'

// Initialize the Righteous font from Google Fonts for headers and prominent text
// Using weight 400 (regular) for consistent styling throughout the app
const _righteous = V0_Font_Righteous({ subsets: ['latin'], weight: ["400"] })

// Global metadata for the application - used for SEO and browser tab display
export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

/**
 * RootLayout Component
 * @param {Readonly<{children: React.ReactNode}>} props - The page content to render within the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* Body element with global font and antialiasing for smooth text rendering */}
      <body className={`font-sans antialiased`}>
        {/* Page content renders here via Next.js routing */}
        {children}
        
        {/* Vercel Analytics: Tracks page views and performance metrics */}
        <Analytics />
      </body>
    </html>
  )
}
