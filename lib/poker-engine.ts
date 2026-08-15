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

// Constants
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

const HAND_EVALUATION_MULTIPLIER = 1_000_000
const KICKER_BASE = 15
const BLIND_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes standard

/**
 * Resets and shuffles the deck using the DeckManager singleton.
 */
export function resetDeck(): void {
  deckManager.reset()
}

/**
 * Deals hole cards to all players.
 * @param numPlayers - Number of players at the table
 * @param cardsPerPlayer - Cards per player (2 for Texas Hold'em, 4 for Omaha)
 * @returns Array of card arrays for each player
 */
export function dealHoleCards(numPlayers: number, cardsPerPlayer = 2): Card[][] {
  const playerCards: Card[][] = Array.from({ length: numPlayers }, () => [])

  // Deal cards in rounds (one card at a time to each player)
  for (let round = 0; round < cardsPerPlayer; round++) {
    for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
      const card = deckManager.drawOne()
      if (card) {
        playerCards[playerIndex].push(card)
      }
    }
  }

  return playerCards
}

/**
 * Deals community cards for a specific phase.
 * @param phase - The dealing phase (flop, turn, or river)
 * @returns Array of community cards for this phase
 */
export function dealCommunityCards(phase: "flop" | "turn" | "river"): Card[] {
  const cards: Card[] = []

  // Burn one card before dealing
  const burnCard = deckManager.drawOne()
  if (burnCard) {
    deckManager.discard([burnCard])
  }

  // Deal appropriate number of cards for the phase
  const cardsToDeal = phase === "flop" ? 3 : 1
  for (let i = 0; i < cardsToDeal; i++) {
    const card = deckManager.drawOne()
    if (card) {
      cards.push(card)
    }
  }

  return cards
}

/**
 * Evaluates the best possible 5-card poker hand from a set of cards.
 * @param cards - Array of cards to evaluate (must have at least 5)
 * @returns The best hand evaluation
 */
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

/**
 * Evaluates exactly 5 cards and returns the hand ranking.
 */
function evaluateFiveCards(cards: Card[]): HandEvaluation {
  const sortedCards = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])

  const isFlush = cards.every((card) => card.suit === cards[0].suit)
  const isStraight = checkStraight(sortedCards)
  const rankCounts = getRankCounts(sortedCards)
  const counts = Object.values(rankCounts).sort((a, b) => b - a)

  // Royal Flush
  if (isFlush && isStraight && sortedCards[0].rank === "A") {
    return createHandEvaluation("royal-flush", sortedCards, "Royal Flush")
  }

  // Straight Flush
  if (isFlush && isStraight) {
    return createHandEvaluation("straight-flush", sortedCards, "Straight Flush", RANK_VALUES[sortedCards[0].rank])
  }

  // Four of a Kind
  if (counts[0] === 4) {
    return createHandEvaluation("four-of-a-kind", sortedCards, "Four of a Kind", getQuadValue(rankCounts))
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return createHandEvaluation("full-house", sortedCards, "Full House", getFullHouseValue(rankCounts))
  }

  // Flush
  if (isFlush) {
    return createHandEvaluation("flush", sortedCards, "Flush", getHighCardValue(sortedCards))
  }

  // Straight
  if (isStraight) {
    return createHandEvaluation("straight", sortedCards, "Straight", RANK_VALUES[sortedCards[0].rank])
  }

  // Three of a Kind
  if (counts[0] === 3) {
    return createHandEvaluation("three-of-a-kind", sortedCards, "Three of a Kind", getTripValue(rankCounts))
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return createHandEvaluation("two-pair", sortedCards, "Two Pair", getTwoPairValue(rankCounts))
  }

  // Pair
  if (counts[0] === 2) {
    return createHandEvaluation("pair", sortedCards, "Pair", getPairValue(rankCounts))
  }

  // High Card
  return createHandEvaluation("high-card", sortedCards, "High Card", getHighCardValue(sortedCards))
}

/**
 * Creates a standardized hand evaluation object.
 */
function createHandEvaluation(
  rank: HandRank,
  cards: Card[],
  description: string,
  tiebreakerValue = 0,
): HandEvaluation {
  return {
    rank,
    value: HAND_RANK_VALUES[rank] * HAND_EVALUATION_MULTIPLIER + tiebreakerValue,
    cards,
    description,
  }
}

/**
 * Checks if 5 cards form a straight.
 */
