/* =====================================================================
   DT // AI SYSTEM — a live night city, rendered in WebGL.

   This is the ThreeUI Community "Kage" landing page engine (MIT,
   @designcodeio/threeui 1.2.0, lib-dist/assets/landing-pages/kage.html,
   sha256 c8e06b90397ac246baf0ab6f32f5f6b570acc6fe03c7009f711b579fb72d9f49),
   ported off its standalone document into a mountable module.
   ThreeUI: MIT License, Copyright (c) 2026 Meng To.

   What is Kage's, unchanged in substance:
     · the noise / canvas-texture toolkit and the procedural surfaces
     · the renderer setup, the half-float scene buffer and the bloom/grade
       post chain, the adaptive resolution governor
     · the camera rig: Catmull-Rom waypoints per [data-cam] section, damped
       scroll progress, aspect fit, pointer parallax, the opening dolly
     · the scroll ↔ chapter anchors, nav/rail wiring, hero exit, reveals,
       cursor, grain, preloader job queue, no-WebGL fallback
     · live card viewports blitted into the composite at their DOM rects
     · the 3-D wordmark, haze, rain, ripples and cursor wisps

   What changed:
     · the Kyoto temple world (hall, torii, lanterns, maples, moon, garden
       cut-outs, leaf fall, cloth plates) is replaced by a night megacity:
       an instanced skyline with procedural windows, the AI core tower,
       elevated highways with traffic, flying vehicles, holographic panels
       and a neural mesh linking the rooftops to the core
     · document globals are scoped to a root element, every listener /
       timer / GPU resource is tracked so the page can unmount cleanly
     · three.js r149 (the exact runtime Kage ships) is loaded on demand
   ===================================================================== */

/* served with an immutable cache header (vercel.json): rename the file on any
   three.js upgrade, or visitors keep the old build */
const THREE_SRC = '/kage/three.min.js'
let threeLoading = null
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE)
  if (!threeLoading) {
    threeLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = THREE_SRC
      s.async = true
      s.onload = () => (window.THREE ? resolve(window.THREE) : reject(new Error('three.js did not register')))
      s.onerror = () => { threeLoading = null; reject(new Error('three.js failed to load')) }
      document.head.appendChild(s)
    })
  }
  return threeLoading
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

