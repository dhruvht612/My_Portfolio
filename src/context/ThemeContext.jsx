import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'theme'
const LIGHT_QUERY = '(prefers-color-scheme: light)'

/* Mobile browser chrome (Safari/Chrome address bar) is painted from this meta tag.
   Left at a single dark value it stayed near-black behind a light page. Values match
   --void in styles/tokens.css. */
const THEME_COLOR = { dark: '#07080d', light: '#f7f8fc' }

/* Must stay >= --dur in styles/tokens.css so the cross-fade completes before the
   .theme-switching class is removed. */
const THEME_FADE_MS = 360

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  followSystemTheme: () => {},
  isSystem: true,
})

function readStored() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function systemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark'
}

/* An explicit choice wins; otherwise follow the OS. The previous version defaulted
   everyone to dark, so a visitor whose system is set to light got dark on first load
   with no indication the site had a light theme at all.
   The pre-paint script in index.html duplicates this logic — keep the two in sync. */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  return readStored() ?? systemTheme()
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)
  /* True while no explicit choice has been stored, i.e. the site is mirroring the OS. */
  const [isSystem, setIsSystem] = useState(() => readStored() === null)

  const firstRun = useRef(true)

  useEffect(() => {
    const root = document.documentElement

    /* Paint the cross-fade only on an actual flip, never on mount — on first render
       the page has not been painted in the old theme, so there is nothing to fade
       from and the class would just delay first paint. */
    let timer
    if (firstRun.current) {
      firstRun.current = false
    } else {
      root.classList.add('theme-switching')
      timer = window.setTimeout(() => root.classList.remove('theme-switching'), THEME_FADE_MS)
    }

    root.setAttribute('data-theme', theme)

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', THEME_COLOR[theme] ?? THEME_COLOR.dark)

    /* Only an explicit choice is persisted. Writing the mirrored OS value would
       silently pin the theme and stop it following the system from then on. */
    if (!isSystem) {
      try {
        localStorage.setItem(STORAGE_KEY, theme)
      } catch {
        /* ignore persistence errors (private mode, etc.) */
      }
    }

    return () => window.clearTimeout(timer)
  }, [theme, isSystem])

  /* Follow the OS live while no explicit choice has been made. */
  useEffect(() => {
    if (!isSystem || typeof window === 'undefined' || !window.matchMedia) return undefined
    const mql = window.matchMedia(LIGHT_QUERY)
    const onChange = (event) => setThemeState(event.matches ? 'light' : 'dark')
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [isSystem])

  const setTheme = useCallback((next) => {
    if (next !== 'light' && next !== 'dark') return
    setIsSystem(false)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setIsSystem(false)
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  /* Drop the explicit choice and hand control back to the OS. */
  const followSystemTheme = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setIsSystem(true)
    setThemeState(systemTheme())
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, followSystemTheme, isSystem }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export default ThemeProvider
