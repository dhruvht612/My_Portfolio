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

/* Particle colours are read from CSS custom properties rather than hardcoded, so the
   field re-tints with the theme. They are "R, G, B" triplets; the draw loop composes
   its own alpha per node and link. Fallbacks match the original cyan network. */
const PARTICLE_VARS = {
  node: { prop: '--particle-node', fallback: '34, 211, 238' },
  front: { prop: '--particle-front', fallback: '103, 232, 249' },
  alpha: { prop: '--particle-alpha', fallback: '1' },
}

function readPalette() {
  if (typeof window === 'undefined') {
    return { node: PARTICLE_VARS.node.fallback, front: PARTICLE_VARS.front.fallback, alpha: 1 }
  }
  const styles = getComputedStyle(document.documentElement)
  const read = (entry) => styles.getPropertyValue(entry.prop).trim() || entry.fallback
  const alpha = Number.parseFloat(read(PARTICLE_VARS.alpha))
  return {
    node: read(PARTICLE_VARS.node),
    front: read(PARTICLE_VARS.front),
    alpha: Number.isFinite(alpha) ? alpha : 1,
  }
}
const LINK_DIST = 170
const GRAB_DIST = 160

/* Per-node cursor response: max px of push at depth 1, and the per-frame ease
   fraction used both on the way out and on the way back to rest. */
const PUSH_MAX = 6
const PUSH_EASE = 0.09

/* Scroll parallax: total px the field drifts across the ENTIRE page at depth 1,
   scaled down by depth so the far layer trails the near one. Deliberately tiny
   next to the page's own scroll distance — the background must always move less
   than the content in front of it. */
const SCROLL_DRIFT = 30
const SCROLL_EASE = 0.08

/* Off-screen wrap margin. Sized to swallow the pointer parallax (18px), the
   scroll drift and the cursor push so a wrapping node still crosses the edge out
   of sight instead of popping in inside the viewport. */
const WRAP = 24

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
      // draw-space scratch: eased cursor push, resolved draw position, and the
      // cached cursor distance (-1 = out of range) shared with the link pass.
      rx: 0,
      ry: 0,
      dx: 0,
      dy: 0,
      cd: -1,
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
    /* Re-read on theme change so the field re-tints with the toggle. Reading the
       computed value once per theme flip (not per frame) keeps the draw loop free of
       getComputedStyle, which forces style recalc. */
    let palette = readPalette()
    const pointer = { x: -1e4, y: -1e4, px: 0, py: 0 }
    // 0..1 page scroll. Written by the existing scroll handler, eased in the draw
    // loop — no second listener, no second rAF.
    let scrollTarget = 0
    let scrollEased = 0

    const readProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      return scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
    }

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
      const live = pointer.px >= -5000
      const ox = live ? (pointer.px / w - 0.5) * 18 : 0
      const oy = live ? (pointer.py / h - 0.5) * 18 : 0

      // Scroll component of the depth parallax. Frozen at 0 on the static
      // reduced-motion frame; bounded to SCROLL_DRIFT px over the whole page.
      if (animate) scrollEased += (scrollTarget - scrollEased) * SCROLL_EASE
      const sy = -scrollEased * SCROLL_DRIFT

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (animate) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < -WRAP) p.x = w + WRAP
          else if (p.x > w + WRAP) p.x = -WRAP
          if (p.y < -WRAP) p.y = h + WRAP
          else if (p.y > h + WRAP) p.y = -WRAP
        }

        // Every offset below lands in DRAW space only. p.x/p.y stay untouched, so
        // the wrap above keeps working exactly as before and the cursor can never
        // drag a node permanently out of the field.
        const bx = p.x + ox * p.depth
        const by = p.y + (oy + sy) * p.depth

        // Per-node cursor repulsion — O(n), one sqrt, reused by the grab line so
        // the frame cost is unchanged. Nodes lean a few px away from the cursor
        // and ease back to rest once it leaves.
        let tx = 0
        let ty = 0
        p.cd = -1
        if (live) {
          const cdx = bx - pointer.px
          const cdy = by - pointer.py
          const cd2 = cdx * cdx + cdy * cdy
          if (cd2 < GRAB_DIST * GRAB_DIST) {
            const cd = Math.sqrt(cd2)
            p.cd = cd
            if (animate && cd > 0.01) {
              // squared falloff so nodes drift in smoothly instead of stepping
              // at the GRAB_DIST boundary
              const falloff = 1 - cd / GRAB_DIST
              const push = (PUSH_MAX * falloff * falloff * p.depth) / cd
              tx = cdx * push
              ty = cdy * push
            }
          }
        }
        if (animate) {
          p.rx += (tx - p.rx) * PUSH_EASE
          p.ry += (ty - p.ry) * PUSH_EASE
        } else {
          p.rx = 0
          p.ry = 0
        }

        p.dx = bx + p.rx
        p.dy = by + p.ry
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
            ctx.strokeStyle = `rgba(${palette.node}, ${(0.22 * t * (a.depth + b.depth) * palette.alpha) / 2})`
            ctx.beginPath()
            ctx.moveTo(a.dx, a.dy)
            ctx.lineTo(b.dx, b.dy)
            ctx.stroke()
          }
        }
        // grab lines toward the cursor — distance already measured above
        if (a.cd >= 0) {
          const t = 1 - a.cd / GRAB_DIST
          ctx.strokeStyle = `rgba(${palette.front}, ${0.4 * t * palette.alpha})`
          ctx.beginPath()
          ctx.moveTo(a.dx, a.dy)
          ctx.lineTo(pointer.px, pointer.py)
          ctx.stroke()
        }
        ctx.fillStyle = `rgba(${a.depth > 0.75 ? palette.front : palette.node}, ${a.alpha * palette.alpha})`
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
      scrollTarget = readProgress()
      // Seed so a reload part-way down the page (or a resize) doesn't animate the
      // drift in from zero. Reduced motion keeps its single frame at neutral.
      scrollEased = reducedMq.matches ? 0 : scrollTarget
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
        const progress = readProgress()
        // unquantised for the canvas parallax (the draw loop eases it); the CSS
        // var below stays quantised so the fixed gradient layers repaint rarely
        scrollTarget = progress
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

    /* ThemeProvider flips data-theme on <html>; watch it so the canvas repaints in
       the new palette. Under reduced motion only one static frame is drawn, so the
       theme flip has to force that frame to be redrawn. */
    const themeObserver = new MutationObserver(() => {
      palette = readPalette()
      if (!running) restart()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

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
      themeObserver.disconnect()
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
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ backgroundColor: 'var(--particle-tint)' }}
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
