import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const ROLES = [
  'Computer Science Student',
  'Full-Stack Developer',
  'Community Builder',
  'Embedded Systems Enthusiast',
]

const BADGES = [
  { label: 'React', icon: 'fab fa-react' },
  { label: 'Python', icon: 'fab fa-python' },
  { label: 'Java', icon: 'fab fa-java' },
  { label: 'Node.js', icon: 'fab fa-node-js' },
  { label: 'AI / ML', icon: 'fas fa-brain' },
]

function useTypingEffect(strings, typingSpeed = 80, deletingSpeed = 40, pauseMs = 1800) {
  const [display, setDisplay] = useState('')
  const [roleIdx, setRoleIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = strings[roleIdx]
    let timeout

    if (!isDeleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), typingSpeed)
    } else if (!isDeleting && charIdx === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs)
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), deletingSpeed)
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false)
      setRoleIdx((i) => (i + 1) % strings.length)
    }

    setDisplay(current.slice(0, charIdx))
    return () => clearTimeout(timeout)
  }, [charIdx, isDeleting, roleIdx, strings, typingSpeed, deletingSpeed, pauseMs])

  return display
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function Landing() {
  const navigate = useNavigate()
  const typedText = useTypingEffect(ROLES)

  const handleEnter = (e) => {
    e?.preventDefault?.()
    navigate('/home')
  }

  return (
    <section
      id="landing"
      aria-label="Welcome"
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'transparent',
        color: '#f1f5f9',
        textAlign: 'center',
      }}
    >
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '44rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Decorative header */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <span
            style={{
              width: '3rem',
              height: '2px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, transparent, #7dd3fc)',
            }}
          />
          <i className="fas fa-rocket" style={{ fontSize: '1.25rem', color: '#7dd3fc' }} aria-hidden />
          <span
            style={{
              width: '3rem',
              height: '2px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #4169e1, transparent)',
            }}
          />
        </motion.div>
        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            color: '#7dd3fc',
          }}
        >
          Portfolio
        </motion.p>
        <motion.h1
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#f1f5f9',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Dhruv Thakar
        </motion.h1>

        {/* Typing subtitle */}
        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontSize: '1.125rem',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
            color: '#94a3b8',
            minHeight: '1.8em',
          }}
          aria-live="polite"
        >
          {typedText}
          <span
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1.15em',
              background: '#7dd3fc',
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
              animation: 'blink-cursor 0.75s step-end infinite',
            }}
            aria-hidden
          />
        </motion.p>

        {/* Tech badges */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {BADGES.map((badge, i) => (
            <motion.span
              key={badge.label}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.0 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '9999px',
                border: '1px solid rgba(125, 211, 252, 0.25)',
                background: 'rgba(125, 211, 252, 0.08)',
                color: '#7dd3fc',
                backdropFilter: 'blur(8px)',
              }}
            >
              <i className={badge.icon} style={{ fontSize: '0.7rem' }} aria-hidden />
              {badge.label}
            </motion.span>
          ))}
        </motion.div>

        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
          <button
            type="button"
            onClick={handleEnter}
            className="landing-cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0a0e17',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #7dd3fc 0%, #4169e1 100%)',
              boxShadow: '0 4px 20px rgba(125, 211, 252, 0.25)',
            }}
          >
            Enter Portfolio
            <i className="fas fa-arrow-right" style={{ marginLeft: '0.25rem' }} aria-hidden />
          </button>
        </motion.div>
      </div>
      <a
        href="/home"
        onClick={handleEnter}
        className="animate-fade-in-up"
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.75rem',
          color: '#94a3b8',
          zIndex: 10,
          textDecoration: 'none',
          animationDelay: '0.4s',
        }}
      >
        Skip to content
      </a>
    </section>
  )
}

export default Landing
