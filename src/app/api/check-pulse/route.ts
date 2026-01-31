import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Check if a wallet's vault is "dead" (inactive beyond threshold)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const vault = await prisma.userVault.findUnique({
      where: { walletAddress: wallet.toLowerCase() },
    })

    if (!vault) {
      return NextResponse.json(
        { error: 'Vault not found' },
        { status: 404 }
      )
    }

    // Calculate if the user is "dead"
    const now = new Date()
    const threshold = new Date(vault.lastHeartbeat)
    threshold.setDate(threshold.getDate() + vault.thresholdDays)
    
    const isDead = now > threshold
    const deadSince = isDead ? threshold.toISOString() : null

    return NextResponse.json({
      wallet: vault.walletAddress,
      isDead,
      deadSince,
      isReleased: vault.isReleased,
      lastHeartbeat: vault.lastHeartbeat.toISOString(),
      thresholdDays: vault.thresholdDays,
    })
  } catch (error) {
    console.error('Error checking pulse:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
