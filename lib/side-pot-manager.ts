import type { PlayerState, SidePot } from "@/types/poker"

export function calculateSidePots(players: PlayerState[]): SidePot[] {
  const sidePots: SidePot[] = []

  // Get all players who made bets, sorted by bet amount
  const playerBets = players
    .filter((p) => p.bet > 0)
    .map((p) => ({ id: p.id, bet: p.bet, allIn: p.allIn }))
    .sort((a, b) => a.bet - b.bet)

  if (playerBets.length === 0) return sidePots

  let previousCap = 0
  const remainingPlayers = new Set(playerBets.map((p) => p.id))

  for (let i = 0; i < playerBets.length; i++) {
    const currentBet = playerBets[i].bet

    if (currentBet > previousCap) {
      const cap = currentBet
      const contributionPerPlayer = cap - previousCap
      const eligiblePlayers = Array.from(remainingPlayers)
      const potAmount = eligiblePlayers.length * contributionPerPlayer

      sidePots.push({
        amount: potAmount,
        eligiblePlayers,
        cap,
      })

      previousCap = cap
    }

    // If player went all-in, they can't win pots beyond this point
    if (playerBets[i].allIn) {
      remainingPlayers.delete(playerBets[i].id)
    }
  }

  return sidePots
}

export function distributePots(sidePots: SidePot[], mainPot: number, winners: string[], players: PlayerState[]): void {
  // Distribute each side pot to eligible winners
  for (const pot of sidePots) {
    const eligibleWinners = winners.filter((id) => pot.eligiblePlayers.includes(id))

    if (eligibleWinners.length > 0) {
      const share = Math.floor(pot.amount / eligibleWinners.length)

      for (const winnerId of eligibleWinners) {
        const player = players.find((p) => p.id === winnerId)
        if (player) {
          player.chips += share
        }
      }
    }
  }

  // Distribute main pot to winners
  if (mainPot > 0 && winners.length > 0) {
    const share = Math.floor(mainPot / winners.length)

    for (const winnerId of winners) {
      const player = players.find((p) => p.id === winnerId)
      if (player) {
        player.chips += share
      }
    }
  }
}
