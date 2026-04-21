import { useEffect } from 'react'

const NODE_COUNT = 80
const MAX_DIST = 150
const NODE_COLOR = '56, 189, 248'
const LINE_OPACITY_MAX = 0.25
const GLOW_COLOR = 'rgba(56, 189, 248, 0.15)'
const CANVAS_BASE = '#0a0f1e'
const HOVER_RADIUS = 240

function random(min, max) {
  return Math.random() * (max - min) + min
}

export function useParticleCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let viewportWidth = window.innerWidth
    let viewportHeight = window.innerHeight

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: random(0, viewportWidth),
      y: random(0, viewportHeight),
      vx: random(-0.3, 0.3),
      vy: random(-0.3, 0.3),
      baseVx: random(-0.3, 0.3),
      baseVy: random(-0.3, 0.3),
      radius: random(1.5, 3.5),
    }))
    const mouse = { x: null, y: null }

    let rafId

    const resize = () => {
      viewportWidth = window.innerWidth
      viewportHeight = window.innerHeight
      const dpr = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = Math.floor(viewportWidth * dpr)
      canvas.height = Math.floor(viewportHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const wrap = (node) => {
      if (node.x < 0) node.x = viewportWidth
      if (node.x > viewportWidth) node.x = 0
      if (node.y < 0) node.y = viewportHeight
      if (node.y > viewportHeight) node.y = 0
    }

    const draw = () => {
      ctx.fillStyle = CANVAS_BASE
      ctx.fillRect(0, 0, viewportWidth, viewportHeight)

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.hypot(dx, dy)
          if (dist <= MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * LINE_OPACITY_MAX
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${NODE_COLOR}, ${alpha})`
            ctx.lineWidth = 1
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      nodes.forEach((node) => {
        if (mouse.x !== null && mouse.y !== null) {
          const dx = node.x - mouse.x
          const dy = node.y - mouse.y
          const dist = Math.hypot(dx, dy) || 1
          if (dist < HOVER_RADIUS) {
            const strength = (1 - dist / HOVER_RADIUS) * 0.22
            node.vx += (dx / dist) * strength
            node.vy += (dy / dist) * strength
          }
        }

        // Ease back to base drift so interaction feels smooth.
        node.vx += (node.baseVx - node.vx) * 0.04
        node.vy += (node.baseVy - node.vy) * 0.04
        node.vx = Math.max(-1.1, Math.min(1.1, node.vx))
        node.vy = Math.max(-1.1, Math.min(1.1, node.vy))
        node.x += node.vx
        node.y += node.vy
        wrap(node)

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${NODE_COLOR}, 0.9)`
        ctx.shadowColor = GLOW_COLOR
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      })

      rafId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    const handlePointerMove = (event) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }
    const handlePointerLeave = () => {
      mouse.x = null
      mouse.y = null
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [canvasRef])
}

