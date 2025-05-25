import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// ✅ 管理員錢包地址（請替換成你自己的）
const ADMIN_WALLET = '72gKWbsA68HV1i451ihNAMqwVzud9cmUBtsdkoey1BoV'

const navItems = [
  { label: '市集', href: '/market' },
  { label: '上架 NFT', href: '/list' },
  { label: '我的上架', href: '/mylistings' },
  { label: '我的訂單', href: '/orders' },
  { label: '我的銷售', href: '/sales' },
  { label: '成交歷史', href: '/history' },
]

export default function Navbar() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // ✅ 自動嘗試 Phantom 錢包連接（靜默）
  useEffect(() => {
    const connect = async () => {
      const { solana } = window as any
      if (solana?.isPhantom) {
        try {
          const res = await solana.connect({ onlyIfTrusted: true })
          setWalletAddress(res.publicKey.toString())
        } catch {
          // 忽略未授權
        }
      }
    }
    connect()
  }, [])

  // ✅ 初始載入主題
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.body.classList.add('dark')
      document.body.classList.remove('light')
      setDarkMode(true)
    } else {
      document.body.classList.add('light')
      document.body.classList.remove('dark')
      setDarkMode(false)
    }
  }, [])

  // ✅ 切換主題
  const toggleDark = () => {
    const isDark = !darkMode
    setDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    document.body.classList.toggle('dark', isDark)
    document.body.classList.toggle('light', !isDark)
  }

  // ✅ 管理員判斷：顯示管理選單
  const isAdmin = walletAddress === ADMIN_WALLET
  const finalNavItems = isAdmin
    ? [...navItems, { label: '🔧 管理', href: '/admin/listings' }]
    : navItems

  return (
    <nav style={{
      display: 'flex',
      gap: 20,
      padding: '12px 24px',
      backgroundColor: '#111827',
      color: 'white',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* 導覽列左側 */}
      <div style={{ display: 'flex', gap: 20 }}>
        {finalNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <span style={{
              color: router.pathname === item.href ? '#60a5fa' : 'white',
              fontWeight: router.pathname === item.href ? 'bold' : 'normal',
              cursor: 'pointer',
            }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* 右側：主題切換 */}
      <button
        onClick={toggleDark}
        style={{
          backgroundColor: 'transparent',
          color: 'white',
          border: '1px solid white',
          padding: '4px 10px',
          borderRadius: 6,
          cursor: 'pointer'
        }}
      >
        {darkMode ? '🌞 Light' : '🌙 Dark'}
      </button>
    </nav>
  )
}
