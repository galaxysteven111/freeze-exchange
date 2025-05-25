import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'

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

  const handleBuy = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      alert('請安裝 Phantom 錢包')
      return
    }

    try {
      const provider = window.solana
      const connection = new Connection('https://api.mainnet-beta.solana.com')
      await provider.connect()

      const fromPubkey = provider.publicKey
      const toPubkey = new PublicKey(nft.owner)
      const lamports = nft.price * LAMPORTS_PER_SOL

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      )

      transaction.feePayer = fromPubkey
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

      const signed = await provider.signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(signature)

      alert('✅ 付款成功！交易簽名：' + signature)
      // 🚀 下一步：可寫入 Supabase 紀錄交易或轉移 NFT（Metaplex）
    } catch (err) {
      console.error('❌ 交易失敗：', err)
      alert('交易失敗，請查看 console')
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
        onClick={handleBuy}
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
        立即購買（Phantom 支付）
      </button>
    </main>
  )
}
