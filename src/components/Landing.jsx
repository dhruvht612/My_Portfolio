import SpaceBackground from './SpaceBackground'

function Landing({ onEnter }) {
  const handleEnter = (e) => {
    e?.preventDefault?.()
    onEnter?.()
    const el = document.getElementById('home')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      id="landing"
      aria-label="Welcome"
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: '#0a0e17',
        color: '#f1f5f9',
        textAlign: 'center',
      }}
    >
      <SpaceBackground />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(10,14,23,0.75) 0%, rgba(10,14,23,0.2) 40%, rgba(10,14,23,0.2) 60%, rgba(10,14,23,0.7) 100%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '40rem', margin: '0 auto' }}>
        {/* Decorative header */}
        <div
          className="animate-fade-in-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            animationDelay: '0s',
          }}
        >
          <span
            style={{
              width: '3rem',
              height: '2px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, transparent, #7dd3fc)',
            }}
          />
          <i className="fas fa-rocket" style={{ fontSize: '1.25rem', color: '#7dd3fc' }} aria-hidden />
          <span
            style={{
              width: '3rem',
              height: '2px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #4169e1, transparent)',
            }}
          />
        </div>
        <p
          className="animate-fade-in-up"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            color: '#7dd3fc',
            animationDelay: '0.08s',
          }}
        >
          Portfolio
        </p>
        <h1
          className="animate-fade-in-up"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#f1f5f9',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            animationDelay: '0.16s',
          }}
        >
          Dhruv Thakar
        </h1>
        <p
          className="animate-fade-in-up"
          style={{
            fontSize: '1.125rem',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            color: '#94a3b8',
            animationDelay: '0.24s',
          }}
        >
          Computer Science Student · Full-Stack Developer · Community Builder
        </p>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.32s' }}>
          <button
            type="button"
            onClick={handleEnter}
            className="landing-cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0a0e17',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #7dd3fc 0%, #4169e1 100%)',
              boxShadow: '0 4px 20px rgba(125, 211, 252, 0.25)',
            }}
          >
            Enter Portfolio
            <i className="fas fa-arrow-right" style={{ marginLeft: '0.25rem' }} aria-hidden />
          </button>
        </div>
      </div>
      <a
        href="#home"
        onClick={handleEnter}
        className="animate-fade-in-up"
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.75rem',
          color: '#94a3b8',
          zIndex: 10,
          textDecoration: 'none',
          animationDelay: '0.4s',
        }}
      >
        Skip to content
      </a>
    </section>
  )
}

export default Landing
