import { useEffect, useState } from 'react'

function getBackgroundConfig() {
  return {
    particles: {
      number: { value: 110, density: { enable: true, value_area: 1300 } },
      color: { value: '#22d3ee' },
      shape: { type: 'circle' },
      opacity: {
        value: 0.22,
        random: true,
        anim: { enable: false },
      },
      size: {
        value: 3.2,
        random: true,
        anim: { enable: false },
      },
      line_linked: {
        enable: true,
        distance: 210,
        color: '#22d3ee',
        opacity: 0.12,
        width: 0.9,
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false,
      },
    },
    interactivity: {
      detect_on: 'window',
      events: {
        onhover: { enable: false, mode: 'grab' },
        onclick: { enable: false, mode: 'push' },
        resize: true,
      },
      modes: {
        grab: { distance: 150, line_linked: { opacity: 0.9 } },
        repulse: { distance: 85, duration: 0.35 },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: true,
  }
}

function getMidConfig() {
  return {
    particles: {
      number: { value: 150, density: { enable: true, value_area: 900 } },
      color: { value: '#22d3ee' },
      shape: { type: 'circle' },
      opacity: {
        value: 0.9,
        random: true,
        anim: { enable: false },
      },
      size: {
        value: 2,
        random: true,
        anim: { enable: false },
      },
      line_linked: {
        enable: true,
        distance: 185,
        color: '#22d3ee',
        opacity: 0.35,
        width: 1.2,
      },
      move: {
        enable: true,
        speed: 1.4,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false,
      },
    },
    interactivity: {
      detect_on: 'window',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true,
      },
      modes: {
        grab: { distance: 150, line_linked: { opacity: 0.9 } },
        repulse: { distance: 85, duration: 0.35 },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: true,
  }
}

function getForegroundConfig() {
  return {
    particles: {
      number: { value: 38, density: { enable: true, value_area: 1200 } },
      color: { value: '#67e8f9' },
      shape: { type: 'circle' },
      opacity: {
        value: 1,
        random: true,
        anim: { enable: false },
      },
      size: {
        value: 2.4,
        random: true,
        anim: { enable: false },
      },
      line_linked: {
        enable: true,
        distance: 165,
        color: '#67e8f9',
        opacity: 0.48,
        width: 1.4,
      },
      move: {
        enable: true,
        speed: 1.8,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false,
      },
    },
    interactivity: {
      detect_on: 'window',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true,
      },
      modes: {
        grab: { distance: 170, line_linked: { opacity: 1 } },
        repulse: { distance: 90, duration: 0.35 },
        push: { particles_nb: 2 },
      },
    },
    retina_detect: true,
  }
}

export default function ParticlesBackground() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setOffset({ x, y })
    }

    const handleMouseLeave = () => setOffset({ x: 0, y: 0 })

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0
      setScrollProgress(progress)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ids = ['particles-bg-back', 'particles-bg-mid', 'particles-bg-front']

    const cleanupParticles = () => {
      ids.forEach((id) => {
        const canvas = document.querySelector(`#${id} canvas`)
        if (canvas) canvas.remove()
      })
      if (window.pJSDom?.length) {
        window.pJSDom.forEach((entry) => entry.pJS.fn.vendors.destroypJS())
        window.pJSDom = []
      }
    }

    const init = () => {
      cleanupParticles()
      if (window.particlesJS) {
        window.particlesJS('particles-bg-back', getBackgroundConfig())
        window.particlesJS('particles-bg-mid', getMidConfig())
        window.particlesJS('particles-bg-front', getForegroundConfig())
      }
    }

    if (window.particlesJS) {
      init()
      return cleanupParticles
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js'
    script.async = true
    script.onload = init
    document.body.appendChild(script)

    return () => {
      cleanupParticles()
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-0 bg-[#0a0f1e] pointer-events-none"
      aria-hidden="true"
      style={{
        '--scroll-progress': scrollProgress,
      }}
    >
      <div className="bg-scroll-shift absolute inset-0" />
      <div className="bg-floating-elements absolute inset-0">
        <div className="floating-grid" />
        <div className="floating-circle floating-circle-1" />
        <div className="floating-circle floating-circle-2" />
        <div className="floating-circle floating-circle-3" />
        <div className="floating-blob floating-blob-1" />
        <div className="floating-blob floating-blob-2" />
      </div>
      <div className="bg-glass-reflection absolute inset-0" />
      <div
        id="particles-bg-back"
        className="absolute inset-0"
        style={{ transform: `translate3d(${offset.x * 0.3}px, ${offset.y * 0.3}px, 0)` }}
      />
      <div
        id="particles-bg-mid"
        className="absolute inset-0"
        style={{ transform: `translate3d(${offset.x * 0.6}px, ${offset.y * 0.6}px, 0)` }}
      />
      <div
        id="particles-bg-front"
        className="absolute inset-0"
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      />
    </div>
  )
}
