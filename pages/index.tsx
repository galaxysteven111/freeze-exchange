import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    const connectWallet = async () => {
      const { solana } = window as any
      if (solana && solana.isPhantom) {
        try {
          const res = await solana.connect()
          setWalletAddress(res.publicKey.toString())
        } catch (err) {
          console.error('Phantom Wallet 連接失敗')
        }
      } else {
        alert('請先安裝 Phantom 錢包')
      }
    }
    connectWallet()
  }, [])

  return (
    <main style={{ padding: 20 }}>
      <h1>Freeze Exchange</h1>
      {walletAddress ? (
        <p>錢包地址：{walletAddress}</p>
      ) : (
        <p>尚未連接錢包</p>
      )}
    </main>
  )
}
