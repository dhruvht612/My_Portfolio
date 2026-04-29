"use client"

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, BriefcaseBusiness, Camera, Globe } from 'lucide-react'
import { cn } from '../../lib/utils'
import { MEDIA } from '../../constants/media'

export const TextHoverEffect = ({ text, duration, className }) => {
  const svgRef = useRef(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [maskPosition, setMaskPosition] = useState({ cx: '50%', cy: '50%' })

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect()
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      })
    }
  }, [cursor])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn('select-none uppercase cursor-pointer', className)}
    >
      <defs>
        <linearGradient id="textGradient" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="25%">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="25%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#4169e1" />
              <stop offset="75%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: '50%', cy: '50%' }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: 'easeOut' }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-neutral-200 font-[helvetica] text-7xl font-bold dark:stroke-neutral-800"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-[#3ca2fa] font-[helvetica] text-7xl font-bold dark:stroke-[#3ca2fa99]"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.3"
        mask="url(#textMask)"
        className="fill-transparent font-[helvetica] text-7xl font-bold"
      >
        {text}
      </text>
    </svg>
  )
}

export const FooterBackgroundGradient = () => {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          'radial-gradient(90% 70% at 50% 5%, rgba(65,105,225,0.16), transparent 60%), radial-gradient(70% 55% at 80% 20%, rgba(125,211,252,0.12), transparent 60%), linear-gradient(to bottom, rgba(10,14,23,0.25) 0%, rgba(10,14,23,0.82) 70%)',
      }}
    />
  )
}

function HoverFooter({ navLinks, heroSocials }) {
  const footerLinks = [
    {
      title: 'Portfolio',
      links: navLinks.slice(0, 4).map((link) => ({ label: link.label, href: link.path ?? `/${link.id}` })),
    },
    {
      title: 'More',
      links: navLinks.slice(4).map((link) => ({ label: link.label, href: link.path ?? `/${link.id}` })),
    },
  ]

  const contactInfo = [
    {
      icon: <Mail size={18} className="text-[#3ca2fa]" />,
      text: 'thakardhruvh@gmail.com',
      href: 'mailto:thakardhruvh@gmail.com',
    },
    {
      icon: <Phone size={18} className="text-[#3ca2fa]" />,
      text: '+1 (647) 000-0000',
      href: 'tel:+16470000000',
    },
    {
      icon: <MapPin size={18} className="text-[#3ca2fa]" />,
      text: 'Oshawa, Ontario, Canada',
    },
  ]

  const socialIconMap = {
    GitHub: <Globe size={20} />,
    LinkedIn: <BriefcaseBusiness size={20} />,
    Instagram: <Camera size={20} />,
    Email: <Mail size={20} />,
  }

  const socialLinks = heroSocials.map((social) => ({
    icon: socialIconMap[social.tooltip] ?? <Globe size={20} />,
    label: social.tooltip,
    href: social.href,
  }))

  return (
    <footer className="relative h-fit overflow-hidden border-t border-[var(--color-border)]/50 bg-[var(--color-bg)]/70 backdrop-blur-sm liquid-glass-footer">
      <div className="max-w-7xl mx-auto p-10 md:p-14 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <img src={MEDIA.logo} alt="Dhruv Thakar Logo" className="w-10 h-10 rounded-full border border-[#3ca2fa66]" />
              <span className="text-white text-2xl font-bold">Dhruv Thakar</span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              Modern portfolio focused on accessible, human-centered software and practical AI-driven solutions.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-[var(--color-text)] text-lg font-semibold mb-6">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <Link to={link.href} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-[var(--color-text)] text-lg font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              {contactInfo.map((item) => (
                <li key={item.text} className="flex items-center space-x-3 text-[var(--color-text-muted)]">
                  {item.icon}
                  {item.href ? (
                    <a href={item.href} className="hover:text-[var(--color-accent)] transition-colors">
                      {item.text}
                    </a>
                  ) : (
                    <span className="hover:text-[var(--color-accent)] transition-colors">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-t border-[var(--color-border)] my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
          <div className="flex space-x-6 text-[var(--color-text-muted)]">
            {socialLinks.map(({ icon, label, href }) => (
              <a key={label} href={href} aria-label={label} className="hover:text-[var(--color-accent)] transition-colors" target="_blank" rel="noreferrer">
                {icon}
              </a>
            ))}
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-center md:text-left text-[var(--color-text-muted)]">
              &copy; {new Date().getFullYear()} Dhruv Thakar. All rights reserved.
            </p>
            <p className="text-xs text-[var(--color-text-muted)]/60 flex items-center gap-1.5">
              Built with
              <span className="text-[var(--color-accent)]">React</span>·
              <span className="text-[var(--color-accent)]">Vite</span>·
              <span className="text-[var(--color-accent)]">Framer Motion</span>
            </p>
          </div>
        </div>
      </div>

      <div className="lg:flex hidden h-[20rem] -mt-28 -mb-16">
        <TextHoverEffect text="Dhruv" className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  )
}

export default HoverFooter

