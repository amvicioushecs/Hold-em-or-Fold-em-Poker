"use client"

import { useEffect } from "react"
import { usePokerGame } from "./use-poker-game"
import { useWebRTC } from "./use-webrtc"
import { useChat } from "./use-chat"

export function useAIOpponents() {
  const { gameState, makeAction } = usePokerGame()
  const { players } = useWebRTC()
  const { sendMessage } = useChat()

  useEffect(() => {
    if (!gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (!currentPlayer || currentPlayer.id === "local") return

    // AI delay to simulate thinking
    const delay = Math.random() * 2000 + 1000 // 1-3 seconds

    const timer = setTimeout(() => {
      const player = players.get(currentPlayer.id)
      if (!player) return

      const { chips, bet } = currentPlayer
      const currentBet = gameState.currentBet
      const amountToCall = currentBet - bet
      const potOdds = amountToCall / (gameState.pot + amountToCall)

      if (gameState.gameMode === "allin") {
        // In all-in or fold mode, AI can only go all-in or fold
        const random = Math.random()
        if (random < 0.6) {
          // 60% chance to go all-in (more aggressive in this mode)
          makeAction(currentPlayer.id, "all-in")
          sendMessage(currentPlayer.id, player.name, `All-in $${chips}`, "text")
        } else {
          // 40% chance to fold
          makeAction(currentPlayer.id, "fold")
          sendMessage(currentPlayer.id, player.name, "Fold", "text")
        }
        return
      }

      // Simple AI decision making for regular modes
      const random = Math.random()
      let action: "fold" | "check" | "call" | "raise" | "all-in"
      let amount: number | undefined

      // Determine action based on pot odds and random factor
      if (amountToCall === 0) {
        // No bet to call
        if (random < 0.3) {
          // 30% chance to raise
          action = "raise"
          amount = Math.min(currentBet * 2 || 20, chips + bet)
          sendMessage(currentPlayer.id, player.name, `Raise to $${amount}`, "text")
        } else {
          // 70% check
          action = "check"
          sendMessage(currentPlayer.id, player.name, "Check", "text")
        }
      } else if (amountToCall >= chips) {
        // All-in or fold situation
        if (random < 0.3) {
          action = "all-in"
          sendMessage(currentPlayer.id, player.name, `All-in $${chips}`, "text")
        } else {
          action = "fold"
          sendMessage(currentPlayer.id, player.name, "Fold", "text")
        }
      } else {
        // Normal betting round
        if (potOdds > 0.4 || random < 0.2) {
          // Bad odds or unlucky - fold
          action = "fold"
          sendMessage(currentPlayer.id, player.name, "Fold", "text")
        } else if (random < 0.5) {
          // 30% chance to call
          action = "call"
          sendMessage(currentPlayer.id, player.name, `Call $${amountToCall}`, "text")
        } else if (random < 0.8) {
          // 30% chance to raise
          action = "raise"
          amount = Math.min(currentBet * 2, chips + bet)
          sendMessage(currentPlayer.id, player.name, `Raise to $${amount}`, "text")
        } else {
          // 20% chance to go all-in
          action = "all-in"
          sendMessage(currentPlayer.id, player.name, `All-in $${chips}`, "text")
        }
      }

      makeAction(currentPlayer.id, action, amount)
    }, delay)

    return () => clearTimeout(timer)
  }, [gameState, players, makeAction, sendMessage])
}
