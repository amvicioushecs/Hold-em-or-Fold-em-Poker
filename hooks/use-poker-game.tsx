"use client"

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react"
import type { GameState, PlayerAction, GameMode } from "@/types/poker"
import { initializeGame, processAction, startNewHand } from "@/lib/poker-engine"
import { useWebRTC } from "./use-webrtc"
import { useTournament } from "./use-tournament"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface ResolvedBlinds {
  smallBlind: number
  bigBlind: number
  ante: number
  level?: number
}

interface PokerGameContextType {
  gameState: GameState | null
  turnTimeLeft: number
  turnDuration: number
  smallBlind: number
  bigBlind: number
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
  const { tournament, currentBlindLevel } = useTournament()

  // Host election: lexicographically first user ID in the room
  const isHost = useMemo(() => {
    if (!roomCode) return true
    const peerIds = Array.from(players.keys())
    const allIds = [myUserId, ...peerIds].filter((id) => id !== "local").sort()
    return allIds.length === 0 || allIds[0] === myUserId
  }, [roomCode, players, myUserId])

  /**
   * Resolve the blinds that should be used for the next hand.
   * - cash / allin / omaha → fixed table blinds stored in provider state
   * - sng / mtt → live level from tournament engine (SB / BB / ante)
   */
  const resolveBlinds = useCallback(
    (mode?: GameMode | null): ResolvedBlinds => {
      const isTournamentMode = mode === "sng" || mode === "mtt"

      if (isTournamentMode && currentBlindLevel) {
        return {
          smallBlind: currentBlindLevel.smallBlind,
          bigBlind: currentBlindLevel.bigBlind,
          ante: currentBlindLevel.ante ?? 0,
          level: currentBlindLevel.level,
        }
      }

      // Fallback: use the blinds that were set when the table/session started
      return {
        smallBlind,
        bigBlind,
        ante: 0,
      }
    },
    [currentBlindLevel, smallBlind, bigBlind],
  )

  // Keep provider blind state in sync when tournament level advances
  // so UI consumers and broadcasts stay accurate.
  useEffect(() => {
    if (!gameState) return
    if (gameState.gameMode !== "sng" && gameState.gameMode !== "mtt") return
    if (!currentBlindLevel) return

    setSmallBlind(currentBlindLevel.smallBlind)
    setBigBlind(currentBlindLevel.bigBlind)
  }, [currentBlindLevel, gameState?.gameMode, gameState])

  const resetTimer = useCallback(() => {
    setTurnTimeLeft(turnDuration)
  }, [turnDuration])

  const broadcastGameState = useCallback(
    (newState: GameState, blinds?: ResolvedBlinds) => {
      setGameState(newState)

      const sb = blinds?.smallBlind ?? smallBlind
      const bb = blinds?.bigBlind ?? bigBlind

      if (roomCode && isSupabaseConfigured && supabase) {
        const gameChannel = supabase.channel(`poker-game-${roomCode}`)
        gameChannel.send({
          type: "broadcast",
          event: "game-state-update",
          payload: {
            gameState: newState,
            smallBlind: sb,
            bigBlind: bb,
            turnTimeLeft: turnDuration,
          },
        })
      }
    },
    [roomCode, smallBlind, bigBlind, turnDuration],
  )

  const startNextHand = useCallback(
    (fromState: GameState) => {
      const blinds = resolveBlinds(fromState.gameMode)

      // Keep local blind state aligned for UI / future hands
      setSmallBlind(blinds.smallBlind)
      setBigBlind(blinds.bigBlind)

      const newHandState = startNewHand(
        fromState,
        blinds.smallBlind,
        blinds.bigBlind,
        Date.now(),
        blinds.ante,
      )

      // Reflect tournament level on the hand state for UI
      if (blinds.level != null) {
        newHandState.blindLevel = blinds.level
      }

      return { newHandState, blinds }
    },
    [resolveBlinds],
  )

