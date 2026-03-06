import { useEffect, useRef, useState } from 'react'
import SpaceBackground from './SpaceBackground'

function Certifications({ certifications }) {
  const [visible, setVisible] = useState({})
  const cardRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const i = entry.target.getAttribute('data-cert-index')
            if (i != null) setVisible((v) => ({ ...v, [i]: true }))
          }
        })
      },
      { threshold: 0.12 },
    )
    cardRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [certifications.length])

  return (
    <section
      id="certifications"
      className="py-20 px-6 bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden"
      aria-labelledby="certifications-heading"
    >
      <SpaceBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)] pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-accent)]/5 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <i className="fas fa-certificate text-4xl text-[var(--color-accent)] animate-pulse" aria-hidden="true" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-blue)] rounded-full" />
          </div>
          <h2 id="certifications-heading" className="text-5xl md:text-6xl font-extrabold mb-4 animate-gradient">
            Licenses &amp; Certifications
          </h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Credentials in Git, GitHub, AI, and full-stack development.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert, index) => {
            const isVisible = visible[index]

            return (
              <article
                key={`${cert.title}-${index}`}
                ref={(el) => { cardRefs.current[index] = el }}
                data-cert-index={index}
                className={`
                  certification-card glass rounded-2xl overflow-hidden
                  hover:border-[var(--color-accent)]/40 hover:shadow-[0_0_28px_rgba(125,211,252,0.12)] hover:-translate-y-1
                  transition-all duration-300
                  ${isVisible ? 'certification-card-visible' : ''}
                `}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <div className="p-5 flex flex-col h-full">
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text)] leading-tight line-clamp-2">
                      {cert.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1 font-medium">
                      {cert.issuer}
                    </p>
                    {cert.issued && (
                      <p className="text-xs text-[var(--color-accent)] mt-0.5">Issued {cert.issued}</p>
                    )}
                  </div>

                  {(cert.tags && cert.tags.length > 0) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {cert.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium glass text-[var(--color-text-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Certifications
