import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    connectWallet()
  }, [])

  useEffect(() => {
    if (walletAddress) fetchOrders()
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

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, listings(*)')
      .eq('buyer', walletAddress)
      .order('created_at', { ascending: false })

    if (!error) setOrders(data || [])
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
        <h1>🧾 我的購買紀錄</h1>
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
          {orders.map((order) => (
            <div key={order.id} style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8 }}>
              <h3>{order.listings?.name || 'NFT 名稱'}</h3>
              <p>價格：{order.price} SOL</p>
              <p>購買時間：{new Date(order.created_at).toLocaleString()}</p>
              <Link href={`/nft/${order.nft_id}`}>
                <button style={{
                  marginTop: 10,
                  padding: '6px 12px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4
                }}>
                  查看詳情
                </button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
