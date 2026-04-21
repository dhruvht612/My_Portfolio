import HoverFooter from './ui/hover-footer'

function Footer({ navLinks, heroSocials, footerBadges }) {
  return (
    <footer
      className="relative z-10"
      style={{
        background: 'linear-gradient(to bottom, rgba(10, 15, 30, 0) 0%, rgba(10, 15, 30, 0.85) 100%)',
        borderTop: '1px solid rgba(100, 200, 255, 0.08)',
      }}
    >
      <HoverFooter navLinks={navLinks} heroSocials={heroSocials} footerBadges={footerBadges} />
    </footer>
  )
}

export default Footer
