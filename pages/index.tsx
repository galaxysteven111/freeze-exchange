import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    const connectWallet = async () => {
      const { solana } = window as any
      if (solana?.isPhantom) {
        try {
          const res = await solana.connect({ onlyIfTrusted: true })
          setWalletAddress(res.publicKey.toString())
        } catch {
          // 忽略錯誤
        }
      }
    }
    connectWallet()
  }, [])

  return (
    <>
      <Navbar />
      <main style={{ padding: 40 }}>
        <h1 style={{ fontSize: '28px', marginBottom: 20 }}>🧊 Freeze Exchange</h1>
        <p style={{ marginBottom: 20 }}>
          歡迎來到去中心化 NFT 二手交易平台！請使用上方導覽列進行市集瀏覽、上架、訂單管理。
        </p>
        {walletAddress ? (
          <p style={{ fontSize: 14, color: 'gray' }}>
            已連接錢包：{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </p>
        ) : (
          <p style={{ fontSize: 14, color: 'gray' }}>尚未連接 Phantom 錢包</p>
        )}
      </main>
    </>
  )
}
