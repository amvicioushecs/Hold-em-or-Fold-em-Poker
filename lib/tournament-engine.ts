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

  // Default blind structure for tournaments
  static getDefaultBlindStructure(): BlindLevel[] {
    return [
      { level: 1, smallBlind: 25, bigBlind: 50, ante: 0, duration: 600 }, // 10 min
      { level: 2, smallBlind: 50, bigBlind: 100, ante: 0, duration: 600 },
      { level: 3, smallBlind: 75, bigBlind: 150, ante: 25, duration: 600 },
      { level: 4, smallBlind: 100, bigBlind: 200, ante: 25, duration: 600 },
      { level: 5, smallBlind: 150, bigBlind: 300, ante: 50, duration: 600 },
      { level: 6, smallBlind: 200, bigBlind: 400, ante: 50, duration: 600 },
      { level: 7, smallBlind: 300, bigBlind: 600, ante: 75, duration: 600 },
      { level: 8, smallBlind: 400, bigBlind: 800, ante: 100, duration: 600 },
      { level: 9, smallBlind: 600, bigBlind: 1200, ante: 150, duration: 600 },
      { level: 10, smallBlind: 800, bigBlind: 1600, ante: 200, duration: 600 },
      { level: 11, smallBlind: 1000, bigBlind: 2000, ante: 300, duration: 600 },
      { level: 12, smallBlind: 1500, bigBlind: 3000, ante: 400, duration: 600 },
      { level: 13, smallBlind: 2000, bigBlind: 4000, ante: 500, duration: 600 },
      { level: 14, smallBlind: 3000, bigBlind: 6000, ante: 1000, duration: 600 },
      { level: 15, smallBlind: 5000, bigBlind: 10000, ante: 1000, duration: 600 },
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
    }

    tournament.registeredPlayers.push(player)
    tournament.totalPlayers++
    tournament.remainingPlayers++
    tournament.totalPrizePool += tournament.config.buyIn

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

    // Calculate number of tables needed
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

      // Update all active tables with new blinds
      tournament.tables.forEach((table) => {
        if (table.isActive && table.gameState) {
          // Update game state blinds
          // This will be implemented when we integrate with game state
        }
      })
    }
  }

  // Handle player elimination
  eliminatePlayer(tournamentId: string, playerId: string): void {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament) return

    // Find player and their table
    let eliminatedPlayer: TournamentPlayer | null = null
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
    } else if (tournament.remainingPlayers <= tournament.config.playersPerTable) {
      // Move to final table
      this.createFinalTable(tournament)
    }
  }

  // Balance tables when players are eliminated
  private balanceTables(tournament: TournamentState): void {
    const activeTables = tournament.tables.filter((t) => t.players.length > 0)

    if (activeTables.length <= 1) return

    // Find tables that need balancing
    const avgPlayers = tournament.remainingPlayers / activeTables.length
    const tablesToBalance = activeTables.filter((t) => Math.abs(t.players.length - avgPlayers) > 1)

    if (tablesToBalance.length === 0) return

    // Sort tables by player count
    activeTables.sort((a, b) => b.players.length - a.players.length)

    // Move players from full tables to empty tables
    while (activeTables[0].players.length - activeTables[activeTables.length - 1].players.length > 1) {
      const fromTable = activeTables[0]
      const toTable = activeTables[activeTables.length - 1]

      // Move a random player
      const playerToMove = fromTable.players[Math.floor(Math.random() * fromTable.players.length)]

      fromTable.players = fromTable.players.filter((p) => p.id !== playerToMove.id)
      playerToMove.tableId = toTable.id
      playerToMove.seatNumber = toTable.players.length + 1
      toTable.players.push(playerToMove)

      activeTables.sort((a, b) => b.players.length - a.players.length)
    }

    // Remove empty tables
    tournament.tables = tournament.tables.filter((t) => t.players.length > 0)
  }

  // Create final table
  private createFinalTable(tournament: TournamentState): void {
    tournament.phase = "final-table"

    // Combine all remaining players into one table
    const finalTable: TournamentTable = {
      id: "final-table",
      players: [],
      gameState: null,
      isActive: true,
    }

    tournament.tables.forEach((table) => {
      table.players.forEach((player, idx) => {
        player.tableId = finalTable.id
        player.seatNumber = finalTable.players.length + 1
        finalTable.players.push(player)
      })
    })

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

  // Update tournament timer
  updateTimer(tournamentId: string, deltaSeconds: number): void {
    const tournament = this.tournaments.get(tournamentId)
    if (!tournament || tournament.phase !== "running") return

    tournament.blindLevelTimeRemaining -= deltaSeconds

    if (tournament.blindLevelTimeRemaining <= 0) {
      this.advanceBlindLevel(tournamentId)
    }

    tournament.currentTime = new Date()
  }
}

// Export singleton instance
export const tournamentEngine = TournamentEngine.getInstance()
