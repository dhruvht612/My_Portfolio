function Certifications({ certifications }) {
  return (
    <section id="certifications" className="py-20 px-6 bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-elevated)]/50 to-[var(--color-bg-elevated)]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-24 left-16 w-64 h-64 bg-[var(--color-accent)] rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-10 w-80 h-80 bg-[var(--color-accent-hover)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-[var(--color-accent-hover)]/10 rounded-full blur-[140px]" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[var(--color-accent)] rounded-full" />
            <i className="fas fa-certificate text-5xl text-[var(--color-accent)] animate-pulse" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[var(--color-accent-hover)] rounded-full" />
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold animate-gradient">Licenses &amp; Certifications</h2>
          <p className="text-[var(--color-text-muted)] text-lg max-w-3xl mx-auto">
            Recognitions that validate my commitment to continuous learning across web development, software engineering, cloud, and emerging technologies.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {certifications.map((cert) => (
            <article
              key={cert.title}
              className="group relative bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg)] p-8 rounded-3xl border border-[var(--color-accent)]/20 hover:border-[var(--color-accent)]/40 hover:shadow-[0_0_35px_rgba(125,211,252,0.2)] transition-all duration-500 hover:-translate-y-2"
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-2">
                  {cert.logo ? (
                    <img src={cert.logo} alt={`${cert.issuer} logo`} className="w-full h-full object-contain" loading="lazy" />
                  ) : (
                    <span className="font-bold text-xl text-[var(--color-text)]">OR</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">{cert.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] font-semibold">
                    {cert.issuer} • Issued {cert.issued}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-300 leading-relaxed">{cert.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {cert.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-bg-card)]/80 text-xs font-semibold text-[var(--color-text)] border border-[var(--color-border)]/60">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex items-center justify-between gap-4">
                <span className="text-xs text-[var(--color-text-muted)] font-mono truncate">{cert.credentialId}</span>
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
                >
                  Show credential
                  <i className="fas fa-external-link-alt text-xs" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Certifications

