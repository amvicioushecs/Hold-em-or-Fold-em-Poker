"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, BookOpen } from "lucide-react"

interface RulesSection {
  id: string
  title: string
  icon: string
  content: React.ReactNode
}

export function RulesPage({ onClose }: { onClose: () => void }) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  const sections: RulesSection[] = [
    {
      id: "texas-holdem",
      title: "Texas Hold'em",
      icon: "♠️",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Texas Hold'em Rules</h3>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Overview</h4>
            <p className="text-muted-foreground text-sm">
              Texas Hold'em is the most popular poker variant. Each player receives 2 hole cards, and 5 community cards
              are dealt face-up on the table. Players make the best 5-card hand using any combination of their hole
              cards and community cards.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Betting Rounds</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Pre-Flop: After receiving hole cards, before community cards</li>
              <li>Flop: After first 3 community cards are dealt</li>
              <li>Turn: After 4th community card is dealt</li>
              <li>River: After 5th and final community card is dealt</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Hand Rankings (High to Low)</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between border-b border-border py-1">
                <span>Royal Flush</span>
                <span className="text-chart-4">A-K-Q-J-10 same suit</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span>Straight Flush</span>
                <span className="text-chart-4">5 cards in sequence, same suit</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span>Four of a Kind</span>
                <span className="text-chart-4">4 cards of same rank</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span>Full House</span>
                <span className="text-chart-4">3 of a kind + pair</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span>Flush</span>
                <span className="text-chart-4">5 cards same suit</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span>Straight</span>
                <span className="text-chart-4">5 cards in sequence</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span>Three of a Kind</span>
                <span className="text-chart-4">3 cards of same rank</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span>Two Pair</span>
                <span className="text-chart-4">2 different pairs</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span>Pair</span>
                <span className="text-chart-4">2 cards of same rank</span>
              </div>
              <div className="flex justify-between py-1">
                <span>High Card</span>
                <span className="text-chart-4">Highest card wins</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "omaha",
      title: "Omaha",
      icon: "♣️",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Omaha Rules</h3>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Overview</h4>
            <p className="text-muted-foreground text-sm">
              Omaha is similar to Texas Hold'em but with a key difference: each player receives 4 hole cards instead of
              2. Players MUST use exactly 2 hole cards and exactly 3 community cards to make their final hand.
            </p>
          </div>

          <div className="bg-chart-4/10 border border-chart-4/30 rounded-lg p-3">
            <h4 className="font-semibold text-chart-4 mb-1 text-sm">Important Rule</h4>
            <p className="text-muted-foreground text-xs">
              You must use EXACTLY 2 of your hole cards and EXACTLY 3 community cards. You cannot use 3 hole cards and 2
              community cards, or all 4 hole cards with 1 community card.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Example</h4>
            <p className="text-muted-foreground text-sm">
              Your hole cards: A♠ K♠ 7♥ 3♦
              <br />
              Community cards: Q♠ J♠ 10♠ 2♣ 8♥
              <br />
              <br />
              Best hand: A♠ K♠ Q♠ J♠ 10♠ (Royal Flush using A♠ K♠ from your hand + Q♠ J♠ 10♠ from the board)
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Betting Structure</h4>
            <p className="text-muted-foreground text-sm">
              Omaha uses the same betting rounds as Texas Hold'em: Pre-Flop, Flop, Turn, and River. Hand rankings are
              identical to Texas Hold'em.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "sng",
      title: "Sit and Go (SNG)",
      icon: "🎯",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Sit and Go Tournament Rules</h3>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a SNG?</h4>
            <p className="text-muted-foreground text-sm">
              Sit and Go tournaments start as soon as the required number of players register. There's no scheduled
              start time - when the table fills up, the tournament begins immediately.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Structure</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Typically 6-9 players per tournament</li>
              <li>Single table format</li>
              <li>Blinds increase at set intervals (usually 10-15 minutes)</li>
              <li>Play continues until one player has all the chips</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Prize Distribution</h4>
            <p className="text-muted-foreground text-sm mb-2">Standard 9-player SNG payout:</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between bg-card/50 px-3 py-2 rounded">
                <span className="text-foreground">1st Place</span>
                <span className="text-chart-4 font-semibold">50%</span>
              </div>
              <div className="flex justify-between bg-card/50 px-3 py-2 rounded">
                <span className="text-foreground">2nd Place</span>
                <span className="text-chart-4 font-semibold">30%</span>
              </div>
              <div className="flex justify-between bg-card/50 px-3 py-2 rounded">
                <span className="text-foreground">3rd Place</span>
                <span className="text-chart-4 font-semibold">20%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Variants</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Heads-Up SNG: 1v1 format, winner takes all</li>
              <li>Turbo SNG: Faster blind increases (5-minute levels)</li>
              <li>Bounty SNG: Earn bonus chips for eliminating players</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "mtt",
      title: "Multi-Table Tournaments",
      icon: "🏆",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Multi-Table Tournament (MTT) Rules</h3>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Overview</h4>
            <p className="text-muted-foreground text-sm">
              MTTs can accommodate hundreds or thousands of players across multiple tables. As players are eliminated,
              tables are consolidated until reaching a final table.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Structure</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Multiple tables running simultaneously</li>
              <li>Tables are balanced as players are eliminated</li>
              <li>Scheduled breaks between blind levels</li>
              <li>Final table formed when players are down to one table</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Table Balancing</h4>
            <p className="text-muted-foreground text-sm">
              When a player is eliminated, tables may be rebalanced to ensure fairness. Players are moved to maintain
              roughly equal player counts at each table. No table should have more than 1 extra player compared to
              another.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Blind Levels</h4>
            <p className="text-muted-foreground text-sm mb-2">
              Blinds increase on a set schedule, typically every 10-15 minutes. Higher levels introduce antes in
              addition to blinds.
            </p>
            <div className="bg-card/50 rounded p-3 text-xs text-muted-foreground space-y-1">
              <div>Level 1: 25/50</div>
              <div>Level 2: 50/100</div>
              <div>Level 3: 75/150 + 25 ante</div>
              <div className="text-chart-4">... blinds continue to increase</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Rebuys and Add-Ons</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Rebuy: Purchase additional chips when below a certain threshold (limited to early levels)</li>
              <li>Add-On: One-time chip purchase available at a specific blind level for all players</li>
              <li>Both increase the total prize pool</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "betting",
      title: "Betting Actions",
      icon: "💰",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Betting Actions Explained</h3>

          <div className="space-y-3">
            <div className="bg-card border border-border rounded-lg p-3">
              <h4 className="font-semibold text-foreground mb-1">Fold</h4>
              <p className="text-muted-foreground text-sm">
                Give up your hand and forfeit any chips you've bet. You cannot win the pot.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <h4 className="font-semibold text-foreground mb-1">Check</h4>
              <p className="text-muted-foreground text-sm">
                Pass the action to the next player without betting. Only available when no one has bet in the current
                round.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <h4 className="font-semibold text-foreground mb-1">Call</h4>
              <p className="text-muted-foreground text-sm">
                Match the current bet to stay in the hand. If you don't have enough chips, you automatically go all-in.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <h4 className="font-semibold text-foreground mb-1">Raise</h4>
              <p className="text-muted-foreground text-sm">
                Increase the bet amount. Other players must call your raise, re-raise, or fold. Minimum raise is
                typically 2x the big blind.
              </p>
            </div>

            <div className="bg-card border border-chart-1 rounded-lg p-3 border-2">
              <h4 className="font-semibold text-chart-1 mb-1">All-In</h4>
              <p className="text-muted-foreground text-sm">
                Bet all your remaining chips. If you have the fewest chips, a side pot may be created for the remaining
                players.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Side Pots</h4>
            <p className="text-muted-foreground text-sm">
              When a player goes all-in with fewer chips than others, a side pot is created. The all-in player can only
              win the main pot. Additional bets from other players go into the side pot, which only they can win.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "positions",
      title: "Table Positions",
      icon: "📍",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Table Positions</h3>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Dealer Button</h4>
            <p className="text-muted-foreground text-sm">
              The dealer button rotates clockwise after each hand. The player with the button acts last in all betting
              rounds except pre-flop, giving them a strategic advantage.
            </p>
          </div>

          <div className="space-y-2">
            <div className="bg-card border border-border rounded-lg p-3">
              <h4 className="font-semibold text-foreground mb-1">Small Blind (SB)</h4>
              <p className="text-muted-foreground text-sm">
                Sits immediately left of the dealer. Posts the small blind (half the big blind) before cards are dealt.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <h4 className="font-semibold text-foreground mb-1">Big Blind (BB)</h4>
              <p className="text-muted-foreground text-sm">
                Sits left of the small blind. Posts the full big blind before cards are dealt. Last to act pre-flop.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <h4 className="font-semibold text-foreground mb-1">Under the Gun (UTG)</h4>
              <p className="text-muted-foreground text-sm">
                First player to act pre-flop, sitting left of the big blind. Considered the worst position.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <h4 className="font-semibold text-foreground mb-1">Middle Position</h4>
              <p className="text-muted-foreground text-sm">
                Players between UTG and late position. Moderate positional advantage.
              </p>
            </div>

            <div className="bg-card border border-chart-4 rounded-lg p-3 border-2">
              <h4 className="font-semibold text-chart-4 mb-1">Late Position (Button)</h4>
              <p className="text-muted-foreground text-sm">
                Best position at the table. Acts last post-flop, seeing all other actions before deciding.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ]

  if (selectedSection) {
    const section = sections.find((s) => s.id === selectedSection)

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="min-h-screen p-4 pb-20">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Button size="icon" variant="ghost" onClick={() => setSelectedSection(null)} className="text-foreground">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Rules</h2>
                <p className="text-sm text-muted-foreground">Learn how to play</p>
              </div>
            </div>

            {/* Content */}
            <div className="bg-card border border-border rounded-2xl p-6">{section?.content}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-screen p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button size="icon" variant="ghost" onClick={onClose} className="text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Game Rules</h2>
              <p className="text-sm text-muted-foreground">Learn how to play poker</p>
            </div>
          </div>

          {/* Rule Sections */}
          <div className="space-y-3">
            {sections.map((section) => (
              <Card
                key={section.id}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-border"
                onClick={() => setSelectedSection(section.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{section.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {section.id === "texas-holdem" && "Most popular poker variant"}
                      {section.id === "omaha" && "Use exactly 2 hole + 3 community cards"}
                      {section.id === "sng" && "Single table tournaments"}
                      {section.id === "mtt" && "Large multi-table tournaments"}
                      {section.id === "betting" && "Fold, check, call, raise, all-in"}
                      {section.id === "positions" && "Understanding table positions"}
                    </p>
                  </div>
                  <ChevronLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="mt-8 bg-chart-4/10 border border-chart-4/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 text-chart-4 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-foreground mb-2">New to Poker?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Start with Texas Hold'em to learn the basics. Focus on understanding hand rankings and betting actions
                  first.
                </p>
                <p className="text-xs text-muted-foreground">
                  Tip: Position matters! Playing from late position (near the button) gives you a strategic advantage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
