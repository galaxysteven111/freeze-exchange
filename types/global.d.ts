export {}

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: (options?: any) => Promise<{
        publicKey: {
          toString(): string
          toBase58(): string
        }
      }>
      publicKey?: {
        toBase58(): string
      }
      signTransaction?: any
      signAllTransactions?: any
    }
  }
}
