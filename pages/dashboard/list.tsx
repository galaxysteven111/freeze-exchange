import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { Metaplex, walletAdapterIdentity, bundlrStorage } from '@metaplex-foundation/js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ListNFT() {
  const wallet = useWallet()
  const [form, setForm] = useState({
    name: '',
    image_url: '',
    description: '',
    price: ''
  })

  const [mintAddress, setMintAddress] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert('請先連接錢包')
      return
    }

    const connection = new Connection(clusterApiUrl('devnet'))
    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet))
      .use(bundlrStorage())

    try {
      // 上傳 metadata（可改成上傳 IPFS）
      const { uri } = await metaplex.nfts().uploadMetadata({
        name: form.name,
        description: form.description,
        image: form.image_url, // 可以是網址或 base64 圖片
      })

      // 真正 mint NFT 到使用者錢包
      const { nft } = await metaplex.nfts().create({
        uri,
        name: form.name,
        sellerFeeBasisPoints: 0,
      })

      const mintAddress = nft.address.toBase58()
      setMintAddress(mintAddress)
      console.log('✅ NFT 已鑄造:', mintAddress)

      // 上傳到 Supabase
      const { error } = await supabase.from('listings').insert({
        name: form.name,
        image_url: form.image_url,
        description: form.description,
        price: parseFloat(form.price),
        mint_address: mintAddress,
        owner: wallet.publicKey.toBase58(),
        created_at: new Date(),
      })

      if (error) {
        alert(`❌ 上架失敗：${error.message}`)
        console.error(error)
      } else {
        alert('✅ NFT 已成功上架並鑄造到你的錢包')
        setForm({ name: '', image_url: '', description: '', price: '' })
      }
    } catch (err: any) {
      console.error('❌ Mint 失敗', err)
      alert('Mint NFT 發生錯誤，請稍後再試')
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
        <h1>上架你的 NFT</h1>

        {!wallet.connected && (
          <p style={{ marginBottom: 20 }}>請先在右上角連接 Phantom 錢包</p>
        )}

        <input name="name" placeholder="NFT 名稱" value={form.name} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: 10 }} />
        <input name="image_url" placeholder="圖片網址" value={form.image_url} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: 10 }} />
        <textarea name="description" placeholder="描述" value={form.description} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: 10 }} />
        <input name="price" type="number" placeholder="價格 (SOL)" value={form.price} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: 10 }} />

        <button
          onClick={handleSubmit}
          style={{ padding: '10px 16px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          上架並 Mint NFT
        </button>

        {mintAddress && (
          <p style={{ marginTop: 20 }}>
            🎉 成功！NFT Mint 地址為：<br />
            <code>{mintAddress}</code>
          </p>
        )}
      </main>
    </>
  )
}
