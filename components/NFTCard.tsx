import React from 'react'

interface NFTCardProps {
  image: string
  name: string
  price?: number
  onClick?: () => void
}

const NFTCard: React.FC<NFTCardProps> = ({ image, name, price, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: 200,
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        background: 'white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
      }}
    >
      <img
        src={image}
        alt={name}
        style={{ width: '100%', height: 200, objectFit: 'cover' }}
      />
      <div style={{ padding: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 'bold' }}>{name}</h3>
        {price !== undefined && (
          <p style={{ marginTop: 6, color: '#6b7280' }}>{price} SOL</p>
        )}
      </div>
    </div>
  )
}

export default NFTCard
