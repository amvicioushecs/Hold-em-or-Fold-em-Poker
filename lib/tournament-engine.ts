import type {
  TournamentConfig,
  TournamentState,
  TournamentPlayer,
  TournamentTable,
  BlindLevel,
} from "@/types/tournament"

export class TournamentEngine {
  private static instance: TournamentEngine
  private tournaments: Map<string, TournamentState> = new Map()

  private constructor() {}

  static getInstance(): TournamentEngine {
    if (!TournamentEngine.instance) {
      TournamentEngine.instance = new TournamentEngine()
    }
    return TournamentEngine.instance
  }

  static getDefaultBlindStructure(): BlindLevel[] {
    return [
      { level: 1, smallBlind: 25, bigBlind: 50, ante: 0, duration: 600 }, // 10 min
      { level: 2, smallBlind: 50, bigBlind: 100, ante: 0, duration: 600 },
      { level: 3, smallBlind: 75, bigBlind: 150, ante: 25, duration: 600 },
      { level: 4, smallBlind: 100, bigBlind: 200, ante: 25, duration: 600 },
      { level: 5, smallBlind: 0, bigBlind: 0, duration: 900, isBreak: true, breakDuration: 900 }, // 15-min break
      { level: 6, smallBlind: 150, bigBlind: 300, ante: 50, duration: 600 },
      { level: 7, smallBlind: 200, bigBlind: 400, ante: 50, duration: 600 },
      { level: 8, smallBlind: 300, bigBlind: 600, ante: 75, duration: 600 },
      { level: 9, smallBlind: 400, bigBlind: 800, ante: 100, duration: 600 },
      { level: 10, smallBlind: 0, bigBlind: 0, duration: 900, isBreak: true, breakDuration: 900 }, // 15-min break
      { level: 11, smallBlind: 600, bigBlind: 1200, ante: 150, duration: 600 },
      { level: 12, smallBlind: 800, bigBlind: 1600, ante: 200, duration: 600 },
      { level: 13, smallBlind: 1000, bigBlind: 2000, ante: 300, duration: 600 },
      { level: 14, smallBlind: 1500, bigBlind: 3000, ante: 400, duration: 600 },
      { level: 15, smallBlind: 0, bigBlind: 0, duration: 600, isBreak: true, breakDuration: 600 }, // 10-min break
      { level: 16, smallBlind: 2000, bigBlind: 4000, ante: 500, duration: 600 },
      { level: 17, smallBlind: 3000, bigBlind: 6000, ante: 1000, duration: 600 },
      { level: 18, smallBlind: 5000, bigBlind: 10000, ante: 1000, duration: 600 },
    ]
  }

  static getTurboBlindStructure(): BlindLevel[] {
    return [
      { level: 1, smallBlind: 25, bigBlind: 50, ante: 0, duration: 300 }, // 5 min
      { level: 2, smallBlind: 50, bigBlind: 100, ante: 0, duration: 300 },
      { level: 3, smallBlind: 100, bigBlind: 200, ante: 25, duration: 300 },
      { level: 4, smallBlind: 150, bigBlind: 300, ante: 50, duration: 300 },
      { level: 5, smallBlind: 250, bigBlind: 500, ante: 75, duration: 300 },
      { level: 6, smallBlind: 400, bigBlind: 800, ante: 100, duration: 300 },
      { level: 7, smallBlind: 600, bigBlind: 1200, ante: 150, duration: 300 },
      { level: 8, smallBlind: 1000, bigBlind: 2000, ante: 300, duration: 300 },
      { level: 9, smallBlind: 1500, bigBlind: 3000, ante: 400, duration: 300 },
      { level: 10, smallBlind: 2500, bigBlind: 5000, ante: 500, duration: 300 },
    ]
  }

  static getHeadsUpBlindStructure(): BlindLevel[] {
    return [
      { level: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 300 }, // 5 min
      { level: 2, smallBlind: 20, bigBlind: 40, ante: 0, duration: 300 },
      { level: 3, smallBlind: 30, bigBlind: 60, ante: 10, duration: 300 },
      { level: 4, smallBlind: 50, bigBlind: 100, ante: 10, duration: 300 },
      { level: 5, smallBlind: 75, bigBlind: 150, ante: 25, duration: 300 },
      { level: 6, smallBlind: 100, bigBlind: 200, ante: 25, duration: 300 },
      { level: 7, smallBlind: 150, bigBlind: 300, ante: 50, duration: 300 },
      { level: 8, smallBlind: 250, bigBlind: 500, ante: 75, duration: 300 },
      { level: 9, smallBlind: 400, bigBlind: 800, ante: 100, duration: 300 },
      { level: 10, smallBlind: 600, bigBlind: 1200, ante: 150, duration: 300 },
    ]
  }

