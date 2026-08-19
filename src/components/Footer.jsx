import { usePortfolio } from '../context/PortfolioContext'
import { MEDIA } from '../constants/media'
import HoverFooter from './ui/hover-footer'

/**
 * Site footer.
 *
 * Owns the single `contentinfo` landmark and maps portfolio data onto the
 * presentational `HoverFooter`. Reading context here rather than accepting props
 * keeps Layout from prop-drilling data it does not otherwise use — which is how
 * `footerBadges` came to be threaded three levels deep and then dropped on the floor.
 */
function Footer() {
  const { navLinks, FOOTER_GROUPS, heroSocials, contactCards, altContactLinks, footerBadges } = usePortfolio()

  const findCard = (title) => contactCards.find((card) => card.title === title)

  /* The resume PDFs are the highest-intent link in the footer, and until now they
     existed only on the Contact page. `download` is what marks them in the data. */
  const resumeLinks = altContactLinks
    .filter((link) => link.download)
    .map((link) => ({
      href: link.href,
      download: link.download,
      label: link.label.replace(/^Resume\s*·\s*/, ''),
    }))

  return (
    <footer className="relative z-10 border-t border-[var(--color-border)]">
      <HoverFooter
        navLinks={navLinks}
        footerGroups={FOOTER_GROUPS}
        heroSocials={heroSocials}
        email={findCard('Email')}
        location={findCard('Location')}
        availability={findCard('Availability')?.value}
        resumeLinks={resumeLinks}
        footerBadges={footerBadges}
        brandLogo={MEDIA.logo}
        blurb="Modern portfolio focused on accessible, human-centered software and practical AI-driven solutions."
      />
    </footer>
  )
}

export default Footer
