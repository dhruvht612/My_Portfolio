import React, { useRef } from 'react'

function HolographicCard({ children, className = '' }) {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / 14
    const rotateY = (centerX - x) / 14

    card.style.setProperty('--x', `${x}px`)
    card.style.setProperty('--y', `${y}px`)
    card.style.setProperty('--bg-x', `${(x / rect.width) * 100}%`)
    card.style.setProperty('--bg-y', `${(y / rect.height) * 100}%`)
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    const card = cardRef.current
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    card.style.setProperty('--x', '50%')
    card.style.setProperty('--y', '50%')
    card.style.setProperty('--bg-x', '50%')
    card.style.setProperty('--bg-y', '50%')
  }

  return (
    <div
      className={`component-card holographic-card ${className}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div className="holo-glow" />
    </div>
  )
}

export default HolographicCard

