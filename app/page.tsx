/**
 * HOME PAGE - Main entry point for the poker game application
 * 
 * This is the root page of the application that sets up the core context providers
 * needed for the poker game to function properly. It establishes:
 * - WebRTC communication for player connectivity
 * - Chat functionality for in-game messaging
 * - Poker game state management
 * - AI opponent management
 * 
 * The page wraps all providers in a specific order to ensure proper dependency resolution.
 */

import { WebRTCProvider } from "@/hooks/use-webrtc"
import { ChatProvider } from "@/hooks/use-chat"
import { PokerGameProvider } from "@/hooks/use-poker-game"
import PokerTable from "@/components/poker-table"
import AIOpponents from "@/components/ai-opponents"

export default function Home() {
  return (
    // WebRTC Provider: Manages peer-to-peer connections for multiplayer communication
    <WebRTCProvider>
      {/* Chat Provider: Handles in-game chat messages between players */}
      <ChatProvider>
        {/* Poker Game Provider: Manages game state, player actions, and game logic */}
        <PokerGameProvider>
          {/* AI Opponents Component: Initializes and manages AI player behavior */}
          <AIOpponents />
          
          {/* Main content area with the poker table */}
          <main className="min-h-screen bg-background">
            <PokerTable />
          </main>
        </PokerGameProvider>
      </ChatProvider>
    </WebRTCProvider>
  )
}
