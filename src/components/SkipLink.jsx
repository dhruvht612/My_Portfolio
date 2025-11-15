function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#22d3ee] text-[#0f172a] px-4 py-2 rounded-lg font-semibold z-50 focus:outline-none focus:ring-2 focus:ring-[#22d3ee] focus:ring-offset-2 focus:ring-offset-gray-900"
    >
      Skip to main content
    </a>
  )
}

export default SkipLink

