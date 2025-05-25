import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NFTDetail() {
  const router = useRouter()
  const { id } = router.query
  const [nft, setNft] = useState<any>(null)

  useEffect(() => {
    if (id) fetchNFT()
  }, [id])

  const fetchNFT = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('讀取失敗', error)
    } else {
      setNft(data)
    }
  }

  if (!nft) return <p style={{ padding: 20 }}>載入中...</p>

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <h1>{nft.name}</h1>
      <img
        src={nft.image_url}
        alt={nft.name}
        style={{ width: '100%', maxHeight: 400, objectFit: 'cover', marginBottom: 20 }}
      />
      <p><strong>描述：</strong>{nft.description}</p>
      <p><strong>價格：</strong>{nft.price} SOL</p>
      <p><strong>Mint Address：</strong>{nft.mint_address}</p>
      <p><strong>賣家地址：</strong>{nft.owner}</p>

      <button
        onClick={() => alert(`🛒 未來將付款 ${nft.price} SOL 購買：${nft.name}`)}
        style={{
          marginTop: 20,
          backgroundColor: '#6366f1',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        立即購買
      </button>
    </main>
  )
}
