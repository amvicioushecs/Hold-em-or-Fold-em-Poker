/**
 * DECK MANAGER - Singleton class for managing the poker deck
 * 
 * This utility handles all deck operations:
 * - Creating and initializing a standard 52-card deck
 * - Shuffling cards using the Fisher-Yates algorithm
 * - Drawing cards for players and community cards
 * - Tracking discarded cards and reshuffling when needed
 * 
 * Uses the Singleton pattern to ensure only one deck instance exists throughout the app.
 */

import type { Card, Suit, Rank } from "@/types/poker"

export class DeckManager {
  /** Static reference to the single instance of DeckManager */
  private static instance: DeckManager
  
  /** Array of cards currently in the deck */
  private deck: Card[] = []
  
  /** Array of cards that have been discarded but not yet reshuffled */
  private discardPile: Card[] = []

  /**
   * Private constructor - prevents direct instantiation
   * Call getInstance() instead to get the singleton instance
   */
  private constructor() {
    this.initializeDeck()
  }

  /**
   * Gets or creates the singleton instance of DeckManager
   * @returns {DeckManager} The singleton DeckManager instance
   */
  static getInstance(): DeckManager {
    if (!DeckManager.instance) {
      DeckManager.instance = new DeckManager()
    }
    return DeckManager.instance
  }

  /**
   * Initializes a fresh 52-card deck with all standard poker cards
   * Creates one card for each combination of 4 suits and 13 ranks
   */
  private initializeDeck(): void {
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"]
    const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

    this.deck = []
    for (const suit of suits) {
      for (const rank of ranks) {
        this.deck.push({ suit, rank })
      }
    }
  }

  /**
   * Shuffles the deck using the Fisher-Yates algorithm
   * Ensures a random distribution of cards for each draw
   * Time complexity: O(n)
   */
  shuffle(): void {
    // Fisher-Yates shuffle algorithm: iterate backwards and swap with random earlier position
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
    }
  }

  /**
   * Draws multiple cards from the deck
   * If insufficient cards remain, reshuffles the discard pile back into the deck
   * 
   * @param {number} [count=1] - Number of cards to draw (defaults to 1)
   * @returns {Card[]} Array of drawn cards
   */
  draw(count = 1): Card[] {
    if (this.deck.length < count) {
      // Not enough cards: reshuffle the discard pile back in
      this.deck.push(...this.discardPile)
      this.discardPile = []
      this.shuffle()
    }

    return this.deck.splice(0, count)
  }

  /**
   * Draws a single card from the deck
   * If no cards remain, reshuffles discard pile back into deck
   * 
   * @returns {Card | null} The drawn card, or null if deck is somehow empty
   */
  drawOne(): Card | null {
    if (this.deck.length === 0) {
      // No cards in deck: reshuffle discard pile
      this.deck.push(...this.discardPile)
      this.discardPile = []
      this.shuffle()
    }

    return this.deck.pop() || null
  }

  /**
   * Discards cards by moving them to the discard pile
   * These cards will be reshuffled back into the deck when needed
   * 
   * @param {Card[]} cards - Array of cards to discard
   */
  discard(cards: Card[]): void {
    this.discardPile.push(...cards)
  }

  /**
   * Resets the deck to a fresh, shuffled state
   * Clears discard pile and reinitializes the full 52-card deck
   * Call this at the start of each new hand
   */
  reset(): void {
    this.initializeDeck()
    this.discardPile = []
    this.shuffle()
  }

  /**
   * Gets the number of cards currently in the main deck (not discard pile)
   * @returns {number} Number of cards available to draw
   */
  getRemainingCards(): number {
    return this.deck.length
  }

  /**
   * Gets the total number of cards (main deck + discard pile)
   * Useful for debugging and verifying deck integrity
   * @returns {number} Total cards in system
   */
  getTotalCards(): number {
    return this.deck.length + this.discardPile.length
  }
}

// ==================== SINGLETON EXPORT ====================
// Export the singleton instance for use throughout the application
// Always use this instance rather than creating new DeckManager instances
export const deckManager = DeckManager.getInstance()
