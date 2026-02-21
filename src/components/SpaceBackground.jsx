/**
 * Reusable space-theme layer: twinkling stars + soft nebula blobs.
 * Use inside a section with relative overflow-hidden. Theme colors only.
 */
const SECTION_STARS = [
  { t: 5, l: 10, s: 1, d: 0 }, { t: 12, l: 85, s: 1, d: 500 }, { t: 25, l: 30, s: 2, d: 200 }, { t: 8, l: 60, s: 1, d: 800 },
  { t: 40, l: 5, s: 1, d: 400 }, { t: 55, l: 90, s: 1, d: 600 }, { t: 70, l: 25, s: 2, d: 300 }, { t: 18, l: 45, s: 1, d: 700 },
  { t: 82, l: 55, s: 1, d: 100 }, { t: 35, l: 75, s: 1, d: 550 }, { t: 60, l: 15, s: 1, d: 250 }, { t: 45, l: 50, s: 2, d: 650 },
  { t: 3, l: 40, s: 1, d: 350 }, { t: 88, l: 20, s: 1, d: 450 }, { t: 75, l: 70, s: 1, d: 150 }, { t: 28, l: 92, s: 1, d: 750 },
  { t: 52, l: 8, s: 2, d: 950 }, { t: 15, l: 35, s: 1, d: 50 }, { t: 65, l: 62, s: 1, d: 850 }, { t: 92, l: 42, s: 1, d: 400 },
]

function SpaceBackground({ stars = true, nebula = true, className = '' }) {
  return (
    <div
      className={`absolute inset-0 z-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {nebula && (
        <>
          <div className="absolute top-0 right-0 w-[20rem] h-[20rem] rounded-full bg-[var(--color-blue)] opacity-[0.08] blur-[60px] animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-[18rem] h-[18rem] rounded-full bg-[var(--color-accent)] opacity-[0.06] blur-[50px] animate-float-slower" />
        </>
      )}
      {stars &&
        SECTION_STARS.map((star, i) => (
          <div
            key={i}
            className="hero-star animate-twinkle"
            style={{
              top: `${star.t}%`,
              left: `${star.l}%`,
              width: star.s,
              height: star.s,
              animationDelay: `${star.d}ms`,
            }}
          />
        ))}
    </div>
  )
}

export default SpaceBackground
