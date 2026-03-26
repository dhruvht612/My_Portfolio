import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const STARFIELD = [
  { t: 8, l: 12, s: 1, d: 0 }, { t: 15, l: 88, s: 2, d: 400 }, { t: 22, l: 25, s: 1, d: 800 }, { t: 6, l: 72, s: 1, d: 1200 },
  { t: 35, l: 8, s: 2, d: 200 }, { t: 42, l: 92, s: 1, d: 600 }, { t: 28, l: 55, s: 1, d: 1000 }, { t: 18, l: 42, s: 2, d: 1400 },
  { t: 55, l: 18, s: 1, d: 300 }, { t: 62, l: 78, s: 2, d: 700 }, { t: 48, l: 35, s: 1, d: 1100 }, { t: 72, l: 62, s: 1, d: 500 },
  { t: 12, l: 5, s: 1, d: 900 }, { t: 38, l: 65, s: 2, d: 1300 }, { t: 78, l: 22, s: 1, d: 350 }, { t: 85, l: 85, s: 2, d: 750 },
  { t: 5, l: 48, s: 1, d: 150 }, { t: 45, l: 95, s: 1, d: 550 }, { t: 58, l: 45, s: 2, d: 950 }, { t: 92, l: 38, s: 1, d: 250 },
  { t: 25, l: 78, s: 1, d: 650 }, { t: 68, l: 8, s: 2, d: 1050 }, { t: 82, l: 55, s: 1, d: 450 }, { t: 32, l: 28, s: 1, d: 850 },
]

const AetherFlowHero = () => {
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []
    const mouse = { x: null, y: null, radius: 200 }

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x
        this.y = y
        this.directionX = directionX
        this.directionY = directionY
        this.size = size
        this.color = color
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
      }

      update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          if (distance < mouse.radius + this.size) {
            const forceDirectionX = dx / distance
            const forceDirectionY = dy / distance
            const force = (mouse.radius - distance) / mouse.radius
            this.x -= forceDirectionX * force * 5
            this.y -= forceDirectionY * force * 5
          }
        }

        this.x += this.directionX
        this.y += this.directionY
        this.draw()
      }
    }

    const init = () => {
      particles = []
      const numberOfParticles = (canvas.height * canvas.width) / 9000
      for (let i = 0; i < numberOfParticles; i += 1) {
        const size = Math.random() * 2 + 1
        const x = Math.random() * (canvas.width - size * 4) + size * 2
        const y = Math.random() * (canvas.height - size * 4) + size * 2
        const directionX = Math.random() * 0.4 - 0.2
        const directionY = Math.random() * 0.4 - 0.2
        const color = 'rgba(125, 211, 252, 0.8)'
        particles.push(new Particle(x, y, directionX, directionY, size, color))
      }
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      init()
    }
    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    const connect = () => {
      for (let a = 0; a < particles.length; a += 1) {
        for (let b = a; b < particles.length; b += 1) {
          const distance =
            (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
            (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y)

          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            const opacityValue = 1 - distance / 20000
            const dxMouseA = particles[a].x - (mouse.x ?? 0)
            const dyMouseA = particles[a].y - (mouse.y ?? 0)
            const distanceMouseA = Math.sqrt(dxMouseA * dxMouseA + dyMouseA * dyMouseA)

            if (mouse.x && distanceMouseA < mouse.radius) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`
            } else {
              ctx.strokeStyle = `rgba(125, 211, 252, ${opacityValue})`
            }

            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      ctx.fillStyle = '#0a0e17'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      particles.forEach((particle) => particle.update())
      connect()
    }

    const handleMouseMove = (event) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }

    const handleMouseOut = () => {
      mouse.x = null
      mouse.y = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseout', handleMouseOut)
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseout', handleMouseOut)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2 + 0.5,
        duration: 0.8,
        ease: 'easeInOut',
      },
    }),
  }

  return (
    <section id="home" className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden" aria-label="Hero">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
        <div className="absolute top-[15%] left-[10%] w-[min(24rem,80vw)] h-[min(24rem,80vw)] rounded-full bg-[var(--color-blue)] opacity-[0.10] blur-[80px] animate-float-slow" />
        <div className="absolute top-[40%] right-[5%] w-[min(20rem,70vw)] h-[min(20rem,70vw)] rounded-full bg-[var(--color-accent)] opacity-[0.08] blur-[70px] animate-float-slower" />
        <div className="absolute bottom-[20%] left-[20%] w-[min(18rem,60vw)] h-[min(18rem,60vw)] rounded-full bg-[var(--color-orange)] opacity-[0.06] blur-[60px] animate-float-reverse" />
        {STARFIELD.map((star, i) => (
          <div
            key={i}
            className="hero-star animate-twinkle"
            style={{ top: `${star.t}%`, left: `${star.l}%`, width: star.s, height: star.s, animationDelay: `${star.d}ms` }}
          />
        ))}
        <div
          className="absolute top-[15%] left-0 w-24 h-0.5 rotate-[-45deg] animate-shooting-star opacity-0"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-accent) 40%, var(--color-accent) 60%, transparent)',
            boxShadow: '0 0 10px 2px var(--color-accent)',
          }}
        />
      </div>

      <div className="relative z-10 text-center p-6">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mb-6 backdrop-blur-sm"
        >
          <Zap className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">Computer Science Student · Full-Stack Developer</span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-[var(--color-text)] to-[var(--color-text-muted)]"
        >
          Dhruv Thakar
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto text-lg text-[var(--color-text-muted)] mb-10"
        >
          I build accessible, human-centered digital experiences across web, data, and AI. Explore my projects, leadership journey, and the technologies I use to bring ideas to life.
        </motion.p>

        <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
          <Link
            to="/projects"
            className="px-8 py-4 bg-[var(--color-orange)] text-white font-semibold rounded-lg shadow-lg hover:bg-[var(--color-orange-hover)] transition-colors duration-300 inline-flex items-center gap-2 mx-auto"
          >
            View My Projects
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default AetherFlowHero
