import { useEffect, useState } from 'react'

const SECTION_IDS = ['home', 'about', 'projects', 'beyond', 'experience', 'skills', 'education', 'certifications', 'contact']

/**
 * Uses IntersectionObserver to track which section is most visible in the viewport.
 * Returns the id of the active section for nav highlighting. Falls back to pathSection when no section is observed yet.
 */
export function useActiveSection(pathSection) {
  const [activeId, setActiveId] = useState(pathSection || 'home')

  useEffect(() => {
    setActiveId(pathSection || 'home')
  }, [pathSection])

  useEffect(() => {
    const observed = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          observed.set(entry.target.id, entry.intersectionRatio)
        })
        let best = { id: null, ratio: 0 }
        observed.forEach((ratio, id) => {
          if (ratio > best.ratio && ratio >= 0.1) best = { id, ratio }
        })
        if (best.id) setActiveId(best.id)
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-80px 0px -50% 0px' }
    )

    const timeout = setTimeout(() => {
      const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean)
      elements.forEach((el) => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [pathSection])

  return activeId
}
