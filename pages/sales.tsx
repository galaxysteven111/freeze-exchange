import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Navbar from '../components/Navbar' // ✅ 新增導覽列

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Sales() {
  const [sales, setSales] = useState<any[]>([])
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    connectWallet()
  }, [])

  useEffect(() => {
    if (walletAddress) fetchSales()
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

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, listings(*)')
      .eq('seller', walletAddress)
      .order('created_at', { ascending: false })

    if (!error) {
      setSales(data || [])
    }
  }

  return (
    <>
      <Navbar /> {/* ✅ 導覽列插入 */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
        <h1>📦 我的銷售紀錄</h1>
        {walletAddress ? (
          <p>錢包地址：{walletAddress}</p>
        ) : (
          <p>尚未連接錢包</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 20 }}>
          {sales.map((sale) => (
            <div key={sale.id} style={{ border: '1px solid #ccc', padding: 12, width: 280 }}>
              <h3>{sale.listings?.name || 'NFT 名稱'}</h3>
              <p>售價：{sale.price} SOL</p>
              <p>買家：{sale.buyer.slice(0, 4)}...{sale.buyer.slice(-4)}</p>
              <p>時間：{new Date(sale.created_at).toLocaleString()}</p>
              <Link href={`/nft/${sale.nft_id}`}>
                <button style={{ marginTop: 10, padding: '6px 12px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: 4 }}>
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
