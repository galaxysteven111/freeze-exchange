import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navbar from '../../components/Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_WALLET = 'YOUR_ADMIN_WALLET_ADDRESS' // ✅ 請換成你的地址

export default function AdminUsers() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [userList, setUserList] = useState<string[]>([])

  useEffect(() => {
    connectWallet()
  }, [])

  useEffect(() => {
    if (walletAddress === ADMIN_WALLET) fetchUsers()
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

  const fetchUsers = async () => {
    const buyers = await supabase.from('orders').select('buyer')
    const sellers = await supabase.from('orders').select('seller')
    const commenters = await supabase.from('messages').select('sender')

    const addresses = new Set<string>()

    buyers.data?.forEach((b) => b.buyer && addresses.add(b.buyer))
    sellers.data?.forEach((s) => s.seller && addresses.add(s.seller))
    commenters.data?.forEach((m) => m.sender && addresses.add(m.sender))

    setUserList(Array.from(addresses))
  }

  if (!walletAddress) return <p style={{ padding: 20 }}>請先連接錢包...</p>
  if (walletAddress !== ADMIN_WALLET) return <p style={{ padding: 20 }}>你沒有管理權限</p>

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <h1>👥 管理員 - 活躍錢包列表</h1>
        <p style={{ marginBottom: 20, color: 'gray' }}>
          此頁顯示所有曾經下單、上架或留言過的錢包地址
        </p>
        <ul style={{ lineHeight: '1.8' }}>
          {userList.map((addr, index) => (
            <li key={index}>
              {index + 1}. {addr}
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
