function Preloader() {
  return (
    <div id="preloader" className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50" aria-hidden="true">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-400 border-solid" />
    </div>
  )
}

export default Preloader

