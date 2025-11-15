import { useEffect, useMemo, useRef, useState } from 'react'
import { aboutTabs } from './data/about'
import { PROJECT_FILTERS, projects } from './data/projects'
import { certifications } from './data/certifications'
import { leadershipRoles } from './data/leadership'
import { skillGroups } from './data/skills'
import SkipLink from './components/SkipLink'
import Preloader from './components/Preloader'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Beyond from './components/Beyond'
import Education from './components/Education'
import CertificationsSection from './components/Certifications'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import './index.css'

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'contact', label: 'Contact' },
]

const typedRoles = [
  'Computer Science Student',
  'Full-Stack Developer',
  'Embedded Systems Enthusiast',
  'Community Builder',
]

const heroSocials = [
  {
    href: 'https://github.com/dhruvht612',
    label: "Visit Dhruv's GitHub profile (opens in new tab)",
    icon: 'fab fa-github',
    ring: 'focus:ring-[#22d3ee]',
    tooltip: 'GitHub',
  },
  {
    href: 'https://linkedin.com/in/dhruv-thakar-ba46aa296',
    label: "Visit Dhruv's LinkedIn profile (opens in new tab)",
    icon: 'fab fa-linkedin',
    ring: 'focus:ring-[#14b8a6]',
    tooltip: 'LinkedIn',
  },
  {
    href: 'mailto:thakardhruvh@gmail.com',
    label: 'Send email to thakardhruvh@gmail.com',
    icon: 'fas fa-envelope',
    ring: 'focus:ring-[#facc15]',
    tooltip: 'Email',
  },
  {
    href: 'https://www.instagram.com/dhruv_200612/?hl=en',
    label: "Visit Dhruv's Instagram profile (opens in new tab)",
    icon: 'fab fa-instagram',
    ring: 'focus:ring-[#ec4899]',
    tooltip: 'Instagram',
  },
]

const quickStats = [
  { value: '11+', label: 'Projects', accent: 'text-[#22d3ee]' },
  { value: '5+', label: 'Technologies', accent: 'text-[#14b8a6]' },
  { value: '2028', label: 'Graduation', accent: 'text-[#22d3ee]' },
]

const aboutCounters = [
  { target: 11, label: 'Projects Completed', accent: 'text-[#22d3ee]', suffix: '+' },
  { target: 6, label: 'Technologies Mastered', accent: 'text-[#14b8a6]', suffix: '+' },
  { target: 3, label: 'Years of Experience', accent: 'text-purple-400', suffix: '' },
  { target: 5, label: 'Leadership Roles', accent: 'text-yellow-400', suffix: '+' },
]

const projectStats = [
  { value: '15+', label: 'Total Projects', gradient: 'from-[#14b8a6]/10 to-[#22d3ee]/10', accent: 'text-[#14b8a6]' },
  { value: '8+', label: 'Technologies', gradient: 'from-purple-500/10 to-pink-500/10', accent: 'text-purple-400' },
  { value: '100%', label: 'Open Source', gradient: 'from-yellow-500/10 to-orange-500/10', accent: 'text-yellow-400' },
  { value: '2025', label: 'Latest Update', gradient: 'from-blue-500/10 to-cyan-500/10', accent: 'text-blue-400' },
]

const beyondStats = [
  { value: '5+', label: 'Leadership Roles', accent: 'text-red-400', gradient: 'from-red-500/10 to-orange-500/10' },
  { value: '500+', label: 'Students Reached', accent: 'text-teal-400', gradient: 'from-teal-500/10 to-cyan-500/10' },
  { value: '10+', label: 'Events Organized', accent: 'text-purple-400', gradient: 'from-purple-500/10 to-pink-500/10' },
  { value: '100%', label: 'Passion Driven', accent: 'text-yellow-400', gradient: 'from-yellow-500/10 to-orange-500/10' },
]