export function mountKageCity(root) {
  /* ---------------------------------------------------------- lifecycle */
  let disposed = false
  const offs = []
  const timers = new Set()
  const on = (t, type, fn, o) => { t.addEventListener(type, fn, o); offs.push(() => t.removeEventListener(type, fn, o)) }
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!disposed) fn() }, ms); timers.add(id); return id }
  const observers = []
  let rafId = 0, cursorRaf = 0

  /* ------------------------------------------------------------ 0 · basics */
  const Q      = new URLSearchParams(location.search)
  const qs     = (k, d) => { const v = Q.get(k); return v === null ? d : v }
  const qn     = (k, d) => { const v = Q.get(k); return v === null ? d : parseFloat(v) }
  const mm     = q => !!(window.matchMedia && window.matchMedia(q).matches)
  const REDUCE = mm('(prefers-reduced-motion: reduce)')
  const COARSE = mm('(hover: none)')

  const clamp  = (v, a, b) => v < a ? a : (v > b ? b : v)
  const sat    = v => clamp(v, 0, 1)
  const lerp   = (a, b, t) => a + (b - a) * t
  const smooth = (e0, e1, x) => { const t = sat((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t) }
  const easeOut= t => 1 - Math.pow(1 - t, 3)
  const TAU    = Math.PI * 2
  /* frame-rate independent damping */
  const damp   = (cur, to, rate, dt) => lerp(cur, to, 1 - Math.exp(-rate * dt))

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0
      let t = Math.imul(a ^ a >>> 15, 1 | a)
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
      return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
  }
  /* classic 2-D gradient noise */
  function noise2D(seed) {
    const rnd = mulberry32(seed), p = new Uint8Array(256), perm = new Uint8Array(512)
    for (let i = 0; i < 256; i++) p[i] = i
    for (let i = 255; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, t = p[i]; p[i] = p[j]; p[j] = t }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
    const G = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10)
    return function (x, y) {
      const xi = Math.floor(x), yi = Math.floor(y)
      const X = xi & 255, Y = yi & 255, xf = x - xi, yf = y - yi
      const u = fade(xf), v = fade(yf)
      const g = (h, dx, dy) => { const q = G[h & 7]; return q[0] * dx + q[1] * dy }
      const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1]
      const ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1]
      return lerp(lerp(g(aa, xf, yf), g(ba, xf - 1, yf), u),
                  lerp(g(ab, xf, yf - 1), g(bb, xf - 1, yf - 1), u), v)
    }
  }
  function fbm(n, x, y, oct, lac, gain) {
    let a = .5, f = 1, s = 0, m = 0
    for (let i = 0; i < (oct || 4); i++) { s += a * n(x * f, y * f); m += a; a *= (gain || .5); f *= (lac || 2) }
    return s / m                                    /* −1 … 1 */
  }

  /* ------------------------------------------------------------ 1 · canvas */
  function cvs(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
  const hex = (r, g, b) => 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')'

  /* stacked, up-scaled value noise — 30× faster than a per-pixel fbm and
     indistinguishable once it is multiplied under a dark base colour */
  function fbmCanvas(W, H, seed, octaves, baseCells, contrast) {
    const out = cvs(W, H), o = out.getContext('2d')
    o.fillStyle = '#808080'; o.fillRect(0, 0, W, H)
    let cells = baseCells || 3, alpha = 1
    for (let i = 0; i < (octaves || 5); i++) {
      const n = cvs(cells, cells), nx = n.getContext('2d')
      const im = nx.createImageData(cells, cells), d = im.data, r = mulberry32(seed + i * 977)
      for (let k = 0; k < cells * cells; k++) {
        const v = 128 + (r() - .5) * 255 * (contrast || 1)
        d[k * 4] = d[k * 4 + 1] = d[k * 4 + 2] = clamp(v, 0, 255); d[k * 4 + 3] = 255
      }
      nx.putImageData(im, 0, 0)
      o.globalAlpha = alpha
      o.globalCompositeOperation = i === 0 ? 'source-over' : 'overlay'
      o.imageSmoothingEnabled = true; o.imageSmoothingQuality = 'high'
      o.drawImage(n, 0, 0, W, H)
      cells *= 2; alpha *= .62
    }
    o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'
    return out
  }

  /* height → tangent-space normal map (blur first, then Sobel) */
  function normalFromHeight(hc, strength) {
    const W = hc.width, H = hc.height
    const b = cvs(W, H), bx = b.getContext('2d')
    bx.filter = 'blur(1.1px)'; bx.drawImage(hc, 0, 0); bx.filter = 'none'
    const src = bx.getImageData(0, 0, W, H).data
    const out = cvs(W, H), ox = out.getContext('2d')
    const im = ox.createImageData(W, H), d = im.data
    const at = (x, y) => src[(((y + H) % H) * W + ((x + W) % W)) * 4] / 255
    const s = strength || 2.4
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const gx = (at(x + 1, y) - at(x - 1, y)) * s
      const gy = (at(x, y + 1) - at(x, y - 1)) * s
      const nx = -gx, ny = gy, nz = 1
      const il = 1 / Math.hypot(nx, ny, nz)
      const i = (y * W + x) * 4
      d[i]     = (nx * il * .5 + .5) * 255
      d[i + 1] = (ny * il * .5 + .5) * 255
      d[i + 2] = (nz * il * .5 + .5) * 255
      d[i + 3] = 255
    }
    ox.putImageData(im, 0, 0)
    return out
  }

  /* ------------------------------------------------------- 2 · surfaces */
  /* long, wet, board-formed concrete — Kage's sanctuary walls, which are
     exactly the parapet a brutalist tower top wants */
  function texWall() {
    const W = 1024, H = 1024
    const c = cvs(W, H), x = c.getContext('2d')
    x.fillStyle = '#10161a'; x.fillRect(0, 0, W, H)
    x.globalCompositeOperation = 'overlay'; x.globalAlpha = .82
    x.drawImage(fbmCanvas(W, H, 41, 6, 3, 1), 0, 0)
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'
    const rnd = mulberry32(7)
    for (let i = 1; i < 6; i++) {
      const y = (H / 6) * i
      x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, y - 1.5, W, 3)
      x.fillStyle = 'rgba(190,205,205,.05)'; x.fillRect(0, y + 2, W, 2)
    }
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
      const cx2 = (W / 4) * (j + .5) + (rnd() - .5) * 14, cy = (H / 6) * (i + .5)
      const g = x.createRadialGradient(cx2, cy, 1, cx2, cy, 11)
      g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(.7, 'rgba(0,0,0,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      x.fillStyle = g; x.beginPath(); x.arc(cx2, cy, 11, 0, TAU); x.fill()
    }
    for (let i = 0; i < 190; i++) {
      const sx = rnd() * W, w = .6 + rnd() * 3.4, top = rnd() * H * .5, len = H * (.4 + rnd() * .7)
      const g = x.createLinearGradient(0, top, 0, top + len)
      const dark = rnd() > .45
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(.25, dark ? 'rgba(0,0,0,.20)' : 'rgba(170,195,200,.045)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      x.fillStyle = g; x.fillRect(sx, top, w, len)
    }
    x.globalAlpha = .16; x.globalCompositeOperation = 'overlay'
    x.drawImage(fbmCanvas(512, 512, 91, 3, 128, 1.4), 0, 0, W, H)
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'
    const h = cvs(W, H), hx = h.getContext('2d')
    hx.fillStyle = '#808080'; hx.fillRect(0, 0, W, H)
    hx.globalAlpha = .5; hx.drawImage(fbmCanvas(W, H, 41, 5, 6, 1), 0, 0); hx.globalAlpha = 1
    for (let i = 1; i < 6; i++) { hx.fillStyle = '#2a2a2a'; hx.fillRect(0, (H / 6) * i - 2, W, 4) }
    return { map: c, normal: normalFromHeight(h, 2.0) }
  }

  /* wet slate paving — big slabs, tight joints, standing water. Kage's court;
     here it is the roof deck the walk begins on. */
  function texFloor() {
    const W = 1024, H = 1024
    const c = cvs(W, H), x = c.getContext('2d')
    const rnd = mulberry32(23)
    x.fillStyle = '#0a0f12'; x.fillRect(0, 0, W, H)
    const N = 4, S = W / N
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const t = .82 + rnd() * .36
      x.fillStyle = hex(12 * t, 17 * t, 20 * t)
      x.fillRect(i * S + 1.5, j * S + 1.5, S - 3, S - 3)
    }
    x.globalCompositeOperation = 'overlay'; x.globalAlpha = .55
    x.drawImage(fbmCanvas(W, H, 63, 6, 4, 1), 0, 0)
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'
    x.strokeStyle = 'rgba(0,0,0,.72)'; x.lineWidth = 3
    for (let i = 0; i <= N; i++) {
      x.beginPath(); x.moveTo(i * S, 0); x.lineTo(i * S, H); x.stroke()
      x.beginPath(); x.moveTo(0, i * S); x.lineTo(W, i * S); x.stroke()
    }
    const h = cvs(W, H), hx = h.getContext('2d')
    hx.fillStyle = '#8c8c8c'; hx.fillRect(0, 0, W, H)
    hx.globalAlpha = .35; hx.drawImage(fbmCanvas(W, H, 63, 5, 8, 1), 0, 0); hx.globalAlpha = 1
    hx.strokeStyle = '#303030'; hx.lineWidth = 5
    for (let i = 0; i <= N; i++) {
      hx.beginPath(); hx.moveTo(i * S, 0); hx.lineTo(i * S, H); hx.stroke()
      hx.beginPath(); hx.moveTo(0, i * S); hx.lineTo(W, i * S); hx.stroke()
    }
    const r = cvs(512, 512), rx = r.getContext('2d')
    rx.fillStyle = '#1c1c1c'; rx.fillRect(0, 0, 512, 512)
    rx.globalAlpha = .95; rx.globalCompositeOperation = 'lighten'
    rx.drawImage(fbmCanvas(512, 512, 77, 4, 3, 1.5), 0, 0)
    rx.globalAlpha = 1; rx.globalCompositeOperation = 'source-over'
    return { map: c, normal: normalFromHeight(h, 1.5), rough: r }
  }

  /* the night sky, wrapped as a dome. Black at altitude, the city's own light
     pushed up into the cloud deck along the horizon — electric blue across
     it and a low signal-red bloom where the core stands. The horizon row is
     the fog colour so the backdrop and the depth cue meet without a seam.
     u = .5 faces −z once the dome is turned (see buildShell). */
  function texSky() {
    const W = 1024, H = 512, c = cvs(W, H), x = c.getContext('2d')
    const g = x.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgb(2,4,9)');     g.addColorStop(.26, 'rgb(5,9,19)')
    g.addColorStop(.42, 'rgb(10,18,33)'); g.addColorStop(.5, 'rgb(15,26,44)')
    g.addColorStop(.56, 'rgb(11,19,32)'); g.addColorStop(1, 'rgb(4,7,12)')
    x.fillStyle = g; x.fillRect(0, 0, W, H)
    /* the cloud deck, lit from below */
    const cl = cvs(W, H / 2), cx = cl.getContext('2d')
    cx.drawImage(fbmCanvas(W, H / 2, 313, 6, 4, .9), 0, 0)
    x.globalAlpha = .30; x.globalCompositeOperation = 'overlay'
    x.drawImage(cl, 0, H * .06, W, H * .46)
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'
    const glow = (u, v, rx, ry, stops) => {
      x.save(); x.translate(W * u, H * v); x.scale(1, ry / rx)
      const rg = x.createRadialGradient(0, 0, 2, 0, 0, W * rx)
      stops.forEach(s => rg.addColorStop(s[0], s[1]))
      x.fillStyle = rg; x.fillRect(-W, -W, W * 2, W * 2); x.restore()
    }
    glow(.5, .5, .62, .10, [[0, 'rgba(70,128,255,.34)'], [.45, 'rgba(40,82,190,.12)'], [1, 'rgba(0,0,0,0)']])
    glow(.53, .5, .16, .06, [[0, 'rgba(224,35,28,.20)'], [.6, 'rgba(150,20,20,.05)'], [1, 'rgba(0,0,0,0)']])
    glow(.18, .5, .22, .05, [[0, 'rgba(60,110,230,.14)'], [1, 'rgba(0,0,0,0)']])
    glow(.84, .5, .22, .05, [[0, 'rgba(60,110,230,.12)'], [1, 'rgba(0,0,0,0)']])
    /* light pollution leaves only the brightest stars */
    const rnd = mulberry32(881)
    for (let i = 0; i < 160; i++) {
      const sx = rnd() * W, sy = rnd() * H * .36, r = .4 + rnd() * rnd() * 1.2
      x.fillStyle = 'rgba(214,228,250,' + (.08 + rnd() * .30) * (1 - sy / (H * .4)) + ')'
      x.beginPath(); x.arc(sx, sy, r, 0, TAU); x.fill()
    }
    return c
  }

  /* the far skyline the city closes with — towers past the fog line, each a
     black slab with a scatter of lit floors. Kage's ridge, in glass. */
  function texSkyline(seed, opt) {
    const o = opt || {}
    const W = 2048, H = 512, c = cvs(W, H), x = c.getContext('2d')
    const rnd = mulberry32(seed), n = noise2D(seed)
    let px = 0
    while (px < W) {
      const w = 14 + rnd() * 46
      const t = px / W
      const base = .30 + .32 * (fbm(n, t * 3.1, .5, 3, 2.1, .5) * .5 + .5)
      const spike = rnd() > .9 ? .25 + rnd() * .3 : 0
      const h = H * clamp(base + rnd() * .18 + spike, .1, .96)
      const top = H - h
      x.fillStyle = o.fill || '#04070c'; x.fillRect(px, top, w, h)
      if (spike) { x.fillRect(px + w / 2 - 1, top - 30 - rnd() * 40, 2, 40 + rnd() * 30) }
      /* lit floors */
      const cols = Math.max(1, (w / 5) | 0), rows = (h / 7) | 0
      const dens = .06 + rnd() * .22
      for (let r = 1; r < rows; r++) for (let k = 0; k < cols; k++) {
        if (rnd() > dens) continue
        const cool = rnd()
        x.fillStyle = cool < .55 ? 'rgba(120,170,255,' + (.35 + rnd() * .5) + ')'
          : (cool < .93 ? 'rgba(235,240,255,' + (.25 + rnd() * .45) + ')' : 'rgba(255,60,48,.75)')
        x.fillRect(px + 2 + k * 5, top + r * 7, 2, 2)
      }
      if (rnd() > .82) {                       /* an aviation light on the roof */
        x.fillStyle = 'rgba(255,40,30,.9)'; x.fillRect(px + w / 2 - 1.5, top - 3, 3, 3)
      }
      px += w + rnd() * 6
    }
    return c
  }

  /* the street grid, seen from four hundred metres up: dark asphalt, every
     avenue a thread of sodium and white, every crossing a brighter knot */
  function texStreets() {
    const S = 256, c = cvs(S, S), x = c.getContext('2d')
    x.fillStyle = '#020306'; x.fillRect(0, 0, S, S)
    const B = S * (22 / 31)                    /* block / (block + street) */
    const band = (x0, y0, w, h, col) => { x.fillStyle = col; x.fillRect(x0, y0, w, h) }
    band(B, 0, S - B, S, 'rgba(36,52,84,.9)')
    band(0, B, S, S - B, 'rgba(36,52,84,.9)')
    const m = B + (S - B) / 2
    const lane = (vert, col, w) => vert ? band(m - w / 2, 0, w, S, col) : band(0, m - w / 2, S, w, col)
    lane(true, 'rgba(255,196,140,.55)', 3); lane(false, 'rgba(255,196,140,.55)', 3)
    lane(true, 'rgba(150,190,255,.65)', 1.2); lane(false, 'rgba(150,190,255,.65)', 1.2)
    const kg = x.createRadialGradient(m, m, 0, m, m, S * .22)
    kg.addColorStop(0, 'rgba(210,225,255,.7)'); kg.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = kg; x.fillRect(0, 0, S, S)
    const rnd = mulberry32(5)
    for (let i = 0; i < 40; i++) {
      const v = rnd() > .5, p = rnd() * S
      band(v ? m - 1.5 + (rnd() - .5) * 4 : p, v ? p : m - 1.5 + (rnd() - .5) * 4, 2.4, 2.4,
        rnd() > .5 ? 'rgba(255,70,60,.9)' : 'rgba(255,245,230,.9)')
    }
    return c
  }

  /* soft round falloff — haze, motes, glows */
  function texGlow(inner, mid) {
    const S = 256, c = cvs(S, S), x = c.getContext('2d')
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
    g.addColorStop(0, inner || 'rgba(255,255,255,1)')
    g.addColorStop(.28, mid || 'rgba(255,255,255,.36)')
    g.addColorStop(.62, 'rgba(255,255,255,.07)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, S, S)
    return c
  }

  /* one wisp — a round mote, not a streak. A hard bright point in a wide,
     very faint halo; a smooth full-radius ramp gives a blob with no centre. */
  function texWisp() {
    const S = 128, c = cvs(S, S), x = c.getContext('2d')
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
    g.addColorStop(0,   'rgba(255,255,255,1)')
    g.addColorStop(.07, 'rgba(236,246,255,.92)')
    g.addColorStop(.16, 'rgba(180,212,255,.40)')
    g.addColorStop(.34, 'rgba(120,168,240,.13)')
    g.addColorStop(.62, 'rgba(80,128,210,.035)')
    g.addColorStop(1,   'rgba(60,100,180,0)')
    x.fillStyle = g; x.fillRect(0, 0, S, S)
    return c
  }

  /* a column of light, brightest at its foot, for the beam over the core */
  function texBeam() {
    const W = 64, H = 512, c = cvs(W, H), x = c.getContext('2d')
    const v = x.createLinearGradient(0, H, 0, 0)
    v.addColorStop(0, 'rgba(255,255,255,1)'); v.addColorStop(.25, 'rgba(255,255,255,.45)')
    v.addColorStop(.7, 'rgba(255,255,255,.08)'); v.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = v; x.fillRect(0, 0, W, H)
    x.globalCompositeOperation = 'destination-in'
    const hz = x.createLinearGradient(0, 0, W, 0)
    hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(.5, 'rgba(0,0,0,1)'); hz.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = hz; x.fillRect(0, 0, W, H)
    x.globalCompositeOperation = 'source-over'
    return c
  }

  /* --------------------------------------------- the holographic panels
     No brands and no borrowed language: abstract system graphics in the two
     environment colours, red only where something is signalling. */
  const MONO = '500 {s}px "JetBrains Mono", ui-monospace, monospace'
  const DISP = '600 {s}px "Space Grotesk", system-ui, sans-serif'
  const font = (f, s) => f.replace('{s}', s)
  function holoFrame(x, W, H, col) {
    x.strokeStyle = col; x.lineWidth = 3; x.strokeRect(6, 6, W - 12, H - 12)
    x.lineWidth = 8
    ;[[6, 6, 1, 1], [W - 6, 6, -1, 1], [6, H - 6, 1, -1], [W - 6, H - 6, -1, -1]].forEach(([px, py, sx, sy]) => {
      x.beginPath(); x.moveTo(px, py + sy * 40); x.lineTo(px, py); x.lineTo(px + sx * 40, py); x.stroke()
    })
  }
  function texHolo(kind, seed) {
    const W = 512, H = kind === 'banner' ? 1024 : 320, c = cvs(W, H), x = c.getContext('2d')
    const rnd = mulberry32(seed)
    const BLUE = 'rgba(120,175,255,', RED = 'rgba(255,60,48,', WHITE = 'rgba(232,240,255,'
    x.clearRect(0, 0, W, H)
    if (kind === 'network') {
      const pts = []
      for (let i = 0; i < 26; i++) pts.push([40 + rnd() * (W - 80), 40 + rnd() * (H - 110)])
      x.lineWidth = 1.4
      pts.forEach((p, i) => pts.slice(i + 1).forEach(q => {
        const d = Math.hypot(p[0] - q[0], p[1] - q[1])
        if (d < 120) { x.strokeStyle = BLUE + (.55 - d / 300) + ')'; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.stroke() }
      }))
      pts.forEach((p, i) => {
        x.fillStyle = i === 7 ? RED + '1)' : WHITE + '.95)'
        x.beginPath(); x.arc(p[0], p[1], i === 7 ? 7 : 3.4, 0, TAU); x.fill()
      })
      x.fillStyle = WHITE + '.9)'; x.font = font(MONO, 22); x.fillText('MODEL / ONLINE', 34, H - 34)
      x.fillStyle = BLUE + '.9)'; x.fillText('0.982', W - 120, H - 34)
      holoFrame(x, W, H, BLUE + '.75)')
    } else if (kind === 'signal') {
      const cx = W / 2, cy = H / 2 - 10
      for (let r = 26; r < 150; r += 22) { x.strokeStyle = RED + (1 - r / 170) + ')'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke() }
      x.strokeStyle = WHITE + '.6)'; x.lineWidth = 1.2
      x.beginPath(); x.moveTo(cx - 170, cy); x.lineTo(cx + 170, cy); x.moveTo(cx, cy - 130); x.lineTo(cx, cy + 130); x.stroke()
      x.fillStyle = RED + '1)'; x.beginPath(); x.arc(cx, cy, 9, 0, TAU); x.fill()
      x.fillStyle = WHITE + '.9)'; x.font = font(MONO, 20); x.fillText('SIGNAL 07', 30, H - 26)
      x.fillText('LOCKED', W - 108, H - 26)
    } else if (kind === 'flow') {
      for (let i = 0; i < 34; i++) {
        const h = 20 + rnd() * rnd() * (H - 110)
        x.fillStyle = i % 9 === 4 ? RED + '.95)' : BLUE + (.45 + rnd() * .5) + ')'
        x.fillRect(30 + i * 13.6, H - 70 - h, 8, h)
      }
      x.fillStyle = WHITE + '.9)'; x.font = font(MONO, 20); x.fillText('DATA FLOW  / 4.2 TB/s', 30, H - 30)
      holoFrame(x, W, H, BLUE + '.6)')
    } else if (kind === 'core') {
      x.font = font(DISP, 210); x.textBaseline = 'middle'
      x.strokeStyle = BLUE + '.95)'; x.lineWidth = 3; x.strokeText('AI', 46, H / 2 - 6)
      x.fillStyle = BLUE + '.16)'; x.fillText('AI', 46, H / 2 - 6)
      x.font = font(MONO, 22); x.fillStyle = WHITE + '.9)'
      x.fillText('CORE 01', W - 168, 64); x.fillText('ONLINE', W - 168, 98)
      x.fillStyle = RED + '1)'; x.beginPath(); x.arc(W - 186, 92, 6, 0, TAU); x.fill()
      holoFrame(x, W, H, BLUE + '.6)')
    } else if (kind === 'trend') {
      x.strokeStyle = BLUE + '.35)'; x.lineWidth = 1
      for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(30, i * 46); x.lineTo(W - 30, i * 46); x.stroke() }
      x.strokeStyle = WHITE + '.95)'; x.lineWidth = 3; x.beginPath()
      let y = H - 90
      for (let i = 0; i <= 40; i++) { y = clamp(y - (rnd() - .32) * 18, 40, H - 70); i ? x.lineTo(30 + i * 11.3, y) : x.moveTo(30, y) }
      x.stroke()
      x.fillStyle = RED + '1)'; x.beginPath(); x.arc(30 + 40 * 11.3, y, 7, 0, TAU); x.fill()
      x.fillStyle = WHITE + '.9)'; x.font = font(MONO, 20); x.fillText('INFERENCE  +12.4%', 30, H - 26)
    } else {                                   /* banner: a tall vertical strip */
      x.fillStyle = BLUE + '.12)'; x.fillRect(0, 0, W, H)
      x.save(); x.translate(W / 2 + 40, H - 60); x.rotate(-Math.PI / 2)
      x.font = font(DISP, 150); x.fillStyle = WHITE + '.92)'
      x.fillText(['SYSTEMS', 'NETWORK', 'SIGNAL'][seed % 3], 0, 0)
      x.restore()
      x.fillStyle = RED + '1)'; x.fillRect(40, 40, 36, 36)
      x.font = font(MONO, 26); x.fillStyle = BLUE + '.95)'; x.fillText('0' + (seed % 9 + 1), 96, 70)
      holoFrame(x, W, H, BLUE + '.7)')
    }
    return c
  }

  /* -------------------------------------------------------------- 4 · gl */
  /* The layout viewport, not the window — on mobile innerWidth follows the
     initial containing block and can run wider than what CSS lays out on. */
  const vpW = () => document.documentElement.clientWidth  || innerWidth
  const vpH = () => document.documentElement.clientHeight || innerHeight

  let THREE = null
  let renderer, scene, camera, maxAniso = 1
  let canvas = null
  const HI = qs('q', COARSE ? 'low' : 'high')
  const LOW = HI === 'low'
  const WANT_POST    = qs('post', '1') !== '0'
  const WANT_SHADOW  = qs('shadow', LOW ? '0' : '1') !== '0'
  const DPR_CAP      = qn('dpr', LOW ? 1.4 : 1.8)
  /* the renderer trades resolution for frame rate on its own — the scene is
     fill-bound, so pixels are the only knob worth turning on unknown hardware */
  const PERF = { scale: 1, acc: 0, n: 0, locked: qs('adapt', '1') === '0' }
  const TEXTURES = []

  /* the fog the whole city stands in. Its colour is the dome's horizon row. */
  const FOG = 0x0d1828
  function initGL() {
    if (qs('nogl', '0') !== '0' || !THREE || !webglAvailable()) throw new Error('webgl disabled')
    canvas = document.createElement('canvas')
    canvas.id = 'gl'; canvas.setAttribute('aria-hidden', 'true')
    root.querySelector('.gl-host').appendChild(canvas)
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !WANT_POST, alpha: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, DPR_CAP))
    renderer.setSize(vpW(), vpH(), true)
    renderer.outputEncoding = WANT_POST ? THREE.LinearEncoding : THREE.sRGBEncoding
    renderer.toneMapping = WANT_POST ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.setClearColor(0x04060b, 1)
    if (WANT_SHADOW) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap }
    maxAniso = renderer.capabilities.getMaxAnisotropy()
    scene = new THREE.Scene()
    /* Kage reached a hundred metres; a city needs its towers to stand out to
       four hundred and still go to air before the far skyline, so the density
       drops and the far plane opens up. */
    scene.fog = new THREE.FogExp2(FOG, 0.0046)
    scene.background = new THREE.Color(FOG)
    camera = new THREE.PerspectiveCamera(36, vpW() / vpH(), .35, 900)
    scene.add(camera)
  }

  function tx(canvasEl, o) {
    o = o || {}
    const t = new THREE.CanvasTexture(canvasEl)
    t.wrapS = t.wrapT = o.wrap || THREE.ClampToEdgeWrapping
    if (o.repeat) t.repeat.set(o.repeat[0], o.repeat[1])
    t.anisotropy = Math.min(o.aniso || 8, maxAniso)
    if (o.srgb !== false) t.encoding = THREE.sRGBEncoding
    t.needsUpdate = true
    TEXTURES.push(t)
    return t
  }
  /* HDR-bright emitters: values above 1 survive because the scene is rendered
     into a half-float buffer, and they are what the bloom feeds on */
  const hdr = (r, g, b) => new THREE.Color().setRGB(r, g, b)

  /* sweep a polygonal cross-section along a path — Kage's kasagi beams, here
     the highway decks and their light rails */
  function sweepPoly(points, profile) {
    const segs = points.length, np = profile.length
    const pos = [], nor = [], uv = [], idx = []
    const T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i < segs; i++) {
      const p = points[i], a = points[Math.max(0, i - 1)], b = points[Math.min(segs - 1, i + 1)]
      T.subVectors(b, a).normalize()
      B.crossVectors(T, up).normalize()
      N.crossVectors(B, T).normalize()
      for (let j = 0; j < np; j++) {
        const u = profile[j][0], v = profile[j][1], l = Math.hypot(u, v) || 1
        pos.push(p.x + B.x * u + N.x * v, p.y + B.y * u + N.y * v, p.z + B.z * u + N.z * v)
        nor.push(B.x * u / l + N.x * v / l, B.y * u / l + N.y * v / l, B.z * u / l + N.z * v / l)
        uv.push(j / np, i / (segs - 1))
      }
    }
    for (let i = 0; i < segs - 1; i++) for (let j = 0; j < np; j++) {
      const j2 = (j + 1) % np, a = i * np + j, b = i * np + j2, c = (i + 1) * np + j2, d = (i + 1) * np + j
      idx.push(a, b, c, a, c, d)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(idx)
    return g
  }

  function mergeGeos(list) {
    let vN = 0, iN = 0
    list.forEach(g => { vN += g.attributes.position.count; iN += g.index.count })
    const pos = new Float32Array(vN * 3), nor = new Float32Array(vN * 3), uv = new Float32Array(vN * 2)
    const idx = vN > 65535 ? new Uint32Array(iN) : new Uint16Array(iN)
    let vo = 0, io = 0
    list.forEach(g => {
      pos.set(g.attributes.position.array, vo * 3)
      nor.set(g.attributes.normal.array, vo * 3)
      uv.set(g.attributes.uv.array, vo * 2)
      const gi = g.index.array
      for (let i = 0; i < gi.length; i++) idx[io + i] = gi[i] + vo
      io += gi.length; vo += g.attributes.position.count
      g.dispose()
    })
    const out = new THREE.BufferGeometry()
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
    out.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    out.setIndex(new THREE.BufferAttribute(idx, 1))
    return out
  }

  /* fog for the hand-written point/line shaders, matched to FogExp2 */
  const FOG_GLSL = 'uniform float uFogD; float fogKeep(float d){ float f = uFogD * d; return exp(-f * f); }\n'

  /* ========================================================== 5 · the world */
  const WORLD = {}                 /* named handles the page can animate */

  /* ---- the site plan, in metres ----------------------------------------
     The walk starts on a tower roof at y = 0 and the street is ninety metres
     below it. Everything downstream — waypoints, highways, the core — is
     pinned to these. */
  const GROUND  = -90
  const EDGE_Z  = -6               /* the parapet line                         */
  const CORE    = { x: 18, z: -168, top: 64 }
  const PITCH   = 31               /* block (22) + street (9)                  */

  function buildShell() {
    /* the sky, wrapped round the rig and carried with it */
    const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 48, 24),
      new THREE.MeshBasicMaterial({ map: tx(texSky()), side: THREE.BackSide,
        depthWrite: false, fog: false, toneMapped: false, color: hdr(.92, .96, 1.05) }))
    sky.rotation.y = Math.PI / 2; sky.renderOrder = 0; sky.frustumCulled = false
    scene.add(sky); WORLD.sky = sky

    /* the far skyline: three bands, nearest last, fog off — a fogged black
       silhouette comes back as a pale band (Kage learned that on its ridge) */
    ;[[-560, 1500, 330, 0x0b1424, 11], [-470, 1200, 250, 0x070d18, 12], [-400, 900, 190, 0x05090f, 13]].forEach((r, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(r[1], r[2]),
        new THREE.MeshBasicMaterial({ map: tx(texSkyline(r[4], { fill: '#' + new THREE.Color(r[3]).getHexString() }), { wrap: THREE.RepeatWrapping }),
          transparent: true, depthWrite: false, fog: false, color: hdr(.55 + i * .18, .6 + i * .18, .72 + i * .18) }))
      m.position.set(CORE.x * .4, GROUND + r[2] / 2 - 10, r[0]); m.renderOrder = 1
      scene.add(m)
    })

    /* the street grid ninety metres down */
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1200),
      new THREE.MeshBasicMaterial({ color: hdr(1.25, 1.25, 1.35),
        map: tx(texStreets(), { wrap: THREE.RepeatWrapping, repeat: [1600 / PITCH, 1200 / PITCH], aniso: 16 }) }))
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, GROUND, -300)
    /* line the texture's streets up with the block plan below */
    ground.material.map.offset.set(((11 - 800) / PITCH) % 1, (-306 / PITCH) % 1)
    scene.add(ground)

    /* ---- the roof deck: Kage's wet court, now forty metres over the city --- */
    const wallT = texWall()
    const wallMat = new THREE.MeshStandardMaterial({
      map: tx(wallT.map, { wrap: THREE.RepeatWrapping, repeat: [6, .5] }),
      normalMap: tx(wallT.normal, { wrap: THREE.RepeatWrapping, repeat: [6, .5], srgb: false }),
      normalScale: new THREE.Vector2(.85, .85), roughness: .78, metalness: .05, color: 0x56606a
    })
    const fT = texFloor()
    const floorMat = new THREE.MeshStandardMaterial({
      map: tx(fT.map, { wrap: THREE.RepeatWrapping, repeat: [5, 3.4], aniso: 16 }),
      normalMap: tx(fT.normal, { wrap: THREE.RepeatWrapping, repeat: [5, 3.4], srgb: false, aniso: 16 }),
      roughnessMap: tx(fT.rough, { wrap: THREE.RepeatWrapping, repeat: [2.6, 2.6], srgb: false }),
      normalScale: new THREE.Vector2(.30, .30),
      /* wet, so a touch more polish than Kage's court: the core and the city
         glow should slide across it */
      roughness: .52, metalness: .22, color: 0x6c7884
    })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 30), floorMat)
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 9); floor.receiveShadow = true
    scene.add(floor); WORLD.floor = floor

    const parapet = []
    parapet.push(new THREE.BoxGeometry(44.6, 1.15, .55).translate(0, .575, EDGE_Z))
    ;[-1, 1].forEach(s => parapet.push(new THREE.BoxGeometry(.55, 1.15, 30).translate(s * 22.0, .575, 9)))
    const pm = new THREE.Mesh(mergeGeos(parapet), wallMat)
    pm.castShadow = pm.receiveShadow = true; scene.add(pm)

    /* glass rail on the parapet: almost nothing, a sheen and a steel cap */
    const steel = new THREE.MeshStandardMaterial({ color: 0x9aa6b4, roughness: .32, metalness: .85 })
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(44, 1.05),
      new THREE.MeshStandardMaterial({ color: 0x9cc0ff, roughness: .08, metalness: .9, transparent: true, opacity: .10, depthWrite: false }))
    glass.position.set(0, 1.68, EDGE_Z); glass.renderOrder = 8; scene.add(glass)
    const posts = []
    for (let i = 0; i <= 22; i++) posts.push(new THREE.BoxGeometry(.06, 1.05, .06).translate(-22 + i * 2, 1.68, EDGE_Z))
    posts.push(new THREE.BoxGeometry(44, .07, .1).translate(0, 2.22, EDGE_Z))
    const rail = new THREE.Mesh(mergeGeos(posts), steel); rail.castShadow = true; scene.add(rail)

    /* a strip of floor light along the foot of the parapet — it is what
       carries the eye to the edge and out over the drop */
    const strip = new THREE.Mesh(new THREE.BoxGeometry(42, .05, .14),
      new THREE.MeshBasicMaterial({ color: hdr(.5, 1.0, 2.4), fog: true, toneMapped: false }))
    strip.position.set(0, .03, EDGE_Z + .45); scene.add(strip)

    /* plant on the roof: condensers, a vent stack, a cable tray */
    const metal = new THREE.MeshStandardMaterial({ color: 0x1a2028, roughness: .58, metalness: .7 })
    const plant = [
      new THREE.BoxGeometry(3.2, 1.8, 2.2).translate(14.2, .9, 13),
      new THREE.BoxGeometry(3.2, 1.8, 2.2).translate(17.8, .9, 13),
      new THREE.BoxGeometry(2.4, 1.3, 4.6).translate(-16.4, .65, 10),
      new THREE.CylinderGeometry(.45, .45, 3.4, 14).translate(-12.2, 1.7, 15),
      new THREE.BoxGeometry(.5, .25, 20).translate(-20.6, .13, 10)
    ]
    const pl = new THREE.Mesh(mergeGeos(plant), metal); pl.castShadow = pl.receiveShadow = true; scene.add(pl)

    /* the aviation mast at the corner, with its red light — the first signal */
    const mast = []
    mast.push(new THREE.CylinderGeometry(.12, .2, 15, 8).translate(19.4, 7.5, -3.4))
    for (let i = 1; i < 6; i++) mast.push(new THREE.BoxGeometry(1.2 - i * .14, .06, .06).translate(19.4, i * 2.4, -3.4))
    const mm2 = new THREE.Mesh(mergeGeos(mast), steel); mm2.castShadow = true; scene.add(mm2)
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 10),
      new THREE.MeshBasicMaterial({ color: hdr(4.2, .25, .2), toneMapped: false }))
    beacon.position.set(19.4, 15.1, -3.4); scene.add(beacon)
    const bHalo = new THREE.Mesh(new THREE.PlaneGeometry(4, 4),
      new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(255,70,50,.95)', 'rgba(224,35,28,.3)')),
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .8 }))
    bHalo.position.copy(beacon.position); bHalo.renderOrder = 9; scene.add(bHalo)
    WORLD.mastBeacon = { core: beacon, halo: bHalo }
  }

  /* ------------------------------------------------------ the city blocks
     One instanced box, scaled per tower, with every window procedural: the
     facade is cut into a floor/column grid in the fragment shader, a hash
     decides which rooms are lit and in what light. One draw call for the
     whole skyline; nothing to download. */
  function cityMaterial() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x0b1119, roughness: .58, metalness: .5 })
    mat.onBeforeCompile = sh => {
      sh.uniforms.uT = WORLD.uT
      sh.uniforms.uWin = WORLD.uWin
      sh.vertexShader = 'attribute float aSeed;\nvarying vec3 vCityP; varying vec3 vCityN; varying vec3 vCityS; varying float vCitySeed;\n' +
        sh.vertexShader.replace('#include <begin_vertex>',
          '#include <begin_vertex>\n' +
          'vec3 cs = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));\n' +
          'vCityS = cs; vCityN = normal; vCitySeed = aSeed; vCityP = position * cs;\n')
      sh.fragmentShader = 'uniform float uT; uniform float uWin;\nvarying vec3 vCityP; varying vec3 vCityN; varying vec3 vCityS; varying float vCitySeed;\n' +
        'float cityHash(vec3 p){ p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }\n' +
        'vec3 cityWindows(){\n' +
        ' vec3 n = vCityN;\n' +
        ' float crownH = step(.78, fract(vCitySeed * 5.31));\n' +
        ' if (abs(n.y) > .5) return vec3(.18, .42, 1.3) * crownH * .35;\n' +
        ' bool sx = abs(n.x) > .5;\n' +
        ' float u = sx ? vCityP.z * sign(n.x) : -vCityP.x * sign(n.z);\n' +
        ' float halfW = sx ? vCityS.z * .5 : vCityS.x * .5;\n' +
        ' float face = sx ? (n.x > 0. ? 1. : 2.) : (n.z > 0. ? 3. : 4.);\n' +
        ' float v = vCityP.y;\n' +
        ' vec2 cell = vec2(2.6, 3.6);\n' +
        ' vec2 id = floor(vec2(u + 400., v) / cell);\n' +
        ' vec2 f = fract(vec2(u + 400., v) / cell);\n' +
        ' float win = step(.14, f.x) * step(f.x, .86) * step(.22, f.y) * step(f.y, .82);\n' +
        ' float r = cityHash(vec3(id, vCitySeed * 97. + face));\n' +
        ' float r2 = cityHash(vec3(id.yx + 7.1, vCitySeed * 13. + face * 3.));\n' +
        ' float dens = .22 + .30 * fract(vCitySeed * 7.13);\n' +
        ' float lit = step(1. - dens, r) * step(.16, cityHash(vec3(id.y, vCitySeed * 3.1, face)));\n' +
        ' vec3 col = r2 < .46 ? vec3(.52, .74, 1.0) : (r2 < .86 ? vec3(.90, .93, 1.0) : vec3(1.0, .74, .50));\n' +
        ' col = r2 > .988 ? vec3(1.0, .14, .10) : col;\n' +
        ' float flick = 1. - step(.993, r2) * step(.5, fract(uT * 1.3 + r * 9.)) * .8;\n' +
        ' float e = win * lit * (.45 + 1.05 * r) * flick;\n' +
        ' float edge = 1. - smoothstep(0., .28, halfW - abs(u));\n' +
        ' float strip = step(.74, fract(vCitySeed * 3.7)) * edge;\n' +
        ' float pulse = .55 + .45 * sin(uT * .9 - v * .05 + vCitySeed * 20.);\n' +
        ' float crown = crownH * (1. - smoothstep(.0, 1.6, vCityS.y - v)) * step(.2, vCityS.y - v);\n' +
        ' return col * e * uWin + vec3(.22, .5, 1.6) * strip * pulse * .9 + vec3(.3, .6, 1.8) * crown;\n' +
        '}\n' +
        sh.fragmentShader.replace('#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\ntotalEmissiveRadiance += cityWindows();')
    }
    return mat
  }

  /* the plan: blocks on a 31 m pitch, one to four towers each, tallest near
     the core. Then every tower that would stand in the camera's path, a
     card's view, a highway or the sight line to the core is cut down to
     clear it — the walk flies over roofs instead of through them. */
  const TOWERS = []
  function planCity() {
    const rnd = mulberry32(2026), n = noise2D(77)
    const span = LOW ? 8 : 12, rows = LOW ? 11 : 15
    for (let gx = -span; gx <= span; gx++) for (let gz = 0; gz < rows; gz++) {
      const bx = gx * PITCH, bz = -26 - gz * PITCH
      if (Math.abs(bx) < 36 && bz > -40) continue          /* our own tower's block */
      const dCore = Math.hypot(bx - CORE.x, bz - CORE.z)
      const down = Math.exp(-dCore * dCore / (2 * 150 * 150))
      const k = 1 + (rnd() * (LOW ? 2 : 3.2)) | 0
      for (let i = 0; i < k; i++) {
        const w = k === 1 ? 14 + rnd() * 7 : 7 + rnd() * 6
        const d = k === 1 ? 14 + rnd() * 7 : 7 + rnd() * 6
        const ox = k === 1 ? 0 : (rnd() - .5) * (22 - w)
        const oz = k === 1 ? 0 : (rnd() - .5) * (22 - d)
        const nz = fbm(n, bx * .006, bz * .006, 3, 2, .5) * .5 + .5
        let h = 26 + nz * 70 + down * 120 * Math.pow(rnd(), .7) + rnd() * 18
        if (rnd() > .96) h += 60 + rnd() * 40                 /* the odd supertall */
        TOWERS.push({ x: bx + ox, z: bz + oz, w: w, d: d, top: GROUND + h, seed: rnd() })
      }
    }
    /* towers that frame the hero view — tall, set back, deliberately placed */
    ;[[-58, -92, 18, 16, 46], [-96, -150, 20, 18, 72], [74, -96, 16, 16, 40], [102, -210, 22, 20, 86],
      [-30, -250, 18, 18, 58], [60, -300, 24, 20, 96], [-140, -260, 20, 22, 80]].forEach((t, i) => {
      TOWERS.push({ x: t[0], z: t[1], w: t[2], d: t[3], top: t[4], seed: .31 + i * .097 })
      TOWERS.push({ x: t[0], z: t[1], w: t[2] * .64, d: t[3] * .64, top: t[4] + 14, seed: .77 + i * .031 })
    })
    /* our own tower, under the roof deck */
    TOWERS.push({ x: 0, z: 9, w: 44, d: 30, top: -.06, seed: .5, own: true })
  }
  /* cut every tower down to clear a set of points by a radius and a margin */
  function clearAround(pts, rad, margin) {
    TOWERS.forEach(t => {
      if (t.own || t.gone) return
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        if (Math.abs(t.x - p.x) < t.w / 2 + rad && Math.abs(t.z - p.z) < t.d / 2 + rad && t.top > p.y - margin) {
          t.top = p.y - margin
          if (t.top < GROUND + 10) { t.gone = true; return }
        }
      }
    })
  }
  function buildCity() {
    planCity()
    /* the camera's path and the card views */
    const path = []
    for (let i = 0; i <= 160; i++) path.push(curveP.getPoint(i / 160))
    clearAround(path.filter(p => p.z < EDGE_Z - 4), 13, 16)
    clearAround(Object.values(VIEWS).map(v => new THREE.Vector3(v.p[0], v.p[1], v.p[2])), 10, 12)
    /* the sight line from the roof to the core's waist: everything under it
       stays, nothing rises into it */
    const sight = []
    for (let i = 0; i <= 40; i++) {
      const t = i / 40
      sight.push(new THREE.Vector3(lerp(0, CORE.x, t), lerp(2, -8, t), lerp(EDGE_Z, CORE.z + 26, t)))
    }
    clearAround(sight, 8, 34)
    /* the core's own plaza */
    TOWERS.forEach(t => { if (!t.own && Math.hypot(t.x - CORE.x, t.z - CORE.z) < 34) t.gone = true })
    if (WORLD.highwayPaths) WORLD.highwayPaths.forEach(pts => clearAround(pts, 9, 7))

    const list = TOWERS.filter(t => !t.gone && t.top > GROUND + 4)
    const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, .5, 0)
    const seeds = new Float32Array(list.length)
    const inst = new THREE.InstancedMesh(geo, cityMaterial(), list.length)
    const M = new THREE.Matrix4(), P = new THREE.Vector3(), S = new THREE.Vector3(), R = new THREE.Quaternion()
    list.forEach((t, i) => {
      P.set(t.x, GROUND, t.z); S.set(t.w, t.top - GROUND, t.d)
      M.compose(P, R, S); inst.setMatrixAt(i, M); seeds[i] = t.seed
    })
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    inst.instanceMatrix.needsUpdate = true
    inst.frustumCulled = false; inst.receiveShadow = true
    scene.add(inst)
    WORLD.city = inst; WORLD.towers = list
  }

  /* --------------------------------------------------------- the AI core
     The page's one landmark. Kage hung a blood moon over its hall; here a
     tower of dark glass carries the light — eight seams of electric blue
     with data running up them, rings of signal round its waist, a lit core
     at the crown and a column of light going up into the cloud. */
  function buildCore() {
    const g = new THREE.Group()
    const shell = new THREE.MeshStandardMaterial({ color: 0x0a1018, roughness: .3, metalness: .85 })
    shell.onBeforeCompile = sh => {
      sh.uniforms.uT = WORLD.uT; sh.uniforms.uFocus = WORLD.uFocus
      sh.vertexShader = 'varying vec3 vCoreP;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nvCoreP = (modelMatrix * vec4(position, 1.0)).xyz;')
      sh.fragmentShader = 'uniform float uT; uniform float uFocus; varying vec3 vCoreP;\n' +
        sh.fragmentShader.replace('#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\n' +
          'vec2 cp = vCoreP.xz - vec2(' + CORE.x.toFixed(1) + ', ' + CORE.z.toFixed(1) + ');\n' +
          'float a = atan(cp.x, cp.y) / 6.2831853 * 8.0;\n' +
          'float seam = 1.0 - smoothstep(0.0, 0.05, abs(fract(a + 0.5) - 0.5));\n' +
          'float lane = floor(a + 0.5);\n' +
          'float run = fract(vCoreP.y * 0.018 - uT * (0.22 + 0.05 * mod(lane, 3.0)) + lane * 0.137);\n' +
          'float packet = smoothstep(0.0, 0.03, run) * (1.0 - smoothstep(0.03, 0.16, run));\n' +
          'float floors = (1.0 - smoothstep(0.0, 0.06, abs(fract(vCoreP.y / 4.5) - 0.5) - 0.44)) * 0.10;\n' +
          'vec3 blue = vec3(0.25, 0.6, 2.4);\n' +
          'vec3 sig = mod(lane, 4.0) == 1.0 ? vec3(3.0, 0.25, 0.18) : blue * 1.6;\n' +
          'totalEmissiveRadiance += blue * seam * (0.55 + 0.25 * uFocus) + sig * seam * packet * 2.2 + blue * floors;\n')
    }
    /* stacked, tapering octagons */
    const tiers = [[18, 14, 46], [14, 11, 50], [11, 8, 40], [8, 5.2, 22]]
    let y = GROUND
    const parts = []
    tiers.forEach(t => {
      parts.push(new THREE.CylinderGeometry(t[1], t[0], t[2], 8, 6).translate(0, y + t[2] / 2, 0))
      parts.push(new THREE.CylinderGeometry(t[1] + .6, t[1] + .6, .8, 8).translate(0, y + t[2] + .4, 0))
      y += t[2] + .8
    })
    const tower = new THREE.Mesh(mergeGeos(parts), shell)
    g.add(tower)
    const crownY = y + 4
    WORLD.coreTop = crownY

    /* the rings: a solid hoop and a broken one counter-turning inside it */
    const ringMat = new THREE.MeshBasicMaterial({ color: hdr(.45, .95, 3.0), fog: true, toneMapped: false })
    const redMat = new THREE.MeshBasicMaterial({ color: hdr(3.4, .22, .16), fog: true, toneMapped: false })
    WORLD.coreRings = []
    ;[[GROUND + 60, 24, ringMat, 0], [GROUND + 102, 19, ringMat, 1], [GROUND + 132, 15.5, redMat, 0], [crownY - 6, 12, ringMat, 1]].forEach((r, i) => {
      const hold = new THREE.Group()
      hold.position.y = r[0]
      if (r[3]) {
        const arcs = []
        for (let k = 0; k < 18; k++) arcs.push(new THREE.TorusGeometry(r[1], .22, 6, 10, TAU / 30).rotateZ(k * TAU / 18))
        hold.add(new THREE.Mesh(mergeGeos(arcs), r[2]))
      } else {
        hold.add(new THREE.Mesh(new THREE.TorusGeometry(r[1], .18, 6, 128), r[2]))
      }
      hold.rotation.x = Math.PI / 2 + (i % 2 ? .05 : -.04)
      hold.userData.spin = (i % 2 ? -1 : 1) * (.05 + i * .02)
      g.add(hold); WORLD.coreRings.push(hold)
    })

    /* the crown: a lit core inside a turning cage, a spire with the signal */
    const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(3.4, 1),
      new THREE.MeshBasicMaterial({ color: hdr(1.6, 2.4, 4.2), toneMapped: false }))
    heart.position.y = crownY; g.add(heart); WORLD.coreHeart = heart
    const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(6.4, 1)),
      new THREE.LineBasicMaterial({ color: hdr(.5, 1.0, 2.8), transparent: true, opacity: .8, toneMapped: false }))
    cage.position.y = crownY; g.add(cage); WORLD.coreCage = cage
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(.15, .5, 22, 8), shell)
    spire.position.y = crownY + 14; g.add(spire)
    const tip = new THREE.Mesh(new THREE.SphereGeometry(.7, 12, 10),
      new THREE.MeshBasicMaterial({ color: hdr(4.6, .3, .22), toneMapped: false }))
    tip.position.y = crownY + 25.4; g.add(tip); WORLD.coreTip = tip

    /* the air round it — a wide, weak corona that the bloom picks up */
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(120, 120),
      new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(140,190,255,.9)', 'rgba(60,110,255,.24)')),
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .42 }))
    halo.position.y = crownY; halo.renderOrder = 2; g.add(halo); WORLD.coreHalo = halo
    const tipHalo = new THREE.Mesh(new THREE.PlaneGeometry(14, 14),
      new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(255,90,70,.95)', 'rgba(224,35,28,.3)')),
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .7 }))
    tipHalo.position.y = crownY + 25.4; tipHalo.renderOrder = 3; g.add(tipHalo); WORLD.coreTipHalo = tipHalo

    /* the beam: two crossed sheets of light running up into the cloud */
    const beamMat = new THREE.MeshBasicMaterial({ map: tx(texBeam()), color: hdr(.55, .85, 1.8),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .34, side: THREE.DoubleSide })
    ;[0, Math.PI / 2].forEach(r => {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(9, 420), beamMat)
      b.position.y = crownY + 210; b.rotation.y = r; b.renderOrder = 2; g.add(b)
    })
    WORLD.coreBeam = beamMat

    /* the glow the core pushes out over its own plaza */
    const spill = new THREE.Mesh(new THREE.PlaneGeometry(160, 70),
      new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(90,150,255,.8)', 'rgba(40,90,240,.22)')),
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: true, opacity: .32 }))
    spill.position.set(0, GROUND + 14, 22); spill.renderOrder = 2; g.add(spill)

    g.position.set(CORE.x, 0, CORE.z)
    scene.add(g); WORLD.core = g

    const lt = new THREE.PointLight(0x4f8dff, 3.4, 300, 1.3)
    lt.position.set(CORE.x, crownY, CORE.z); scene.add(lt); WORLD.coreLight = lt
    const low = new THREE.PointLight(0x3a72ff, 2.2, 140, 1.6)
    low.position.set(CORE.x, GROUND + 40, CORE.z + 30); scene.add(low)
  }

  /* ------------------------------------------------- highways & traffic */
  const HWY = [
    { y: -44, pts: [[-460, -44, -70], [-200, -44, -96], [-40, -44, -112], [120, -44, -118], [300, -44, -150], [480, -44, -200]] },
    { y: -60, pts: [[-470, -60, -270], [-180, -60, -226], [0, -60, -210], [150, -60, -232], [320, -60, -300], [480, -60, -330]] },
    { y: -28, pts: [[-120, -28, -420], [-70, -28, -300], [-34, -28, -200], [-52, -28, -110], [-110, -28, -40], [-240, -28, 10]] }
  ]
  function planHighways() {
    WORLD.highways = HWY.map(h => {
      const c = new THREE.CatmullRomCurve3(h.pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', .5)
      const S = 600, samp = c.getSpacedPoints(S)
      return { curve: c, samp: samp }
    })
    WORLD.highwayPaths = WORLD.highways.map(h => h.samp.filter((p, i) => i % 3 === 0))
  }
  function buildHighways() {
    const deck = new THREE.MeshStandardMaterial({ color: 0x10161e, roughness: .7, metalness: .35 })
    const white = new THREE.MeshBasicMaterial({ color: hdr(.9, 1.1, 1.6), fog: true, toneMapped: false })
    const blue = new THREE.MeshBasicMaterial({ color: hdr(.3, .7, 2.4), fog: true, toneMapped: false })
    const decks = [], railsW = [], railsB = [], piers = []
    WORLD.highways.forEach(h => {
      const pts = h.samp.filter((p, i) => i % 2 === 0)
      decks.push(sweepPoly(pts, [[-8, -.7], [8, -.7], [8, .4], [-8, .4]]))
      railsW.push(sweepPoly(pts, [[-8.1, .4], [-7.8, .4], [-7.8, .75], [-8.1, .75]]))
      railsB.push(sweepPoly(pts, [[7.8, .4], [8.1, .4], [8.1, .75], [7.8, .75]]))
      railsB.push(sweepPoly(pts, [[-.12, .41], [.12, .41], [.12, .5], [-.12, .5]]))
      for (let i = 0; i < h.samp.length; i += 22) {
        const p = h.samp[i]
        piers.push(new THREE.BoxGeometry(2.4, p.y - GROUND, 2.4).translate(p.x, GROUND + (p.y - GROUND) / 2 - .6, p.z))
      }
    })
    const add = (geos, mat) => { const m = new THREE.Mesh(mergeGeos(geos), mat); m.receiveShadow = true; scene.add(m); return m }
    add(decks, deck); add(piers, deck); add(railsW, white); add(railsB, blue)

    /* traffic: two lanes each way, a point of light per vehicle. White heads
       one way, red tails the other — the oldest picture of a city at night. */
    const per = LOW ? 18 : 42
    const cars = []
    WORLD.highways.forEach((h, hi) => {
      ;[-5.6, -2.2, 2.2, 5.6].forEach(lane => {
        const dir = lane < 0 ? 1 : -1
        for (let k = 0; k < per; k++) cars.push({ h: hi, lane: lane, dir: dir, s: Math.random(), v: (.010 + Math.random() * .010) * (hi === 2 ? 1.6 : 1) })
      })
    })
    const N = cars.length
    const g = new THREE.BufferGeometry()
    const col = new Float32Array(N * 3)
    cars.forEach((c, i) => {
      const red = c.dir < 0
      col[i * 3] = red ? 3.2 : 2.2; col[i * 3 + 1] = red ? .2 : 2.1; col[i * 3 + 2] = red ? .14 : 1.9
    })
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    g.setAttribute('aCol', new THREE.BufferAttribute(col, 3))
    const pts = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: { uTex: { value: tx(texGlow()) }, uSize: { value: vpH() * .5 }, uFogD: { value: scene.fog.density } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader:
        'attribute vec3 aCol; uniform float uSize; varying vec3 vC; varying float vK;\n' + FOG_GLSL +
        'void main(){ vC = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0);\n' +
        ' vK = fogKeep(-mv.z);\n' +
        ' gl_PointSize = clamp(uSize * 0.9 / max(-mv.z, 1.0), 1.5, 26.0);\n' +
        ' gl_Position = projectionMatrix * mv; }',
      fragmentShader:
        'uniform sampler2D uTex; varying vec3 vC; varying float vK;\n' +
        'void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb, t.a * (0.15 + 0.85 * vK)); }'
    }))
    pts.frustumCulled = false; pts.renderOrder = 6
    scene.add(pts)
    WORLD.traffic = { mesh: pts, cars: cars }
  }
  const _tA = { x: 0, y: 0, z: 0 }
  function highwayAt(h, s, out) {
    const S = h.samp, f = (((s % 1) + 1) % 1) * (S.length - 1), i = f | 0, k = f - i
    const a = S[i], b = S[Math.min(i + 1, S.length - 1)]
    out.x = lerp(a.x, b.x, k); out.y = lerp(a.y, b.y, k); out.z = lerp(a.z, b.z, k)
    /* the lane offset runs along the ground normal of the curve */
    const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1
    out.nx = -dz / l; out.nz = dx / l
    return out
  }
  function updateTraffic(dt, quiet) {
    const T = WORLD.traffic; if (!T) return
    const P = T.mesh.geometry.attributes.position.array
    const sp = 1 - quiet * .55
    T.cars.forEach((c, i) => {
      c.s += c.dir * c.v * dt * sp
      const h = WORLD.highways[c.h]
      highwayAt(h, c.s, _tA)
      P[i * 3] = _tA.x + _tA.nx * c.lane; P[i * 3 + 1] = _tA.y + 1.0; P[i * 3 + 2] = _tA.z + _tA.nz * c.lane
    })
    T.mesh.geometry.attributes.position.needsUpdate = true
  }

  /* ----------------------------------------------------- flying vehicles
     A slow fleet on lanes in the air: dark hulls, a white light at the nose,
     red at the tail, a cold underglow. Most circle the core, a few run the
     long avenues. */
  function buildFlyers() {
    const N = LOW ? 8 : 18
    const rnd = mulberry32(909), list = []
    for (let i = 0; i < N; i++) {
      const orbit = i % 3 !== 2
      list.push({
        orbit: orbit,
        cx: orbit ? CORE.x + (rnd() - .5) * 20 : (rnd() - .5) * 160,
        cz: orbit ? CORE.z + (rnd() - .5) * 20 : -40 - rnd() * 260,
        rx: orbit ? 60 + rnd() * 110 : 0, rz: orbit ? 40 + rnd() * 90 : 0,
        y: orbit ? -30 + rnd() * 80 : -10 + rnd() * 40,
        sp: (orbit ? .018 + rnd() * .03 : 5 + rnd() * 6) * (rnd() > .5 ? 1 : -1),
        ph: rnd() * TAU, axis: rnd() > .5 ? 'x' : 'z', len: 520
      })
    }
    const hull = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, .55, 4.6),
      new THREE.MeshStandardMaterial({ color: 0x141b24, roughness: .4, metalness: .8 }), N)
    hull.frustumCulled = false; scene.add(hull)
    const g = new THREE.BufferGeometry()
    const col = new Float32Array(N * 3 * 3), siz = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      col.set([2.4, 2.4, 2.6], i * 9); col.set([3.4, .25, .2], i * 9 + 3); col.set([.35, .75, 2.4], i * 9 + 6)
      siz[i * 3] = 1.0; siz[i * 3 + 1] = .8; siz[i * 3 + 2] = 2.6
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 9), 3))
    g.setAttribute('aCol', new THREE.BufferAttribute(col, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(siz, 1))
    const lights = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: { uTex: { value: tx(texGlow()) }, uSize: { value: vpH() * .5 }, uFogD: { value: scene.fog.density }, uT: WORLD.uT },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader:
        'attribute vec3 aCol; attribute float aSize; uniform float uSize; uniform float uT; varying vec3 vC; varying float vK;\n' + FOG_GLSL +
        'void main(){ vC = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0); vK = fogKeep(-mv.z);\n' +
        ' float blink = aSize < 0.9 ? step(0.5, fract(uT * 0.9 + position.x * 0.01)) * 0.8 + 0.2 : 1.0;\n' +
        ' vC *= blink;\n' +
        ' gl_PointSize = clamp(uSize * aSize * 1.6 / max(-mv.z, 1.0), 1.5, 48.0);\n' +
        ' gl_Position = projectionMatrix * mv; }',
      fragmentShader:
        'uniform sampler2D uTex; varying vec3 vC; varying float vK;\n' +
        'void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb, t.a * (0.2 + 0.8 * vK)); }'
    }))
    lights.frustumCulled = false; lights.renderOrder = 6; scene.add(lights)
    WORLD.flyers = { list: list, hull: hull, lights: lights }
  }
  const FL = {}
  function updateFlyers(dt) {
    const F = WORLD.flyers; if (!F) return
    if (!FL.m) { FL.m = new THREE.Matrix4(); FL.q = new THREE.Quaternion(); FL.p = new THREE.Vector3(); FL.f = new THREE.Vector3(); FL.s = new THREE.Vector3(1, 1, 1); FL.up = new THREE.Vector3(0, 1, 0); FL.z = new THREE.Vector3(0, 0, 1) }
    const P = F.lights.geometry.attributes.position.array
    F.list.forEach((c, i) => {
      if (c.orbit) {
        c.ph += c.sp * dt
        FL.p.set(c.cx + Math.cos(c.ph) * c.rx, c.y + Math.sin(c.ph * 2.0) * 3, c.cz + Math.sin(c.ph) * c.rz)
        FL.f.set(-Math.sin(c.ph) * c.rx, 0, Math.cos(c.ph) * c.rz).multiplyScalar(Math.sign(c.sp)).normalize()
      } else {
        c.ph += c.sp * dt
        const t = ((c.ph % c.len) + c.len) % c.len - c.len / 2
        if (c.axis === 'x') { FL.p.set(t, c.y, c.cz); FL.f.set(Math.sign(c.sp), 0, 0) }
        else { FL.p.set(c.cx, c.y, -40 + t * .8 - 180); FL.f.set(0, 0, Math.sign(c.sp)) }
      }
      FL.q.setFromUnitVectors(FL.z, FL.f)
      FL.m.compose(FL.p, FL.q, FL.s); F.hull.setMatrixAt(i, FL.m)
      const k = i * 9
      P[k] = FL.p.x + FL.f.x * 2.4; P[k + 1] = FL.p.y; P[k + 2] = FL.p.z + FL.f.z * 2.4
      P[k + 3] = FL.p.x - FL.f.x * 2.4; P[k + 4] = FL.p.y + .1; P[k + 5] = FL.p.z - FL.f.z * 2.4
      P[k + 6] = FL.p.x; P[k + 7] = FL.p.y - .6; P[k + 8] = FL.p.z
    })
    F.hull.instanceMatrix.needsUpdate = true
    F.lights.geometry.attributes.position.needsUpdate = true
  }

  /* --------------------------------------------------- holographic panels
     Hung on the faces of towers that look back at the walk. Additive, so
     they add light rather than painting over the facade, with a scanline
     and the occasional dropped frame worked in on top. */
  function holoMaterial(map, seed, tint) {
    const m = new THREE.MeshBasicMaterial({ map: map, color: tint || hdr(1.5, 1.5, 1.6), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: true })
    m.onBeforeCompile = sh => {
      sh.uniforms.uT = WORLD.uT; sh.uniforms.uQuiet = WORLD.uQuiet; sh.uniforms.uSeed = { value: seed }
      sh.fragmentShader = 'uniform float uT; uniform float uQuiet; uniform float uSeed;\n' + sh.fragmentShader.replace('#include <map_fragment>',
        '#include <map_fragment>\n' +
        'float scan = 0.80 + 0.20 * sin(vUv.y * 520.0 + uT * 5.0);\n' +
        'float roll = smoothstep(0.0, 0.04, abs(fract(vUv.y - uT * 0.12) - 0.5));\n' +
        'float drop = 1.0 - 0.75 * step(0.985, fract(sin(floor(uT * 9.0) * 12.9898 + uSeed) * 43758.5453));\n' +
        'diffuseColor.rgb *= scan * (0.75 + 0.25 * roll) * drop * (1.0 - 0.6 * uQuiet);\n')
    }
    return m
  }
  function buildHolograms() {
    const rnd = mulberry32(31)
    const kinds = ['network', 'signal', 'flow', 'core', 'trend']
    const cands = WORLD.towers.filter(t => !t.own && t.top > -36 && t.z < -50 && t.z > -330 && Math.abs(t.x) < 190 && t.w > 10)
    cands.sort((a, b) => (Math.hypot(a.x, a.z + 120) - Math.hypot(b.x, b.z + 120)))
    const pick = []
    for (let i = 0; i < cands.length && pick.length < (LOW ? 6 : 12); i++) if (rnd() > .35) pick.push(cands[i])
    WORLD.holos = []
    pick.forEach((t, i) => {
      const banner = i % 4 === 3
      const kind = banner ? 'banner' : kinds[i % kinds.length]
      const map = tx(texHolo(kind, 11 + i))
      const front = Math.abs(t.x) < 60 || i % 3 === 0
      const fw = front ? t.w : t.d
      const w = banner ? Math.min(fw * .42, 7) : Math.min(fw * .82, 22)
      const h = banner ? w * 2 : w * .625
      const tint = i % 5 === 1 ? hdr(1.7, 1.2, 1.2) : null
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), holoMaterial(map, i * 1.7, tint))
      const y = t.top - h / 2 - 3 - rnd() * 8
      if (front) m.position.set(t.x, y, t.z + t.d / 2 + .5)
      else { const s = t.x > 0 ? -1 : 1; m.position.set(t.x + s * (t.w / 2 + .5), y, t.z); m.rotation.y = s * Math.PI / 2 }
      m.renderOrder = 4; scene.add(m); WORLD.holos.push(m)
    })
    /* the big one: a display the size of a building, facing the roof */
    const big = new THREE.Mesh(new THREE.PlaneGeometry(52, 30), holoMaterial(tx(texHolo('network', 3)), 9.3, hdr(1.35, 1.45, 1.7)))
    big.position.set(-70, -6, -186); big.rotation.y = .32; big.renderOrder = 4
    scene.add(big); WORLD.holos.push(big)
    const frame = new THREE.Mesh(new THREE.BoxGeometry(56, 34, 3),
      new THREE.MeshStandardMaterial({ color: 0x0b1018, roughness: .5, metalness: .7 }))
    frame.position.set(-70 - Math.sin(.32) * 2, -6, -186 - Math.cos(.32) * 2); frame.rotation.y = .32; scene.add(frame)
    const legs = new THREE.Mesh(new THREE.BoxGeometry(6, 80, 6), frame.material)
    legs.position.set(-70 - Math.sin(.32) * 2, -6 - 17 - 40, -186 - Math.cos(.32) * 2); legs.rotation.y = .32; scene.add(legs)
  }

  /* ------------------------------------------------------ the neural mesh
     Rooftops wired to each other and to the core. Faint lines, with packets
     of light running along them — mostly blue; red is a signal. */
  function buildNetwork() {
    const rnd = mulberry32(4242)
    const tops = WORLD.towers.filter(t => !t.own && t.top > -50 && Math.hypot(t.x - CORE.x, t.z - CORE.z) < 260 && t.z < -30)
    const nodes = []
    for (let i = 0; i < tops.length && nodes.length < (LOW ? 22 : 40); i++) {
      if (rnd() > .55) continue
      const t = tops[i]
      nodes.push(new THREE.Vector3(t.x, t.top + 2.5, t.z))
    }
    const crown = new THREE.Vector3(CORE.x, WORLD.coreTop, CORE.z)
    const edges = []
    nodes.forEach((p, i) => {
      const near = nodes.map((q, j) => [j, p.distanceToSquared(q)]).filter(e => e[0] !== i).sort((a, b) => a[1] - b[1])
      near.slice(0, 2).forEach(e => { if (e[0] > i) edges.push([p, nodes[e[0]]]) })
      if (i % 3 === 0) edges.push([p, crown])
    })
    const SEG = 14
    const pos = [], at = [], sd = []
    edges.forEach(e => {
      const a = e[0], b = e[1], len = a.distanceTo(b), lift = len * .12, s = rnd()
      for (let k = 0; k < SEG; k++) {
        ;[k, k + 1].forEach(j => {
          const t = j / SEG
          pos.push(lerp(a.x, b.x, t), lerp(a.y, b.y, t) + Math.sin(t * Math.PI) * lift, lerp(a.z, b.z, t))
          at.push(t); sd.push(s)
        })
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('aT', new THREE.Float32BufferAttribute(at, 1))
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(sd, 1))
    const lines = new THREE.LineSegments(g, new THREE.ShaderMaterial({
      uniforms: { uT: WORLD.uT, uFocus: WORLD.uFocus, uFogD: { value: scene.fog.density * .7 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader:
        'attribute float aT; attribute float aSeed; varying float vT; varying float vS; varying float vK;\n' + FOG_GLSL +
        'void main(){ vT = aT; vS = aSeed; vec4 mv = modelViewMatrix * vec4(position, 1.0); vK = fogKeep(-mv.z);\n' +
        ' gl_Position = projectionMatrix * mv; }',
      fragmentShader:
        'uniform float uT; uniform float uFocus; varying float vT; varying float vS; varying float vK;\n' +
        'void main(){\n' +
        ' float head = fract(uT * (0.10 + vS * 0.12) + vS * 7.0);\n' +
        ' float p = exp(-pow((vT - head) * 16.0, 2.0));\n' +
        ' vec3 base = vec3(0.30, 0.55, 1.4);\n' +
        ' vec3 hot = vS > 0.9 ? vec3(3.2, 0.3, 0.2) : vec3(0.9, 1.5, 3.2);\n' +
        ' float a = (0.07 + 0.08 * uFocus) + p * (0.85 + 0.6 * uFocus);\n' +
        ' gl_FragColor = vec4(mix(base, hot, p), a * (0.25 + 0.75 * vK)); }'
    }))
    lines.frustumCulled = false; lines.renderOrder = 5; scene.add(lines)

    const ng = new THREE.BufferGeometry()
    ng.setAttribute('position', new THREE.Float32BufferAttribute(nodes.flatMap(p => [p.x, p.y, p.z]), 3))
    ng.setAttribute('aSeed', new THREE.Float32BufferAttribute(nodes.map(() => rnd()), 1))
    const dots = new THREE.Points(ng, new THREE.ShaderMaterial({
      uniforms: { uTex: { value: tx(texGlow()) }, uSize: { value: vpH() * .5 }, uT: WORLD.uT, uFocus: WORLD.uFocus, uFogD: { value: scene.fog.density * .7 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader:
        'attribute float aSeed; uniform float uSize; uniform float uT; uniform float uFocus; varying float vS; varying float vK;\n' + FOG_GLSL +
        'void main(){ vS = aSeed; vec4 mv = modelViewMatrix * vec4(position, 1.0); vK = fogKeep(-mv.z);\n' +
        ' float beat = 0.8 + 0.2 * sin(uT * 2.0 + aSeed * 30.0);\n' +
        ' gl_PointSize = clamp(uSize * (3.0 + uFocus * 1.5) * beat / max(-mv.z, 1.0), 2.0, 40.0);\n' +
        ' gl_Position = projectionMatrix * mv; }',
      fragmentShader:
        'uniform sampler2D uTex; varying float vS; varying float vK;\n' +
        'void main(){ vec4 t = texture2D(uTex, gl_PointCoord);\n' +
        ' vec3 c = vS > 0.86 ? vec3(3.2, 0.3, 0.22) : vec3(0.7, 1.3, 3.0);\n' +
        ' gl_FragColor = vec4(c * t.rgb, t.a * (0.25 + 0.75 * vK)); }'
    }))
    dots.frustumCulled = false; dots.renderOrder = 6; scene.add(dots)
    WORLD.network = { lines: lines, dots: dots }
  }

  /* --------------------------------------------------- the giant wordmark */
  const WORD_Z = -11.0
  const WORD = { glyphs: [], group: null, ink: null, reveal: 0 }
  function buildWordmark() {
    /* Set to the frame width, so the letters are spaced out rather than made
       taller. It stands past the parapet, over the drop, and rises from
       behind it the way Kage's rose from behind the grass. */
    const SZ = 320, TRACK = .30, PAD = 26
    const FONT = '600 ' + SZ + 'px "Space Grotesk", system-ui, sans-serif'
    const m = cvs(4, 4).getContext('2d')
    m.font = FONT
    m.textBaseline = 'alphabetic'; m.textAlign = 'left'
    const word = 'DHRUV', gl = []
    let pen = 0, ascMax = 0, descMax = 0, xMin = 1e9, xMax = -1e9
    for (const ch of word) {
      const t = m.measureText(ch)
      const g = { ch: ch, adv: t.width, asc: t.actualBoundingBoxAscent, desc: t.actualBoundingBoxDescent,
                  l: t.actualBoundingBoxLeft, r: t.actualBoundingBoxRight, pen: pen }
      gl.push(g)
      ascMax = Math.max(ascMax, g.asc); descMax = Math.max(descMax, g.desc)
      xMin = Math.min(xMin, pen - g.l); xMax = Math.max(xMax, pen + g.r)
      pen += t.width + TRACK * SZ
    }
    const group = new THREE.Group()
    WORD.glyphs = []
    gl.forEach(g => {
      const cw = Math.ceil(g.l + g.r) + PAD * 2, chh = Math.ceil(g.asc + g.desc) + PAD * 2
      const c = cvs(cw, chh), x = c.getContext('2d')
      x.font = FONT
      x.textBaseline = 'alphabetic'; x.textAlign = 'left'
      /* one vertical wash shared by the word: subtle white going to steel */
      const gy0 = PAD + g.asc - ascMax, gy1 = PAD + g.asc + descMax * .4
      const grad = x.createLinearGradient(0, gy0, 0, gy1)
      grad.addColorStop(0, 'rgb(236,242,250)')
      grad.addColorStop(.52, 'rgb(200,214,232)')
      grad.addColorStop(1, 'rgb(132,154,186)')
      x.fillStyle = grad
      x.fillText(g.ch, PAD + g.l, PAD + g.asc)
      /* a fine raster through the letter, so it reads as light in the air */
      x.globalCompositeOperation = 'destination-out'
      x.fillStyle = 'rgba(0,0,0,.22)'
      for (let yy = 0; yy < chh; yy += 6) x.fillRect(0, yy, cw, 2)
      x.globalCompositeOperation = 'source-over'

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cw, chh),
        new THREE.MeshBasicMaterial({ map: tx(c, { aniso: 16 }), transparent: true,
          depthWrite: false, side: THREE.DoubleSide, fog: true, opacity: 1 }))
      mesh.position.set(g.pen + (g.r - g.l) / 2, (g.asc - g.desc) / 2, 0)
      mesh.renderOrder = 12
      mesh.frustumCulled = false
      mesh.userData.baseY = mesh.position.y
      group.add(mesh)
      WORD.glyphs.push(mesh)
    })
    group.position.z = WORD_Z
    scene.add(group)
    WORD.group = group
    WORD.ink = { xMin: xMin, xMax: xMax, cx: (xMin + xMax) / 2, w: xMax - xMin, asc: ascMax }
  }

  /* --------------------------------------------------------- atmospherics
     Kage's haze, embers and rain held a courtyard. The walk here covers two
     hundred metres, so the weather is wrapped round the camera in the shader
     instead: every drop keeps a real world position, and any that falls too
     far from the lens is folded back across it. */
  function buildAtmosphere() {
    const hazeTex = tx(texGlow('rgba(150,185,230,.55)', 'rgba(90,130,200,.18)'))
    WORLD.haze = []
    const rnd = mulberry32(66)
    const n = LOW ? 6 : 10
    for (let i = 0; i < n; i++) {
      const s = 34 + rnd() * 50
      const h = new THREE.Mesh(new THREE.PlaneGeometry(s, s * .5),
        new THREE.MeshBasicMaterial({ map: hazeTex, transparent: true, blending: THREE.AdditiveBlending,
          depthWrite: false, fog: false, opacity: .035 + rnd() * .05 }))
      const p = curveP.getPoint(.12 + (i / n) * .88)
      h.position.set(p.x + (rnd() - .5) * 80, p.y - 8 - rnd() * 26, p.z - 30 - rnd() * 60)
      h.renderOrder = 4
      h.userData = { sp: .03 + rnd() * .06, ph: rnd() * TAU, x0: h.position.x }
      scene.add(h); WORLD.haze.push(h)
    }

    /* data motes, drifting up through the air round the walk */
    const N = LOW ? 260 : 620, R = 34
    const pos = new Float32Array(N * 3), seed = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (rnd() - .5) * 2 * R; pos[i * 3 + 1] = (rnd() - .5) * 2 * R; pos[i * 3 + 2] = (rnd() - .5) * 2 * R
      seed[i] = rnd()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const emb = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: { uT: WORLD.uT, uCam: WORLD.uCam, uR: { value: R }, uTex: { value: tx(texGlow('rgba(210,230,255,1)', 'rgba(110,160,255,.35)')) },
        uSize: { value: vpH() * .5 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader:
        'attribute float aSeed; uniform float uT; uniform float uSize; uniform vec3 uCam; uniform float uR; varying float vA; varying float vS;\n' +
        'void main(){ vec3 p = position;\n' +
        ' p.y += uT * (0.25 + aSeed * 0.5);\n' +
        ' p.x += sin(uT * 0.36 + aSeed * 22.0) * 1.2;\n' +
        ' p.z += cos(uT * 0.29 + aSeed * 17.0) * 1.0;\n' +
        ' p = mod(p - uCam + uR, 2.0 * uR) + uCam - uR;\n' +
        ' vec4 mv = modelViewMatrix * vec4(p, 1.0);\n' +
        ' float d = length(p - uCam) / uR;\n' +
        ' vA = (0.25 + aSeed * 0.75) * (1.0 - smoothstep(0.6, 1.0, d)); vS = aSeed;\n' +
        ' gl_PointSize = uSize * (0.012 + aSeed * 0.022) / max(-mv.z, 0.6);\n' +
        ' gl_Position = projectionMatrix * mv; }',
      fragmentShader:
        'uniform sampler2D uTex; varying float vA; varying float vS;\n' +
        'void main(){ vec4 t = texture2D(uTex, gl_PointCoord);\n' +
        ' vec3 c = vS > 0.94 ? vec3(1.9, 0.3, 0.25) : vec3(0.75, 1.0, 1.5);\n' +
        ' gl_FragColor = vec4(t.rgb * c, t.a * vA * 0.7); }'
    }))
    emb.frustumCulled = false; emb.renderOrder = 5
    scene.add(emb); WORLD.embers = emb

    /* rain, wrapped the same way */
    if (!LOW) {
      const D = 1400, RR = 30, rp = new Float32Array(D * 2 * 3), rt = new Float32Array(D * 2), rs = new Float32Array(D * 2), rl = new Float32Array(D * 2)
      for (let i = 0; i < D; i++) {
        const x = (rnd() - .5) * 2 * RR, z = (rnd() - .5) * 2 * RR, y = (rnd() - .5) * 2 * RR, sp = 8 + rnd() * 9, ln = .35 + rnd() * .6
        for (let k = 0; k < 2; k++) {
          const o = (i * 2 + k) * 3
          rp[o] = x; rp[o + 1] = y; rp[o + 2] = z
          rt[i * 2 + k] = k; rs[i * 2 + k] = sp; rl[i * 2 + k] = ln
        }
      }
      const rg = new THREE.BufferGeometry()
      rg.setAttribute('position', new THREE.BufferAttribute(rp, 3))
      rg.setAttribute('aTop', new THREE.BufferAttribute(rt, 1))
      rg.setAttribute('aSpeed', new THREE.BufferAttribute(rs, 1))
      rg.setAttribute('aLen', new THREE.BufferAttribute(rl, 1))
      const rain = new THREE.LineSegments(rg, new THREE.ShaderMaterial({
        uniforms: { uT: WORLD.uT, uCam: WORLD.uCam, uR: { value: RR }, uQuiet: WORLD.uQuiet },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        vertexShader:
          'attribute float aTop; attribute float aSpeed; attribute float aLen; uniform float uT; uniform vec3 uCam; uniform float uR; varying float vA;\n' +
          'void main(){ vec3 p = position;\n' +
          ' p.y -= uT * aSpeed;\n' +
          ' p = mod(p - uCam + uR, 2.0 * uR) + uCam - uR;\n' +
          ' p.y += aTop * aLen; p.x += aTop * aLen * 0.08;\n' +
          ' float d = length(p - uCam) / uR;\n' +
          ' vA = 1.0 - smoothstep(0.55, 1.0, d);\n' +
          ' gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
        fragmentShader: 'uniform float uQuiet; varying float vA;\nvoid main(){ gl_FragColor = vec4(0.58, 0.74, 1.0, vA * 0.05 * (1.0 - 0.75 * uQuiet)); }'
      }))
      rain.frustumCulled = false; rain.renderOrder = 6
      scene.add(rain); WORLD.rain = rain
    }

    /* ripples on the standing water of the roof deck */
    const ringC = cvs(256, 256), rx2 = ringC.getContext('2d')
    const rg2 = rx2.createRadialGradient(128, 128, 84, 128, 128, 128)
    rg2.addColorStop(0, 'rgba(255,255,255,0)'); rg2.addColorStop(.62, 'rgba(255,255,255,.55)')
    rg2.addColorStop(.86, 'rgba(255,255,255,.22)'); rg2.addColorStop(1, 'rgba(255,255,255,0)')
    rx2.fillStyle = rg2; rx2.fillRect(0, 0, 256, 256)
    const ringTex = tx(ringC)
    WORLD.ripples = []
    for (let i = 0; i < (LOW ? 6 : 13); i++) {
      const r = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, blending: THREE.AdditiveBlending,
          depthWrite: false, fog: true, opacity: 0, color: 0xbcd4ff }))
      r.rotation.x = -Math.PI / 2; r.renderOrder = 7
      r.userData = { t: rnd() * 4, x: (rnd() - .5) * 30, z: -3 + rnd() * 22, sp: .5 + rnd() * .5 }
      scene.add(r); WORLD.ripples.push(r)
    }
  }

  /* ==================================================== 6c · the cursor wisps
     A drift of cold motes that follows the pointer. A child of the camera,
     so the pointer maps straight into camera space; emission is by distance
     travelled, so a slow hand lays a drift and a fast one throws it apart. */
  const WISP_D = 3.4
  const WISP = { list: [], i: 0, acc: 0, ex: 0, ey: 0, lx: 0, ly: 0, idle: 0, seen: false }
  function buildWisps() {
    if (COARSE) return
    const N = LOW ? 90 : 190
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    g.setAttribute('aA', new THREE.BufferAttribute(new Float32Array(N), 1))
    g.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(N), 1))
    const pts = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: { uTex: { value: tx(texWisp()) }, uPx: { value: vpH() } },
      transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, depthTest: false, fog: false,
      vertexShader:
        'attribute float aA; attribute float aS;\n' +
        'uniform float uPx; varying float vA;\n' +
        'void main(){ vA = aA;\n' +
        ' vec4 mv = modelViewMatrix * vec4(position,1.0);\n' +
        ' gl_PointSize = uPx * aS / max(-mv.z, 0.4);\n' +
        ' gl_Position = projectionMatrix * mv; }',
      fragmentShader:
        'uniform sampler2D uTex; varying float vA;\n' +
        'void main(){ if (vA <= 0.0) discard;\n' +
        ' vec4 t = texture2D(uTex, gl_PointCoord);\n' +
        ' gl_FragColor = vec4(t.rgb, t.a * vA); }'
    }))
    pts.frustumCulled = false; pts.renderOrder = 9
    pts.layers.set(1)
    camera.add(pts)
    WISP.mesh = pts
    for (let i = 0; i < N; i++) WISP.list.push({ life: 0, max: 1, vx: 0, vy: 0, sz: 0, ph: 0 })
  }
  function wispPoint(nx, ny) {
    const hh = Math.tan(camera.fov * Math.PI / 360) * WISP_D
    return [nx * hh * camera.aspect, ny * hh]
  }
  function updateWisps(dt) {
    if (!WISP.mesh) return
    const g = WISP.mesh.geometry
    const P = g.attributes.position.array, A = g.attributes.aA.array
    const S = g.attributes.aS.array
    const L = WISP.list, N = L.length
    const pt = wispPoint(RIG.tmx, RIG.tmy)
    if (!WISP.seen) { WISP.ex = WISP.lx = pt[0]; WISP.ey = WISP.ly = pt[1]; WISP.seen = true }
    WISP.ex = damp(WISP.ex, pt[0], 16, dt)
    WISP.ey = damp(WISP.ey, pt[1], 16, dt)
    const dx = WISP.ex - WISP.lx, dy = WISP.ey - WISP.ly
    const moved = Math.hypot(dx, dy)
    const ang = moved > 1e-5 ? Math.atan2(dy, dx) : 0
    const spawn = (x, y, a, weak) => {
      const i = WISP.i; WISP.i = (i + 1) % N
      const w = L[i], k = i * 3
      P[k] = x + (Math.random() + Math.random() - 1) * .30
      P[k + 1] = y + (Math.random() + Math.random() - 1) * .30
      P[k + 2] = -WISP_D + (Math.random() - .5) * .9
      w.life = 0; w.max = (weak ? 2.1 : 1.45) + Math.random() * 1.3
      w.vx = -Math.cos(a) * .09 + (Math.random() - .5) * .38
      w.vy = -Math.sin(a) * .09 + (Math.random() - .5) * .32 + .02
      w.sz = (weak ? .018 : .024) + Math.random() * .026
      w.ph = Math.random() * TAU
    }
    WISP.acc += moved
    const STEP = .030
    let guard = 0
    while (WISP.acc >= STEP && guard++ < 14) {
      WISP.acc -= STEP
      const t = moved > 1e-6 ? Math.min(1, guard * STEP / moved) : 0
      spawn(WISP.lx + dx * t, WISP.ly + dy * t, ang, false)
    }
    WISP.idle += dt
    if (WISP.idle > .42) { WISP.idle = 0; spawn(WISP.ex, WISP.ey, Math.random() * TAU, true) }
    WISP.lx = WISP.ex; WISP.ly = WISP.ey
    for (let i = 0; i < N; i++) {
      const w = L[i], k = i * 3
      if (w.life >= w.max) { A[i] = 0; continue }
      w.life += dt
      const u = w.life / w.max
      P[k]     += (w.vx + Math.sin(clock * 1.3 + w.ph) * .17) * dt
      P[k + 1] += (w.vy + Math.cos(clock * 1.1 + w.ph * 1.7) * .14) * dt
      w.vx *= 1 - .5 * dt; w.vy = w.vy * (1 - .5 * dt) + .022 * dt
      A[i] = smooth(0, .12, u) * (1 - smooth(.22, 1, u)) * .9
      S[i] = w.sz * (1 + u * .55)
    }
    g.attributes.position.needsUpdate = true
    g.attributes.aA.needsUpdate = true
    g.attributes.aS.needsUpdate = true
  }

  function buildLights() {
    scene.add(new THREE.HemisphereLight(0x40608f, 0x05070c, .26))
    /* a cold key from high over the left shoulder; it casts the roof's
       shadows and nothing else does */
    const key = new THREE.DirectionalLight(0xa9c4ff, .95)
    key.position.set(-14, 26, 22)
    key.target.position.set(0, 0, 2); scene.add(key.target)
    if (WANT_SHADOW) {
      key.castShadow = true
      const S = LOW ? 1024 : 2048
      key.shadow.mapSize.set(S, S)
      const c = key.shadow.camera
      c.left = -30; c.right = 30; c.top = 30; c.bottom = -30; c.near = 3; c.far = 90
      key.shadow.bias = -0.0012; key.shadow.normalBias = .035; key.shadow.radius = 2.2
    }
    scene.add(key); WORLD.key = key
    /* the city's own light coming back up off the cloud: a blue rim from the
       core's side, a trace of signal red from the right */
    const rim = new THREE.DirectionalLight(0x3f7dff, .75)
    rim.position.set(CORE.x, 30, CORE.z); rim.target.position.set(0, -20, 0); scene.add(rim.target); scene.add(rim)
    const red = new THREE.DirectionalLight(0xff3324, .22)
    red.position.set(160, 10, -60); scene.add(red)
    /* the roof's own fill, and the warning light's spill on the mast corner */
    const fill = new THREE.PointLight(0x7fa6ff, 1.1, 34, 2)
    fill.position.set(-2, 7.5, 6); scene.add(fill)
    const warn = new THREE.PointLight(0xff2a1c, 1.6, 14, 2)
    warn.position.set(19.4, 14.4, -3.0); scene.add(warn); WORLD.warnLight = warn
  }

  /* ================================================== 7 · post-processing */
  const POST = { levels: [] }
  const QUAD_VS = 'varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }'

  function initPost() {
    POST.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    POST.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null)
    POST.quad.frustumCulled = false
    POST.qScene = new THREE.Scene(); POST.qScene.add(POST.quad)
    POST.up = new THREE.ShaderMaterial({
      uniforms: { tS: { value: null }, uAmt: { value: 1 } }, vertexShader: QUAD_VS,
      fragmentShader: 'uniform sampler2D tS; uniform float uAmt; varying vec2 vUv;\nvoid main(){ gl_FragColor = vec4(texture2D(tS,vUv).rgb*uAmt, 1.0); }',
      blending: THREE.AdditiveBlending, transparent: true, depthTest: false, depthWrite: false
    })
    if (!WANT_POST) return
    const w = renderer.domElement.width, h = renderer.domElement.height
    const O = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, depthBuffer: false, stencilBuffer: false }
    POST.scene = new THREE.WebGLRenderTarget(w, h, Object.assign({}, O, { depthBuffer: true, samples: LOW ? 0 : 2 }))
    let lw = Math.max(2, w >> 1), lh = Math.max(2, h >> 1)
    const N = 4
    for (let i = 0; i < N; i++) {
      POST.levels.push({ a: new THREE.WebGLRenderTarget(lw, lh, O), b: new THREE.WebGLRenderTarget(lw, lh, O), w: lw, h: lh })
      lw = Math.max(2, lw >> 1); lh = Math.max(2, lh >> 1)
    }
    POST.bright = new THREE.ShaderMaterial({
      uniforms: { tS: { value: null }, uThr: { value: .86 }, uKnee: { value: .50 } },
      vertexShader: QUAD_VS,
      fragmentShader:
        'uniform sampler2D tS; uniform float uThr; uniform float uKnee; varying vec2 vUv;\n' +
        'void main(){ vec3 c = texture2D(tS, vUv).rgb;\n' +
        ' float l = dot(c, vec3(0.2126,0.7152,0.0722));\n' +
        ' float k = smoothstep(uThr, uThr+uKnee, l);\n' +
        ' gl_FragColor = vec4(c*k, 1.0); }'
    })
    POST.blur = new THREE.ShaderMaterial({
      uniforms: { tS: { value: null }, uDir: { value: new THREE.Vector2(1, 0) } },
      vertexShader: QUAD_VS,
      fragmentShader:
        'uniform sampler2D tS; uniform vec2 uDir; varying vec2 vUv;\n' +
        'void main(){ vec3 c = texture2D(tS, vUv).rgb * 0.2270270270;\n' +
        ' c += texture2D(tS, vUv + uDir*1.3846153846).rgb * 0.3162162162;\n' +
        ' c += texture2D(tS, vUv - uDir*1.3846153846).rgb * 0.3162162162;\n' +
        ' c += texture2D(tS, vUv + uDir*3.2307692308).rgb * 0.0702702703;\n' +
        ' c += texture2D(tS, vUv - uDir*3.2307692308).rgb * 0.0702702703;\n' +
        ' gl_FragColor = vec4(c, 1.0); }'
    })
    POST.comp = new THREE.ShaderMaterial({
      uniforms: {
        tS: { value: null }, tB: { value: null }, uRes: { value: new THREE.Vector2(w, h) },
        uT: { value: 0 }, uBloom: { value: .42 }, uCA: { value: 1 }, uGrain: { value: .020 },
        uVig: { value: 1 }, uExp: { value: .74 }, uFade: { value: 1 }, uSat: { value: 1.04 }
      },
      vertexShader: QUAD_VS,
      fragmentShader:
        'uniform sampler2D tS; uniform sampler2D tB; uniform vec2 uRes;\n' +
        'uniform float uT, uBloom, uCA, uGrain, uVig, uExp, uFade, uSat;\n' +
        'varying vec2 vUv;\n' +
        'vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }\n' +
        'void main(){\n' +
        ' vec2 d = vUv - 0.5; float r2 = dot(d,d);\n' +
        ' float ca = uCA * (0.30 + r2*2.6) * 0.0013;\n' +
        ' vec3 c;\n' +
        ' c.r = texture2D(tS, vUv + d*ca).r;\n' +
        ' c.g = texture2D(tS, vUv).g;\n' +
        ' c.b = texture2D(tS, vUv - d*ca).b;\n' +
        ' c += texture2D(tB, vUv).rgb * uBloom;\n' +
        ' c *= uExp;\n' +
        ' c = aces(c);\n' +
        ' float l = dot(c, vec3(0.2126,0.7152,0.0722));\n' +
        ' c = mix(vec3(l), c, uSat);\n' +
        /* Kage graded teal shadows under warm highs. The city is blue
           infrastructure under white light, so the shadows go to navy and the
           highs stay neutral-cool. */
        ' c = mix(c, c*vec3(0.78,0.94,1.16), smoothstep(0.55,0.0,l)*0.80);\n' +
        ' c = mix(c, c*vec3(1.0,1.0,1.02), smoothstep(0.50,1.0,l)*0.26);\n' +
        ' float v = smoothstep(1.22, 0.26, length(d*vec2(1.0,0.94))*1.42);\n' +
        ' c *= mix(1.0, v, uVig);\n' +
        ' float g = fract(sin(dot(vUv*uRes + uT*137.0, vec2(12.9898,78.233)))*43758.5453);\n' +
        ' c += (g-0.5)*uGrain;\n' +
        ' c *= uFade;\n' +
        ' vec3 e = pow(max(c,0.0), vec3(1.0/2.2));\n' +
        ' e = clamp((e - 0.30) * 1.00 + 0.30, 0.0, 1.0);\n' +
        ' gl_FragColor = vec4( e, 1.0 );\n' +
        '}'
    })
  }
  function pass(mat, target, additive) {
    POST.quad.material = mat
    renderer.setRenderTarget(target || null)
    if (!additive) renderer.clear(true, false, false)
    renderer.render(POST.qScene, POST.cam)
  }
  function renderPost() {
    const L = POST.levels
    POST.bright.uniforms.tS.value = POST.scene.texture
    pass(POST.bright, L[0].a)
    for (let i = 0; i < L.length; i++) {
      if (i > 0) { POST.up.blending = THREE.NoBlending; POST.up.uniforms.uAmt.value = 1; POST.up.uniforms.tS.value = L[i - 1].a; pass(POST.up, L[i].a) }
      POST.blur.uniforms.tS.value = L[i].a; POST.blur.uniforms.uDir.value.set(1 / L[i].w, 0); pass(POST.blur, L[i].b)
      POST.blur.uniforms.tS.value = L[i].b; POST.blur.uniforms.uDir.value.set(0, 1 / L[i].h); pass(POST.blur, L[i].a)
    }
    POST.up.blending = THREE.AdditiveBlending; POST.up.uniforms.uAmt.value = .52
    for (let i = L.length - 1; i > 0; i--) { POST.up.uniforms.tS.value = L[i].a; pass(POST.up, L[i - 1].a, true) }
    POST.comp.uniforms.tS.value = POST.scene.texture
    POST.comp.uniforms.tB.value = L[0].a
    pass(POST.comp, null)
  }

  /* ================================================= 8 · the camera rig
     One waypoint per [data-cam] section: the roof, the core, the network,
     the highway, the infrastructure, the highest point. */
  const CAM = [
    { p: [  0.0,   4.20,  13.6 ], t: [  7.0,  -4.0,  -90.0 ], fov: 40 },  /* 0 city overview  */
    { p: [ -8.0,  -6.00, -40.0 ], t: [ 18.0,   8.0, -168.0 ], fov: 46 },  /* 1 the AI core    */
    { p: [ 34.0,   6.00, -84.0 ], t: [-30.0, -26.0, -150.0 ], fov: 48 },  /* 2 project mesh   */
    { p: [-34.0, -36.00, -78.0 ], t: [ 40.0, -44.0, -128.0 ], fov: 50 },  /* 3 system log     */
    { p: [ -6.0, -58.00, -128.0], t: [ 22.0,  -6.0, -176.0 ], fov: 54 },  /* 4 technology     */
    { p: [-40.0,  58.00, -46.0 ], t: [ 16.0,  14.0, -168.0 ], fov: 42 }   /* 5 connection     */
  ]
  /* the live windows: a camera each, named rather than numbered so the page
     can hang any subsystem on any card */
  const VIEWS = {
    core:     { p: [ -10.0,  40.0, -104.0 ], t: [ CORE.x, 60.0, CORE.z ], fov: 30 },
    network:  { p: [  60.0,  30.0, -110.0 ], t: [ -20.0, -20.0, -200.0 ], fov: 44 },
    finance:  { p: [ -22.0,  -2.0, -120.0 ], t: [ -70.0,  -6.0, -186.0 ], fov: 40 },
    route:    { p: [ -60.0, -20.0, -60.0  ], t: [   0.0, -44.0, -112.0 ], fov: 44 },
    health:   { p: [  50.0, -20.0, -140.0 ], t: [ CORE.x, -40.0, CORE.z ], fov: 40 },
    builders: { p: [ -40.0,  20.0, -230.0 ], t: [  20.0, -30.0, -170.0 ], fov: 46 },
    grid:     { p: [  10.0,  70.0, -60.0  ], t: [  10.0, -90.0, -180.0 ], fov: 40 }
  }
  const RIG = { prog: 0, smooth: 0, mx: 0, my: 0, tmx: 0, tmy: 0, intro: 0, focus: -1, focusAmt: 0 }
  let curveP, curveT, tmpCam, _p, _t, _d

  function buildRig() {
    _p = new THREE.Vector3(); _t = new THREE.Vector3(); _d = new THREE.Vector3()
    curveP = new THREE.CatmullRomCurve3(CAM.map(c => new THREE.Vector3(c.p[0], c.p[1], c.p[2])), false, 'catmullrom', .42)
    curveT = new THREE.CatmullRomCurve3(CAM.map(c => new THREE.Vector3(c.t[0], c.t[1], c.t[2])), false, 'catmullrom', .42)
    tmpCam = new THREE.PerspectiveCamera(CAM[0].fov, vpW() / vpH(), .35, 900)
    camera.layers.enable(1); camera.layers.enable(2)
  }
  /* Every waypoint is composed for a wide frame. On a tall one the rig steps
     back along its own view axis and opens up instead of cropping the core. */
  function aspectFix() { return clamp((1.62 - vpW() / vpH()) / 1.05, 0, 1) }
  function fitAspect(p, t, fov) {
    const nf = aspectFix()
    if (nf <= 0) return fov
    _d.subVectors(p, t).normalize()
    p.addScaledVector(_d, nf * 8.2)
    p.y += nf * 1.1
    return fov * (1 + nf * .40)
  }
  function applyCamera() {
    const N = CAM.length - 1
    const u = clamp(RIG.smooth / N, 0, 1)
    curveP.getPoint(u, _p); curveT.getPoint(u, _t)
    const i = clamp(Math.floor(RIG.smooth), 0, N - 1), f = clamp(RIG.smooth - i, 0, 1)
    let fov = lerp(CAM[i].fov, CAM[i + 1].fov, f)
    fov = fitAspect(_p, _t, fov)
    /* the opening dolly: a long lens easing in from further back */
    const io = 1 - RIG.intro
    _p.z += io * 5.6; _p.y += io * 0.65; fov += io * 8
    /* parallax — a hand-held drift, never enough to break the frame */
    const par = 1 - smooth(0, 1.6, RIG.smooth) * .55
    _p.x += RIG.mx * 0.62 * par; _p.y += RIG.my * 0.34 * par
    _t.x -= RIG.mx * 0.20 * par * 3; _t.y -= RIG.my * 0.12 * par * 3
    camera.position.copy(_p)
    camera.lookAt(_t)
    if (Math.abs(camera.fov - fov) > 1e-4) { camera.fov = fov; camera.updateProjectionMatrix() }
  }

  /* ============================================== 9 · scroll ↔ chapters */
  const $  = s => root.querySelector(s)
  const $$ = s => [].slice.call(root.querySelectorAll(s))
  let SECS = [], CAMV = []
  let anchors = [], maxScroll = 1, activeSec = 0
  function measure() {
    SECS = $$('[data-cam]')
    /* each section names its own waypoint, so a one-section page parks the
       camera at its district and a route change glides there */
    CAMV = SECS.map(s => clamp(parseFloat(s.dataset.cam) || 0, 0, CAM.length - 1))
    maxScroll = Math.max(1, document.documentElement.scrollHeight - vpH())
    anchors = SECS.map((el, i) => {
      if (i === 0) return 0
      if (i === SECS.length - 1) return maxScroll
      const top = el.getBoundingClientRect().top + scrollY
      return clamp(top + el.offsetHeight * .5 - vpH() * .5, 0, maxScroll)
    })
    for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1)
  }
  function progressFor(y) {
    if (!anchors.length || y <= anchors[0]) return 0
    for (let i = 0; i < anchors.length - 1; i++)
      if (y <= anchors[i + 1]) return i + (y - anchors[i]) / (anchors[i + 1] - anchors[i])
    return anchors.length - 1
  }
  /* section progress → position on the camera path */
  function camAt(p) {
    if (!CAMV.length) return RIG.prog
    const i = Math.floor(p), j = Math.min(i + 1, CAMV.length - 1)
    return lerp(CAMV[i], CAMV[j], p - i)
  }

  /* ============================================ 10 · the wordmark layout */
  function layoutWord() {
    if (!WORD.group) return
    const c = CAM[0]
    const hp = new THREE.Vector3(c.p[0], c.p[1], c.p[2])
    const ht = new THREE.Vector3(c.t[0], c.t[1], c.t[2])
    tmpCam.fov = fitAspect(hp, ht, c.fov)
    tmpCam.aspect = vpW() / vpH()
    tmpCam.position.copy(hp)
    tmpCam.lookAt(ht)
    tmpCam.updateProjectionMatrix(); tmpCam.updateMatrixWorld(true)
    const hit = (nx, ny) => {
      const v = new THREE.Vector3(nx, ny, .5).unproject(tmpCam).sub(tmpCam.position).normalize()
      return tmpCam.position.clone().addScaledVector(v, (WORD_Z - tmpCam.position.z) / v.z)
    }
    const L = hit(-1, 0), R = hit(1, 0)
    /* judge the frame by its shape, not its width: a tall frame forces the
       word up and in */
    const narrow = vpW() / vpH() < 1.05
    const fill = narrow ? .96 : 1.00
    const s = (R.x - L.x) * fill / WORD.ink.w
    const base = hit(0, narrow ? -.06 : -.40)
    WORD.group.scale.setScalar(s)
    WORD.group.position.set(-WORD.ink.cx * s, base.y, WORD_Z)
    WORD.rise = WORD.ink.asc * s * 1.25
  }

  /* =================================================== 11 · page wiring */
  const nav = $('#nav'), preEl = $('#pre'), preFill = $('#pre-fill'), prePct = $('#pre-pct'), preLabel = $('#pre-label')
  const revealed = new WeakSet()
  let revealIO = null
  function wireReveals() {
    const groups = new Map()
    const items = $$('[data-rv], .mask-line')
    items.forEach(el => {
      const key = el.parentElement
      const arr = groups.get(key) || []; arr.push(el); groups.set(key, arr)
    })
    groups.forEach(arr => arr.forEach((el, i) => { if (!el.dataset.rvd) el.dataset.rvd = i * 85 }))
    if (!revealIO) {
      if (!window.IntersectionObserver) { items.forEach(el => el.classList.add('rv-in')); return }
      revealIO = new IntersectionObserver(es => {
        es.forEach(e => {
          if (!e.isIntersecting) return
          revealIO.unobserve(e.target)
          const d = parseFloat(e.target.dataset.rvd || 0)
          later(() => e.target.classList.add('rv-in'), REDUCE ? 0 : d)
        })
      }, { rootMargin: '0px 0px -10% 0px', threshold: .04 })
      observers.push(revealIO)
    }
    items.forEach(el => {
      if (el.closest('#hero') || revealed.has(el) || el.classList.contains('rv-in')) return
      revealed.add(el); revealIO.observe(el)
    })
  }

  /* ------------------------------------------------------ leaving the hero
     Everything along the edges of the hero is spent the moment the walk
     starts. Each piece gets its own window so the hero stands down one
     element at a time; the live window dissolves rather than fades. */
  function wireHeroExit() {
    let seq = [], active = false
    const apply = () => {
      const t = clamp(scrollY / Math.max(1, vpH() * .58), 0, 1)
      if (t <= 0) {
        if (!active) return
        seq.forEach(o => {
          o.el.style.opacity = ''; o.el.style.transform = ''; o.el.style.filter = ''
          o.el.style.pointerEvents = ''; o.el.style.transition = ''
        })
        active = false; return
      }
      active = true
      seq.forEach(o => {
        o.el.style.transition = 'none'
        const a = 1 - smooth(o.at, o.at + o.span, t)
        o.el.style.opacity = a.toFixed(3)
        if (o.shift) o.el.style.transform = 'translate3d(0,' + ((1 - a) * 15).toFixed(1) + 'px,0)'
        if (o.blur) o.el.style.filter = a > .999 ? '' : 'blur(' + ((1 - a) * o.blur).toFixed(1) + 'px)'
        o.el.style.pointerEvents = a < .05 ? 'none' : ''
      })
    }
    /* re-collected per page: the hero only exists on / */
    WIRE.heroExit = () => {
      seq = [
        { el: $('.peek'),      at: .00, span: .26, blur: 10 },
        { el: $('.hero-cue'),  at: .10, span: .30, shift: true },
        { el: $('.hero-side'), at: .40, span: .30 }
      ].filter(o => o.el)
      active = true; apply()                 /* true: a hero kept from before gets its styles cleared at the top */
    }
    on(window, 'scroll', apply, { passive: true })
    on(window, 'resize', apply, { passive: true })
    WIRE.heroExit()
  }

  const scrollToY = y => scrollTo({ top: y, behavior: REDUCE ? 'auto' : 'smooth' })
  function wireNav() {
    let last = 0, dots = []
    const rail = $('#rail')
    /* one dot per chapter; a single-chapter page gets none (the rail hides when empty) */
    WIRE.buildRail = () => {
      if (!rail) return
      rail.textContent = ''
      if (SECS.length > 1) SECS.forEach((s, i) => {
        const name = s.getAttribute('data-name') || 'Section'
        const b = document.createElement('button')
        b.type = 'button'
        b.innerHTML = '<i></i>'; b.title = name
        b.setAttribute('aria-label', 'Go to ' + name)
        b.addEventListener('click', () => { measure(); scrollToY(anchors[i]) })
        rail.appendChild(b)
      })
      dots = $$('#rail button')
    }
    WIRE.buildRail()
    const links = $$('.nav-link')
    const burger = $('.nav-burger')
    const html = document.documentElement
    const closeMenu = () => {
      if (!nav || !burger) return
      nav.classList.remove('menu-open')
      burger.classList.remove('active')
      burger.setAttribute('aria-expanded', 'false')
      html.classList.remove('dt-nav-open')
    }
    const setMenu = open => {
      if (open) nav.classList.remove('hide')
      nav.classList.toggle('menu-open', open)
      burger.classList.toggle('active', open)
      burger.setAttribute('aria-expanded', String(open))
      html.classList.toggle('dt-nav-open', open)
    }
    if (burger) {
      on(burger, 'click', () => { if (vpW() > 820) return; setMenu(!nav.classList.contains('menu-open')) })
    }
    WIRE.closeMenu = closeMenu
    links.forEach(link => on(link, 'click', closeMenu))
    on(window, 'keydown', e => { if (e.key === 'Escape') closeMenu() })
    on(window, 'resize', () => { if (vpW() > 820) closeMenu() }, { passive: true })
    /* which chapter each link points at, read off its data-sec (the href is a
       route now) — never positional */
    const linkSec = () => links.map(l => l.dataset.sec ? SECS.indexOf(root.querySelector(l.dataset.sec)) : -1)
    let map = linkSec()
    const sync = () => {
      const y = scrollY
      if (nav) {
        nav.classList.toggle('stuck', y > 40)
        nav.classList.toggle('hide', !nav.classList.contains('menu-open') && y > last + 4 && y > vpH() * .8)
      }
      last = y
      const a = Math.round(progressFor(y))
      if (a !== activeSec || !dots[a] || !dots[a].classList.contains('on')) {
        activeSec = a
        dots.forEach((d, i) => d.classList.toggle('on', i === a))
        /* visual only: aria-current is the router's (the page), set in React */
        links.forEach((l, i) => l.classList.toggle('on', map[i] === a))
      }
    }
    on(window, 'scroll', sync, { passive: true })
    /* in-page anchors anywhere in the page, delegated so re-rendered links
       keep working */
    on(root, 'click', e => {
      const a = e.target.closest && e.target.closest('a[href^="#"]')
      if (!a || !root.contains(a)) return
      const href = a.getAttribute('href')
      let t = null
      try { t = href === '#top' ? null : root.querySelector(href) } catch { return }   /* '#' placeholders */
      if (href !== '#top' && !t) return
      e.preventDefault()
      measure(); map = linkSec()
      const i = t ? SECS.indexOf(t) : 0
      const y = href === '#top' ? 0 : (i >= 0 ? anchors[i] : t.getBoundingClientRect().top + scrollY - 40)
      scrollToY(y)
      /* keep history.state: it is the router's (key/idx), and null breaks Back */
      if (history.replaceState) history.replaceState(history.state, '', href === '#top' ? location.pathname : href)
      /* move focus with the view, for keyboard and screen-reader users */
      const target = t || $('#hero')
      if (target) { if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }) }
    })
    WIRE.syncNav = () => { map = linkSec(); sync() }
    sync()
  }
  const WIRE = { syncNav: () => {} }

  function wireFocus() {
    /* hovering a subsystem warms the core and lights the mesh */
    on(root, 'pointerover', e => {
      const el = e.target.closest && e.target.closest('[data-focus]')
      if (el) RIG.focus = +el.dataset.focus || 0
    })
    on(root, 'pointerout', e => {
      const el = e.target.closest && e.target.closest('[data-focus]')
      if (el && !el.contains(e.relatedTarget)) RIG.focus = -1
    })
    on(root, 'focusin', e => {
      const el = e.target.closest && e.target.closest('[data-focus]')
      RIG.focus = el ? (+el.dataset.focus || 0) : -1
    })
  }

  function wireCursor() {
    const dot = $('#cursor')
    if (!dot) return
    if (COARSE) { dot.style.display = 'none'; return }
    let x = vpW() / 2, y = vpH() / 2, tx2 = x, ty = y
    on(window, 'pointermove', e => {
      tx2 = e.clientX; ty = e.clientY
      RIG.tmx = (e.clientX / vpW()) * 2 - 1
      RIG.tmy = -((e.clientY / vpH()) * 2 - 1)
    }, { passive: true })
    on(root, 'pointerover', e => { if (e.target.closest && e.target.closest('[data-cursor], a, button, summary')) dot.classList.add('act') })
    on(root, 'pointerout', e => {
      const from = e.target.closest && e.target.closest('[data-cursor], a, button, summary')
      const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-cursor], a, button, summary')
      if (from && from !== to) dot.classList.remove('act')
    })
    const tick = () => {
      x = lerp(x, tx2, .18); y = lerp(y, ty, .18)
      dot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'
      cursorRaf = requestAnimationFrame(tick)
    }
    tick()
  }

  function makeGrain() {
    const el = $('#grain'); if (!el) return
    const S = 180, c = cvs(S, S), x = c.getContext('2d')
    if (!x) return
    const im = x.createImageData(S, S), d = im.data, r = mulberry32(9)
    for (let i = 0; i < S * S; i++) {
      const v = 110 + r() * 90
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255
    }
    x.putImageData(im, 0, 0)
    el.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')'
  }

  /* ============================================ 12 · the card viewports */
  const CARDS = []
  const camFor = name => {
    const d = VIEWS[name] || VIEWS.grid
    const c = new THREE.PerspectiveCamera(d.fov, 4 / 5, .3, 900)
    c.position.set(d.p[0], d.p[1], d.p[2])
    c.lookAt(d.t[0], d.t[1], d.t[2])
    c.layers.set(0)
    c.userData = { home: c.position.clone(), look: new THREE.Vector3(d.t[0], d.t[1], d.t[2]), push: 0, want: 0 }
    return c
  }
  /* (re)collect the windows — the page re-renders when its data arrives, so
     the elements are looked up again rather than held from the first boot */
  function collectCards() {
    if (!THREE || !scene) return
    const seen = new Set()
    $$('[data-view]').forEach(el => {
      const frame = el.querySelector('[data-frame]') || el
      seen.add(frame)
      if (CARDS.some(C => C.el === frame)) return
      CARDS.push({ cam: camFor(el.dataset.view), el: frame, host: el, rt: null, dirty: true })
    })
    for (let i = CARDS.length - 1; i >= 0; i--) {
      if (!seen.has(CARDS[i].el)) { if (CARDS[i].rt) CARDS[i].rt.dispose(); CARDS.splice(i, 1) }
    }
  }
  function wireCardHover() {
    on(root, 'pointerover', e => {
      const host = e.target.closest && e.target.closest('[data-view]')
      CARDS.forEach(C => { if (C.host === host) C.cam.userData.want = 1 })
    })
    on(root, 'pointerout', e => {
      const host = e.target.closest && e.target.closest('[data-view]')
      if (host && !host.contains(e.relatedTarget)) CARDS.forEach(C => { if (C.host === host) C.cam.userData.want = 0 })
    })
  }
  /* A render target keeps its own viewport/scissor — renderer.setScissor()
     only reaches the default framebuffer. */
  let _push = null
  function setRegion(rt, x, y, w, h) {
    if (rt) {
      const pr = renderer.getPixelRatio()
      rt.viewport.set(x * pr, y * pr, w * pr, h * pr)
      rt.scissor.set(x * pr, y * pr, w * pr, h * pr)
      rt.scissorTest = true
      renderer.setRenderTarget(rt)
    } else {
      renderer.setViewport(x, y, w, h)
      renderer.setScissor(x, y, w, h)
      renderer.setScissorTest(true)
    }
  }
  function clearRegion(rt) {
    if (rt) {
      rt.viewport.set(0, 0, rt.width, rt.height)
      rt.scissor.set(0, 0, rt.width, rt.height)
      rt.scissorTest = false
      renderer.setRenderTarget(rt)
    } else {
      renderer.setScissorTest(false)
      renderer.setViewport(0, 0, vpW(), vpH())
      renderer.setScissor(0, 0, vpW(), vpH())
    }
  }
  function cardBuffer(C, w, h) {
    const pr = Math.min(renderer.getPixelRatio(), 2)
    const W = Math.max(8, Math.round(w * pr)), H = Math.max(8, Math.round(h * pr))
    if (C.rt && C.rt.width === W && C.rt.height === H) return C.rt
    if (C.rt) C.rt.dispose()
    C.rt = new THREE.WebGLRenderTarget(W, H, {
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      type: THREE.HalfFloatType, depthBuffer: true, stencilBuffer: false
    })
    C.dirty = true
    return C.rt
  }
  function aimCard(C, aspect) {
    const c = C.cam, u = c.userData
    c.aspect = aspect; c.updateProjectionMatrix()
    if (!_push) _push = new THREE.Vector3()
    _push.subVectors(u.look, u.home).normalize()
    c.position.copy(u.home).addScaledVector(_push, u.push * 9)
    c.lookAt(u.look)
  }
  /* Cull on the element's effective opacity, not just its rect: the canvas
     knows nothing about the DOM over it, so a faded card would otherwise go
     on painting a live view with no card around it. */
  function cardAlpha(el) {
    let a = 1
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n)
      if (s.display === 'none' || s.visibility === 'hidden') return 0
      a *= +s.opacity
      if (a < .001) return 0
    }
    return a
  }
  const CARD_ROTA = LOW ? 48 : 24
  function renderCards(rt) {
    if (!CARDS.length) return
    let drew = false
    for (let i = 0; i < CARDS.length; i++) {
      const C = CARDS[i], r = C.el.getBoundingClientRect()
      if (r.bottom < -40 || r.top > vpH() + 40 || r.width < 4) continue
      if (cardAlpha(C.el) < .995) continue
      if (!WANT_POST) {
        setRegion(rt, r.left, vpH() - r.bottom, r.width, r.height)
        renderer.clear(true, true, false)
        aimCard(C, r.width / r.height)
        renderer.render(scene, C.cam)
        drew = true; continue
      }
      const buf = cardBuffer(C, r.width, r.height)
      const u = C.cam.userData
      if (C.dirty || Math.abs(u.push - u.want) > .002 || (FRAME + i * 7) % CARD_ROTA === 0) {
        aimCard(C, r.width / r.height)
        renderer.setRenderTarget(buf)
        renderer.clear(true, true, false)
        renderer.render(scene, C.cam)
        C.dirty = false
      }
      setRegion(rt, r.left, vpH() - r.bottom, r.width, r.height)
      POST.up.blending = THREE.NoBlending
      POST.up.uniforms.uAmt.value = 1
      POST.up.uniforms.tS.value = buf.texture
      pass(POST.up, rt)
      drew = true
    }
    if (drew) clearRegion(rt)
  }

  /* ==================================================== 13 · the machine */
  let running = false, tPrev = 0, clock = 0, fadeIn = 0
  const INTRO = { t0: 0 }

  function resize() {
    if (!renderer) return
    const w = vpW(), h = vpH()
    root.style.setProperty('--vw', w + 'px')
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, DPR_CAP) * PERF.scale)
    renderer.setSize(w, h, true)
    camera.aspect = w / h; camera.updateProjectionMatrix()
    const pw = renderer.domElement.width, ph = renderer.domElement.height
    if (WANT_POST && POST.scene) {
      POST.scene.setSize(pw, ph)
      POST.comp.uniforms.uRes.value.set(pw, ph)
      let lw = Math.max(2, pw >> 1), lh = Math.max(2, ph >> 1)
      POST.levels.forEach(L => { L.a.setSize(lw, lh); L.b.setSize(lw, lh); L.w = lw; L.h = lh; lw = Math.max(2, lw >> 1); lh = Math.max(2, lh >> 1) })
    }
    /* multisampling is the first thing to go when the budget tightens */
    if (POST.scene) {
      const want = (!LOW && PERF.scale > .78) ? 2 : 0
      if (POST.scene.samples !== want) { POST.scene.samples = want; POST.scene.dispose() }
    }
    CARDS.forEach(C => { C.dirty = true })
    if (WANT_SHADOW && WORLD.key) WORLD.key.shadow.needsUpdate = true
    const px = h * renderer.getPixelRatio()
    ;[WORLD.embers, WORLD.traffic && WORLD.traffic.mesh, WORLD.flyers && WORLD.flyers.lights, WORLD.network && WORLD.network.dots]
      .forEach(m => { if (m && m.material.uniforms.uSize) m.material.uniforms.uSize.value = px * .5 })
    if (WISP.mesh) WISP.mesh.material.uniforms.uPx.value = px
    layoutWord()
    measure()
  }

  function updateWorld(dt) {
    WORLD.uT.value = clock
    WORLD.uCam.value.copy(camera.position)
    /* the focused subsystem warms the core and lights the mesh */
    RIG.focusAmt = damp(RIG.focusAmt, RIG.focus >= 0 ? 1 : 0, 5, dt)
    const f = RIG.focusAmt
    WORLD.uFocus.value = f
    /* at the highest point the city goes quiet: less weather, slower traffic */
    const quiet = smooth(4.1, 4.9, RIG.smooth)
    WORLD.uQuiet.value = quiet
    if (WORLD.coreHalo) {
      WORLD.coreHalo.material.opacity = .40 + f * .16 + Math.sin(clock * .5) * .04
      WORLD.coreHalo.quaternion.copy(camera.quaternion)
    }
    if (WORLD.coreLight) WORLD.coreLight.intensity = 3.4 * (1 + f * .35) * (1 + Math.sin(clock * .43) * .05)
    if (WORLD.coreRings) WORLD.coreRings.forEach(r => { r.rotation.z += r.userData.spin * dt })
    if (WORLD.coreCage) { WORLD.coreCage.rotation.y += dt * .18; WORLD.coreCage.rotation.x += dt * .07 }
    if (WORLD.coreHeart) WORLD.coreHeart.scale.setScalar(1 + Math.sin(clock * 1.6) * .05 + f * .12)
    const blink = (Math.sin(clock * 2.4) > .55) ? 1 : .12
    if (WORLD.coreTipHalo) { WORLD.coreTipHalo.material.opacity = .25 + blink * .6; WORLD.coreTipHalo.quaternion.copy(camera.quaternion) }
    if (WORLD.mastBeacon) {
      const b = (Math.sin(clock * 2.1 + 1.3) > .6) ? 1 : .1
      WORLD.mastBeacon.halo.material.opacity = .15 + b * .75
      WORLD.mastBeacon.halo.quaternion.copy(camera.quaternion)
      if (WORLD.warnLight) WORLD.warnLight.intensity = .3 + b * 1.5
    }
    if (WORLD.coreBeam) WORLD.coreBeam.opacity = (.30 + Math.sin(clock * .7) * .04) * (1 + quiet * .4)
    if (WORLD.haze) WORLD.haze.forEach(h => {
      h.position.x = h.userData.x0 + Math.sin(clock * h.userData.sp + h.userData.ph) * 12
      h.quaternion.copy(camera.quaternion)
    })
    if (WORLD.ripples) WORLD.ripples.forEach(r => {
      const u = r.userData
      u.t += dt * u.sp
      if (u.t > 4) { u.t = 0; u.x = (Math.random() - .5) * 30; u.z = -3 + Math.random() * 22 }
      const k = u.t / 4
      const s = .3 + k * 4.2
      r.scale.set(s, s, 1)
      r.position.set(u.x, .02, u.z)
      r.material.opacity = Math.sin(k * Math.PI) * .16
    })
    /* the type rises from behind the parapet, then dissolves as you leave */
    if (WORD.group) {
      const near = smooth(0.02, 0.62, RIG.smooth)
      WORD.glyphs.forEach((g, i) => {
        const st = clamp((WORD.reveal - i * .075) / .62, 0, 1)
        const e = easeOut(st)
        g.position.y = g.userData.baseY - (1 - e) * (WORD.ink.asc * 1.15)
        g.material.opacity = e * (1 - near) * .92
        g.visible = g.material.opacity > .004
      })
    }
    updateTraffic(dt, quiet)
    updateFlyers(dt)
    updateWisps(dt)
    if (CARDS.length) CARDS.forEach(C => { const u = C.cam.userData; u.push = damp(u.push, u.want, 3.4, dt) })
    if (WORLD.sky) WORLD.sky.position.copy(camera.position)
  }

  let FRAME = 0
  function render() {
    /* a collapsed viewport (DevTools dragged over the page) floors the canvas
       to 0px, and every target sized from it goes incomplete with it */
    if (!canvas.width || !canvas.height) return
    FRAME++
    renderer.setRenderTarget(WANT_POST ? POST.scene : null)
    renderer.clear(true, true, false)
    renderer.render(scene, camera)
    renderCards(WANT_POST ? POST.scene : null)
    renderer.setRenderTarget(null)
    if (WANT_POST) {
      POST.comp.uniforms.uT.value = clock
      POST.comp.uniforms.uFade.value = fadeIn
      renderPost()
    }
  }

  function frame(now) {
    if (!running || disposed) return
    const raw = (now - tPrev) / 1000 || 0
    const dt = Math.min(raw, .05)              /* animation never jumps … */
    tPrev = now
    /* reduced motion: the city holds still — the camera still follows the
       scroll, but nothing in the world moves on its own */
    clock += REDUCE ? 0 : dt
    fadeIn = INTRO.t0 ? sat((now - INTRO.t0) / 700) : 1
    if (!PERF.locked && clock > 2.2) {
      PERF.acc += raw; PERF.n++            /* … but the governor reads the truth */
      if (PERF.n >= 40 || PERF.acc > .9) {
        const avg = PERF.acc / PERF.n; PERF.acc = 0; PERF.n = 0
        if (avg > .0230 && PERF.scale > .55) { PERF.scale = Math.max(.55, PERF.scale * (avg > .05 ? .64 : .85)); resize() }
        else if (avg < .0138 && PERF.scale < 1) { PERF.scale = Math.min(1, PERF.scale + .08); resize() }
      }
    }
    RIG.prog = camAt(progressFor(scrollY))
    RIG.smooth = REDUCE ? RIG.prog : damp(RIG.smooth, RIG.prog, 5.2, dt)
    RIG.mx = damp(RIG.mx, REDUCE ? 0 : RIG.tmx, 2.6, dt)
    RIG.my = damp(RIG.my, REDUCE ? 0 : RIG.tmy, 2.6, dt)
    if (INTRO.t0) {
      const el = (now - INTRO.t0) / 1000
      RIG.intro = sat(el / 2.4)
      WORD.reveal = Math.min(1.2, el / 1.5)
    }
    applyCamera()
    updateWorld(dt)
    render()
    queue()
  }
  const TIMER = qs('driver', 'raf') === 'timer'
  function queue() {
    if (disposed) return
    if (TIMER) later(() => frame(performance.now()), 16)
    else rafId = requestAnimationFrame(frame)
  }

  /* ======================================================== 14 · booting */
  const JOBS = [
    ['Loading the runtime', () => Promise.all([
      loadThree().then(T => { THREE = T }),
      document.fonts ? Promise.all(['600 320px "Space Grotesk"', '500 22px "JetBrains Mono"'].map(f => document.fonts.load(f))).catch(() => {}) : null
    ])],
    ['Booting the renderer', () => {
      initGL()
      WORLD.uT = { value: 0 }; WORLD.uWin = { value: 1 }; WORLD.uFocus = { value: 0 }; WORLD.uQuiet = { value: 0 }
      WORLD.uCam = { value: new THREE.Vector3() }
      buildRig(); buildLights()
    }],
    ['Grading the night sky', () => buildShell()],
    ['Routing the highways', () => planHighways()],
    ['Raising the skyline', () => buildCity()],
    ['Energizing the AI core', () => buildCore()],
    ['Opening the traffic', () => buildHighways()],
    ['Launching the fleet', () => buildFlyers()],
    ['Projecting the displays', () => buildHolograms()],
    ['Linking the neural mesh', () => buildNetwork()],
    ['Setting the type in the air', () => buildWordmark()],
    ['Raising the weather', () => { buildAtmosphere(); buildWisps() }],
    ['Calibrating the optics', () => {
      initPost(); collectCards()
      WORD.glyphs.forEach(m => m.layers.set(2))
      if (WORLD.rain) WORLD.rain.layers.set(1)
      if (WORLD.embers) WORLD.embers.layers.set(1)
      WORLD.ripples.forEach(r => r.layers.set(1))
      layoutWord(); measure()
      /* nothing that casts a shadow ever moves, so bake it once */
      if (WANT_SHADOW && WORLD.key) { WORLD.key.shadow.autoUpdate = false; WORLD.key.shadow.needsUpdate = true }
    }]
  ]

  function boot() {
    measure()
    wireReveals(); wireNav(); wireHeroExit(); wireFocus(); wireCursor(); wireCardHover()
    /* the page grows after boot — data arriving, fonts, a log entry opened —
       and every scene anchor moves with it */
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => { measure(); WIRE.syncNav() })
      ro.observe(root); observers.push(ro)
    }
    if (!webglAvailable() || qs('nogl', '0') !== '0') { fallback(new Error('webgl unavailable')); return }
    makeGrain()
    document.documentElement.classList.add('dt-city-locked')
    let i = 0
    const step = () => {
      if (disposed) return
      const j = JOBS[i]
      if (preLabel) preLabel.textContent = j[0]
      const done = () => {
        if (disposed) return
        i++
        const p = i / JOBS.length
        if (preFill) preFill.style.right = ((1 - p) * 100).toFixed(1) + '%'
        if (prePct) prePct.textContent = Math.round(p * 100)
        if (i < JOBS.length) later(step, 16); else later(start, 220)
      }
      let r
      try { r = j[1]() }
      catch (err) {
        console.error('[dt-city] job "' + j[0] + '" failed', err)
        if (i <= 1) return fallback(err)          /* no renderer, no scene */
      }
      if (r && r.then) r.then(done, err => { console.error('[dt-city] job "' + j[0] + '" failed', err); if (i <= 1) fallback(err); else done() })
      else done()
    }
    later(step, 60)
  }

  function fallback(err) {
    if (disposed) return
    root.classList.add('no-webgl')
    document.documentElement.classList.remove('dt-city-locked')
    if (preEl) preEl.classList.add('done')
    $$('[data-rv], .mask-line').forEach(e => e.classList.add('rv-in'))
    window.__dtCity = { fallback: true, error: String((err && err.message) || err) }
  }

  function goToHash() {
    const h = location.hash
    if (!h || h.length < 2) return false
    let t = null
    try { t = root.querySelector(h) } catch { return false }
    if (!t) return false
    measure()
    const i = SECS.indexOf(t)
    scrollTo(0, i >= 0 ? anchors[i] : t.getBoundingClientRect().top + scrollY - 40)
    return true
  }

  function start() {
    if (disposed) return
    on(window, 'resize', () => { resize() }, { passive: true })
    on(window, 'orientationchange', () => later(resize, 250))
    on(document, 'visibilitychange', () => {
      if (document.hidden) { running = false; cancelAnimationFrame(rafId) }
      else if (!running && !disposed) { running = true; tPrev = performance.now(); queue() }
    })
    resize()
    const shot = Q.get('shot')
    if (shot !== null) {                       /* deterministic states for review */
      RIG.intro = 1; WORD.reveal = 1.2; fadeIn = 1; INTRO.t0 = 0
      /* unlock before measuring: a locked page has no scroll height to anchor on */
      document.documentElement.classList.remove('dt-city-locked')
      $$('[data-rv], .mask-line').forEach(e => e.classList.add('rv-in'))
      measure()
      const n = clamp(parseInt(shot, 10) || 0, 0, SECS.length - 1)
      scrollTo(0, anchors[n])
      RIG.smooth = RIG.prog = camAt(progressFor(anchors[n]))
      if (preEl) preEl.classList.add('done')
    } else {
      if (preEl) preEl.classList.add('done')
      later(() => {
        document.documentElement.classList.remove('dt-city-locked')
        goToHash()
        revealHero()
      }, REDUCE ? 0 : 340)
    }
    running = true; tPrev = performance.now()
    INTRO.t0 = shot !== null ? 0 : (REDUCE ? performance.now() - 4000 : performance.now())
    queue()
    window.__dtCity = { RIG: RIG, WORLD: WORLD, WORD: WORD, CAM: CAM, POST: POST, renderer: renderer, scene: scene, camera: camera, anchors: () => anchors }
  }

  /* the hero never waits on the observer: it opens in sequence, on boot and
     on every return to / */
  function revealHero() {
    const items = $('#hero') ? [].slice.call($('#hero').querySelectorAll('[data-rv], .mask-line')) : []
    items.forEach((e, i) => later(() => e.classList.add('rv-in'), REDUCE ? 0 : 120 + i * 95))
  }

  /* ----------------------------------------------------------- public API */
  function refresh() {
    if (disposed) return
    measure()
    wireReveals()
    WIRE.syncNav()
    collectCards()
    if (root.classList.contains('no-webgl')) $$('[data-rv], .mask-line').forEach(e => e.classList.add('rv-in'))
  }

  /* The route changed under the same city: new sections, same world. The
     camera glides to the new page's waypoint on its own (RIG.smooth damps). */
  function setPage() {
    if (disposed) return
    RIG.focus = -1
    WIRE.closeMenu()
    if (!goToHash()) scrollTo(0, 0)
    measure(); WIRE.buildRail(); WIRE.heroExit()
    refresh()
    if (preEl && preEl.classList.contains('done')) revealHero()   /* mid-boot, start() still does it */
  }

  function dispose() {
    disposed = true; running = false
    cancelAnimationFrame(rafId); cancelAnimationFrame(cursorRaf)
    timers.forEach(id => clearTimeout(id)); timers.clear()
    offs.forEach(f => f()); offs.length = 0
    observers.forEach(o => o.disconnect())
    document.documentElement.classList.remove('dt-city-locked', 'dt-nav-open')
    if (scene) {
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose()
        const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []
        mats.forEach(m => m.dispose())
      })
    }
    if (POST.quad) { POST.quad.geometry.dispose() }
    ;['up', 'bright', 'blur', 'comp'].forEach(k => { if (POST[k]) POST[k].dispose() })
    if (POST.scene) POST.scene.dispose()
    POST.levels.forEach(L => { L.a.dispose(); L.b.dispose() })
    CARDS.forEach(C => { if (C.rt) C.rt.dispose() })
    TEXTURES.forEach(t => t.dispose())
    if (renderer) { renderer.dispose(); renderer.forceContextLoss() }
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas)
    if (window.__dtCity && window.__dtCity.renderer === renderer) window.__dtCity = undefined
  }

  boot()
  return { refresh: refresh, setPage: setPage, dispose: dispose }
}
