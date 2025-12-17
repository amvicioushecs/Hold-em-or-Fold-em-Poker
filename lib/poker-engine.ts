import type {
  Card,
  Rank,
  HandEvaluation,
  HandRank,
  GameState,
  PlayerState,
  PlayerAction,
  GameMode,
} from "@/types/poker"
import { deckManager } from "./deck-manager"

const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

const RANK_VALUES: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
}

const HAND_RANK_VALUES: Record<HandRank, number> = {
  "high-card": 1,
  "pair": 2,
  "two-pair": 3,
  "three-of-a-kind": 4,
  "straight": 5,
  "flush": 6,
  "full-house": 7,
  "four-of-a-kind": 8,
  "straight-flush": 9,
  "royal-flush": 10,
}

// Create and shuffle a deck using DeckManager
export function createDeck(): Card[] {
  deckManager.reset()
  return []
}

// Deal cards to players using DeckManager
export function dealCards(deck: Card[], numPlayers: number): { playerCards: Card[][]; remainingDeck: Card[] } {
  const playerCards: Card[][] = Array.from({ length: numPlayers }, () => [])

  // Deal 2 cards to each player
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < numPlayers; j++) {
      const card = deckManager.drawOne()
      if (card) {
        playerCards[j].push(card)
      }
    }
  }

  return { playerCards, remainingDeck: [] }
}

// Deal community cards using DeckManager
export function dealCommunityCards(
  deck: Card[],
  phase: "flop" | "turn" | "river",
): { cards: Card[]; remainingDeck: Card[] } {
  const cards: Card[] = []

  // Burn one card
  const burnCard = deckManager.drawOne()
  if (burnCard) {
    deckManager.discard([burnCard])
  }

  if (phase === "flop") {
    cards.push(...deckManager.draw(3))
  } else {
    const card = deckManager.drawOne()
    if (card) {
      cards.push(card)
    }
  }

  return { cards, remainingDeck: [] }
}

// Evaluate a poker hand
export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length < 5) {
    throw new Error("Need at least 5 cards to evaluate hand")
  }

  const allCombinations = getCombinations(cards, 5)
  let bestHand: HandEvaluation | null = null

  for (const combo of allCombinations) {
    const evaluation = evaluateFiveCards(combo)
    if (!bestHand || evaluation.value > bestHand.value) {
      bestHand = evaluation
    }
  }

  return bestHand!
}

function evaluateFiveCards(cards: Card[]): HandEvaluation {
  const sortedCards = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])

  const isFlush = cards.every((card) => card.suit === cards[0].suit)
  const isStraight = checkStraight(sortedCards)
  const rankCounts = getRankCounts(sortedCards)
  const counts = Object.values(rankCounts).sort((a, b) => b - a)

  // Royal Flush
  if (isFlush && isStraight && sortedCards[0].rank === "A") {
    return {
      rank: "royal-flush",
      value: HAND_RANK_VALUES["royal-flush"] * 1000000,
      cards: sortedCards,
      description: "Royal Flush",
    }
  }

  // Straight Flush
  if (isFlush && isStraight) {
    return {
      rank: "straight-flush",
      value: HAND_RANK_VALUES["straight-flush"] * 1000000 + RANK_VALUES[sortedCards[0].rank],
      cards: sortedCards,
      description: "Straight Flush",
    }
  }

  // Four of a Kind
  if (counts[0] === 4) {
    return {
      rank: "four-of-a-kind",
      value: HAND_RANK_VALUES["four-of-a-kind"] * 1000000 + getQuadValue(rankCounts),
      cards: sortedCards,
      description: "Four of a Kind",
    }
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return {
      rank: "full-house",
      value: HAND_RANK_VALUES["full-house"] * 1000000 + getFullHouseValue(rankCounts),
      cards: sortedCards,
      description: "Full House",
    }
  }

  // Flush
  if (isFlush) {
    return {
      rank: "flush",
      value: HAND_RANK_VALUES.flush * 1000000 + getHighCardValue(sortedCards),
      cards: sortedCards,
      description: "Flush",
    }
  }

  // Straight
  if (isStraight) {
    return {
      rank: "straight",
      value: HAND_RANK_VALUES.straight * 1000000 + RANK_VALUES[sortedCards[0].rank],
      cards: sortedCards,
      description: "Straight",
    }
  }

  // Three of a Kind
  if (counts[0] === 3) {
    return {
      rank: "three-of-a-kind",
      value: HAND_RANK_VALUES["three-of-a-kind"] * 1000000 + getTripValue(rankCounts),
      cards: sortedCards,
      description: "Three of a Kind",
    }
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return {
      rank: "two-pair",
      value: HAND_RANK_VALUES["two-pair"] * 1000000 + getTwoPairValue(rankCounts),
      cards: sortedCards,
      description: "Two Pair",
    }
  }

  // Pair
  if (counts[0] === 2) {
    return {
      rank: "pair",
      value: HAND_RANK_VALUES.pair * 1000000 + getPairValue(rankCounts),
      cards: sortedCards,
      description: "Pair",
    }
  }

  // High Card
  return {
    rank: "high-card",
    value: HAND_RANK_VALUES["high-card"] * 1000000 + getHighCardValue(sortedCards),
    cards: sortedCards,
    description: "High Card",
  }
}

