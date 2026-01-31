import { NextRequest, NextResponse } from 'next/server'

// Upload video to IPFS using Pinata
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    // For hackathon demo, we'll simulate IPFS upload
    // In production, integrate with Pinata or web3.storage
    const pinataApiKey = process.env.PINATA_API_KEY
    const pinataSecretKey = process.env.PINATA_SECRET_KEY

    if (!pinataApiKey || !pinataSecretKey) {
      // Fallback: return mock hash for demo
      const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      
      return NextResponse.json({
        success: true,
        ipfsHash: mockHash,
        message: 'Demo mode: Mock IPFS hash generated. Configure PINATA_API_KEY for real uploads.',
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${mockHash}`
      })
    }

    // Real Pinata upload
    const data = new FormData()
    data.append('file', file)

    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey
      },
      body: data
    })

    const result = await pinataResponse.json()

    if (!pinataResponse.ok) {
      throw new Error(result.error || 'Pinata upload failed')
    }

    return NextResponse.json({
      success: true,
      ipfsHash: result.IpfsHash,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    })

  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}
