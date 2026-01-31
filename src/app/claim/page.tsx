'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Gift, CheckCircle2, Loader2, Key } from 'lucide-react'
import Link from 'next/link'

// This page allows heirs to claim inheritance using email login (Account Abstraction via Privy)
// No wallet or crypto knowledge required!

export default function ClaimPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'verify' | 'claimed'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [claimedData, setClaimedData] = useState<{ 
    secretNote?: string; 
    privateKey?: string 
  } | null>(null)

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) return
    
    setIsLoading(true)
    // In production, this would call Privy's email verification
    // For demo, we simulate the flow
    setTimeout(() => {
      setStep('verify')
      setIsLoading(false)
    }, 1500)
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) return
    
    setIsLoading(true)
    // In production, this would verify with Privy and fetch decrypted data
    // For demo, we simulate success
    setTimeout(() => {
      setClaimedData({
        secretNote: 'This is the decrypted secret message from your loved one. In a real scenario, this would be the actual encrypted content released from the iExec TEE.',
        privateKey: '0x742d35Cc6634C0532925a3b844Bc9e7595f...',
      })
      setStep('claimed')
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-6">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Email Step */}
        {step === 'email' && (
          <div className="p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20 flex items-center justify-center">
              <Gift className="w-8 h-8 text-violet-400" />
            </div>
            
            <h1 className="font-display text-2xl font-bold text-center mb-2 text-zinc-100">
              Claim Your Inheritance
            </h1>
            <p className="text-zinc-500 text-center mb-8">
              Enter the email address where you received the notification.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
                  />
                </div>
              </div>

              <button
                onClick={handleSendCode}
                disabled={isLoading || !email.includes('@')}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </div>

            <p className="mt-6 text-xs text-zinc-600 text-center">
              No crypto wallet needed. We use Account Abstraction to make this easy.
            </p>
          </div>
        )}

        {/* Verify Step */}
        {step === 'verify' && (
          <div className="p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
              <Lock className="w-8 h-8 text-zinc-400" />
            </div>
            
            <h1 className="font-display text-2xl font-bold text-center mb-2 text-zinc-100">
              Enter Verification Code
            </h1>
            <p className="text-zinc-500 text-center mb-8">
              We sent a 6-digit code to <span className="text-zinc-300">{email}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-600 text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
                />
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isLoading || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-900 font-semibold text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Claim'
                )}
              </button>

              <button
                onClick={() => setStep('email')}
                className="w-full text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}

        {/* Claimed Step */}
        {step === 'claimed' && claimedData && (
          <div className="p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            
            <h1 className="font-display text-2xl font-bold text-center mb-2 text-zinc-100">
              Inheritance Claimed
            </h1>
            <p className="text-zinc-500 text-center mb-8">
              Here is what was left for you.
            </p>

            <div className="space-y-4">
              {claimedData.secretNote && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                    <Gift className="w-4 h-4" />
                    Secret Message
                  </div>
                  <p className="text-zinc-200 text-sm leading-relaxed">
                    {claimedData.secretNote}
                  </p>
                </div>
              )}

              {claimedData.privateKey && (
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <div className="flex items-center gap-2 text-sm text-violet-400 mb-2">
                    <Key className="w-4 h-4" />
                    Private Key
                  </div>
                  <p className="text-violet-200 text-sm font-mono break-all">
                    {claimedData.privateKey}
                  </p>
                  <p className="mt-2 text-xs text-violet-400/70">
                    ⚠️ Keep this secure. Do not share with anyone.
                  </p>
                </div>
              )}
            </div>

            <Link 
              href="/"
              className="block mt-6 text-center text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              Learn more about De-Inherit
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
