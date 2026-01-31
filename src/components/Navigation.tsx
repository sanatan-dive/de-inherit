'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, ArrowUpRight, Menu, X, LogOut, User } from 'lucide-react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'

export function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Only use wallet hooks on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/vault', label: 'Create Vault' },
    { href: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b border-white/5 bg-black/20 backdrop-blur-sm transition-all duration-300">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
           <Shield className="w-6 h-6 text-white" fill="currentColor" />
           <span className="font-bold text-xl tracking-tight text-white">De-Inherit</span>
        </Link>
        
        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-zinc-400 text-sm font-medium">
          {navLinks.map((link) => {
             const isActive = pathname === link.href
             return (
               <Link 
                 key={link.href}
                 href={link.href} 
                 className={`transition-colors ${isActive ? 'text-white' : 'hover:text-white'}`}
               >
                 {link.label}
               </Link>
             )
          })}
        </div>

        {/* Wallet & Mobile Menu */}
        <div className="flex items-center gap-4">
          {mounted && <ConnectButton />}
          
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 border-b border-white/10 p-6 md:hidden flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-zinc-400 hover:text-white font-medium text-lg"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => open()}
          className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
        <button
          onClick={() => disconnect()}
          className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => open()}
      className="hidden md:flex px-6 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-white text-sm font-medium hover:bg-zinc-800 items-center gap-2 group transition-all"
    >
      Get Started
      <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center group-hover:bg-zinc-600 transition-colors">
        <ArrowUpRight className="w-3 h-3" />
      </div>
    </button>
  )
}
