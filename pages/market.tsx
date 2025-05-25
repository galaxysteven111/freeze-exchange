import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Market() {
  const [nfts, setNfts] = useState<any[]>([])

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('讀取失敗', error)
    } else {
      setNfts(data || [])
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h1>市集 | 所有上架的 NFT</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {nfts.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ccc', padding: 10, width: 280 }}>
            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p><strong>{item.price} SOL</strong></p>
            {/* 未來這裡可以加立即購買按鈕 */}
          </div>
        ))}
      </div>
    </main>
  )
}
