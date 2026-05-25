import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getCurrentUserProfile } from '@/lib/auth'
import { createGame, getAvailableGames, joinGame } from '@/lib/game'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await req.json()
    const { action } = data

    if (action === 'create') {
      const game = await createGame(data.gameData)
      return NextResponse.json(game)
    } else if (action === 'join') {
      const player = await joinGame(data.gameId, data.buyInAmount)
      return NextResponse.json(player)
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[v0] Games API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const games = await getAvailableGames()
    return NextResponse.json(games)
  } catch (error) {
    console.error('[v0] Games API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
