import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const navItems = [
  { label: '市集', href: '/market' },
  { label: '上架 NFT', href: '/list' },
  { label: '我的上架', href: '/mylistings' }, // ✅ 新增這一行
  { label: '我的訂單', href: '/orders' },
  { label: '我的銷售', href: '/sales' },
  { label: '成交歷史', href: '/history' },
]

export default function Navbar() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)

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

  const toggleDark = () => {
    const isDark = !darkMode
    setDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')

    if (isDark) {
      document.body.classList.add('dark')
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
      document.body.classList.remove('dark')
    }
  }

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
      {/* 左側導覽連結 */}
      <div style={{ display: 'flex', gap: 20 }}>
        {navItems.map((item) => (
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

      {/* 右側主題切換按鈕 */}
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
