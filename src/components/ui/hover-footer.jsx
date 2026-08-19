"use client"

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { motion, useInView, useSpring } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUp, ArrowUpRight, Download } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { EASE } from '../../lib/motion'

/* Aliased at module scope (the Header / AnimatedSection pattern): this eslint config
   has no react plugin, so an identifier used only inside JSX reads as unused. */
const MotionRadialGradient = motion.radialGradient
const MotionText = motion.text

/* Wordmark geometry. A 300x68 viewBox keeps the letterforms close to the box edges,
   so the SVG needs no negative margins to read as a large closing mark — the old
   `h-[20rem] -mt-28 -mb-16` existed to crop a 300x100 box that was mostly empty. */
const VIEW_W = 300
const VIEW_H = 68
const FONT_SIZE = 46
const REVEAL_RADIUS = 42

/* Cursor-follow spring. The mask centre chases the pointer instead of snapping: the
   old component never passed a `duration` prop, so `duration ?? 0` teleported the
   reveal and the effect read as a hard-edged spotlight. */
const FOLLOW_SPRING = { stiffness: 260, damping: 34, mass: 0.6 }
const REVEAL_SPRING = { stiffness: 180, damping: 28 }

/* Stroke-draw entrance, played once when the footer is actually reached. */
const DRAW_TRANSITION = { duration: 2.2, ease: EASE.standard }

/**
 * Hover-reveal wordmark.
 *
 * Three stacked strokes: a static outline that is always legible, a signal-coloured
 * pass that draws itself on first view, and a gradient pass revealed through a radial
 * mask that tracks the pointer.
 *
 * Pointer tracking runs entirely on motion values — no component state per move and
 * no `getBoundingClientRect` per move, which is what made the previous version
 * re-render and force layout on every frame of a hover.
 */
