import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getPlayerStats, getPlayerTransactions } from '@/lib/auth'
import { getPlayerStats as getGameStats, getPlayerTransactions as getGameTransactions } from '@/lib/game'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const stats = await getGameStats(userId)
    const transactions = await getGameTransactions(userId)

    return NextResponse.json({
      stats,
      transactions,
    })
  } catch (error) {
    console.error('[v0] Player profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
