import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrumSepolia } from '@reown/appkit/networks'

// Get projectId from environment
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID

if (!projectId) {
  console.warn('Missing NEXT_PUBLIC_REOWN_PROJECT_ID - wallet connection will not work')
}

// Define the networks we support
export const networks = [arbitrumSepolia]

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: projectId || '',
  networks,
})

export const config = wagmiAdapter.wagmiConfig
