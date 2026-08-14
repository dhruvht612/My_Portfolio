import { useEffect, useRef } from 'react'

/**
 * Ambient particle network — single canvas, no external script.
 *
 * Replaces the previous 3× particles.js CDN instances (298 particles, three
 * RAF loops, unthrottled mousemove/scroll setState). Depth is simulated per
 * particle instead of per layer, so one draw pass keeps the same layered
 * cyan-network look at a fraction of the cost.
 *
 * Guards: skipped on small/coarse-pointer screens, one static frame under
 * prefers-reduced-motion, paused while the tab is hidden, DPR clamped.
 */

const NODE_COLOR = '34, 211, 238' // #22d3ee
const FRONT_COLOR = '103, 232, 249' // #67e8f9
const LINK_DIST = 170
const GRAB_DIST = 160

function createParticles(count, w, h) {
  const parts = new Array(count)
  for (let i = 0; i < count; i++) {
    // depth 0.3 (far, dim, slow) → 1.0 (near, bright, fast)
    const depth = 0.3 + Math.random() * 0.7
    parts[i] = {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.9 * depth,
      vy: (Math.random() - 0.5) * 0.9 * depth,
      r: 0.8 + Math.random() * 1.8 * depth,
      alpha: 0.16 + 0.55 * depth * Math.random(),
      depth,
    }
  }
  return parts
}

export default function ParticlesBackground() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return undefined

    const fine = window.matchMedia('(pointer: fine)')
    const wide = window.matchMedia('(min-width: 768px)')
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)')

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let w = 0
    let h = 0
    let dpr = 1
    let particles = []
    let raf = 0
    let running = false
    const pointer = { x: -1e4, y: -1e4, px: 0, py: 0 }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = wide.matches ? Math.min(90, Math.round((w * h) / 22000)) : 0
      particles = createParticles(count, w, h)
    }

    const drawFrame = (animate) => {
      ctx.clearRect(0, 0, w, h)
      // ease the parallax origin toward the pointer
      pointer.px += (pointer.x - pointer.px) * 0.06
      pointer.py += (pointer.y - pointer.py) * 0.06
      const ox = pointer.px >= -5000 ? (pointer.px / w - 0.5) * 18 : 0
      const oy = pointer.py >= -5000 ? (pointer.py / h - 0.5) * 18 : 0

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (animate) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < -10) p.x = w + 10
          else if (p.x > w + 10) p.x = -10
          if (p.y < -10) p.y = h + 10
          else if (p.y > h + 10) p.y = -10
        }
        p.dx = p.x + ox * p.depth
        p.dy = p.y + oy * p.depth
      }

      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.dx - b.dx
          const dy = a.dy - b.dy
          const d2 = dx * dx + dy * dy
          if (d2 < LINK_DIST * LINK_DIST) {
            const t = 1 - Math.sqrt(d2) / LINK_DIST
            ctx.strokeStyle = `rgba(${NODE_COLOR}, ${(0.22 * t * (a.depth + b.depth)) / 2})`
            ctx.beginPath()
            ctx.moveTo(a.dx, a.dy)
            ctx.lineTo(b.dx, b.dy)
            ctx.stroke()
          }
        }
        // grab lines toward the cursor
        const cdx = a.dx - pointer.px
        const cdy = a.dy - pointer.py
        const cd2 = cdx * cdx + cdy * cdy
        if (cd2 < GRAB_DIST * GRAB_DIST) {
          const t = 1 - Math.sqrt(cd2) / GRAB_DIST
          ctx.strokeStyle = `rgba(${FRONT_COLOR}, ${0.4 * t})`
          ctx.beginPath()
          ctx.moveTo(a.dx, a.dy)
          ctx.lineTo(pointer.px, pointer.py)
          ctx.stroke()
        }
        ctx.fillStyle = `rgba(${a.depth > 0.75 ? FRONT_COLOR : NODE_COLOR}, ${a.alpha})`
        ctx.beginPath()
        ctx.arc(a.dx, a.dy, a.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => {
      drawFrame(true)
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running || reducedMq.matches || document.hidden) return
      running = true
      raf = requestAnimationFrame(loop)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const restart = () => {
      stop()
      resize()
      if (reducedMq.matches) drawFrame(false)
      else start()
    }

    // scroll progress feeds the CSS decorative layers — rAF-gated ref write, no
    // state. Quantized so the fixed gradient layers repaint at most 50 times
    // over a full page scroll instead of every frame.
    let ticking = false
    let lastProgress = ''
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
        const q = (Math.round(progress * 50) / 50).toFixed(2)
        if (q !== lastProgress) {
          lastProgress = q
          root.style.setProperty('--scroll-progress', q)
        }
        ticking = false
      })
    }

    const onPointerMove = (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
    }
    const onPointerLeave = () => {
      pointer.x = -1e4
      pointer.y = -1e4
    }
    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    let resizeTick = false
    const onResize = () => {
      if (resizeTick) return
      resizeTick = true
      requestAnimationFrame(() => {
        restart()
        onScroll()
        resizeTick = false
      })
    }

    restart()
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    reducedMq.addEventListener('change', restart)
    wide.addEventListener('change', restart)
    if (fine.matches) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerleave', onPointerLeave)
    }

    return () => {
      stop()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      reducedMq.removeEventListener('change', restart)
      wide.removeEventListener('change', restart)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-0 bg-[#0a0f1e]/40 pointer-events-none"
      aria-hidden="true"
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
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
