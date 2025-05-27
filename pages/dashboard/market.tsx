import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import NFTCard from '@/components/NFTCard'
import { buyNFT } from '@/lib/solana'
import { PublicKey } from '@solana/web3.js'

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

  const handleBuy = async (item: any) => {
    try {
      const { solana } = window as any
      if (!solana?.isPhantom) {
        alert('請安裝 Phantom 錢包')
        return
      }

      const resp = await solana.connect()
      const buyerPubKey = new PublicKey(resp.publicKey.toString())
      const sellerPubKey = new PublicKey(item.owner)
      const mintPubKey = new PublicKey(item.mint_address)

      const transaction = await buyNFT({
        buyer: buyerPubKey,
        seller: sellerPubKey,
        mint: mintPubKey,
        priceInSol: item.price,
      })

      const { signature } = await solana.signAndSendTransaction(transaction)
      console.log('✅ 交易成功，簽名：', signature)
      alert(`✅ 成功購買 ${item.name}，交易簽名：${signature}`)

    } catch (err) {
      console.error('❌ 購買失敗', err)
      alert('❌ 購買失敗，請稍後再試')
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
        <h1>市集 | 所有上架的 NFT</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {nfts.map((item) => (
            <div key={item.id}>
              <NFTCard
                image={item.image_url}
                name={item.name}
                price={item.price}
                onClick={() => handleBuy(item)}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                <Link href={`/chat/${item.id}`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    backgroundColor: '#e2e8f0',
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    💬 留言
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
