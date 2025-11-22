import type { Card, Suit } from "@/types/poker"

export function getCardDisplay(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  }

  return `${card.rank}${suitSymbols[card.suit]}`
}

export function getCardColor(suit: Suit): "red" | "black" {
  return suit === "hearts" || suit === "diamonds" ? "red" : "black"
}

export function getSuitSymbol(suit: Suit): string {
  const suitSymbols: Record<Suit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  }
  return suitSymbols[suit]
}
