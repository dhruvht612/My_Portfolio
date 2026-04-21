import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { usePortfolio } from '../context/PortfolioContext'
import { useActiveSection } from '../hooks/useActiveSection'
import SkipLink from './SkipLink'
import Header from './Header'
import Footer from './Footer'
import ChatWidget from './ChatWidget'

export default function Layout() {
  const portfolio = usePortfolio()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState(portfolio.initialChatMessages)
  const [chatInput, setChatInput] = useState('')
  const scrollProgressRef = useRef(null)
  const chatMessagesRef = useRef(null)

  const pathname = location.pathname
  const pathSection = pathname.slice(1) || 'home'
  const activeSection = useActiveSection(pathSection)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [isDarkMode])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollableHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
          const scrolled = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0
          if (scrollProgressRef.current) scrollProgressRef.current.style.width = `${scrolled}%`
          setIsHeaderScrolled(window.scrollY > 50)
          ticking = false
        })
        ticking = true
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  const toggleTheme = () => setIsDarkMode((p) => !p)
  const toggleMenu = () => setIsMenuOpen((p) => !p)
  const closeMenu = () => setIsMenuOpen(false)
  const toggleChatWidget = () => setChatOpen((p) => !p)
  const handleChatInputChange = (e) => setChatInput(e.target.value)
  const handleChatSend = () => {
    if (!chatInput.trim()) return
    const newMessage = { id: Date.now(), from: 'user', text: chatInput.trim() }
    setChatMessages((prev) => [...prev, newMessage])
    setChatInput('')
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'bot', text: "Thanks for reaching out! I'll get back to you shortly 🤝" },
      ])
    }, 600)
  }

  useEffect(() => {
    if (chatMessagesRef.current) chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
  }, [chatMessages])

  return (
    <div className="min-h-screen text-[var(--color-text)]" style={{ position: 'relative', background: 'transparent' }}>
      <div style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <SkipLink />
        <Header
          navLinks={portfolio.navLinks}
          activeSection={activeSection}
          isHeaderScrolled={isHeaderScrolled}
          isMenuOpen={isMenuOpen}
          onToggleMenu={toggleMenu}
          onCloseMenu={closeMenu}
          scrollProgressRef={scrollProgressRef}
          fixed={true}
        />
        <main id="main-content" className="pt-[72px] relative z-10 min-h-screen">
          <Outlet />
        </main>
        <Footer navLinks={portfolio.navLinks} heroSocials={portfolio.heroSocials} footerBadges={portfolio.footerBadges} />
        <ChatWidget
          chatOpen={chatOpen}
          toggleChat={toggleChatWidget}
          chatMessages={chatMessages}
          chatInput={chatInput}
          onChatInputChange={handleChatInputChange}
          onChatSend={handleChatSend}
          chatMessagesRef={chatMessagesRef}
        />
      </div>
    </div>
  )
}
