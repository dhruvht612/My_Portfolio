function Preloader() {
  return (
    <div id="preloader" className="fixed inset-0 bg-[var(--color-bg)] flex items-center justify-center z-50" aria-hidden="true">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[var(--color-accent)] border-solid" />
    </div>
  )
}

export default Preloader

