'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Shield, ArrowUpRight, Clock, Lock, Send, Eye, Heart } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-body text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.png"
          alt="Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        {/* Overlay gradient for text readability and to fade bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
      </div>

      {/* Lighting effect beams */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[100px] rounded-full mix-blend-overlay" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-overlay" />
      </div>



      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-48 px-6 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="max-w-5xl mx-auto text-center">
          {/* Social proof pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border border-black bg-zinc-800 relative overflow-hidden"
                >
                   {/* Placeholder avatars - typically images, using gradients here for abstraction matching reference */}
                   <div className={`w-full h-full bg-gradient-to-br ${
                     i === 1 ? 'from-orange-400 to-red-500' :
                     i === 2 ? 'from-blue-400 to-indigo-500' :
                     i === 3 ? 'from-emerald-400 to-cyan-500' : 'from-purple-400 to-pink-500'
                   }`} />
                </div>
              ))}
            </div>
            <span className="text-zinc-300 text-sm font-medium">
              Trusted by over <span className="text-white font-bold">1,000+</span> crypto users
            </span>
          </motion.div>

          {/* Headline - Big and Bold */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="text-6xl md:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-8"
          >
            Protect your wallet and <br />
            assets from <span className="text-zinc-400">the afterlife</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            No more worries about lost private keys. De-Inherit detects inactivity
            and securely transfers your digital legacy to your loved ones effortlessly.
          </motion.p>

          {/* CTA Button - Pill shaped, white glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {mounted && <CTAButton />}
          </motion.div>
        </div>
      </section>

      {/* Floating Dashboard Preview - Positioned to look like it's emerging from bottom light */}
      <section className="relative z-20 -mt-32 px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }}
          className="max-w-6xl mx-auto perspective-1000"
        >
          {/* Main Container Mockup */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#050505]/90 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5">
            
            {/* Glossy reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-10" />

            {/* Dashboard Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/50">
               <div className="flex items-center gap-4">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                   <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                 </div>
                 <div className="h-6 w-px bg-white/10 mx-2" />
                 <span className="text-zinc-500 text-xs font-mono">de-inherit-vault-v1.0</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-400">
                   0x7a3B...4f2E
                 </div>
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/10" />
               </div>
            </div>

            <div className="grid md:grid-cols-[240px,1fr] min-h-[500px]">
              {/* Sidebar */}
              <div className="border-r border-white/5 p-6 space-y-8 bg-black/20">
                 <div className="space-y-1">
                   {[
                     { label: 'Home', active: false },
                     { label: 'All files', active: false },
                     { label: 'Private files', active: false },
                     { label: 'De-Inherit Vault', active: true, badge: true },
                   ].map(item => (
                     <div key={item.label} className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between cursor-pointer transition-colors ${item.active ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                       {item.label}
                       {item.badge && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                     </div>
                   ))}
                 </div>

                 <div>
                   <h3 className="px-4 text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">Settings</h3>
                   <div className="space-y-1">
                     <div className="px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-300 text-sm cursor-pointer">Notifications</div>
                     <div className="px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-300 text-sm cursor-pointer">Security</div>
                   </div>
                 </div>
              </div>

              {/* Main Area */}
              <div className="p-8 bg-gradient-to-b from-transparent to-black/40">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">Mia de Silva</h2>
                    <p className="text-zinc-500 text-sm">Managing digital assets inheritance protocol</p>
                  </div>
                  <div className="flex gap-3">
                     <button className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-colors">+ Invite</button>
                     <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all">Upgrade</button>
                  </div>
                </div>

                {/* Main Card */}
                <div className="rounded-2xl bg-[#0F0F11] border border-white/5 p-6 mb-6">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex gap-6 text-sm">
                        <span className="text-white border-b-2 border-white pb-1">Security</span>
                        <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">Billing</span>
                        <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">Heirs</span>
                      </div>
                   </div>

                   {/* Progress Section */}
                   <div className="p-5 rounded-xl bg-[#1A1A1E] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-blue-500 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" strokeDasharray="90, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">Vault Security is 90%</h4>
                          <p className="text-zinc-500 text-xs mt-0.5">Please review your heir's email verification status.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button className="text-xs text-zinc-500 hover:text-white transition-colors">Dismiss</button>
                        <button className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-medium border border-blue-500/20 hover:bg-blue-600/30 transition-colors">Review security</button>
                      </div>
                   </div>

                   <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-8 mb-4">Basics</h3>
                   
                   <div className="flex items-center justify-between py-4 border-b border-white/5">
                     <div>
                       <div className="text-sm text-white font-medium mb-1">Password</div>
                       <div className="text-xs text-zinc-500">Set a password to protect your account</div>
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="flex gap-1">
                         {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />)}
                       </div>
                       <div className="flex items-center gap-1.5 text-emerald-500 text-xs">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                         Very secure
                       </div>
                       <button className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors ml-4">Edit</button>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer Minimal */}
      <footer className="relative z-10 py-12 border-t border-white/5 bg-black">
         <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2 opacity-50">
             <Shield className="w-5 h-5 text-white" />
             <span className="text-white font-semibold">De-Inherit</span>
           </div>
           <p className="text-zinc-600 text-sm">© 2026 De-Inherit Protocol. All rights reserved.</p>
         </div>
      </footer>
    </div>
  )
}



function CTAButton() {
  const { isConnected } = useAccount()
  const { open } = useAppKit()

  if (isConnected) {
    return (
      <Link
        href="/vault"
        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
      >
        Create Vault
        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
           <ArrowUpRight className="w-3 h-3 text-white" />
        </div>
      </Link>
    )
  }

  return (
    <button
      onClick={() => open()}
      className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
    >
      Get De-Inherit
      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
         <ArrowUpRight className="w-3 h-3 text-white" />
      </div>
    </button>
  )
}