export const TextHoverEffect = ({ text, className }) => {
  const svgRef = useRef(null)
  const rectRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const reduced = useReducedMotion()
  const inView = useInView(svgRef, { once: true, amount: 0.3 })

  /* useId() yields ':r0:'-style values; strip the colons so url(#id) stays valid, and
     so two mounted instances never collide on a shared literal id. */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const revealId = `wordmark-reveal-${uid}`
  const strokeId = `wordmark-stroke-${uid}`
  const maskId = `wordmark-mask-${uid}`

  const cx = useSpring(VIEW_W / 2, FOLLOW_SPRING)
  const cy = useSpring(VIEW_H / 2, FOLLOW_SPRING)
  const radius = useSpring(0, REVEAL_SPRING)

  const cacheRect = useCallback(() => {
    if (svgRef.current) rectRef.current = svgRef.current.getBoundingClientRect()
  }, [])

  const track = useCallback(
    (event) => {
      const rect = rectRef.current
      if (!rect || !rect.width || !rect.height) return
      cx.set(((event.clientX - rect.left) / rect.width) * VIEW_W)
      cy.set(((event.clientY - rect.top) / rect.height) * VIEW_H)
    },
    [cx, cy],
  )

  /* The cached rect goes stale if the page scrolls or resizes mid-hover, so it is
     refreshed only while hovered — one rect read per scroll frame during a hover the
     user is actively performing, versus one per pointermove before. */
  useEffect(() => {
    if (!hovered) return undefined
    window.addEventListener('scroll', cacheRect, { passive: true })
    window.addEventListener('resize', cacheRect)
    return () => {
      window.removeEventListener('scroll', cacheRect)
      window.removeEventListener('resize', cacheRect)
    }
  }, [hovered, cacheRect])

  const handleEnter = useCallback(
    (event) => {
      cacheRect()
      track(event)
      radius.set(REVEAL_RADIUS)
      setHovered(true)
    },
    [cacheRect, track, radius],
  )

  const handleLeave = useCallback(() => {
    radius.set(0)
    setHovered(false)
  }, [radius])

  /* Under reduced motion the pointer reveal is not offered at all — the static
     outline plus a fully drawn signal stroke carry the wordmark on their own. */
  const interactive = !reduced
  const drawn = reduced || inView

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      onPointerEnter={interactive ? handleEnter : undefined}
      onPointerMove={interactive ? track : undefined}
      onPointerLeave={interactive ? handleLeave : undefined}
      className={cn('select-none uppercase', interactive && 'cursor-crosshair', className)}
    >
      <defs>
        {/* Stroke colours. A real linearGradient with x1/x2 — the previous version put
            radialGradient attributes (cx/cy/r) on a linearGradient, where they are
            ignored, so the "reveal" was silently a flat left-to-right ramp. */}
        <linearGradient id={strokeId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={VIEW_W} y2="0">
          <stop offset="0%" style={{ stopColor: 'var(--signal)' }} />
          <stop offset="50%" style={{ stopColor: 'var(--signal-2)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--ember)' }} />
        </linearGradient>

        {/* The actual cursor spotlight: radius springs 0 -> REVEAL_RADIUS on enter. */}
        <MotionRadialGradient id={revealId} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={radius}>
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </MotionRadialGradient>
        <mask id={maskId}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${revealId})`} />
        </mask>
      </defs>

      {/* Always-on outline. Token-driven, so it is legible in both themes — the old
          `stroke-neutral-200 dark:stroke-neutral-800` painted near-black on the
          near-black default theme and was effectively invisible. */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={FONT_SIZE}
        strokeWidth="0.4"
        className="fill-transparent font-bold"
        style={{ stroke: 'var(--ink-faint)', opacity: 0.35, fontFamily: 'var(--font-display)' }}
      >
        {text}
      </text>

      <MotionText
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={FONT_SIZE}
        strokeWidth="0.4"
        className="fill-transparent font-bold"
        style={{ stroke: 'var(--signal)', opacity: 0.55, fontFamily: 'var(--font-display)' }}
        initial={reduced ? false : { strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={drawn ? { strokeDashoffset: 0, strokeDasharray: 1000 } : undefined}
        transition={DRAW_TRANSITION}
      >
        {text}
      </MotionText>

      {interactive && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={FONT_SIZE}
          strokeWidth="0.5"
          stroke={`url(#${strokeId})`}
          mask={`url(#${maskId})`}
          className="fill-transparent font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {text}
        </text>
      )}
    </svg>
  )
}

/** Pulls a readable label out of a shields.io badge URL for its alt text. */
function badgeLabel(url) {
  const match = /\/badge\/([^-?/]+)/.exec(url)
  if (!match) return 'Technology badge'
  try {
    return decodeURIComponent(match[1]).replace(/_/g, ' ')
  } catch {
    return 'Technology badge'
  }
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="footer-heading">{title}</h3>
      <ul className="mt-5 space-y-1">{children}</ul>
    </div>
  )
}

/**
 * Site footer body.
 *
 * Presentational: every string it renders arrives as a prop, so the copy lives in the
 * portfolio data layer instead of being duplicated here.
 */
