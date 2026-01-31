import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { vaultId, guardianAddress, approved } = await request.json()

    if (!vaultId || !guardianAddress) {
      return NextResponse.json(
        { error: 'Vault ID and guardian address required' },
        { status: 400 }
      )
    }

    // Create or update guardian approval
    const approval = await prisma.guardianApproval.upsert({
      where: {
        vaultId_guardianAddress: {
          vaultId,
          guardianAddress
        }
      },
      update: {
        approved: approved ?? true,
        approvedAt: new Date()
      },
      create: {
        vaultId,
        guardianAddress,
        approved: approved ?? true,
        approvedAt: new Date()
      }
    })

    // Get vault to check if threshold is met
    const vault = await prisma.userVault.findUnique({
      where: { id: vaultId }
    })

    if (!vault) {
      return NextResponse.json(
        { error: 'Vault not found' },
        { status: 404 }
      )
    }

    // Count approvals
    const approvalCount = await prisma.guardianApproval.count({
      where: {
        vaultId,
        approved: true
      }
    })

    const thresholdMet = approvalCount >= vault.requiredApprovals

    return NextResponse.json({
      success: true,
      approval,
      approvalCount,
      requiredApprovals: vault.requiredApprovals,
      thresholdMet
    })

  } catch (error) {
    console.error('Guardian approval error:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}

// Get approval status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const vaultId = url.searchParams.get('vaultId')

    if (!vaultId) {
      return NextResponse.json(
        { error: 'Vault ID required' },
        { status: 400 }
      )
    }

    const approvals = await prisma.guardianApproval.findMany({
      where: { vaultId }
    })

    const vault = await prisma.userVault.findUnique({
      where: { id: vaultId }
    })

    return NextResponse.json({
      approvals,
      requiredApprovals: vault?.requiredApprovals || 0,
      guardianAddresses: vault?.guardianAddresses || []
    })

  } catch (error) {
    console.error('Get approvals error:', error)
    return NextResponse.json(
      { error: 'Failed to get approvals' },
      { status: 500 }
    )
  }
}
