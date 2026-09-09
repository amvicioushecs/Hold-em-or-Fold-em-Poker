"use client"

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react"
import type { GameState, PlayerAction, GameMode } from "@/types/poker"
import { initializeGame, processAction, startNewHand } from "@/lib/poker-engine"
import { useWebRTC } from "./use-webrtc"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface PokerGameContextType {
  gameState: GameState | null
  turnTimeLeft: number
  turnDuration: number
  startGame: (
    playerIds: string[],
    playerNames: string[],
    seatNumbers: number[],
    smallBlind?: number,
    bigBlind?: number,
    dealerSeat?: number,
    gameMode?: GameMode,
  ) => void
  makeAction: (playerId: string, action: PlayerAction, amount?: number) => void
  resetGame: () => void
  nextHand: () => void
  handleTimeUp: () => void
  resetTimer: () => void
  isHost: boolean
}

const PokerGameContext = createContext<PokerGameContextType | null>(null)

export function PokerGameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [smallBlind, setSmallBlind] = useState(10)
  const [bigBlind, setBigBlind] = useState(20)
  const [turnTimeLeft, setTurnTimeLeft] = useState(30)
  const [turnDuration] = useState(30)

  const { roomCode, myUserId, players } = useWebRTC()

  // Host election: lexicographically first user ID in the room
  const isHost = useMemo(() => {
    if (!roomCode) return true
    const peerIds = Array.from(players.keys())
    const allIds = [myUserId, ...peerIds].filter((id) => id !== "local").sort()
    return allIds.length === 0 || allIds[0] === myUserId
  }, [roomCode, players, myUserId])

  const resetTimer = useCallback(() => {
    setTurnTimeLeft(turnDuration)
  }, [turnDuration])

  const broadcastGameState = useCallback((newState: GameState) => {
    setGameState(newState)

    if (roomCode && isSupabaseConfigured && supabase) {
      const gameChannel = supabase.channel(`poker-game-${roomCode}`)
      gameChannel.send({
        type: "broadcast",
        event: "game-state-update",
        payload: {
          gameState: newState,
          smallBlind,
          bigBlind,
          turnTimeLeft: turnDuration,
        },
      })
    }
  }, [roomCode, smallBlind, bigBlind, turnDuration])

  const startGame = useCallback(
    (
      playerIds: string[],
      playerNames: string[],
      seatNumbers: number[],
      sbAmount = 10,
      bbAmount = 20,
      dealerSeat = 1,
      gameMode: GameMode = "cash", // Fixed: was "sng"
    ) => {
      if (playerIds.length < 2) {
        return
      }

      setSmallBlind(sbAmount)
      setBigBlind(bbAmount)
      setTurnTimeLeft(turnDuration)

      const initialState = initializeGame(playerIds, playerNames, seatNumbers, 1000, dealerSeat, gameMode)

      if (!initialState.players[initialState.smallBlindIndex] || !initialState.players[initialState.bigBlindIndex]) {
        console.error("Invalid player indices")
        return
      }

      // Post blinds
      const smallBlindPlayer = initialState.players[initialState.smallBlindIndex]
      const bigBlindPlayer = initialState.players[initialState.bigBlindIndex]

      if (smallBlindPlayer && smallBlindPlayer.chips >= sbAmount) {
        smallBlindPlayer.chips -= sbAmount
        smallBlindPlayer.bet = sbAmount
        initialState.pot += sbAmount
      }

      if (bigBlindPlayer && bigBlindPlayer.chips >= bbAmount) {
        bigBlindPlayer.chips -= bbAmount
        bigBlindPlayer.bet = bbAmount
        initialState.pot += bbAmount
        initialState.currentBet = bbAmount
      }

      initialState.currentPlayerIndex = (initialState.bigBlindIndex + 1) % initialState.players.length

      broadcastGameState(initialState)
    },
    [turnDuration, broadcastGameState],
  )

  const makeAction = useCallback(
    (playerId: string, action: PlayerAction, amount?: number) => {
      if (!gameState) return

      const targetId = playerId === "local" ? myUserId : playerId

      if (roomCode && isSupabaseConfigured && supabase) {
        // Broadcast local client action
        const gameChannel = supabase.channel(`poker-game-${roomCode}`)
        gameChannel.send({
          type: "broadcast",
          event: "game-action",
          payload: { playerId: targetId, action, amount },
        })

        // Host processes action immediately
        if (isHost) {
          const newState = processAction(gameState, targetId, action, amount)
          broadcastGameState(newState)

          if (newState.phase === "complete") {
            setTimeout(() => {
              const newHandState = startNewHand(newState, smallBlind, bigBlind)
              broadcastGameState(newHandState)
            }, 3000)
          }
        }
      } else {
        // Single player mode logic
        const newState = processAction(gameState, targetId, action, amount)
        setGameState(newState)
        setTurnTimeLeft(turnDuration)

        if (newState.phase === "complete") {
          setTimeout(() => {
            const newHandState = startNewHand(newState, smallBlind, bigBlind)
            setGameState(newHandState)
            setTurnTimeLeft(turnDuration)
          }, 3000)
        }
      }
    },
    [gameState, smallBlind, bigBlind, turnDuration, roomCode, isHost, myUserId, broadcastGameState],
  )

  const handleTimeUp = useCallback(() => {
    if (!gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (!currentPlayer) return

    const currentBet = gameState.currentBet
    const playerBet = currentPlayer.bet
    const amountToCall = currentBet - playerBet

    if (roomCode && isSupabaseConfigured && supabase) {
      if (isHost) {
        const action = amountToCall === 0 ? "check" : "fold"
        const newState = processAction(gameState, currentPlayer.id, action)
        broadcastGameState(newState)

        if (newState.phase === "complete") {
          setTimeout(() => {
            const newHandState = startNewHand(newState, smallBlind, bigBlind)
            broadcastGameState(newHandState)
          }, 3000)
        }
      }
    } else {
      const action = amountToCall === 0 ? "check" : "fold"
      const newState = processAction(gameState, currentPlayer.id, action)
      setGameState(newState)
      setTurnTimeLeft(turnDuration)

      if (newState.phase === "complete") {
        setTimeout(() => {
          const newHandState = startNewHand(newState, smallBlind, bigBlind)
          setGameState(newHandState)
          setTurnTimeLeft(turnDuration)
        }, 3000)
      }
    }
  }, [gameState, turnDuration, roomCode, isHost, smallBlind, bigBlind, broadcastGameState])

  const nextHand = useCallback(() => {
    if (!gameState) return

    if (roomCode && isSupabaseConfigured && supabase) {
      if (isHost) {
        const newState = startNewHand(gameState, smallBlind, bigBlind)
        broadcastGameState(newState)
      }
    } else {
      const newState = startNewHand(gameState, smallBlind, bigBlind)
      setGameState(newState)
      setTurnTimeLeft(turnDuration)
    }
  }, [gameState, smallBlind, bigBlind, turnDuration, roomCode, isHost, broadcastGameState])

  const resetGame = useCallback(() => {
    setGameState(null)
    setTurnTimeLeft(turnDuration)
  }, [turnDuration])

  // Real-time synchronization subscription for clients
  useEffect(() => {
    if (!roomCode || !isSupabaseConfigured || !supabase) return

    const gameChannel = supabase.channel(`poker-game-${roomCode}`)

    gameChannel
      .on("broadcast", { event: "game-state-update" }, ({ payload }: { payload: any }) => {
        setGameState(payload.gameState)
        setSmallBlind(payload.smallBlind)
        setBigBlind(payload.bigBlind)
        setTurnTimeLeft(payload.turnTimeLeft)
      })
      .on("broadcast", { event: "game-action" }, ({ payload }: { payload: any }) => {
        if (isHost) {
          // Process client's actions on the host machine
          const latestState = gameState || payload.gameState
          if (latestState) {
            const newState = processAction(latestState, payload.playerId, payload.action, payload.amount)
            broadcastGameState(newState)

            if (newState.phase === "complete") {
              setTimeout(() => {
                const newHandState = startNewHand(newState, smallBlind, bigBlind)
                broadcastGameState(newHandState)
              }, 3000)
            }
          }
        }
      })
      .subscribe()

    return () => {
      gameChannel.unsubscribe()
    }
  }, [roomCode, isHost, gameState, smallBlind, bigBlind, broadcastGameState])

  const contextValue = useMemo(
    () => ({
      gameState,
      turnTimeLeft,
      turnDuration,
      startGame,
      makeAction,
      resetGame,
      nextHand,
      handleTimeUp,
      resetTimer,
      isHost,
    }),
    [gameState, turnTimeLeft, turnDuration, startGame, makeAction, resetGame, nextHand, handleTimeUp, resetTimer, isHost],
  )

  return <PokerGameContext.Provider value={contextValue}>{children}</PokerGameContext.Provider>
}

export function usePokerGame() {
  const context = useContext(PokerGameContext)
  if (!context) {
    throw new Error("usePokerGame must be used within a PokerGameProvider")
  }
  return context
}
