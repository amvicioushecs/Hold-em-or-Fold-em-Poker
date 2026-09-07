import { WebRTCProvider } from "@/hooks/use-webrtc"
import { ChatProvider } from "@/hooks/use-chat"
import { PokerGameProvider } from "@/hooks/use-poker-game"
import PokerTable from "@/components/poker-table"
import AuthPage from "@/components/auth-page"

export default function Home() {
  // TODO: Replace with actual authentication state
  const isAuthenticated = false
  
  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <WebRTCProvider>
      <ChatProvider>
        <PokerGameProvider>
          <main className="min-h-screen bg-background">
            <PokerTable />
          </main>
        </PokerGameProvider>
      </ChatProvider>
    </WebRTCProvider>
  )
}
