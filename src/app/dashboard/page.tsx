'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useSearchParams } from 'next/navigation'
import { 
  Shield, 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { HeartbeatButton } from '@/components/HeartbeatButton'

interface Vault {
  id: string
  protectedDataAddress: string
  lastHeartbeat: string
  thresholdDays: number
  isReleased: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()
  const searchParams = useSearchParams()
  const justCreated = searchParams.get('created') === 'true'

  const [vault, setVault] = useState<Vault | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [heartbeatLoading, setHeartbeatLoading] = useState(false)

  const fetchVault = useCallback(async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/vault?wallet=${address}`)
      if (response.ok) {
        const data = await response.json()
        setVault(data.vault)
      } else if (response.status === 404) {
        setVault(null)
      } else {
        throw new Error('Failed to fetch vault')
      }
    } catch (err) {
      console.error('Error fetching vault:', err)
      setError(err instanceof Error ? err.message : 'Failed to load vault')
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    if (isConnected && address) {
      fetchVault()
    } else {
      setLoading(false)
    }
  }, [isConnected, address, fetchVault])

  const handleHeartbeat = async () => {
    if (!address || !vault) return

    setHeartbeatLoading(true)
    try {
      const response = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      })

      if (!response.ok) {
        throw new Error('Failed to send heartbeat')
      }

      await fetchVault()
    } catch (err) {
      console.error('Error sending heartbeat:', err)
      setError(err instanceof Error ? err.message : 'Failed to send heartbeat')
    } finally {
      setHeartbeatLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20 flex items-center justify-center">
            <Shield className="w-10 h-10 text-violet-400" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-4 text-zinc-100">
            Connect Wallet
          </h1>
          <p className="text-zinc-500 mb-8">
            Connect your wallet to view your vault dashboard.
          </p>
          <button 
            onClick={() => open()} 
            className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold text-sm uppercase tracking-wider"
          >
            Connect Wallet
          </button>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          <p className="text-zinc-500">Loading your vault...</p>
        </div>
      </div>
    )
  }

  if (!vault) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
            <Shield className="w-10 h-10 text-zinc-400" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-4 text-zinc-100">
            No Vault Found
          </h1>
          <p className="text-zinc-500 mb-8">
            Create your first vault to secure your digital legacy.
          </p>
          <Link 
            href="/vault" 
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold text-sm uppercase tracking-wider"
          >
            <Plus className="w-5 h-5" />
            Create Your First Vault
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Success banner */}
        {justCreated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400">
              Vault created successfully! Your secrets are now encrypted.
            </span>
          </motion.div>
        )}

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-zinc-100 mb-1">
              Your Vault
            </h1>
            <p className="text-zinc-500">
              Monitor your vault status and stay alive
            </p>
          </div>
          <button 
            onClick={fetchVault}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-300 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Heartbeat Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] flex flex-col items-center"
          >
            <h2 className="font-display text-xl font-semibold mb-8 text-zinc-300">
              {vault.isReleased ? 'Vault Released' : 'Stay Alive'}
            </h2>
            <HeartbeatButton
              lastHeartbeat={new Date(vault.lastHeartbeat)}
              thresholdDays={vault.thresholdDays}
              onPulse={handleHeartbeat}
              isLoading={heartbeatLoading}
            />
          </motion.div>

          {/* Vault Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]"
          >
            <h2 className="font-display text-xl font-semibold mb-6 text-zinc-300">
              Vault Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-zinc-500">Status</span>
                <span className={`flex items-center gap-2 ${
                  vault.isReleased ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {vault.isReleased ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      Released
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Active
                    </>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-zinc-500">Threshold</span>
                <span className="flex items-center gap-2 text-zinc-300">
                  <Clock className="w-4 h-4 text-violet-400" />
                  {vault.thresholdDays} days
                </span>
              </div>

              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-zinc-500">Last Heartbeat</span>
                <span className="text-zinc-300">
                  {new Date(vault.lastHeartbeat).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-zinc-500">Created</span>
                <span className="text-zinc-300">
                  {new Date(vault.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="py-3">
                <span className="text-zinc-500 block mb-2">Protected Data</span>
                <a
                  href={`https://explorer.iex.ec/arbitrum-sepolia-testnet/dataset/${vault.protectedDataAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-mono text-violet-400 hover:text-violet-300 break-all transition-colors"
                >
                  {vault.protectedDataAddress.slice(0, 10)}...{vault.protectedDataAddress.slice(-8)}
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