  const startGame = useCallback(
    (
      playerIds: string[],
      playerNames: string[],
      seatNumbers: number[],
      sbAmount = 10,
      bbAmount = 20,
      dealerSeat = 1,
      gameMode: GameMode = "cash",
    ) => {
      if (playerIds.length < 2) {
        return
      }

      // For tournaments, prefer the live blind level if one is already available
      let effectiveSb = sbAmount
      let effectiveBb = bbAmount
      let effectiveAnte = 0
      let effectiveLevel: number | undefined

      if ((gameMode === "sng" || gameMode === "mtt") && currentBlindLevel) {
        effectiveSb = currentBlindLevel.smallBlind
        effectiveBb = currentBlindLevel.bigBlind
        effectiveAnte = currentBlindLevel.ante ?? 0
        effectiveLevel = currentBlindLevel.level
      }

      setSmallBlind(effectiveSb)
      setBigBlind(effectiveBb)
      setTurnTimeLeft(turnDuration)

      // Starting chips: tournaments should use config starting chips when available
      const startingChips =
        (gameMode === "sng" || gameMode === "mtt") && tournament?.config?.startingChips
          ? tournament.config.startingChips
          : 1000

      const initialState = initializeGame(
        playerIds,
        playerNames,
        seatNumbers,
        startingChips,
        dealerSeat,
        gameMode,
      )

      if (effectiveLevel != null) {
        initialState.blindLevel = effectiveLevel
      }

      if (!initialState.players[initialState.smallBlindIndex] || !initialState.players[initialState.bigBlindIndex]) {
        console.error("Invalid player indices")
        return
      }

      // Post antes (tournament) then blinds
      let pot = 0
      if (effectiveAnte > 0) {
        for (const player of initialState.players) {
          if (player.chips > 0) {
            const anteAmount = Math.min(effectiveAnte, player.chips)
            player.chips -= anteAmount
            pot += anteAmount
            if (player.chips === 0) player.allIn = true
          }
        }
      }

      const smallBlindPlayer = initialState.players[initialState.smallBlindIndex]
      const bigBlindPlayer = initialState.players[initialState.bigBlindIndex]

      if (smallBlindPlayer && smallBlindPlayer.chips >= effectiveSb) {
        smallBlindPlayer.chips -= effectiveSb
        smallBlindPlayer.bet = effectiveSb
        pot += effectiveSb
      } else if (smallBlindPlayer) {
        // Short-stack all-in for blind
        const amount = smallBlindPlayer.chips
        smallBlindPlayer.bet = amount
        pot += amount
        smallBlindPlayer.chips = 0
        smallBlindPlayer.allIn = true
      }

      if (bigBlindPlayer && bigBlindPlayer.chips >= effectiveBb) {
        bigBlindPlayer.chips -= effectiveBb
        bigBlindPlayer.bet = effectiveBb
        pot += effectiveBb
        initialState.currentBet = effectiveBb
      } else if (bigBlindPlayer) {
        const amount = bigBlindPlayer.chips
        bigBlindPlayer.bet = amount
        pot += amount
        bigBlindPlayer.chips = 0
        bigBlindPlayer.allIn = true
        initialState.currentBet = Math.max(initialState.currentBet, amount)
      }

      initialState.pot = pot
      initialState.currentPlayerIndex = (initialState.bigBlindIndex + 1) % initialState.players.length

      broadcastGameState(initialState, {
        smallBlind: effectiveSb,
        bigBlind: effectiveBb,
        ante: effectiveAnte,
        level: effectiveLevel,
      })
    },
    [turnDuration, broadcastGameState, currentBlindLevel, tournament],
  )

