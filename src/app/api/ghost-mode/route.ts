import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple on-chain activity checker using public RPC
async function getLastTransactionTime(address: string): Promise<Date | null> {
  try {
    // Using Arbitrum Sepolia public RPC
    const response = await fetch('https://sepolia-rollup.arbitrum.io/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
        id: 1
      })
    })
    
    const data = await response.json()
    const blockTimestamp = parseInt(data.result.timestamp, 16)
    
    // Check if address has any activity by querying balance changes
    // For demo purposes, we'll use a simplified check
    // In production, you'd use Etherscan API or indexer
    const balanceResponse = await fetch('https://sepolia-rollup.arbitrum.io/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
        id: 2
      })
    })
    
    const balanceData = await balanceResponse.json()
    const txCount = parseInt(balanceData.result, 16)
    
    // If transaction count changed, consider it as activity
    // For hackathon demo, return current time if wallet has transactions
    if (txCount > 0) {
      return new Date(blockTimestamp * 1000)
    }
    
    return null
  } catch (error) {
    console.error('Error checking on-chain activity:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Find vault
    const vault = await prisma.userVault.findUnique({
      where: { walletAddress }
    })

    if (!vault) {
      return NextResponse.json(
        { error: 'Vault not found' },
        { status: 404 }
      )
    }

    if (!vault.ghostModeEnabled) {
      return NextResponse.json({
        message: 'Ghost mode not enabled',
        ghostModeEnabled: false
      })
    }

    // Check on-chain activity
    const lastActivity = await getLastTransactionTime(walletAddress)
    
    if (lastActivity && lastActivity > vault.lastHeartbeat) {
      // Update heartbeat automatically
      const updatedVault = await prisma.userVault.update({
        where: { walletAddress },
        data: {
          lastHeartbeat: new Date(),
          lastOnChainActivity: lastActivity
        }
      })

      return NextResponse.json({
        message: 'Heartbeat auto-updated via Ghost Mode',
        lastHeartbeat: updatedVault.lastHeartbeat,
        lastOnChainActivity: lastActivity,
        autoUpdated: true
      })
    }

    return NextResponse.json({
      message: 'No recent on-chain activity detected',
      lastHeartbeat: vault.lastHeartbeat,
      autoUpdated: false
    })

  } catch (error) {
    console.error('Ghost mode check error:', error)
    return NextResponse.json(
      { error: 'Failed to check ghost mode' },
      { status: 500 }
    )
  }
}