function checkStraight(cards: Card[]): boolean {
  const values = cards.map((c) => RANK_VALUES[c.rank])

  // Check for regular straight
  let isStraight = values.every((v, i) => i === 0 || values[i - 1] - v === 1)

  // Check for A-2-3-4-5 straight (wheel)
  if (!isStraight && cards[0].rank === "A" && cards[1].rank === "5") {
    const wheelValues = [14, 5, 4, 3, 2]
    isStraight = values.every((v, i) => v === wheelValues[i])
  }

  return isStraight
}

/**
 * Counts occurrences of each rank in the hand.
 */
function getRankCounts(cards: Card[]): Record<string, number> {
  return cards.reduce((counts, card) => {
    counts[card.rank] = (counts[card.rank] || 0) + 1
    return counts
  }, {} as Record<string, number>)
}

/**
 * Generates all combinations of a given size from an array.
 */
function getCombinations<T>(array: T[], size: number): T[][] {
  if (size > array.length) return []
  if (size === array.length) return [array]
  if (size === 1) return array.map((item) => [item])

  const combinations: T[][] = []
  for (let i = 0; i < array.length - size + 1; i++) {
    const head = array[i]
    const tailCombinations = getCombinations(array.slice(i + 1), size - 1)
    combinations.push(...tailCombinations.map((tail) => [head, ...tail]))
  }
  return combinations
}

/**
 * Calculates kicker-based tiebreaker values for various hand types.
 */
function calculateKickerValue(ranks: string[], basePowers: number[]): number {
  return ranks.reduce((sum, rank, i) => sum + RANK_VALUES[rank as Rank] * Math.pow(KICKER_BASE, basePowers[i] ?? 0), 0)
}

function getHighCardValue(cards: Card[]): number {
  return calculateKickerValue(
    cards.map((c) => c.rank),
    [4, 3, 2, 1, 0],
  )
}

function getPairValue(rankCounts: Record<string, number>): number {
  const pairRank = Object.keys(rankCounts).find((rank) => rankCounts[rank] === 2)!
  const kickers = Object.keys(rankCounts)
    .filter((rank) => rankCounts[rank] === 1)
    .sort((a, b) => RANK_VALUES[b as Rank] - RANK_VALUES[a as Rank])

  return RANK_VALUES[pairRank as Rank] * 1000 + calculateKickerValue(kickers, [2, 1])
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

  return RANK_VALUES[tripRank as Rank] * 1000 + calculateKickerValue(kickers, [1, 0])
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

/**
 * Determines the winner(s) at showdown based on hand evaluations.
 */
export function determineWinners(players: PlayerState[], communityCards: Card[], gameState: GameState): string[] {
  const activePlayers = players.filter((p) => !p.folded)

  if (activePlayers.length === 1) {
    return [activePlayers[0].id]
  }

  const evaluations = activePlayers.map((player) => ({
    playerId: player.id,
    evaluation:
      gameState.gameMode === "omaha"
        ? evaluateOmahaHand(player.cards, communityCards)
        : evaluateHand([...player.cards, ...communityCards]),
  }))

  const maxValue = Math.max(...evaluations.map((e) => e.evaluation.value))
  return evaluations.filter((e) => e.evaluation.value === maxValue).map((e) => e.playerId)
}

/**
 * Evaluates an Omaha hand (must use exactly 2 hole cards and 3 community cards).
 */
function evaluateOmahaHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
  if (holeCards.length < 2) {
    throw new Error("Omaha requires at least 2 hole cards")
  }
  if (communityCards.length < 3) {
    throw new Error("Omaha requires at least 3 community cards to evaluate")
  }

  const holeCombinations = getCombinations(holeCards, 2)
  const boardCombinations = getCombinations(communityCards, 3)

  let bestHand: HandEvaluation | null = null

  for (const holeCombo of holeCombinations) {
    for (const boardCombo of boardCombinations) {
      const fiveCardHand = [...holeCombo, ...boardCombo]
      const evaluation = evaluateFiveCards(fiveCardHand)
      if (!bestHand || evaluation.value > bestHand.value) {
        bestHand = evaluation
      }
    }
  }

  return bestHand!
}

/**
 * Initializes a new poker game with the given configuration.
 */
export function initializeGame(
  playerIds: string[],
  playerNames: string[],
  seatNumbers: number[],
  startingChips = 1000,
  dealerSeat = 1,
  gameMode: GameMode = "sng",
  timestamp: number = Date.now(),
): GameState {
  resetDeck()
  const cardsPerPlayer = gameMode === "omaha" ? 4 : 2
  const playerCards = dealHoleCards(playerIds.length, cardsPerPlayer)

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
    gameMode,
    blindLevel: 1,
    lastBlindIncreaseTime: timestamp,
  }
}

/**
 * Starts a new hand with rotated dealer button and fresh cards.
 */
