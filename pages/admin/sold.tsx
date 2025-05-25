import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navbar from '../../components/Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_WALLET = 'YOUR_ADMIN_WALLET_ADDRESS' // ✅ 換成你的地址

export default function AdminSoldItems() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    connectWallet()
  }, [])

  useEffect(() => {
    if (walletAddress === ADMIN_WALLET) fetchSold()
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

  const fetchSold = async () => {
    const { data, error } = await supabase
      .from('sold_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setItems(data || [])
  }

  if (!walletAddress) return <p style={{ padding: 20 }}>請先連接錢包...</p>
  if (walletAddress !== ADMIN_WALLET) return <p style={{ padding: 20 }}>你沒有管理權限</p>

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
        <h1>📊 管理員 - 全站成交紀錄</h1>
        <p style={{ marginBottom: 16, color: 'gray' }}>顯示所有成功交易的 NFT</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="card">
              <img
                src={item.image_url}
                alt={item.name}
                style={{
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  borderRadius: 6
                }}
              />
              <h3>{item.name}</h3>
              <p><strong>價格：</strong>{item.price} SOL</p>
              <p><strong>賣家：</strong>{item.seller.slice(0, 4)}...{item.seller.slice(-4)}</p>
              <p><strong>買家：</strong>{item.buyer.slice(0, 4)}...{item.buyer.slice(-4)}</p>
              <p style={{ fontSize: 12, color: 'gray' }}>
                🕒 {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

