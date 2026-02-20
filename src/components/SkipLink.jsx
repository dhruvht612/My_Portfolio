function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[var(--color-orange)] text-white px-4 py-2 rounded-lg font-semibold z-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
    >
      Skip to main content
    </a>
  )
}

export default SkipLink

