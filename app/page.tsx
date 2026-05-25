'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { WebRTCProvider } from "@/hooks/use-webrtc"
import { ChatProvider } from "@/hooks/use-chat"
import { PokerGameProvider } from "@/hooks/use-poker-game"
import PokerTable from "@/components/poker-table"
import AIOpponents from "@/components/ai-opponents"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-4">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <WebRTCProvider>
      <ChatProvider>
        <PokerGameProvider>
          <AIOpponents />
          <main className="min-h-screen bg-background">
            <PokerTable />
          </main>
        </PokerGameProvider>
      </ChatProvider>
    </WebRTCProvider>
  )
}
