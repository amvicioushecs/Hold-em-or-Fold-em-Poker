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
 */
export function dealCommunityCards(phase: "flop" | "turn" | "river"): Card[] {
  const cards: Card[] = []

  const burnCard = deckManager.drawOne()
  if (burnCard) {
    deckManager.discard([burnCard])
  }

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

function evaluateFiveCards(cards: Card[]): HandEvaluation {
  const sortedCards = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])

  const isFlush = cards.every((card) => card.suit === cards[0].suit)
  const isStraight = checkStraight(sortedCards)
  const rankCounts = getRankCounts(sortedCards)
  const counts = Object.values(rankCounts).sort((a, b) => b - a)

  if (isFlush && isStraight && sortedCards[0].rank === "A") {
    return createHandEvaluation("royal-flush", sortedCards, "Royal Flush")
  }

  if (isFlush && isStraight) {
    return createHandEvaluation("straight-flush", sortedCards, "Straight Flush", RANK_VALUES[sortedCards[0].rank])
  }

  if (counts[0] === 4) {
    return createHandEvaluation("four-of-a-kind", sortedCards, "Four of a Kind", getQuadValue(rankCounts))
  }

  if (counts[0] === 3 && counts[1] === 2) {
    return createHandEvaluation("full-house", sortedCards, "Full House", getFullHouseValue(rankCounts))
  }

  if (isFlush) {
    return createHandEvaluation("flush", sortedCards, "Flush", getHighCardValue(sortedCards))
  }

  if (isStraight) {
    return createHandEvaluation("straight", sortedCards, "Straight", RANK_VALUES[sortedCards[0].rank])
  }

  if (counts[0] === 3) {
    return createHandEvaluation("three-of-a-kind", sortedCards, "Three of a Kind", getTripValue(rankCounts))
  }

  if (counts[0] === 2 && counts[1] === 2) {
    return createHandEvaluation("two-pair", sortedCards, "Two Pair", getTwoPairValue(rankCounts))
  }

  if (counts[0] === 2) {
    return createHandEvaluation("pair", sortedCards, "Pair", getPairValue(rankCounts))
  }

  return createHandEvaluation("high-card", sortedCards, "High Card", getHighCardValue(sortedCards))
}

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

function checkStraight(cards: Card[]): boolean {
  const values = cards.map((c) => RANK_VALUES[c.rank])

  let isStraight = values.every((v, i) => i === 0 || values[i - 1] - v === 1)

  if (!isStraight && cards[0].rank === "A" && cards[1].rank === "5") {
    const wheelValues = [14, 5, 4, 3, 2]
    isStraight = values.every((v, i) => v === wheelValues[i])
  }

  return isStraight
}

function getRankCounts(cards: Card[]): Record<string, number> {
  return cards.reduce((counts, card) => {
    counts[card.rank] = (counts[card.rank] || 0) + 1
    return counts
  }, {} as Record<string, number>)
}

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
 * Default gameMode is now "cash".
 */
export function initializeGame(
  playerIds: string[],
  playerNames: string[],
  seatNumbers: number[],
  startingChips = 1000,
  dealerSeat = 1,
  gameMode: GameMode = "cash",
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

  players.sort((a, b) => a.seatNumber - b.seatNumber)

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
 *
 * IMPORTANT CHANGE:
 * For SNG / MTT the caller MUST pass the correct current smallBlind and bigBlind
 * from the tournament blind structure (tournamentEngine.getCurrentBlindLevel).
 * This function no longer invents its own blind progression with a multiplier.
 *
 * Optional ante is now supported.
 */
export function startNewHand(
  currentState: GameState,
  smallBlind: number,
  bigBlind: number,
  timestamp: number = Date.now(),
  ante: number = 0,
): GameState {
  resetDeck()

  const players = currentState.players.map((p) => ({
    ...p,
    bet: 0,
    cards: [] as Card[],
    folded: false,
    allIn: false,
    lastAction: undefined,
  }))

  // Rotate dealer to next active player (skip busted players)
  let newDealerIndex = (currentState.dealerIndex + 1) % players.length
  while (players[newDealerIndex].chips === 0 && newDealerIndex !== currentState.dealerIndex) {
    newDealerIndex = (newDealerIndex + 1) % players.length
  }

  const newDealerSeat = players[newDealerIndex].seatNumber
  const smallBlindIndex = (newDealerIndex + 1) % players.length
  const bigBlindIndex = (newDealerIndex + 2) % players.length

  // Deal hole cards
  const cardsPerPlayer = currentState.gameMode === "omaha" ? 4 : 2
  const playerCards = dealHoleCards(players.length, cardsPerPlayer)
  players.forEach((player, index) => {
    player.cards = playerCards[index]
  })

  // Use the blinds that were passed in (authoritative source of truth)
  const currentSmallBlind = smallBlind
  const currentBigBlind = bigBlind

  // Keep level tracking purely for UI / history
  const newBlindLevel = currentState.blindLevel ?? 1
  const lastIncreaseTime = currentState.lastBlindIncreaseTime ?? timestamp

  let pot = 0

  // Post antes first (if any) from every player who still has chips
  if (ante > 0) {
    for (const player of players) {
      if (player.chips > 0) {
        const anteAmount = Math.min(ante, player.chips)
        player.chips -= anteAmount
        pot += anteAmount
        if (player.chips === 0) player.allIn = true
      }
    }
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

  pot += smallBlindAmount + bigBlindAmount

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
 * Processes a player's action.
 *
 * All-in or Fold mode ("allin"):
 * Only "fold" and "all-in" are legal actions. Everything else is rejected.
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

  // Strict All-in or Fold restriction
  if (newState.gameMode === "allin") {
    if (action !== "fold" && action !== "all-in") {
      console.log("[v0] All-in or Fold mode: only fold and all-in are allowed. Rejected:", action)
      return gameState
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

  const activePlayers = newState.players.filter((p) => !p.folded)
  if (activePlayers.length === 1) {
    newState.phase = "showdown"
    newState.winners = [activePlayers[0].id]

    const winner = newState.players.find((p) => p.id === activePlayers[0].id)
    if (winner) {
      winner.chips += newState.pot
    }
    newState.pot = 0
    return newState
  }

  newState.players.forEach((player) => {
    player.bet = 0
    player.lastAction = undefined
  })
  newState.currentBet = 0

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

    case "river": {
      newState.phase = "showdown"
      const winners = determineWinners(newState.players, newState.communityCards, newState)
      newState.winners = winners

      if (winners.length > 0) {
        const share = Math.floor(newState.pot / winners.length)
        const remainder = newState.pot % winners.length

        newState.players.forEach((player) => {
          if (winners.includes(player.id)) {
            player.chips += share
          }
        })

        const firstWinner = newState.players.find((p) => p.id === winners[0])
        if (firstWinner) {
          firstWinner.chips += remainder
        }
      }
      newState.pot = 0
      break
    }

    case "showdown":
      newState.phase = "complete"
      break
  }

  const playersWhoCanAct = newState.players.filter((p) => !p.folded && !p.allIn)
  if (playersWhoCanAct.length > 0) {
    newState.currentPlayerIndex = (newState.dealerIndex + 1) % newState.players.length
    while (newState.players[newState.currentPlayerIndex].folded || newState.players[newState.currentPlayerIndex].allIn) {
      newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length
    }
  } else {
    newState.currentPlayerIndex = newState.dealerIndex
  }

  return newState
}