function checkStraight(cards: Card[]): boolean {
  const values = cards.map((c) => RANK_VALUES[c.rank])

  // Check for regular straight
  let isStraight = true
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      isStraight = false
      break
    }
  }

  // Check for A-2-3-4-5 straight (wheel)
  if (!isStraight && cards[0].rank === "A" && cards[1].rank === "5") {
    const wheelValues = [14, 5, 4, 3, 2]
    isStraight = values.every((v, i) => v === wheelValues[i])
  }

  return isStraight
}

function getRankCounts(cards: Card[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1
  }
  return counts
}

function getCombinations<T>(array: T[], size: number): T[][] {
  if (size > array.length) return []
  if (size === array.length) return [array]
  if (size === 1) return array.map((item) => [item])

  const combinations: T[][] = []
  for (let i = 0; i < array.length - size + 1; i++) {
    const head = array[i]
    const tailCombinations = getCombinations(array.slice(i + 1), size - 1)
    for (const tail of tailCombinations) {
      combinations.push([head, ...tail])
    }
  }
  return combinations
}

function getHighCardValue(cards: Card[]): number {
  return cards.reduce((sum, card, index) => sum + RANK_VALUES[card.rank] * Math.pow(15, 4 - index), 0)
}

function getPairValue(rankCounts: Record<string, number>): number {
  const pairRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 2)!
  const kickers = Object.keys(rankCounts)
    .filter((rank) => rankCounts[rank] === 1)
    .sort((a, b) => RANK_VALUES[b as Rank] - RANK_VALUES[a as Rank])

  return (
    RANK_VALUES[pairRank as Rank] * 1000 +
    kickers.reduce((sum, rank, i) => sum + RANK_VALUES[rank as Rank] * Math.pow(15, 2 - i), 0)
  )
}

function getTwoPairValue(rankCounts: Record<string, number>): number {
  const pairs = Object.keys(rankCounts)
    .filter((rank) => rankCounts[rank] === 2)
    .sort((a, b) => RANK_VALUES[b as Rank] - RANK_VALUES[a as Rank])
  const kicker = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 1)!

  return RANK_VALUES[pairs[0] as Rank] * 10000 + RANK_VALUES[pairs[1] as Rank] * 100 + RANK_VALUES[kicker as Rank]
}

function getTripValue(rankCounts: Record<string, number>): number {
  const tripRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 3)!
  const kickers = Object.keys(rankCounts)
    .filter((rank) => rankCounts[rank] === 1)
    .sort((a, b) => RANK_VALUES[b as Rank] - RANK_VALUES[a as Rank])

  return (
    RANK_VALUES[tripRank as Rank] * 1000 +
    kickers.reduce((sum, rank, i) => sum + RANK_VALUES[rank as Rank] * Math.pow(15, 1 - i), 0)
  )
}

function getFullHouseValue(rankCounts: Record<string, number>): number {
  const tripRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 3)!
  const pairRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 2)!

  return RANK_VALUES[tripRank as Rank] * 100 + RANK_VALUES[pairRank as Rank]
}

