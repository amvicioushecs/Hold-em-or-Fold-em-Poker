import type { Card, HandRank } from "@/types/poker"
import { evaluateHand, evaluateOmahaHand } from "./poker-engine"

export interface HandTestCase {
  description: string
  cards: Card[]
  expectedRank: HandRank
}

// Utility to create cards for testing
export function createCard(rank: Card["rank"], suit: Card["suit"]): Card {
  return { rank, suit }
}

// Test cases for Texas Hold'em hand evaluation
export const texasHoldemTestCases: HandTestCase[] = [
  {
    description: "Royal Flush in Hearts",
    cards: [
      createCard("A", "hearts"),
      createCard("K", "hearts"),
      createCard("Q", "hearts"),
      createCard("J", "hearts"),
      createCard("10", "hearts"),
    ],
    expectedRank: "royal-flush",
  },
  {
    description: "Straight Flush (9-high)",
    cards: [
      createCard("9", "diamonds"),
      createCard("8", "diamonds"),
      createCard("7", "diamonds"),
      createCard("6", "diamonds"),
      createCard("5", "diamonds"),
    ],
    expectedRank: "straight-flush",
  },
  {
    description: "Four of a Kind (Aces)",
    cards: [
      createCard("A", "hearts"),
      createCard("A", "diamonds"),
      createCard("A", "clubs"),
      createCard("A", "spades"),
      createCard("K", "hearts"),
    ],
    expectedRank: "four-of-a-kind",
  },
  {
    description: "Full House (Kings over Threes)",
    cards: [
      createCard("K", "hearts"),
      createCard("K", "diamonds"),
      createCard("K", "clubs"),
      createCard("3", "spades"),
      createCard("3", "hearts"),
    ],
    expectedRank: "full-house",
  },
  {
    description: "Flush (Ace-high Spades)",
    cards: [
      createCard("A", "spades"),
      createCard("10", "spades"),
      createCard("7", "spades"),
      createCard("5", "spades"),
      createCard("2", "spades"),
    ],
    expectedRank: "flush",
  },
  {
    description: "Straight (Wheel: A-2-3-4-5)",
    cards: [
      createCard("A", "hearts"),
      createCard("5", "diamonds"),
      createCard("4", "clubs"),
      createCard("3", "spades"),
      createCard("2", "hearts"),
    ],
    expectedRank: "straight",
  },
  {
    description: "Straight (10-high)",
    cards: [
      createCard("10", "hearts"),
      createCard("9", "diamonds"),
      createCard("8", "clubs"),
      createCard("7", "spades"),
      createCard("6", "hearts"),
    ],
    expectedRank: "straight",
  },
  {
    description: "Three of a Kind (Queens)",
    cards: [
      createCard("Q", "hearts"),
      createCard("Q", "diamonds"),
      createCard("Q", "clubs"),
      createCard("7", "spades"),
      createCard("2", "hearts"),
    ],
    expectedRank: "three-of-a-kind",
  },
  {
    description: "Two Pair (Jacks and Sixes)",
    cards: [
      createCard("J", "hearts"),
      createCard("J", "diamonds"),
      createCard("6", "clubs"),
      createCard("6", "spades"),
      createCard("A", "hearts"),
    ],
    expectedRank: "two-pair",
  },
  {
    description: "Pair (Tens)",
    cards: [
      createCard("10", "hearts"),
      createCard("10", "diamonds"),
      createCard("K", "clubs"),
      createCard("9", "spades"),
      createCard("3", "hearts"),
    ],
    expectedRank: "pair",
  },
  {
    description: "High Card (Ace-high)",
    cards: [
      createCard("A", "hearts"),
      createCard("J", "diamonds"),
      createCard("9", "clubs"),
      createCard("6", "spades"),
      createCard("2", "hearts"),
    ],
    expectedRank: "high-card",
  },
]

// Run all test cases and return results
export function runHandEvaluationTests(): {
  passed: number
  failed: number
  results: Array<{ test: string; passed: boolean; error?: string }>
} {
  let passed = 0
  let failed = 0
  const results: Array<{ test: string; passed: boolean; error?: string }> = []

  for (const testCase of texasHoldemTestCases) {
    try {
      const evaluation = evaluateHand(testCase.cards)
      const testPassed = evaluation.rank === testCase.expectedRank

      if (testPassed) {
        passed++
      } else {
        failed++
      }

      results.push({
        test: testCase.description,
        passed: testPassed,
        error: testPassed ? undefined : `Expected ${testCase.expectedRank}, got ${evaluation.rank}`,
      })
    } catch (error) {
      failed++
      results.push({
        test: testCase.description,
        passed: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return { passed, failed, results }
}

// Validate Omaha hand evaluation requires exactly 2 hole + 3 community
export function validateOmahaEvaluation(
  holeCards: Card[],
  communityCards: Card[],
): {
  valid: boolean
  error?: string
} {
  if (holeCards.length !== 4) {
    return {
      valid: false,
      error: `Omaha requires exactly 4 hole cards, got ${holeCards.length}`,
    }
  }

  if (communityCards.length !== 5) {
    return {
      valid: false,
      error: `Omaha requires exactly 5 community cards, got ${communityCards.length}`,
    }
  }

  try {
    evaluateOmahaHand(holeCards, communityCards)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Compare two hands and return which is stronger
export function compareHands(cards1: Card[], cards2: Card[]): "hand1" | "hand2" | "tie" {
  const eval1 = evaluateHand(cards1)
  const eval2 = evaluateHand(cards2)

  if (eval1.value > eval2.value) return "hand1"
  if (eval2.value > eval1.value) return "hand2"
  return "tie"
}
