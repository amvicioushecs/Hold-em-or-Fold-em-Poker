import { WebRTCProvider } from "@/hooks/use-webrtc"
import { ChatProvider } from "@/hooks/use-chat"
import { PokerGameProvider } from "@/hooks/use-poker-game"
import PokerTable from "@/components/poker-table"
import AIOpponents from "@/components/ai-opponents"

export default function Home() {
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
