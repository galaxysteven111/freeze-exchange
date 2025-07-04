import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navbar from '../components/Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function History() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('sold_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setItems(data || [])
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
        <h1>📜 成交歷史紀錄</h1>
        <p style={{ marginBottom: 20, color: 'gray' }}>
          顯示平台上所有已完成的 NFT 交易
        </p>
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
              <h3 style={{ marginTop: 8 }}>{item.name}</h3>
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
