import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js'
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NFTDetail() {
  const router = useRouter()
  const { id } = router.query
  const [nft, setNft] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [canComment, setCanComment] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      fetchNFT()
      fetchMessages()
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `nft_id=eq.${id}`,
        },
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

  const connectWallet = async () => {
    const { solana } = window as any
    if (solana && solana.isPhantom) {
      try {
        const res = await solana.connect()
        setWalletAddress(res.publicKey.toString())
      } catch {
        alert('錢包連接失敗')
      }
    } else {
      alert('請安裝 Phantom 錢包')
    }
  }

  const fetchNFT = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()
    if (!error && data) {
      setNft(data)
      checkCommentAccess(data)
    }
  }

  const checkCommentAccess = async (nft: any) => {
    const solana = (window as any).solana
    const user = solana?.publicKey?.toBase58()
    if (!user) return
    if (user === nft.owner) {
      setCanComment(true)
      return
    }
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('nft_id', nft.id)
      .eq('buyer', user)
    if (!error && data.length > 0) setCanComment(true)
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('nft_id', id)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }
const handleSendMessage = async () => {
  if (!walletAddress || !newMessage.trim()) {
    alert('請先連接錢包並輸入留言')
    return
  }

  const nftId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null
  if (!nftId) {
    alert('❌ NFT ID 無效')
    return
  }

  const { error } = await supabase.from('messages').insert({
    nft_id: nftId,
    sender: walletAddress,
    content: newMessage,
  })

  if (error) {
    alert(`❌ 發送失敗：${error.message}`)
    console.error(error)
  } else {
    setNewMessage('')
  }
}

  const handleBuy = async () => {
    const solana = (window as any).solana
    if (!solana?.isPhantom) {
      alert('請安裝 Phantom 錢包')
      return
    }
    try {
      await solana.connect()
      const buyer = new PublicKey(solana.publicKey.toBase58())
      const seller = new PublicKey(nft.owner)
      const mint = new PublicKey(nft.mint_address)
      if (buyer.toBase58() === seller.toBase58()) return alert('❌ 不能購買自己上架的 NFT')

      const priceLamports = nft.price * LAMPORTS_PER_SOL
      const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed')

      const paymentTx = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: buyer, toPubkey: seller, lamports: priceLamports })
      )
      paymentTx.feePayer = buyer
      paymentTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      const signedPayment = await solana.signTransaction(paymentTx)
      const paymentSig = await connection.sendRawTransaction(signedPayment.serialize())
      await connection.confirmTransaction(paymentSig)

      const sellerToken = await getAssociatedTokenAddress(mint, seller)
      const buyerToken = await getAssociatedTokenAddress(mint, buyer)

      const nftTx = new Transaction().add(
        createTransferInstruction(sellerToken, buyerToken, seller, 1)
      )
      nftTx.feePayer = buyer
      nftTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      const signedNFT = await solana.signTransaction(nftTx)
      const nftSig = await connection.sendRawTransaction(signedNFT.serialize())
      await connection.confirmTransaction(nftSig)

      await supabase.from('orders').insert({
        nft_id: nft.id,
        buyer: buyer.toBase58(),
        seller: seller.toBase58(),
        price: nft.price,
        payment_sig: paymentSig,
        nft_sig: nftSig,
      })
      await supabase.from('sold_items').insert({
        name: nft.name,
        image_url: nft.image_url,
        mint_address: nft.mint_address,
        price: nft.price,
        seller: seller.toBase58(),
        buyer: buyer.toBase58(),
      })
      await supabase.from('listings').delete().eq('id', nft.id)
      alert(`✅ 成交成功！\n付款 tx: ${paymentSig}\nNFT tx: ${nftSig}`)
    } catch (err) {
      console.error(err)
      alert('交易失敗，請檢查鏈上與錢包狀態')
    }
  }

  if (!nft) return <p style={{ padding: 20 }}>載入中...</p>

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <h1>{nft.name}</h1>
      <img src={nft.image_url} alt={nft.name} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', marginBottom: 20 }} />
      <p><strong>描述：</strong>{nft.description}</p>
      <p><strong>價格：</strong>{nft.price} SOL</p>
      <p><strong>Mint Address：</strong>{nft.mint_address}</p>
      <p><strong>賣家地址：</strong>{nft.owner}</p>

      <button onClick={handleBuy} style={{ marginTop: 20, backgroundColor: '#6366f1', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
        立即購買（付款 + NFT 轉移 + 記錄）
      </button>

      <hr style={{ margin: '40px 0' }} />
      <h2>💬 NFT 聊天室</h2>

      <div style={{ maxHeight: 300, overflowY: 'auto', background: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        {messages.map((msg) => {
          const isMine = msg.sender === walletAddress
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              <div style={{ backgroundColor: isMine ? '#6366f1' : '#e5e7eb', color: isMine ? 'white' : '#111827', padding: '10px 14px', borderRadius: 16, maxWidth: '70%', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>{msg.sender.slice(0, 4)}...{msg.sender.slice(-4)}・{new Date(msg.created_at).toLocaleTimeString()}</div>
                <div>{msg.content}</div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="輸入訊息..."
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button onClick={handleSendMessage} style={{ padding: '10px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 6 }}>
          發送
        </button>
      </div>
    </main>
  )
}