const goals = [
  {
    title: 'Short-Term Goals',
    badge: '2025-2026',
    icon: 'fas fa-rocket',
    accent: 'from-red-500/20 to-orange-500/20',
    bullets: [
      'Build and contribute to personal projects in web and app development',
      'Stay current with industry trends and emerging technologies',
      'Secure internship experience in software or research by 2026',
      'Continue developing skills in frameworks, design, and data handling',
    ],
    progressLabel: 'In Progress',
    progress: 45,
  },
  {
    title: 'Long-Term Goals',
    badge: '2026-2030',
    icon: 'fas fa-graduation-cap',
    accent: 'from-pink-500/20 to-purple-500/20',
    bullets: [
      'Contribute to innovative research and impactful real-world solutions',
      'Pursue advanced education or leadership roles in technology',
      'Mentor and inspire future computer scientists and developers',
      'Collaborate on projects that bridge technology and social impact',
    ],
    vision: 'Future Tech Leader',
  },
]

const contactCards = [
  {
    title: 'Email',
    value: 'thakardhruvh@gmail.com',
    icon: 'fas fa-envelope',
    href: 'mailto:thakardhruvh@gmail.com',
    accent: 'from-[#14b8a6]/20 to-[#22d3ee]/20',
  },
  {
    title: 'Location',
    value: 'Oshawa, Ontario, Canada',
    icon: 'fas fa-map-marker-alt',
    accent: 'from-[#22d3ee]/20 to-[#06b6d4]/20',
  },
  {
    title: 'Availability',
    value: 'Open to Opportunities',
    icon: 'fas fa-check-circle',
    accent: 'from-green-500/20 to-emerald-500/20',
  },
]

const altContactLinks = [
  {
    label: 'GitHub Profile',
    href: 'https://github.com/dhruvht612',
    icon: 'fab fa-github',
    hover: 'hover:bg-[#14b8a6] hover:border-[#14b8a6]',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/dhruv-thakar',
    icon: 'fab fa-linkedin',
    hover: 'hover:bg-[#0077b5] hover:border-[#0077b5]',
  },
  {
    label: 'Download Resume',
    href: 'https://drive.google.com/uc?export=download&id=1',
    icon: 'fas fa-download',
    hover: 'hover:bg-[#22d3ee] hover:border-[#22d3ee]',
  },
]

const footerBadges = [
  'https://img.shields.io/badge/HTML5-%23E34F26.svg?&style=flat&logo=html5&logoColor=white',
  'https://img.shields.io/badge/Tailwind-%2306B6D4.svg?&style=flat&logo=tailwind-css&logoColor=white',
  'https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?&style=flat&logo=javascript&logoColor=black',
]

const focusAreas = ['Software Development', 'Data Structures', 'Algorithms', 'OOP (C++, Python, Java)', 'Web Development', 'Statistics & Mathematics']

const educationHighlights = [
  {
    title: 'Core Coursework',
    icon: 'fas fa-book-open',
    accent: 'from-blue-500/20 to-blue-600/20',
    bullets: ['Data Structures & Algorithms', 'Object-Oriented Programming', 'Database Systems & Web Dev'],
  },
  {
    title: 'Hands-On Learning',
    icon: 'fas fa-laptop-code',
    accent: 'from-teal-500/20 to-teal-600/20',
    bullets: ['15+ course projects completed', 'Hackathon participation', 'Collaborative team projects'],
  },
  {
    title: 'Technical Growth',
    icon: 'fas fa-code',
    accent: 'from-purple-500/20 to-purple-600/20',
    bullets: ['8+ programming languages', 'Modern frameworks & tools', 'Version control & DevOps basics'],
  },
]

