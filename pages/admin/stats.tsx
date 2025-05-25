import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navbar from '../../components/Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_WALLET = 'YOUR_ADMIN_WALLET_ADDRESS' // ✅ 請換成你的地址

export default function AdminStats() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [soldItems, setSoldItems] = useState<any[]>([])

  useEffect(() => {
    connectWallet()
  }, [])

  useEffect(() => {
    if (walletAddress === ADMIN_WALLET) fetchStats()
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

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('sold_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setSoldItems(data || [])
  }

  if (!walletAddress) return <p style={{ padding: 20 }}>請先連接錢包...</p>
  if (walletAddress !== ADMIN_WALLET) return <p style={{ padding: 20 }}>你沒有管理權限</p>

  const totalVolume = soldItems.reduce((sum, item) => sum + item.price, 0)
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = soldItems.filter(item => item.created_at.startsWith(today)).length

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <h1>📈 管理員 - 平台統計資料</h1>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginTop: 20
        }}>
          <div style={{ fontSize: 18 }}>🧾 總成交筆數：<strong>{soldItems.length}</strong></div>
          <div style={{ fontSize: 18 }}>💰 總交易額（SOL）：<strong>{totalVolume.toFixed(2)}</strong></div>
          <div style={{ fontSize: 18 }}>📆 今日成交筆數：<strong>{todayCount}</strong></div>
        </div>

        <hr style={{ margin: '30px 0' }} />

        <h3>📋 最近 5 筆交易</h3>
        <ul>
          {soldItems.slice(0, 5).map((item) => (
            <li key={item.id}>
              {item.name} – {item.price} SOL – {new Date(item.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