function getQuadValue(rankCounts: Record<string, number>): number {
  const quadRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 4)!
  const kicker = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 1)!

  return RANK_VALUES[quadRank as Rank] * 100 + RANK_VALUES[kicker as Rank]
}

// Determine winners
export function determineWinners(players: PlayerState[], communityCards: Card[]): string[] {
  const activePlayers = players.filter((p) => !p.folded)

  if (activePlayers.length === 1) {
    return [activePlayers[0].id]
  }

  const evaluations = activePlayers.map((player) => ({
    playerId: player.id,
    evaluation: evaluateHand([...player.cards, ...communityCards]),
  }))

  const maxValue = Math.max(...evaluations.map((e) => e.evaluation.value))
  return evaluations.filter((e) => e.evaluation.value === maxValue).map((e) => e.playerId)
}

// Initialize game state
export function initializeGame(
  playerIds: string[],
  playerNames: string[],
  seatNumbers: number[],
  startingChips = 1000,
  dealerSeat = 1,
  gameMode: GameMode = "sng",
): GameState {
  deckManager.reset()
  const { playerCards } = dealCards([], playerIds.length)

  const players: PlayerState[] = playerIds.map((id, index) => ({
    id,
    name: playerNames[index] || `Player ${index + 1}`,
    chips: startingChips,
    bet: 0,
    cards: playerCards[index],
    folded: false,
    allIn: false,
    isActive: true,
    lastAction: undefined,
    seatNumber: seatNumbers[index],
  }))

  // Sort players by seat number for proper order
  players.sort((a, b) => a.seatNumber - b.seatNumber)

  // Find dealer index (player with dealer seat)
  const dealerIndex = players.findIndex((p) => p.seatNumber === dealerSeat)
  const smallBlindIndex = (dealerIndex + 1) % players.length
  const bigBlindIndex = (dealerIndex + 2) % players.length

  return {
    phase: "pre-flop",
    pot: 0,
    communityCards: [],
    currentBet: 0,
    currentPlayerIndex: 0,
    dealerIndex,
    dealerSeatNumber: dealerSeat,
    smallBlindIndex,
    bigBlindIndex,
    players,
    deck: [],
    winners: [],
    handNumber: 1,
    gameMode, // Store game mode in state
  }
}

// Start new hand with rotated dealer
export function startNewHand(currentState: GameState, smallBlind: number, bigBlind: number): GameState {
  deckManager.reset()

  // Reset player states
  const players = currentState.players.map((p) => ({
    ...p,
    bet: 0,
    cards: [],
    folded: false,
    allIn: false,
    lastAction: undefined,
  }))

  // Rotate dealer to next active player
  let newDealerIndex = (currentState.dealerIndex + 1) % players.length
  while (players[newDealerIndex].chips === 0 && newDealerIndex !== currentState.dealerIndex) {
    newDealerIndex = (newDealerIndex + 1) % players.length
  }

  const newDealerSeat = players[newDealerIndex].seatNumber

  // Calculate blinds positions
  const smallBlindIndex = (newDealerIndex + 1) % players.length
  const bigBlindIndex = (newDealerIndex + 2) % players.length

  // Deal new cards
  const { playerCards } = dealCards([], players.length)
  players.forEach((player, index) => {
    player.cards = playerCards[index]
  })

  // Post blinds
  const smallBlindPlayer = players[smallBlindIndex]
  const bigBlindPlayer = players[bigBlindIndex]

  const smallBlindAmount = Math.min(smallBlind, smallBlindPlayer.chips)
  const bigBlindAmount = Math.min(bigBlind, bigBlindPlayer.chips)

  smallBlindPlayer.chips -= smallBlindAmount
  smallBlindPlayer.bet = smallBlindAmount
  if (smallBlindPlayer.chips === 0) smallBlindPlayer.allIn = true

  bigBlindPlayer.chips -= bigBlindAmount
  bigBlindPlayer.bet = bigBlindAmount
  if (bigBlindPlayer.chips === 0) bigBlindPlayer.allIn = true

  const pot = smallBlindAmount + bigBlindAmount

  // Start with player after big blind
  const currentPlayerIndex = (bigBlindIndex + 1) % players.length

  return {
    phase: "pre-flop",
    pot,
    communityCards: [],
    currentBet: bigBlindAmount,
    currentPlayerIndex,
    dealerIndex: newDealerIndex,
    dealerSeatNumber: newDealerSeat,
    smallBlindIndex,
    bigBlindIndex,
    players,
    deck: [],
    winners: [],
    handNumber: currentState.handNumber + 1,
    gameMode: currentState.gameMode, // Preserve game mode across hands
  }
}

