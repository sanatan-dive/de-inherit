'use client'

import { IExecDataProtectorCore } from '@iexec/dataprotector'
import { useAccount, useWalletClient } from 'wagmi'

// iExec configuration for Arbitrum Sepolia
const IAPP_ADDRESS = process.env.NEXT_PUBLIC_IAPP_ADDRESS || '0x0000000000000000000000000000000000000000'

export interface ProtectDataParams {
  secretNote: string
  privateKey?: string
  heirEmail: string
  videoIpfsHash?: string
}

export interface ProtectedDataResult {
  address: string
  owner: string
  name: string
}

export function useDataProtector() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  const protectData = async (params: ProtectDataParams): Promise<ProtectedDataResult> => {
    if (!walletClient) {
      throw new Error('Wallet not connected')
    }

    // Create DataProtector Core instance with experimental networks enabled for Arbitrum Sepolia
    const dataProtectorCore = new IExecDataProtectorCore(walletClient, {
      allowExperimentalNetworks: true,
    })

    // Prepare the data to protect
    const dataToProtect = {
      secretNote: params.secretNote,
      ...(params.privateKey && { privateKey: params.privateKey }),
      heirEmail: params.heirEmail,
      ...(params.videoIpfsHash && { videoIpfsHash: params.videoIpfsHash }),
      createdAt: new Date().toISOString(),
    }

    // Protect the data
    const protectedData = await dataProtectorCore.protectData({
      data: dataToProtect,
      name: `De-Inherit Vault - ${new Date().toLocaleDateString()}`,
    })

    // If we have an iApp address, grant it access
    if (IAPP_ADDRESS && IAPP_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      await dataProtectorCore.grantAccess({
        protectedData: protectedData.address,
        authorizedApp: IAPP_ADDRESS,
        authorizedUser: '0x0000000000000000000000000000000000000000', // Any user (for the iApp to read)
      })
    }

    return {
      address: protectedData.address,
      owner: address || '',
      name: protectedData.name || 'De-Inherit Vault',
    }
  }

  return { protectData }
}
