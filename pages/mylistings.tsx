import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MyListings() {
  const [listings, setListings] = useState<any[]>([])
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

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

    if (!error) setListings(data || [])
  }

  const handleRemove = async (id: string) => {
    const confirm = window.confirm('你確定要下架這個 NFT 嗎？')
    if (!confirm) return

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (error) {
      alert('❌ 下架失敗')
    } else {
      alert('✅ NFT 已下架')
      fetchMyListings() // 重新載入
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
        <h1>📋 我的上架 NFT</h1>
        {walletAddress ? (
          <p>錢包地址：{walletAddress}</p>
        ) : (
          <p>尚未連接錢包</p>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            marginTop: 20
          }}
        >
          {listings.map((item) => (
            <div key={item.id} className="card">
              <img
                src={item.image_url}
                alt={item.name}
                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 6 }}
              />
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p><strong>價格：</strong>{item.price} SOL</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <Link href={`/nft/${item.id}`}>
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4
                  }}>
                    查看詳情
                  </button>
                </Link>
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4
                  }}
                >
                  ❌ 下架
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
