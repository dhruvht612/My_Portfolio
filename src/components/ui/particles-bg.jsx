import { useEffect } from 'react'

function getParticlesConfig() {
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

export default function ParticlesBackground() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const cleanupParticles = () => {
      const canvas = document.querySelector('#particles-js canvas')
      if (canvas) canvas.remove()
      if (window.pJSDom?.length) {
        window.pJSDom.forEach((entry) => entry.pJS.fn.vendors.destroypJS())
        window.pJSDom = []
      }
    }

    const init = () => {
      cleanupParticles()
      if (window.particlesJS) {
        window.particlesJS('particles-js', getParticlesConfig())
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

  return <div id="particles-js" className="fixed inset-0 z-0 bg-[#0a0f1e]" aria-hidden="true" />
}
