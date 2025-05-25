import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Navbar() {
  const router = useRouter()

  const navItems = [
    { label: '市集', href: '/market' },
    { label: '上架 NFT', href: '/list' },
    { label: '我的訂單', href: '/orders' },
    { label: '我的銷售', href: '/sales' },
    { label: '成交歷史', href: '/history' },
  ]

  return (
    <nav style={{
      display: 'flex',
      gap: 20,
      padding: '12px 24px',
      backgroundColor: '#111827',
      color: 'white',
      justifyContent: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
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
    </nav>
  )
}
