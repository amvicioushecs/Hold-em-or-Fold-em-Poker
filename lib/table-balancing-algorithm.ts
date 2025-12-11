import type { TournamentTable, TournamentPlayer } from "@/types/tournament"

export interface TableBalancingConfig {
  maxPlayersPerTable: number
  minPlayersPerTable: number
  maxTableImbalance: number // Max difference in player count between tables
}

export class TableBalancer {
  static needsRebalancing(tables: TournamentTable[], config: TableBalancingConfig): boolean {
    const activeTables = tables.filter((t) => t.players.length > 0)

    if (activeTables.length <= 1) return false

    const counts = activeTables.map((t) => t.players.length)
    const max = Math.max(...counts)
    const min = Math.min(...counts)

    return max - min > config.maxTableImbalance
  }

  static calculateOptimalTableCount(totalPlayers: number, maxPlayersPerTable: number): number {
    return Math.ceil(totalPlayers / maxPlayersPerTable)
  }

  static getBalancedDistribution(totalPlayers: number, numTables: number): number[] {
    const basePerTable = Math.floor(totalPlayers / numTables)
    const remainder = totalPlayers % numTables

    const distribution: number[] = []
    for (let i = 0; i < numTables; i++) {
      distribution.push(basePerTable + (i < remainder ? 1 : 0))
    }

    return distribution
  }

  static shouldBreakTable(table: TournamentTable, allTables: TournamentTable[], config: TableBalancingConfig): boolean {
    const totalPlayers = allTables.reduce((sum, t) => sum + t.players.length, 0)
    const optimalTables = this.calculateOptimalTableCount(totalPlayers, config.maxPlayersPerTable)

    return allTables.length > optimalTables && table.players.length <= config.minPlayersPerTable
  }

  static findBestTableForPlayer(
    player: TournamentPlayer,
    tables: TournamentTable[],
    excludeTableId?: string,
  ): TournamentTable | null {
    const eligibleTables = tables.filter((t) => t.id !== excludeTableId && t.isActive && t.players.length > 0)

    if (eligibleTables.length === 0) return null

    // Find table with fewest players (to maintain balance)
    eligibleTables.sort((a, b) => a.players.length - b.players.length)

    return eligibleTables[0]
  }

  static redistributePlayers(players: TournamentPlayer[], targetTables: TournamentTable[]): void {
    // Clear existing assignments
    targetTables.forEach((table) => {
      table.players = []
    })

    // Distribute using round-robin for fairness
    players.forEach((player, idx) => {
      const tableIdx = idx % targetTables.length
      const table = targetTables[tableIdx]

      player.tableId = table.id
      player.seatNumber = table.players.length + 1
      table.players.push(player)
    })
  }
}
