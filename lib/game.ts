import { supabase, createAdminClient } from './supabase'
import { getCurrentUser, getCurrentUserProfile, getPlayerProfile } from './auth'

// Create a new game
export async function createGame(gameData: {
  game_type: 'cash' | 'tournament' | 'sng'
  buy_in: number
  small_blind: number
  big_blind: number
  max_players: number
}) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const userProfile = await getCurrentUserProfile()
    if (!userProfile) throw new Error('User profile not found')

    const { data, error } = await supabase
      .from('games')
      .insert({
        ...gameData,
        created_by: userProfile.id,
        status: 'waiting',
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Create game error:', error)
    throw error
  }
}

// Get all available games
export async function getAvailableGames() {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        created_by: users!created_by (username, avatar_url),
        players: game_players (id, user_id)
      `)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[v0] Get available games error:', error)
    return []
  }
}

// Get game by ID
export async function getGameById(gameId: string) {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        created_by: users!created_by (username, avatar_url),
        players: game_players (
          *,
          user: users (username, avatar_url)
        )
      `)
      .eq('id', gameId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Get game error:', error)
    throw error
  }
}

// Join a game
export async function joinGame(gameId: string, buyInAmount: number) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const userProfile = await getCurrentUserProfile()
    if (!userProfile) throw new Error('User profile not found')

    const playerProfile = await getPlayerProfile(userProfile.id)
    if (!playerProfile) throw new Error('Player profile not found')

    // Add player to game
    const { data: playerData, error: playerError } = await supabase
      .from('game_players')
      .insert({
        game_id: gameId,
        player_id: playerProfile.id,
        user_id: userProfile.id,
        buy_in_amount: buyInAmount,
        current_chips: buyInAmount,
        position: 'unknown',
        is_active: true,
      })
      .select()
      .single()

    if (playerError) throw playerError

    // Update player profile chip stack
    const newChipStack = (playerProfile.chip_stack || 0) - buyInAmount
    await supabase
      .from('player_profiles')
      .update({ chip_stack: newChipStack })
      .eq('id', playerProfile.id)

    // Create transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: userProfile.id,
        transaction_type: 'buy_in',
        amount: buyInAmount,
        game_id: gameId,
        description: `Buy-in for game ${gameId}`,
      })

    return playerData
  } catch (error) {
    console.error('[v0] Join game error:', error)
    throw error
  }
}

// Leave a game
export async function leaveGame(gameId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const userProfile = await getCurrentUserProfile()
    if (!userProfile) throw new Error('User profile not found')

    const { error } = await supabase
      .from('game_players')
      .update({
        is_active: false,
        left_at: new Date().toISOString(),
      })
      .eq('game_id', gameId)
      .eq('user_id', userProfile.id)

    if (error) throw error
  } catch (error) {
    console.error('[v0] Leave game error:', error)
    throw error
  }
}

// Start a game (game creator only)
export async function startGame(gameId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const game = await getGameById(gameId)
    const userProfile = await getCurrentUserProfile()

    if (game.created_by !== userProfile?.id) {
      throw new Error('Only game creator can start the game')
    }

    const { data, error } = await supabase
      .from('games')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', gameId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Start game error:', error)
    throw error
  }
}

// End a game and process winnings
export async function endGame(gameId: string, winnerId: string, totalPot: number) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const game = await getGameById(gameId)
    const userProfile = await getCurrentUserProfile()

    if (game.created_by !== userProfile?.id) {
      throw new Error('Only game creator can end the game')
    }

    // Get winner info
    const { data: winnerUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', winnerId)
      .single()

    // Update game
    const { error: gameError } = await supabase
      .from('games')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        winner_id: winnerUser?.id,
        total_pot: totalPot,
      })
      .eq('id', gameId)

    if (gameError) throw gameError

    // Process winnings
    const { data: winnerProfile } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('user_id', winnerId)
      .single()

    if (winnerProfile) {
      await supabase
        .from('player_profiles')
        .update({
          chip_stack: (winnerProfile.chip_stack || 0) + totalPot,
          total_winnings: (winnerProfile.total_winnings || 0) + totalPot,
          games_won: (winnerProfile.games_won || 0) + 1,
        })
        .eq('id', winnerProfile.id)

      // Create transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: winnerId,
          transaction_type: 'winnings',
          amount: totalPot,
          game_id: gameId,
          description: `Winnings from game ${gameId}`,
        })
    }
  } catch (error) {
    console.error('[v0] End game error:', error)
    throw error
  }
}

// Record a hand
export async function recordHand(gameId: string, handData: {
  hand_number: number
  button_position: number
  small_blind_position: number
  big_blind_position: number
  community_cards: string[]
  pot_size: number
  winner_id?: string
}) {
  try {
    const { data, error } = await supabase
      .from('hands')
      .insert({
        game_id: gameId,
        ...handData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Record hand error:', error)
    throw error
  }
}

// Record player hand action
export async function recordPlayerHand(handId: string, playerHandData: {
  player_id: string
  user_id: string
  hole_cards: string[]
  position: string
  actions?: string
  final_hand_rank?: string
  won_hand: boolean
  hand_winnings: number
}) {
  try {
    const { data, error } = await supabase
      .from('player_hands')
      .insert({
        hand_id: handId,
        ...playerHandData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Record player hand error:', error)
    throw error
  }
}

// Get player stats
export async function getPlayerStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Get player stats error:', error)
    return null
  }
}

// Get player transaction history
export async function getPlayerTransactions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[v0] Get transactions error:', error)
    return []
  }
}
