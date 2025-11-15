function Certifications({ certifications }) {
  return (
    <section id="certifications" className="py-20 px-6 bg-gradient-to-b from-[#0f172a] via-[#0b1220] to-[#0f172a] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-24 left-16 w-64 h-64 bg-[#14b8a6] rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-10 w-80 h-80 bg-[#22d3ee] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-[#14b8a6]/10 via-transparent to-[#22d3ee]/10 rounded-full blur-[140px]" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-[#14b8a6] rounded-full" />
            <i className="fas fa-certificate text-5xl text-[#22d3ee] animate-pulse" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-[#22d3ee] rounded-full" />
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold animate-gradient">Licenses &amp; Certifications</h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Recognitions that validate my commitment to continuous learning across web development, software engineering, cloud, and emerging technologies.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {certifications.map((cert) => (
            <article
              key={cert.title}
              className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-white/10 hover:border-white/40 hover:shadow-[0_0_35px_rgba(255,255,255,0.15)] transition-all duration-500 hover:-translate-y-2"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                  {cert.logo ? (
                    <img src={cert.logo} alt={`${cert.issuer} logo`} className="w-10 h-10 object-contain" loading="lazy" />
                  ) : (
                    <span className="font-bold text-xl text-white">OR</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#14b8a6] transition-colors">{cert.title}</h3>
                  <p className="text-sm text-gray-400 font-semibold">
                    {cert.issuer} • Issued {cert.issued}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-300 leading-relaxed">{cert.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {cert.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/60 text-xs font-semibold text-gray-200 border border-gray-700/60">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-700 flex items-center justify-between gap-4">
                <span className="text-xs text-gray-500 font-mono truncate">{cert.credentialId}</span>
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#14b8a6] hover:text-[#22d3ee] transition-colors"
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

