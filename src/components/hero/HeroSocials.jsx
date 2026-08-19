/**
 * Hero social chip row.
 *
 * Semantics are carried over verbatim from the previous inline hero markup:
 * 44px rounded chip, target/rel only for non-mailto hrefs, aria-label from
 * social.label, and the per-social focus-ring utility class.
 *
 * The old `title` attribute is replaced by a real .social-chip__tip element so
 * the tooltip appears on keyboard focus too, not just hover. It is aria-hidden
 * because aria-label already supplies the accessible name.
 *
 * @param {{ socials?: Array<{ href: string, label: string, icon: string, ring: string, tooltip: string }>, className?: string }} props
 */
export default function HeroSocials({ socials, className = '' }) {
  if (!socials || socials.length === 0) return null

  return (
    <div className={`flex justify-center gap-3 ${className}`.trim()}>
      {socials.map((social) => {
        const isMailto = social.href.startsWith('mailto')

        return (
          <a
            key={social.href}
            href={social.href}
            target={isMailto ? undefined : '_blank'}
            rel={isMailto ? undefined : 'noopener noreferrer'}
            className={`social-chip w-11 h-11 rounded-xl focus:outline-none focus:ring-2 ${social.ring} focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]`}
            aria-label={social.label}
          >
            <i className={`${social.icon} text-lg`} aria-hidden="true" />
            {social.tooltip ? (
              <span className="social-chip__tip" aria-hidden="true">
                {social.tooltip}
              </span>
            ) : null}
          </a>
        )
      })}
    </div>
  )
}
