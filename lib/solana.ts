import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token'

// 連線到 Solana mainnet-beta/devnet（請視環境選擇）
export const connection = new Connection('https://api.devnet.solana.com')

// ✅ 購買 NFT：從賣家轉給買家
export async function buyNFT({
  buyer,
  seller,
  mint,
  priceInSol,
}: {
  buyer: PublicKey
  seller: PublicKey
  mint: PublicKey
  priceInSol: number
}) {
  // 1. 建立 SOL 支付交易
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: buyer,
      toPubkey: seller,
      lamports: priceInSol * 1e9, // SOL to lamports
    })
  )

  // 2. 可在此加入轉 NFT 的邏輯，例如 SPL Token transfer
  // const buyerAta = await getAssociatedTokenAddress(mint, buyer)
  // const sellerAta = await getAssociatedTokenAddress(mint, seller)
  // transaction.add(createTransferInstruction(sellerAta, buyerAta, seller, 1))

  return transaction
}

// ✅ Mint NFT（可日後擴充）
export async function mintNFT({
  payer,
  metadataUrl,
}: {
  payer: Keypair
  metadataUrl: string
}) {
  // TODO: 使用 Metaplex 或 Candy Machine v3 建立 NFT
  console.log('🔨 正在準備 Mint NFT：', metadataUrl)
}
