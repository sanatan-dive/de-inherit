import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch vault by wallet address
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

    return NextResponse.json({ vault })
  } catch (error) {
    console.error('Error fetching vault:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new vault
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      walletAddress, 
      protectedDataAddress, 
      heirEmail, 
      thresholdDays,
      ghostModeEnabled,
      guardianAddresses,
      requiredApprovals,
      videoIpfsHash
    } = body

    if (!walletAddress || !protectedDataAddress || !heirEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if vault already exists
    const existingVault = await prisma.userVault.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    })

    if (existingVault) {
      return NextResponse.json(
        { error: 'Vault already exists for this wallet' },
        { status: 409 }
      )
    }

    // Create new vault with winning features
    const vault = await prisma.userVault.create({
      data: {
        walletAddress: walletAddress.toLowerCase(),
        protectedDataAddress,
        heirEmail,
        thresholdDays: thresholdDays || 30,
        ghostModeEnabled: ghostModeEnabled || false,
        guardianAddresses: guardianAddresses || [],
        requiredApprovals: requiredApprovals || 0,
        videoIpfsHash: videoIpfsHash || null,
      },
    })

    return NextResponse.json({ vault }, { status: 201 })
  } catch (error) {
    console.error('Error creating vault:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a vault
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    await prisma.userVault.delete({
      where: { walletAddress: wallet.toLowerCase() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vault:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
