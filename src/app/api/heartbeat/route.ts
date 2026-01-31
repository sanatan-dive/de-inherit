import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Update heartbeat for a wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const vault = await prisma.userVault.update({
      where: { walletAddress: walletAddress.toLowerCase() },
      data: { lastHeartbeat: new Date() },
    })

    return NextResponse.json({
      success: true,
      lastHeartbeat: vault.lastHeartbeat,
    })
  } catch (error) {
    console.error('Error updating heartbeat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