function HoverFooter({
  navLinks = [],
  footerGroups = [],
  heroSocials = [],
  email,
  location,
  availability,
  resumeLinks = [],
  footerBadges = [],
  brandName = 'Dhruv Thakar',
  brandLogo,
  blurb,
}) {
  const reduced = useReducedMotion()

  /* Columns come from an explicit `footerGroup` field. The previous
     navLinks.slice(0, 4) / .slice(4) split silently regrouped every link the moment a
     nav entry was added or reordered. */
  const columns = footerGroups
    .map((title) => ({ title, links: navLinks.filter((link) => link.footerGroup === title) }))
    .filter((column) => column.links.length > 0)

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div className="liquid-glass-footer relative isolate overflow-hidden">
      <div className="footer-veil" aria-hidden="true" />

      <div className="relative z-[2] mx-auto w-full max-w-7xl px-6 py-14 sm:px-8 md:py-16">
        {/* Closing CTA — the footer is where a visitor lands after reading everything,
            so it leads with the ask rather than with a link directory. */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            {availability && (
              <span className="footer-status">
                <span className="footer-status-dot" aria-hidden="true" />
                {availability}
              </span>
            )}
            <h2 className="footer-headline">Let&rsquo;s build something worth shipping.</h2>
            <p className="mt-4 text-[var(--step--1)] leading-relaxed text-[var(--color-text-muted)]">
              Open to internships, new-grad roles and collaborations on accessible, human-centered software.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/contact" className="footer-cta footer-cta--primary">
              Get in touch
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            {email && (
              <a href={email.href} className="footer-cta footer-cta--ghost">
                {email.value}
              </a>
            )}
          </div>
        </div>

        <hr className="footer-rule" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-2 sm:col-span-4 lg:col-span-4">
            <div className="flex items-center gap-3">
              {brandLogo && (
                <img
                  src={brandLogo}
                  alt=""
                  width="40"
                  height="40"
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-10 rounded-full border border-[var(--color-border)] object-cover"
                />
              )}
              <span className="text-xl font-bold tracking-tight text-[var(--color-text)]">{brandName}</span>
            </div>
            {blurb && (
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">{blurb}</p>
            )}
            {location && (
              <p className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <i className="fas fa-map-marker-alt text-[var(--color-accent)]" aria-hidden="true" />
                {location.value}
              </p>
            )}
          </div>

          {columns.map((column) => (
            <div key={column.title} className="lg:col-span-2">
              <FooterColumn title={column.title}>
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link to={link.path ?? `/${link.id}`} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </FooterColumn>
            </div>
          ))}

          {resumeLinks.length > 0 && (
            <div className="lg:col-span-2">
              <FooterColumn title="Resume">
                {resumeLinks.map((resume) => (
                  <li key={resume.href}>
                    <a href={resume.href} download={resume.download} className="footer-link group">
                      <Download
                        size={13}
                        aria-hidden="true"
                        className="opacity-50 transition-opacity group-hover:opacity-100"
                      />
                      {resume.label}
                    </a>
                  </li>
                ))}
              </FooterColumn>
            </div>
          )}

          <div className="lg:col-span-2">
            <h3 className="footer-heading">Connect</h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {heroSocials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    title={social.tooltip}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                    className="footer-social"
                  >
                    {/* Uses the icon class already carried by the data. The old map
                        substituted a globe for GitHub and a briefcase for LinkedIn. */}
                    <i className={social.icon} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="footer-rule" />

        <div className="flex flex-col-reverse items-center gap-6 text-sm md:flex-row md:justify-between">
          <p className="text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>

          {footerBadges.length > 0 && (
            <ul className="flex flex-wrap items-center justify-center gap-2" aria-label="Built with">
              {footerBadges.map((badge) => (
                <li key={badge}>
                  <img
                    src={badge}
                    alt={badgeLabel(badge)}
                    height="20"
                    loading="lazy"
                    decoding="async"
                    className="h-5 w-auto opacity-70 transition-opacity hover:opacity-100"
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2">
            <Link to="/admin/login" className="footer-mini-link">
              <i className="fas fa-lock text-[10px]" aria-hidden="true" />
              Admin
            </Link>
            <button type="button" onClick={scrollUp} className="footer-mini-link">
              <ArrowUp size={13} aria-hidden="true" />
              Back to top
            </button>
          </div>
        </div>
      </div>

      {/* Decorative closing wordmark. Rendered at every breakpoint now — hiding it
          below lg left mobile ending on a bare copyright line. */}
      <div className="footer-wordmark relative z-[1]">
        <TextHoverEffect text={brandName.split(' ')[0]} />
      </div>
    </div>
  )
}

export default HoverFooter
