// pages/chat/[id].tsx
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ChatRoom() {
  const router = useRouter()
  const { id } = router.query
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [nft, setNft] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const connectWallet = async () => {
      const { solana } = window as any
      if (solana?.isPhantom) {
        const res = await solana.connect()
        setWalletAddress(res.publicKey.toString())
      }
    }
    connectWallet()
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('nft_id', id)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
    }
    const fetchNFT = async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', id).single()
      if (data) setNft(data)
    }
    if (id) {
      fetchMessages()
      fetchNFT()
    }
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `nft_id=eq.${id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const nftId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null
    if (!walletAddress || !newMessage.trim() || !nftId) {
      alert('請先連接錢包並輸入留言')
      return
    }
    const { error } = await supabase.from('messages').insert({
      nft_id: nftId,
      sender: walletAddress,
      content: newMessage
    })
    if (!error) setNewMessage('')
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>📨 NFT Chat Room</h2>
      {nft && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
          <img src={nft.image_url} alt={nft.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
          <div>
            <h3 style={{ margin: 0 }}>{nft.name}</h3>
            <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{nft.description}</p>
          </div>
        </div>
      )}

      {!walletAddress && (
        <button
          onClick={async () => {
            const { solana } = window as any
            if (solana?.isPhantom) {
              const res = await solana.connect()
              setWalletAddress(res.publicKey.toString())
            } else {
              alert('請安裝 Phantom 錢包')
            }
          }}
          style={{
            marginBottom: 12,
            padding: '8px 16px',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          連接錢包以留言
        </button>
      )}

      <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: 10, height: 400, overflowY: 'auto', background: '#f9f9f9' }}>
        {messages.map((msg) => {
          const isMine = msg.sender === walletAddress
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              <div style={{ background: isMine ? '#4f46e5' : '#e5e7eb', color: isMine ? '#fff' : '#000', padding: '8px 12px', borderRadius: 16, maxWidth: '70%' }}>
                <div style={{ fontSize: 12, marginBottom: 4, opacity: 0.6 }}>{msg.sender.slice(0, 4)}...{msg.sender.slice(-4)}</div>
                <div>{msg.content}</div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', marginTop: 12, gap: 8 }}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="輸入訊息..."
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button onClick={handleSend} style={{ padding: '10px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 6 }}>
          發送
        </button>
      </div>
    </main>
  )
}