  const makeAction = useCallback(
    (playerId: string, action: PlayerAction, amount?: number) => {
      if (!gameState) return

      const targetId = playerId === "local" ? myUserId : playerId

      if (roomCode && isSupabaseConfigured && supabase) {
        const gameChannel = supabase.channel(`poker-game-${roomCode}`)
        gameChannel.send({
          type: "broadcast",
          event: "game-action",
          payload: { playerId: targetId, action, amount },
        })

        if (isHost) {
          const newState = processAction(gameState, targetId, action, amount)
          broadcastGameState(newState)

          if (newState.phase === "complete") {
            setTimeout(() => {
              const { newHandState, blinds } = startNextHand(newState)
              broadcastGameState(newHandState, blinds)
            }, 3000)
          }
        }
      } else {
        const newState = processAction(gameState, targetId, action, amount)
        setGameState(newState)
        setTurnTimeLeft(turnDuration)

        if (newState.phase === "complete") {
          setTimeout(() => {
            const { newHandState } = startNextHand(newState)
            setGameState(newHandState)
            setTurnTimeLeft(turnDuration)
          }, 3000)
        }
      }
    },
    [gameState, turnDuration, roomCode, isHost, myUserId, broadcastGameState, startNextHand],
  )

  const handleTimeUp = useCallback(() => {
    if (!gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (!currentPlayer) return

    const amountToCall = gameState.currentBet - currentPlayer.bet
    // In all-in mode, auto-fold on timeout (never auto all-in)
    const action =
      gameState.gameMode === "allin"
        ? "fold"
        : amountToCall === 0
          ? "check"
          : "fold"

    if (roomCode && isSupabaseConfigured && supabase) {
      if (isHost) {
        const newState = processAction(gameState, currentPlayer.id, action)
        broadcastGameState(newState)

        if (newState.phase === "complete") {
          setTimeout(() => {
            const { newHandState, blinds } = startNextHand(newState)
            broadcastGameState(newHandState, blinds)
          }, 3000)
        }
      }
    } else {
      const newState = processAction(gameState, currentPlayer.id, action)
      setGameState(newState)
      setTurnTimeLeft(turnDuration)

      if (newState.phase === "complete") {
        setTimeout(() => {
          const { newHandState } = startNextHand(newState)
          setGameState(newHandState)
          setTurnTimeLeft(turnDuration)
        }, 3000)
      }
    }
  }, [gameState, turnDuration, roomCode, isHost, broadcastGameState, startNextHand])

  const nextHand = useCallback(() => {
    if (!gameState) return

    if (roomCode && isSupabaseConfigured && supabase) {
      if (isHost) {
        const { newHandState, blinds } = startNextHand(gameState)
        broadcastGameState(newHandState, blinds)
      }
    } else {
      const { newHandState } = startNextHand(gameState)
      setGameState(newHandState)
      setTurnTimeLeft(turnDuration)
    }
  }, [gameState, turnDuration, roomCode, isHost, broadcastGameState, startNextHand])

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
          const latestState = gameState || payload.gameState
          if (latestState) {
            const newState = processAction(latestState, payload.playerId, payload.action, payload.amount)
            broadcastGameState(newState)

            if (newState.phase === "complete") {
              setTimeout(() => {
                const { newHandState, blinds } = startNextHand(newState)
                broadcastGameState(newHandState, blinds)
              }, 3000)
            }
          }
        }
      })
      .subscribe()

    return () => {
      gameChannel.unsubscribe()
    }
  }, [roomCode, isHost, gameState, broadcastGameState, startNextHand])

  const contextValue = useMemo(
    () => ({
      gameState,
      turnTimeLeft,
      turnDuration,
      smallBlind,
      bigBlind,
      startGame,
      makeAction,
      resetGame,
      nextHand,
      handleTimeUp,
      resetTimer,
      isHost,
    }),
    [
      gameState,
      turnTimeLeft,
      turnDuration,
      smallBlind,
      bigBlind,
      startGame,
      makeAction,
      resetGame,
      nextHand,
      handleTimeUp,
      resetTimer,
      isHost,
    ],
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