export function startNewHand(
  currentState: GameState,
  smallBlind: number,
  bigBlind: number,
  timestamp: number = Date.now(),
): GameState {
  resetDeck()

  // Reset player states for the new hand
  const players = currentState.players.map((p) => ({
    ...p,
    bet: 0,
    cards: [] as Card[],
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
  const cardsPerPlayer = currentState.gameMode === "omaha" ? 4 : 2
  const playerCards = dealHoleCards(players.length, cardsPerPlayer)
  players.forEach((player, index) => {
    player.cards = playerCards[index]
  })

  // Calculate Blinds based on Mode
  let currentSmallBlind = smallBlind
  let currentBigBlind = bigBlind
  let newBlindLevel = currentState.blindLevel ?? 1
  let lastIncreaseTime = currentState.lastBlindIncreaseTime ?? Date.now()

  if (currentState.gameMode === "sng" || currentState.gameMode === "mtt") {
    // Check if enough time has passed since last increase
    const now = timestamp
    if (now - lastIncreaseTime > BLIND_INTERVAL_MS) {
      newBlindLevel++
      lastIncreaseTime = now
    }

    // Apply multiplier based on level
    const multiplier = Math.pow(1.5, newBlindLevel - 1)
    currentSmallBlind = Math.floor(smallBlind * multiplier)
    currentBigBlind = Math.floor(bigBlind * multiplier)
  }

  // Post blinds
  const smallBlindPlayer = players[smallBlindIndex]
  const bigBlindPlayer = players[bigBlindIndex]

  const smallBlindAmount = Math.min(currentSmallBlind, smallBlindPlayer.chips)
  const bigBlindAmount = Math.min(currentBigBlind, bigBlindPlayer.chips)

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
    gameMode: currentState.gameMode,
    blindLevel: newBlindLevel,
    lastBlindIncreaseTime: lastIncreaseTime,
  }
}

/**
 * Processes a player's action (fold, check, call, raise, all-in).
 */
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

  // In all-in or fold mode, only allow fold or all-in actions
  if (newState.gameMode === "allin" && action !== "fold" && action !== "all-in") {
    console.log("[v0] All-in or fold mode: only fold and all-in allowed, rejecting action:", action)
    return gameState
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

    case "call": {
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
    }

    case "raise": {
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
    }

    case "all-in": {
      const allInAmount = player.chips
      player.chips = 0
      player.bet += allInAmount
      newState.pot += allInAmount
      newState.currentBet = Math.max(newState.currentBet, player.bet)
      player.allIn = true
      player.lastAction = "all-in"
      break
    }
  }

  return advanceTurn(newState)
}

/**
 * Advances to the next player's turn or moves to the next phase if all players have acted.
 */
function advanceTurn(gameState: GameState): GameState {
  const newState = { ...gameState }
  const activePlayers = newState.players.filter((p) => !p.folded && !p.allIn)

  const allPlayersActed = activePlayers.every((p) => p.bet === newState.currentBet && p.lastAction !== undefined)

  if (allPlayersActed || activePlayers.length <= 1) {
    return advancePhase(newState)
  }

  // Move to next non-folded, non-all-in player
  do {
    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length
  } while (newState.players[newState.currentPlayerIndex].folded || newState.players[newState.currentPlayerIndex].allIn)

  return newState
}

/**
 * Advances the game to the next phase (flop, turn, river, showdown).
 */
function advancePhase(gameState: GameState): GameState {
  const newState = { ...gameState }

  // Reset player bets and actions for the new phase
  newState.players.forEach((player) => {
    player.bet = 0
    player.lastAction = undefined
  })
  newState.currentBet = 0

  // Deal community cards and transition to next phase
  switch (newState.phase) {
    case "pre-flop":
      newState.communityCards = dealCommunityCards("flop")
      newState.phase = "flop"
      break

    case "flop":
      newState.communityCards = [...newState.communityCards, ...dealCommunityCards("turn")]
      newState.phase = "turn"
      break

    case "turn":
      newState.communityCards = [...newState.communityCards, ...dealCommunityCards("river")]
      newState.phase = "river"
      break

    case "river":
      newState.phase = "showdown"
      newState.winners = determineWinners(newState.players, newState.communityCards, newState)
      break

    case "showdown":
      newState.phase = "complete"
      break
  }

  // Set first active player after dealer as current player
  newState.currentPlayerIndex = (newState.dealerIndex + 1) % newState.players.length
  while (newState.players[newState.currentPlayerIndex].folded || newState.players[newState.currentPlayerIndex].allIn) {
    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length
  }

  return newState
}
