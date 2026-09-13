import { WebRTCProvider } from "@/hooks/use-webrtc"
import { ChatProvider } from "@/hooks/use-chat"
import { PokerGameProvider } from "@/hooks/use-poker-game"
import { TournamentProvider } from "@/hooks/use-tournament"
import PokerTable from "@/components/poker-table"
import AIOpponents from "@/components/ai-opponents"

export default function Home() {
  return (
    <WebRTCProvider>
      <ChatProvider>
        <TournamentProvider>
          <PokerGameProvider>
            <AIOpponents />
            <main className="screen-mobile relative w-full min-h-dvh bg-[#07090E]">
              <PokerTable />
            </main>
          </PokerGameProvider>
        </TournamentProvider>
      </ChatProvider>
    </WebRTCProvider>
  )
}
