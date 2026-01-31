import { PrismaClient } from '@prisma/client'

declare global {
  // Allow global `prisma` to be typed
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Simple initialization for Prisma 6
function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient()
  }
  
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  
  return global.prisma
}

// Export a function that gets the client when needed
export const getPrisma = getPrismaClient

// For simpler imports, also export a lazy proxy
export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const client = getPrismaClient()
    return (client as unknown as Record<string, unknown>)[prop as string]
  }
})
