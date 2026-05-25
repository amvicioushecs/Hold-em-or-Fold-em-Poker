import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { startGame, endGame, leaveGame, recordHand, recordPlayerHand } from '@/lib/game'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const gameId = params.id

    if (action === 'start') {
      const game = await startGame(gameId)
      return NextResponse.json(game)
    } else if (action === 'end') {
      await endGame(gameId, data.winnerId, data.totalPot)
      return NextResponse.json({ success: true })
    } else if (action === 'leave') {
      await leaveGame(gameId)
      return NextResponse.json({ success: true })
    } else if (action === 'recordHand') {
      const hand = await recordHand(gameId, data.handData)
      return NextResponse.json(hand)
    } else if (action === 'recordPlayerHand') {
      const playerHand = await recordPlayerHand(data.handId, data.playerHandData)
      return NextResponse.json(playerHand)
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[v0] Game action API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
