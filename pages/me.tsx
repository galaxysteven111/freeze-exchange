import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MyNFTs() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [nfts, setNfts] = useState<any[]>([])

  useEffect(() => {
    connectWallet()
  }, [])

  useEffect(() => {
    if (walletAddress) fetchMyListings()
  }, [walletAddress])

  const connectWallet = async () => {
    const { solana } = window as any
    if (solana && solana.isPhantom) {
      try {
        const res = await solana.connect()
        setWalletAddress(res.publicKey.toString())
      } catch (err) {
        alert('錢包連接失敗')
      }
    } else {
      alert('請安裝 Phantom 錢包')
    }
  }

  const fetchMyListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('owner', walletAddress)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('讀取失敗', error)
    } else {
      setNfts(data || [])
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h1>我的上架 NFT</h1>
      {walletAddress ? <p>已登入錢包：{walletAddress}</p> : <p>尚未連接錢包...</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 20 }}>
        {nfts.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ccc', padding: 10, width: 260 }}>
            <img
              src={item.image_url}
              alt={item.name}
              style={{ width: '100%', height: 180, objectFit: 'cover' }}
            />
            <h3>{item.name}</h3>
            <p>{item.price} SOL</p>
          </div>
        ))}
      </div>
    </main>
  )
}
