import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Righteous as V0_Font_Righteous } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"

const _righteous = V0_Font_Righteous({ subsets: ["latin"], weight: ["400"] })

export const metadata: Metadata = {
  title: "Hold'em or Fold'em Poker",
  description: "Mobile-first multiplayer poker — cash, SNG, MTT, All-in or Fold",
  generator: "v0.app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hold'em or Fold'em",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07090E" },
    { media: "(prefers-color-scheme: light)", color: "#07090E" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body
        className={`font-sans antialiased h-full overflow-x-hidden bg-[#07090E] text-foreground`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="app-shell relative mx-auto min-h-dvh w-full max-w-[430px] overflow-x-hidden">
            {children}
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
