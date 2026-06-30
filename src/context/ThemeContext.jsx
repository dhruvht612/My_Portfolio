import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {}, setTheme: () => {} })

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  try {
    return localStorage.getItem(STORAGE_KEY) || 'dark'
  } catch {
    return 'dark'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore persistence errors (private mode, etc.) */
    }
  }, [theme])

  const setTheme = useCallback((next) => setThemeState(next), [])
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
    []
  )

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export default ThemeProvider