// Process player action
export function processAction(
  gameState: GameState,
  playerId: string,
  action: PlayerAction,
  amount?: number,
): GameState {
  const newState = { ...gameState }
  const playerIndex = newState.players.findIndex((p) => p.id === playerId)
  const player = newState.players[playerIndex]

  if (!player || player.folded || player.allIn) {
    return gameState
  }

  if (newState.gameMode === "allin") {
    // In all-in or fold mode, only allow fold or all-in actions
    if (action !== "fold" && action !== "all-in") {
      console.log("[v0] All-in or fold mode: only fold and all-in allowed, rejecting action:", action)
      return gameState // Reject any action that isn't fold or all-in
    }
  }

  switch (action) {
    case "fold":
      player.folded = true
      player.lastAction = "fold"
      break

    case "check":
      if (player.bet < newState.currentBet) {
        return gameState
      }
      player.lastAction = "check"
      break

    case "call":
      const callAmount = Math.min(newState.currentBet - player.bet, player.chips)
      player.chips -= callAmount
      player.bet += callAmount
      newState.pot += callAmount
      player.lastAction = "call"
      if (player.chips === 0) {
        player.allIn = true
        player.lastAction = "all-in"
      }
      break

    case "raise":
      if (!amount || amount <= newState.currentBet) {
        return gameState
      }
      const raiseAmount = Math.min(amount - player.bet, player.chips)
      player.chips -= raiseAmount
      player.bet += raiseAmount
      newState.pot += raiseAmount
      newState.currentBet = player.bet
      player.lastAction = "raise"
      if (player.chips === 0) {
        player.allIn = true
        player.lastAction = "all-in"
      }
      break

    case "all-in":
      const allInAmount = player.chips
      player.chips = 0
      player.bet += allInAmount
      newState.pot += allInAmount
      newState.currentBet = Math.max(newState.currentBet, player.bet)
      player.allIn = true
      player.lastAction = "all-in"
      break
  }

  return advanceTurn(newState)
}

function advanceTurn(gameState: GameState): GameState {
  const newState = { ...gameState }
  const activePlayers = newState.players.filter((p) => !p.folded && !p.allIn)

  const allPlayersActed = activePlayers.every((p) => p.bet === newState.currentBet && p.lastAction !== undefined)

  if (allPlayersActed || activePlayers.length <= 1) {
    return advancePhase(newState)
  }

  do {
    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length
  } while (newState.players[newState.currentPlayerIndex].folded || newState.players[newState.currentPlayerIndex].allIn)

  return newState
}

function advancePhase(gameState: GameState): GameState {
  const newState = { ...gameState }

  newState.players.forEach((player) => {
    player.bet = 0
    player.lastAction = undefined
  })
  newState.currentBet = 0

  switch (newState.phase) {
    case "pre-flop":
      const { cards: flopCards } = dealCommunityCards([], "flop")
      newState.communityCards = flopCards
      newState.phase = "flop"
      break

    case "flop":
      const { cards: turnCards } = dealCommunityCards([], "turn")
      newState.communityCards = [...newState.communityCards, ...turnCards]
      newState.phase = "turn"
      break

    case "turn":
      const { cards: riverCards } = dealCommunityCards([], "river")
      newState.communityCards = [...newState.communityCards, ...riverCards]
      newState.phase = "river"
      break

    case "river":
      newState.phase = "showdown"
      newState.winners = determineWinners(newState.players, newState.communityCards)
      break

    case "showdown":
      newState.phase = "complete"
      break
  }

  newState.currentPlayerIndex = (newState.dealerIndex + 1) % newState.players.length
  while (newState.players[newState.currentPlayerIndex].folded || newState.players[newState.currentPlayerIndex].allIn) {
    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length
  }

  return newState
}
