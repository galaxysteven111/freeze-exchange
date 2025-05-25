import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navbar from '../../components/Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ✅ 替換為你的管理員地址
const ADMIN_WALLET = '72gKWbsA68HV1i451ihNAMqwVzud9cmUBtsdkoey1BoV'

export default function AdminListings() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [listings, setListings] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    connectWallet()
  }, [])

  useEffect(() => {
    if (walletAddress === ADMIN_WALLET) fetchListings()
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

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setListings(data || [])
  }

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('確定要強制下架這筆 NFT？')
    if (!confirm) return

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (error) {
      alert('❌ 刪除失敗')
    } else {
      alert('✅ 已強制下架')
      fetchListings()
    }
  }

  const filtered = listings.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!walletAddress) return <p style={{ padding: 20 }}>請先連接錢包...</p>
  if (walletAddress !== ADMIN_WALLET) return <p style={{ padding: 20 }}>你沒有管理權限</p>

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
        <h1>🛠 管理員 - 所有上架中的 NFT</h1>
        <input
          type="text"
          placeholder="搜尋 NFT 名稱..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            margin: '16px 0',
            padding: '8px 12px',
            width: '100%',
            maxWidth: 400
          }}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20
          }}
        >
          {filtered.map((item) => (
            <div key={item.id} className="card">
              <img
                src={item.image_url}
                alt={item.name}
                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 6 }}
              />
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p><strong>價格：</strong>{item.price} SOL</p>
              <p><strong>擁有者：</strong>{item.owner.slice(0, 4)}...{item.owner.slice(-4)}</p>
              <button
                onClick={() => handleDelete(item.id)}
                style={{
                  marginTop: 10,
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 4
                }}
              >
                ❌ 強制下架
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