  // Create a new tournament
  createTournament(config: TournamentConfig): TournamentState {
    const tournament: TournamentState = {
      config,
      phase: "registration",
      currentBlindLevel: 0,
      blindLevelTimeRemaining: config.blindStructure[0].duration,
      totalPrizePool: 0,
      registeredPlayers: [],
      tables: [],
      eliminatedPlayers: [],
      currentTime: new Date(),
      totalPlayers: 0,
      remainingPlayers: 0,
      totalBountyPot: config.tournamentType === "bounty" || config.tournamentType === "pko" ? 0 : undefined,
      breakTimeRemaining: 0,
      isAddOnAvailable: false,
      isRebuyAvailable: config.rebuyConfig?.enabled || false,
    }

    this.tournaments.set(config.id, tournament)
    return tournament
  }

  // Register a player for tournament
  registerPlayer(tournamentId: string, playerId: string, playerName: string): boolean {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament) return false

    // Check if registration is open
    if (tournament.phase !== "registration" && tournament.phase !== "late-registration") {
      return false
    }

    // Check if tournament is full
    if (tournament.registeredPlayers.length >= tournament.config.maxPlayers) {
      return false
    }

    // Check if player already registered
    if (tournament.registeredPlayers.some((p) => p.id === playerId)) {
      return false
    }

    // Add player
    const player: TournamentPlayer = {
      id: playerId,
      name: playerName,
      chips: tournament.config.startingChips,
      tableId: "",
      seatNumber: 0,
      isEliminated: false,
      bountyValue: tournament.config.bountyAmount || 0,
      bountiesEarned: 0,
      rebuysUsed: 0,
      hasAddOn: false,
    }

    tournament.registeredPlayers.push(player)
    tournament.totalPlayers++
    tournament.remainingPlayers++
    tournament.totalPrizePool += tournament.config.buyIn

    if (tournament.config.tournamentType === "bounty" && tournament.config.bountyAmount) {
      tournament.totalBountyPot = (tournament.totalBountyPot || 0) + tournament.config.bountyAmount
    }

