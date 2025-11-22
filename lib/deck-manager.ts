import type { Card, Suit, Rank } from "@/types/poker"

export class DeckManager {
  private static instance: DeckManager
  private deck: Card[] = []
  private discardPile: Card[] = []

  private constructor() {
    this.initializeDeck()
  }

  static getInstance(): DeckManager {
    if (!DeckManager.instance) {
      DeckManager.instance = new DeckManager()
    }
    return DeckManager.instance
  }

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

  shuffle(): void {
    // Fisher-Yates shuffle algorithm
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
    }
  }

  draw(count = 1): Card[] {
    if (this.deck.length < count) {
      // Reshuffle discard pile back into deck if needed
      this.deck.push(...this.discardPile)
      this.discardPile = []
      this.shuffle()
    }

    return this.deck.splice(0, count)
  }

  drawOne(): Card | null {
    if (this.deck.length === 0) {
      this.deck.push(...this.discardPile)
      this.discardPile = []
      this.shuffle()
    }

    return this.deck.pop() || null
  }

  discard(cards: Card[]): void {
    this.discardPile.push(...cards)
  }

  reset(): void {
    this.initializeDeck()
    this.discardPile = []
    this.shuffle()
  }

  getRemainingCards(): number {
    return this.deck.length
  }

  getTotalCards(): number {
    return this.deck.length + this.discardPile.length
  }
}

// Export singleton instance
export const deckManager = DeckManager.getInstance()
