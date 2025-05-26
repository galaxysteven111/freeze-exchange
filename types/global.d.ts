export {}

declare global {
  interface PhantomProvider {
    isPhantom?: boolean
    connect: (options?: any) => Promise<{
      publicKey: {
        toBase58(): string
      }
    }>
    publicKey?: {
      toBase58(): string
    }
    signTransaction?: any
    signAllTransactions?: any
  }

  interface Window {
    solana?: PhantomProvider
  }
}
