'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useRouter } from 'next/navigation'
import { 
  Lock, 
  Mail, 
  Clock, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Key,
  Ghost,
  Users,
  Video,
  Play,
  StopCircle,
  Upload
} from 'lucide-react'
import { useDataProtector } from '@/lib/dataprotector'

const steps = [
  { id: 1, title: 'Secret', icon: Lock },
  { id: 2, title: 'Heir', icon: Mail },
  { id: 3, title: 'Advanced', icon: Users },
  { id: 4, title: 'Timer', icon: Clock },
  { id: 5, title: 'Confirm', icon: Check },
]

const timerOptions = [
  { days: 7, label: '7 Days', desc: 'Weekly check-in' },
  { days: 14, label: '14 Days', desc: 'Bi-weekly' },
  { days: 30, label: '30 Days', desc: 'Monthly (Recommended)' },
  { days: 90, label: '90 Days', desc: 'Quarterly' },
  { days: 365, label: '1 Year', desc: 'Annual' },
]

export default function VaultPage() {
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()
  const router = useRouter()
  const { protectData } = useDataProtector()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [secretNote, setSecretNote] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [heirEmail, setHeirEmail] = useState('')
  const [heirName, setHeirName] = useState('')
  const [thresholdDays, setThresholdDays] = useState(30)
  
  // New features
  const [ghostModeEnabled, setGhostModeEnabled] = useState(false)
  const [guardianAddresses, setGuardianAddresses] = useState<string[]>([''])
  const [requiredApprovals, setRequiredApprovals] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return secretNote.trim().length > 0 || privateKey.trim().length > 0
      case 2:
        return heirEmail.trim().length > 0 && heirEmail.includes('@')
      case 3:
        return true // Advanced features are optional
      case 4:
        return thresholdDays > 0
      default:
        return true
    }
  }

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        setVideoBlob(blob)
        setRecordedChunks(chunks)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Camera access denied')
    }
  }

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const uploadVideo = async () => {
    if (!videoBlob) return null
    
    setUploadingVideo(true)
    try {
      const formData = new FormData()
      formData.append('video', videoBlob, 'last_words.webm')
      
      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setUploadingVideo(false)
      return data.ipfsHash
    } catch (err) {
      console.error('Video upload error:', err)
      setUploadingVideo(false)
      return null
    }
  }

  const handleSubmit = async () => {
    if (!address) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Upload video if recorded
      let videoIpfsHash = null
      if (videoBlob) {
        videoIpfsHash = await uploadVideo()
      }

      // 1. Protect data with iExec DataProtector
      const protectedData = await protectData({
        secretNote,
        privateKey: privateKey || undefined,
        heirEmail,
        videoIpfsHash: videoIpfsHash || undefined,
      })

      // Filter out empty guardian addresses
      const validGuardians = guardianAddresses.filter(addr => addr.trim().length > 0)

      // 2. Save to database
      const response = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          protectedDataAddress: protectedData.address,
          heirEmail,
          thresholdDays,
          ghostModeEnabled,
          guardianAddresses: validGuardians,
          requiredApprovals: validGuardians.length > 0 ? requiredApprovals : 0,
          videoIpfsHash,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save vault')
      }

      // 3. Redirect to dashboard
      router.push('/dashboard?created=true')
    } catch (err) {
      console.error('Error creating vault:', err)
      setError(err instanceof Error ? err.message : 'Failed to create vault')
    } finally {
      setIsSubmitting(false)
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
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
            <Lock className="w-10 h-10 text-zinc-400" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-4 text-zinc-100">
            Connect Wallet
          </h1>
          <p className="text-zinc-500 mb-8">
            Connect your wallet to create a secure vault.
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

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-max">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  step.id === currentStep 
                    ? 'text-white' 
                    : step.id < currentStep 
                      ? 'text-emerald-400' 
                      : 'text-zinc-600'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                    step.id === currentStep 
                      ? 'bg-white/10 border-white/30' 
                      : step.id < currentStep 
                        ? 'bg-emerald-500/20 border-emerald-500/30' 
                        : 'bg-white/5 border-white/10'
                  }`}>
                    {step.id < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-px mx-2 transition-colors ${
                    step.id < currentStep ? 'bg-emerald-500/50' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </motion.div>
        )}

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]"
        >
          {/* Step 1: Secret */}
          {currentStep === 1 && <SecretStep secretNote={secretNote} setSecretNote={setSecretNote} privateKey={privateKey} setPrivateKey={setPrivateKey} />}

          {/* Step 2: Heir */}
          {currentStep === 2 && <HeirStep heirName={heirName} setHeirName={setHeirName} heirEmail={heirEmail} setHeirEmail={setHeirEmail} />}

          {/* Step 3: Advanced Features */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-100 mb-2">
                  🏆 Winning Features
                </h2>
                <p className="text-zinc-500">
                  Optional advanced security and personalization features.
                </p>
              </div>

              {/* Ghost Mode */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Ghost className="w-5 h-5 text-violet-400" />
                    <div>
                      <h3 className="font-semibold text-white">Ghost Mode</h3>
                      <p className="text-xs text-zinc-500">Auto-detects on-chain activity</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGhostModeEnabled(!ghostModeEnabled)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      ghostModeEnabled 
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                        : 'bg-white/5 text-zinc-400 border border-white/10'
                    }`}
                  >
                    {ghostModeEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <p className="text-xs text-zinc-600">
                  Automatically resets your heartbeat timer when you make transactions on-chain.
                </p>
              </div>

              {/* Multi-Sig Guardians */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-semibold text-white">Guardian Approvals (Multi-Sig)</h3>
                    <p className="text-xs text-zinc-500">Require friends to vouch before release</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {guardianAddresses.map((addr, index) => (
                    <input
                      key={index}
                      type="text"
                      value={addr}
                      onChange={(e) => {
                        const newGuardians = [...guardianAddresses]
                        newGuardians[index] = e.target.value
                        setGuardianAddresses(newGuardians)
                      }}
                      placeholder={`Guardian ${index + 1} address (0x...)`}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-600 text-sm font-mono focus:outline-none focus:border-white/20"
                    />
                  ))}
                  <button
                    onClick={() => setGuardianAddresses([...guardianAddresses, ''])}
                    className="text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    + Add Guardian
                  </button>
                  {guardianAddresses.filter(a => a.trim()).length > 0 && (
                    <div className="mt-2">
                      <label className="text-xs text-zinc-500">Required Approvals:</label>
                      <input
                        type="number"
                        min={1}
                        max={guardianAddresses.filter(a => a.trim()).length}
                        value={requiredApprovals}
                        onChange={(e) => setRequiredApprovals(parseInt(e.target.value) || 1)}
                        className="ml-2 w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Video Last Words */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Video className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-white">Video Last Words</h3>
                    <p className="text-xs text-zinc-500">Leave a personal message</p>
                  </div>
                </div>
                
                {!videoBlob ? (
                  <div className="space-y-3">
                    <video ref={videoRef} autoPlay muted className="w-full rounded-lg bg-black" style={{ display: isRecording ? 'block' : 'none' }} />
                    <div className="flex gap-2">
                      {!isRecording ? (
                        <button
                          onClick={startVideoRecording}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium hover:bg-red-500/30"
                        >
                          <Play className="w-4 h-4" />
                          Record Message
                        </button>
                      ) : (
                        <button
                          onClick={stopVideoRecording}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-500/20 text-zinc-300 border border-zinc-500/30 text-sm font-medium hover:bg-zinc-500/30"
                        >
                          <StopCircle className="w-4 h-4" />
                          Stop Recording
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-emerald-300">Video recorded ({(videoBlob.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button
                      onClick={() => setVideoBlob(null)}
                      className="ml-auto text-xs text-zinc-400 hover:text-white"
                    >
                      Re-record
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Timer */}
          {currentStep === 4 && <TimerStep thresholdDays={thresholdDays} setThresholdDays={setThresholdDays} />}

          {/* Step 5: Confirm */}
          {currentStep === 5 && <ConfirmStep secretNote={secretNote} privateKey={privateKey} heirEmail={heirEmail} thresholdDays={thresholdDays} ghostModeEnabled={ghostModeEnabled} guardianAddresses={guardianAddresses} requiredApprovals={requiredApprovals} videoBlob={videoBlob} />}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || uploadingVideo}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-900 font-semibold text-sm disabled:opacity-50"
              >
                {isSubmitting || uploadingVideo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadingVideo ? 'Uploading...' : 'Encrypting...'}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Create Vault
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Step Components
function SecretStep({ secretNote, setSecretNote, privateKey, setPrivateKey }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-zinc-100 mb-2">Your Secret</h2>
        <p className="text-zinc-500">Enter the message or key you want to protect.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Secret Message</label>
          <textarea
            value={secretNote}
            onChange={(e) => setSecretNote(e.target.value)}
            placeholder="Your will, instructions, or message to your heir..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            <Key className="w-4 h-4 inline mr-2" />
            Private Key (Optional)
          </label>
          <input
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-600 font-mono focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
          />
          <p className="mt-2 text-xs text-zinc-600">
            Encrypted with TEE. No one can read it except your heir after release.
          </p>
        </div>
      </div>
    </div>
  )
}

function HeirStep({ heirName, setHeirName, heirEmail, setHeirEmail }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-zinc-100 mb-2">Your Heir</h2>
        <p className="text-zinc-500">Who should receive your secrets?</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Heir Name</label>
          <input
            type="text"
            value={heirName}
            onChange={(e) => setHeirName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Heir Email *</label>
          <input
            type="email"
            value={heirEmail}
            onChange={(e) => setHeirEmail(e.target.value)}
            placeholder="heir@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
          />
          <p className="mt-2 text-xs text-zinc-600">
            They'll receive an email with access instructions when vault releases.
          </p>
        </div>
      </div>
    </div>
  )
}

function TimerStep({ thresholdDays, setThresholdDays }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-zinc-100 mb-2">Heartbeat Timer</h2>
        <p className="text-zinc-500">How long before the vault releases if you go silent?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {timerOptions.map((option) => (
          <button
            key={option.days}
            onClick={() => setThresholdDays(option.days)}
            className={`p-4 rounded-xl border text-left transition-all ${
              thresholdDays === option.days
                ? 'bg-white/10 border-white/30 text-white'
                : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/5 hover:border-white/15'
            }`}
          >
            <div className="font-semibold">{option.label}</div>
            <div className="text-xs text-zinc-500">{option.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ConfirmStep({ secretNote, privateKey, heirEmail, thresholdDays, ghostModeEnabled, guardianAddresses, requiredApprovals, videoBlob }: any) {
  const validGuardians = guardianAddresses.filter((a: string) => a.trim().length > 0)
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-zinc-100 mb-2">Confirm Your Vault</h2>
        <p className="text-zinc-500">Review your settings before encrypting.</p>
      </div>
      <div className="space-y-4 p-4 rounded-xl bg-white/5">
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-zinc-500">Secret</span>
          <span className="text-zinc-300">
            {secretNote.length > 0 ? '•'.repeat(Math.min(secretNote.length, 10)) : 'Empty'}
            {privateKey && ' + Private Key'}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-zinc-500">Heir</span>
          <span className="text-zinc-300">{heirEmail}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-zinc-500">Timer</span>
          <span className="text-zinc-300">{thresholdDays} days</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-zinc-500">Ghost Mode</span>
          <span className="text-zinc-300">{ghostModeEnabled ? '✓ Enabled' : 'Disabled'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-zinc-500">Guardians</span>
          <span className="text-zinc-300">
            {validGuardians.length > 0 ? `${requiredApprovals}/${validGuardians.length} required` : 'None'}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-zinc-500">Video Message</span>
          <span className="text-zinc-300">{videoBlob ? '✓ Recorded' : 'None'}</span>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <p className="text-sm text-violet-300">
          Your data will be encrypted using iExec TEE technology. No one can read it until the vault releases.
        </p>
      </div>
    </div>
  )
}