const initialChatMessages = [
  { id: 1, from: 'bot', text: 'Hey there! 👋 Ready to build something amazing together?' },
]

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const [projectFilter, setProjectFilter] = useState('all')
  const [aboutTab, setAboutTab] = useState('story')
  const [typedText, setTypedText] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState(initialChatMessages)
  const [chatInput, setChatInput] = useState('')

  const scrollProgressRef = useRef(null)
  const chatMessagesRef = useRef(null)
  const typedRoleRef = useRef(0)
  const typedCharRef = useRef(0)
  const typedDeletingRef = useRef(false)

  useEffect(() => {
    const handleLoad = () => setIsLoading(false)
    window.addEventListener('load', handleLoad)
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => {
      window.removeEventListener('load', handleLoad)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const currentRole = typedRoles[typedRoleRef.current]
      if (!typedDeletingRef.current) {
        typedCharRef.current += 1
        if (typedCharRef.current >= currentRole.length) {
          typedDeletingRef.current = true
        }
      } else {
        typedCharRef.current -= 1
        if (typedCharRef.current <= 0) {
          typedDeletingRef.current = false
          typedRoleRef.current = (typedRoleRef.current + 1) % typedRoles.length
        }
      }
      setTypedText(currentRole.slice(0, typedCharRef.current))
    }, 120)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollableHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
          const scrolled = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0
          if (scrollProgressRef.current) {
            scrollProgressRef.current.style.width = `${scrolled}%`
          }
          setIsHeaderScrolled(window.scrollY > 50)
          const sections = document.querySelectorAll('section[id]')
          let current = 'home'
          sections.forEach((section) => {
            const offset = section.offsetTop - 150
            if (window.scrollY >= offset) {
              current = section.getAttribute('id') ?? 'home'
            }
          })
          setActiveSection(current)
          ticking = false
        })
        ticking = true
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const counters = document.querySelectorAll('[data-count]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = Number(entry.target.getAttribute('data-count')) || 0
            const suffix = entry.target.getAttribute('data-suffix') ?? ''
            let current = 0
            const increment = Math.max(1, Math.ceil(target / 60))
            const updateCounter = () => {
              current += increment
              if (current >= target) {
                entry.target.textContent = `${target}${suffix}`
              } else {
                entry.target.textContent = `${current}${suffix}`
                requestAnimationFrame(updateCounter)
              }
            }
            updateCounter()
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 },
    )
    counters.forEach((counter) => observer.observe(counter))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const bars = document.querySelectorAll('.skill-progress')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const progress = entry.target.getAttribute('data-progress')
            entry.target.style.width = `${progress}%`
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.4 },
    )
    bars.forEach((bar) => {
      bar.style.width = '0%'
      observer.observe(bar)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const cards = document.querySelectorAll('.project-card')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 },
    )
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [projectFilter])

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatMessages])

  const filteredProjects = useMemo(() => {
    if (projectFilter === 'all') return projects
    return projects.filter((project) => project.categories?.map((cat) => cat.toLowerCase()).includes(projectFilter))
  }, [projectFilter])

  const toggleTheme = () => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
    }
    setIsDarkMode((prev) => !prev)
  }

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const handleFilterChange = (filter) => setProjectFilter(filter)

  const handleChatSend = () => {
    if (!chatInput.trim()) return
    const newMessage = { id: Date.now(), from: 'user', text: chatInput.trim() }
    setChatMessages((prev) => [...prev, newMessage])
    setChatInput('')
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: "Thanks for reaching out! I'll get back to you shortly 🤝",
        },
      ])
    }, 600)
  }

  const closeMenu = () => setIsMenuOpen(false)
  const toggleChatWidget = () => setChatOpen((prev) => !prev)
  const handleChatInputChange = (event) => setChatInput(event.target.value)

  return (
    <div className="bg-gray-900 text-gray-100">
      <SkipLink />
      {isLoading && <Preloader />}
      <div id="main-content" className={isLoading ? 'hidden' : 'block'}>
        <Header
          navLinks={navLinks}
          activeSection={activeSection}
          isHeaderScrolled={isHeaderScrolled}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          isMenuOpen={isMenuOpen}
          onToggleMenu={toggleMenu}
          onCloseMenu={closeMenu}
          scrollProgressRef={scrollProgressRef}
        />
        <main>
          <Hero typedText={typedText} heroSocials={heroSocials} quickStats={quickStats} />
          <About aboutTab={aboutTab} setAboutTab={setAboutTab} aboutTabs={aboutTabs} aboutCounters={aboutCounters} />
          <Projects
            projectStats={projectStats}
            filters={PROJECT_FILTERS}
            projectFilter={projectFilter}
            onFilterChange={handleFilterChange}
            projects={filteredProjects}
          />
          <Beyond beyondStats={beyondStats} goals={goals} leadershipRoles={leadershipRoles} />
          <Education focusAreas={focusAreas} highlightCards={educationHighlights} />
          <CertificationsSection certifications={certifications} />
          <Skills skillGroups={skillGroups} />
          <Contact contactCards={contactCards} heroSocials={heroSocials} altContactLinks={altContactLinks} />
        </main>
        <Footer navLinks={navLinks} heroSocials={heroSocials} footerBadges={footerBadges} />
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

export default App

