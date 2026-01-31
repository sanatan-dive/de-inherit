'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { arbitrumSepolia } from '@reown/appkit/networks'
import { WagmiProvider, type Config } from 'wagmi'
import { wagmiAdapter, projectId } from '@/config/wagmiConfig'

// Create a query client
const queryClient = new QueryClient()

// Metadata for the app
const metadata = {
  name: 'De-Inherit',
  description: 'Digital Legacy Platform - Secure your secrets for the afterlife',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://de-inherit.vercel.app',
  icons: ['/favicon.ico'],
}

// Track if AppKit has been initialized
let appKitInitialized = false

function initAppKit() {
  if (typeof window !== 'undefined' && projectId && !appKitInitialized) {
    createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      networks: [arbitrumSepolia],
      defaultNetwork: arbitrumSepolia,
      metadata,
      features: {
        analytics: true,
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-color-mix': '#8b5cf6',
        '--w3m-color-mix-strength': 20,
        '--w3m-accent': '#00ff9f',
        '--w3m-border-radius-master': '12px',
      },
    })
    appKitInitialized = true
  }
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initAppKit()
    setReady(true)
  }, [])

  if (!ready) {
    // Render minimal loading state during SSR and first paint
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
