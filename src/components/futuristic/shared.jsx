/* Small pieces every scene uses. The word-split is Kage's splitHeadingWords,
   rendered by React instead of rewritten into the DOM after the fact, so a
   re-render can never fight it; the full text stays readable to assistive
   tech while the animated words are presentational. */

export function SplitWords({ text }) {
  return String(text)
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => (
      <span key={i}>
        {i ? ' ' : null}
        <span className="word-mask">
          <span className="word" style={{ '--word-delay': `${i * 72}ms` }}>{w}</span>
        </span>
      </span>
    ))
}

export function SplitHeading({ as: Tag = 'h2', id, className, lines, lineClass = [] }) {
  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((line, i) => (
        <span key={i} aria-hidden="true" className={`mask-line word-reveal${lineClass[i] ? ` ${lineClass[i]}` : ''}`}>
          <SplitWords text={line} />
        </span>
      ))}
    </Tag>
  )
}

export function SectionHead({ num, label, right }) {
  return (
    <div className="sec-head" data-rv="fade">
      <span className="k"><b>{num}</b> / {label}</span>
      <span className="rule" />
      {right ? <span className="k">{right}</span> : null}
    </div>
  )
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M3 11 11 3M5 3h6v6" stroke="#e6edf6" strokeWidth="1.3" />
    </svg>
  )
}

export function HudCorners() {
  return (
    <>
      <span className="hud-corner tl" aria-hidden="true" />
      <span className="hud-corner tr" aria-hidden="true" />
      <span className="hud-corner bl" aria-hidden="true" />
      <span className="hud-corner br" aria-hidden="true" />
    </>
  )
}

/* The DT monogram: a framed mark with one red signal in its corner. */
export function DTMark({ size = 36 }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="41" height="41" stroke="#e6edf6" strokeOpacity=".45" />
      <path d="M1.5 12V1.5H12M32 1.5h10.5V12M42.5 32v10.5H32M12 42.5H1.5V32" stroke="#e6edf6" strokeWidth="1.6" />
      <text x="22" y="28.5" textAnchor="middle" fontFamily="'Space Grotesk', system-ui, sans-serif" fontSize="15.5" fontWeight="600" letterSpacing=".5" fill="#e6edf6">DT</text>
      <circle cx="35.5" cy="8.5" r="2.4" fill="#e0231c" />
    </svg>
  )
}
