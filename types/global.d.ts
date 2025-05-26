export {}

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: (options?: any) => Promise<{ publicKey: { toString(): string } }>
      publicKey?: {
        toBase58(): string
      }
      signTransaction?: any
      signAllTransactions?: any
    }
  }
}
