import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ListNFT() {
  const [form, setForm] = useState({
    name: '',
    image_url: '',
    mint_address: '',
    description: '',
    price: ''
  })
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!walletAddress) {
      alert('請先連接錢包')
      return
    }

    const { error } = await supabase.from('listings').insert({
      ...form,
      owner: walletAddress,
      price: parseFloat(form.price),
      created_at: new Date()
    })

    if (error) {
      alert('上架失敗')
      console.error(error)
    } else {
      alert('NFT 已成功上架！')
      setForm({ name: '', image_url: '', mint_address: '', description: '', price: '' })
    }
  }

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

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1>上架你的 NFT</h1>

      {!walletAddress && (
        <button onClick={connectWallet} style={{ marginBottom: 20 }}>
          連接 Phantom 錢包
        </button>
      )}

      <input name="name" placeholder="NFT 名稱" value={form.name} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <input name="image_url" placeholder="圖片網址" value={form.image_url} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <input name="mint_address" placeholder="Mint Address" value={form.mint_address} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <textarea name="description" placeholder="描述" value={form.description} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <input name="price" type="number" placeholder="價格 (SOL)" value={form.price} onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: 10 }} />

      <button onClick={handleSubmit}>確認上架</button>
    </main>
  )
}
