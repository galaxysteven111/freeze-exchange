import Navbar from '../components/Navbar'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  })

  const sampleMessages = [
    { id: 1, sender: 'you', content: '嗨，這個 NFT 還在嗎？', timestamp: '10:01' },
    { id: 2, sender: 'other', content: '在的，價格可以談', timestamp: '10:03' },
    { id: 3, sender: 'you', content: '7 SOL 可以嗎？', timestamp: '10:04' },
    { id: 4, sender: 'other', content: '我設定是 8.88，但你買兩個我便宜點', timestamp: '10:06' },
  ]

  return (
    <>
      <Navbar />
      <main style={{ padding: 40, textAlign: 'center' }}>
        <Image
          src="/logo-freeze.svg"
          alt="Freeze Exchange Logo"
          width={120}
          height={120}
          style={{ marginBottom: 20 }}
        />
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 12 }}>
          🧊 Freeze Exchange
        </h1>
        <p style={{ marginBottom: 20, fontSize: 16, color: '#4B5563' }}>
          專為 Solana 設計的 NFT 二手交易平台
        </p>
        <p style={{ fontSize: 14, color: 'gray' }}>
          {walletAddress
            ? `已連接錢包：${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
            : '尚未連接 Phantom 錢包'}
        </p>

        {/* Chatbox 模擬 UI */}
        <div style={{ maxWidth: 500, margin: '40px auto 0', textAlign: 'left', border: '1px solid #ccc', borderRadius: 10, padding: 16, height: 300, overflowY: 'auto', background: '#f9f9f9' }}>
          {sampleMessages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'you' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div style={{
                backgroundColor: msg.sender === 'you' ? '#6366f1' : '#e5e7eb',
                color: msg.sender === 'you' ? 'white' : '#111827',
                padding: '10px 14px',
                borderRadius: 16,
                maxWidth: '70%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              }}>
                <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>{msg.sender === 'you' ? '你' : '賣家'}・{msg.timestamp}</div>
                <div style={{ wordBreak: 'break-word' }}>{msg.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
    </>
  )
}