    return true
  }

  // Start the tournament
  startTournament(tournamentId: string): boolean {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament) return false

    // Check minimum players
    if (tournament.registeredPlayers.length < tournament.config.minPlayers) {
      return false
    }

    // Create tables and assign players
    this.createTablesAndAssignPlayers(tournament)

    tournament.phase = "running"
    tournament.startTime = new Date()
    tournament.currentTime = new Date()

    return true
  }

  // Create tables and assign players
  private createTablesAndAssignPlayers(tournament: TournamentState): void {
    const playersPerTable = tournament.config.playersPerTable
    const players = [...tournament.registeredPlayers]

    // Shuffle players for random table assignment
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[players[i], players[j]] = [players[j], players[i]]
    }

    if (tournament.config.tournamentType === "headsup") {
      // Create one table per 2 players
      const numTables = Math.floor(players.length / 2)

      for (let i = 0; i < numTables; i++) {
        const table: TournamentTable = {
          id: `table-${i + 1}`,
          players: [],
          gameState: null,
          isActive: true,
        }

        // Assign 2 players to this table
        const player1 = players[i * 2]
        const player2 = players[i * 2 + 1]

        player1.tableId = table.id
        player1.seatNumber = 1
        table.players.push(player1)

        player2.tableId = table.id
        player2.seatNumber = 2
        table.players.push(player2)

        tournament.tables.push(table)
      }

      return
    }

    // Calculate number of tables needed for regular tournaments
    const numTables = Math.ceil(players.length / playersPerTable)

    // Create tables
    for (let i = 0; i < numTables; i++) {
      const table: TournamentTable = {
        id: `table-${i + 1}`,
        players: [],
        gameState: null,
        isActive: true,
      }

      // Assign players to this table
      const startIdx = i * playersPerTable
      const endIdx = Math.min(startIdx + playersPerTable, players.length)

      for (let j = startIdx; j < endIdx; j++) {
        const player = players[j]
        player.tableId = table.id
        player.seatNumber = j - startIdx + 1
        table.players.push(player)
      }

      tournament.tables.push(table)
    }
  }

  // Advance blind level
  advanceBlindLevel(tournamentId: string): void {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament) return

    if (tournament.currentBlindLevel < tournament.config.blindStructure.length - 1) {
      tournament.currentBlindLevel++
      const newLevel = tournament.config.blindStructure[tournament.currentBlindLevel]
      tournament.blindLevelTimeRemaining = newLevel.duration

      if (newLevel.isBreak) {
        tournament.phase = "break"
        tournament.breakTimeRemaining = newLevel.breakDuration || newLevel.duration
      } else {
        if (tournament.phase === "break") {
          tournament.phase = "running"
        }
      }

      if (tournament.config.addOnConfig) {
        const addOnConfig = tournament.config.addOnConfig
        if (tournament.currentBlindLevel === addOnConfig.availableAtLevel) {
          tournament.isAddOnAvailable = true
        }
        if (addOnConfig.availableUntilLevel && tournament.currentBlindLevel > addOnConfig.availableUntilLevel) {
          tournament.isAddOnAvailable = false
        }
      }

      if (tournament.config.rebuyConfig) {
        const rebuyConfig = tournament.config.rebuyConfig
        if (tournament.currentBlindLevel > rebuyConfig.allowedUntilLevel) {
          tournament.isRebuyAvailable = false
        }
      }

      // Update all active tables with new blinds
      tournament.tables.forEach((table) => {
        if (table.isActive && table.gameState) {
          // Update game state blinds
          // This will be implemented when we integrate with game state
        }
      })
    }
  }

  processRebuy(tournamentId: string, playerId: string): boolean {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament || !tournament.config.rebuyConfig?.enabled) return false

    const rebuyConfig = tournament.config.rebuyConfig

    // Check if rebuy period is active
    if (tournament.currentBlindLevel > rebuyConfig.allowedUntilLevel) {
      tournament.isRebuyAvailable = false
      return false
    }

    // Find player
    let player: TournamentPlayer | null = null
    for (const table of tournament.tables) {
      const p = table.players.find((p) => p.id === playerId)
      if (p) {
        player = p
        break
      }
    }

    if (!player) return false

    // Check rebuy eligibility
    const rebuysUsed = player.rebuysUsed || 0
    if (rebuysUsed >= rebuyConfig.maxRebuys) return false

    // Check chip threshold if configured
    if (rebuyConfig.allowedWhenChipsBelow && player.chips >= rebuyConfig.allowedWhenChipsBelow) {
      return false
    }

    // Process rebuy
    player.chips += rebuyConfig.chipsReceived
    player.rebuysUsed = rebuysUsed + 1
    tournament.totalPrizePool += rebuyConfig.cost

    return true
  }

  processAddOn(tournamentId: string, playerId: string): boolean {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament || !tournament.config.addOnConfig?.enabled) return false

    const addOnConfig = tournament.config.addOnConfig

    // Check if add-on is available
    if (!tournament.isAddOnAvailable) return false

    // Find player
    let player: TournamentPlayer | null = null
    for (const table of tournament.tables) {
      const p = table.players.find((p) => p.id === playerId)
      if (p) {
        player = p
        break
      }
    }

    if (!player) return false

    // Check if player already purchased add-on
    if (player.hasAddOn) return false

    // Process add-on
    player.chips += addOnConfig.chipsReceived
    player.hasAddOn = true
    tournament.totalPrizePool += addOnConfig.cost

    return true
  }

  eliminatePlayer(tournamentId: string, playerId: string, eliminatorId?: string): void {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament) return

    // Find player and their table
    let eliminatedPlayer: TournamentPlayer | null = null
    let eliminatorPlayer: TournamentPlayer | null = null
    let playerTable: TournamentTable | null = null

    for (const table of tournament.tables) {
      const player = table.players.find((p) => p.id === playerId)
      if (player) {
        eliminatedPlayer = player
        playerTable = table
        break
      }
    }

    if (!eliminatedPlayer || !playerTable) return

    if (
      (tournament.config.tournamentType === "bounty" || tournament.config.tournamentType === "pko") &&
      eliminatorId &&
      eliminatedPlayer.bountyValue
    ) {
      // Find eliminator in all tables
      for (const table of tournament.tables) {
        const eliminator = table.players.find((p) => p.id === eliminatorId)
        if (eliminator) {
          eliminatorPlayer = eliminator

          if (tournament.config.tournamentType === "pko") {
            const halfBounty = eliminatedPlayer.bountyValue / 2
            eliminator.chips += halfBounty
            eliminator.bountyValue = (eliminator.bountyValue || 0) + halfBounty
          } else {
            // Regular bounty: full bounty to eliminator
            eliminator.chips += eliminatedPlayer.bountyValue
          }

          eliminator.bountiesEarned = (eliminator.bountiesEarned || 0) + 1
          break
        }
      }
    }

    // Mark player as eliminated
    eliminatedPlayer.isEliminated = true
    eliminatedPlayer.eliminationPlace = tournament.remainingPlayers
    tournament.remainingPlayers--

    // Remove player from table
    playerTable.players = playerTable.players.filter((p) => p.id !== playerId)
    tournament.eliminatedPlayers.push(eliminatedPlayer)

    // Check if we need to balance tables
    this.balanceTables(tournament)

    // Check if tournament is complete
    if (tournament.remainingPlayers === 1) {
      this.completeTournament(tournament)
    } else if (
      tournament.config.tournamentType === "headsup" ||
      tournament.remainingPlayers <= tournament.config.playersPerTable
    ) {
      // Move to final table
      this.createFinalTable(tournament)
    }
  }

  // Balance tables when players are eliminated
  private balanceTables(tournament: TournamentState): void {
    const activeTables = tournament.tables.filter((t) => t.players.length > 0 && t.isActive)

    if (activeTables.length <= 1) return

    // Sort tables by player count (descending)
    activeTables.sort((a, b) => b.players.length - a.players.length)

    const totalPlayers = activeTables.reduce((sum, t) => sum + t.players.length, 0)
    const idealPlayersPerTable = Math.floor(totalPlayers / activeTables.length)
    const remainder = totalPlayers % activeTables.length

    if (this.shouldConsolidateTables(tournament, activeTables)) {
      this.consolidateTables(tournament, activeTables)
      return
    }

    let balanced = false
    while (!balanced) {
      const maxTable = activeTables[0]
      const minTable = activeTables[activeTables.length - 1]

      // Table difference should not exceed 1
      if (maxTable.players.length - minTable.players.length <= 1) {
        balanced = true
        break
      }

      const playerToMove = this.selectPlayerToMove(maxTable)
      if (playerToMove) {
        this.movePlayer(playerToMove, maxTable, minTable)

        // Re-sort after move
        activeTables.sort((a, b) => b.players.length - a.players.length)
      } else {
        balanced = true
      }
    }

    tournament.tables = tournament.tables.filter((t) => t.players.length > 0 || !t.isActive)
  }

  private shouldConsolidateTables(tournament: TournamentState, activeTables: TournamentTable[]): boolean {
    const totalPlayers = activeTables.reduce((sum, t) => sum + t.players.length, 0)
    const playersPerTable = tournament.config.playersPerTable

    // If all remaining players can fit at one fewer table, consolidate
    const minTablesNeeded = Math.ceil(totalPlayers / playersPerTable)

    return activeTables.length > minTablesNeeded
  }

  private consolidateTables(tournament: TournamentState, activeTables: TournamentTable[]): void {
    const totalPlayers = activeTables.reduce((sum, t) => sum + t.players.length, 0)
    const playersPerTable = tournament.config.playersPerTable
    const tablesNeeded = Math.ceil(totalPlayers / playersPerTable)

    if (tablesNeeded >= activeTables.length) return

    // Collect all players
    const allPlayers: TournamentPlayer[] = []
    activeTables.forEach((table) => {
      allPlayers.push(...table.players)
      table.players = []
      table.isActive = false
    })

    // Create new balanced tables
    const newTables: TournamentTable[] = []
    for (let i = 0; i < tablesNeeded; i++) {
      const table: TournamentTable = {
        id: `table-${i + 1}`,
        players: [],
        gameState: null,
        isActive: true,
      }
      newTables.push(table)
    }

    // Distribute players evenly using round-robin
    allPlayers.forEach((player, idx) => {
      const tableIdx = idx % tablesNeeded
      const table = newTables[tableIdx]
      player.tableId = table.id
      player.seatNumber = table.players.length + 1
      table.players.push(player)
    })

    tournament.tables = newTables
  }

  private selectPlayerToMove(table: TournamentTable): TournamentPlayer | null {
    if (table.players.length === 0) return null

    // For simplicity, move a random non-dealer player
    // In a real implementation, would check game state for current hand
    const eligiblePlayers = table.players.filter((p) => !p.isEliminated)

    if (eligiblePlayers.length === 0) return null

    // Select random player
    const randomIdx = Math.floor(Math.random() * eligiblePlayers.length)
    return eligiblePlayers[randomIdx]
  }

  private movePlayer(player: TournamentPlayer, fromTable: TournamentTable, toTable: TournamentTable): void {
    // Remove from old table
    fromTable.players = fromTable.players.filter((p) => p.id !== player.id)

    // Add to new table
    player.tableId = toTable.id
    player.seatNumber = toTable.players.length + 1
    toTable.players.push(player)
  }

  // Create final table
  private createFinalTable(tournament: TournamentState): void {
    tournament.phase = "final-table"

    const finalTable: TournamentTable = {
      id: "final-table",
      players: [],
      gameState: null,
      isActive: true,
    }

    // Collect all remaining players
    const allRemainingPlayers: TournamentPlayer[] = []
    tournament.tables.forEach((table) => {
      allRemainingPlayers.push(...table.players.filter((p) => !p.isEliminated))
    })

    // Sort by chip count (descending) for seat assignment
    allRemainingPlayers.sort((a, b) => b.chips - a.chips)

    // Assign seats alternating from chip leader
    allRemainingPlayers.forEach((player, idx) => {
      player.tableId = finalTable.id
      player.seatNumber = idx + 1
      finalTable.players.push(player)
    })

    // Deactivate old tables
    tournament.tables.forEach((t) => (t.isActive = false))

    // Set final table as the only active table
    tournament.tables = [finalTable]
  }

  // Complete tournament and award prizes
  private completeTournament(tournament: TournamentState): void {
    tournament.phase = "completed"

    // Find the winner
    const winner = tournament.tables[0]?.players[0]
    if (winner) {
      winner.eliminationPlace = 1
    }

    // Calculate prize distribution
    const prizePool = tournament.totalPrizePool
    const percentages = tournament.config.prizePoolPercentages

    // Sort players by elimination place (lower = better)
    const allPlayers = [...tournament.tables[0].players, ...tournament.eliminatedPlayers].sort((a, b) => {
      const placeA = a.eliminationPlace || 999
      const placeB = b.eliminationPlace || 999
      return placeA - placeB
    })

    // Award prizes
    percentages.forEach((percentage, idx) => {
      if (idx < allPlayers.length) {
        allPlayers[idx].prizeWon = Math.floor((prizePool * percentage) / 100)
      }
    })
  }

  // Get tournament state
  getTournament(tournamentId: string): TournamentState | undefined {
    return this.tournaments.get(tournamentId)
  }

  // Get current blind level
  getCurrentBlindLevel(tournamentId: string): BlindLevel | undefined {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament) return undefined

    return tournament.config.blindStructure[tournament.currentBlindLevel]
  }

  updateTimer(tournamentId: string, deltaSeconds: number): void {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament) return

    if (tournament.phase === "break") {
      tournament.breakTimeRemaining = (tournament.breakTimeRemaining || 0) - deltaSeconds

      if (tournament.breakTimeRemaining <= 0) {
        tournament.phase = "running"
        tournament.breakTimeRemaining = 0
        // Advance to next level after break
        this.advanceBlindLevel(tournamentId)
      }
    } else if (tournament.phase === "running") {
      tournament.blindLevelTimeRemaining -= deltaSeconds

      if (tournament.blindLevelTimeRemaining <= 0) {
        this.advanceBlindLevel(tournamentId)
      }
    }

    tournament.currentTime = new Date()
  }
}

// Export singleton instance
export const tournamentEngine = TournamentEngine.getInstance()
