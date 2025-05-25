import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js'
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token'
import { Metaplex } from '@metaplex-foundation/js'

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
      await provider.connect()
      const buyer = provider.publicKey
      const seller = new PublicKey(nft.owner)
      const mintAddress = new PublicKey(nft.mint_address)
      const priceLamports = nft.price * LAMPORTS_PER_SOL

      const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed')

      // ✅ Step 1: Transfer SOL from buyer to seller
      const paymentTx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: buyer,
          toPubkey: seller,
          lamports: priceLamports,
        })
      )
      paymentTx.feePayer = buyer
      paymentTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

      const signedPayment = await provider.signTransaction(paymentTx)
      const paymentSig = await connection.sendRawTransaction(signedPayment.serialize())
      await connection.confirmTransaction(paymentSig)

      // ✅ Step 2: Transfer NFT from seller to buyer
      const metaplex = Metaplex.make(connection)
      const token = await getOrCreateAssociatedTokenAccount(connection, provider, mintAddress, seller)
      const buyerTokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider, mintAddress, buyer)

      const nftTransferTx = new Transaction().add(
        createTransferInstruction(
          token.address,
          buyerTokenAccount.address,
          seller,
          1
        )
      )
      nftTransferTx.feePayer = buyer
      nftTransferTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

      const signedNFTTx = await provider.signTransaction(nftTransferTx)
      const nftSig = await connection.sendRawTransaction(signedNFTTx.serialize())
      await connection.confirmTransaction(nftSig)

      // ✅ Step 3: 將訂單寫入 Supabase
      const { error } = await supabase.from('orders').insert({
        nft_id: nft.id,
        buyer: buyer.toBase58(),
        seller: seller.toBase58(),
        price: nft.price,
        payment_sig: paymentSig,
        nft_sig: nftSig,
      })

      if (error) {
        console.error('寫入訂單失敗', error)
        alert('NFT 轉移成功，但儲存訂單資料失敗')
      } else {
        alert(`✅ 成功完成交易！\n付款 tx: ${paymentSig}\nNFT 轉帳 tx: ${nftSig}`)
      }

    } catch (err) {
      console.error('❌ 發生錯誤：', err)
      alert('交易失敗，請檢查錢包與鏈上狀態')
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
        立即購買（付款 + NFT 轉移 + 記錄）
      </button>
    </main>
  )
}
