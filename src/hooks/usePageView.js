import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function getOrCreateVisitorId() {
  try {
    let id = localStorage.getItem('visitor_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('visitor_id', id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

function getDeviceInfo() {
  const ua = navigator.userAgent
  let deviceType = 'desktop'
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile'
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet'

  let browser = 'unknown'
  if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome'
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
  else if (/Edg/i.test(ua)) browser = 'Edge'

  return { deviceType, browser }
}

/**
 * Fire-and-forget page view insert. Skips admin/dev routes and when Supabase is not configured.
 */
export function usePageView() {
  const location = useLocation()
  const lastPathRef = useRef(null)

  useEffect(() => {
    if (!supabase) return
    const path = location.pathname
    if (path.startsWith('/admin') || path.startsWith('/dev/')) return
    if (lastPathRef.current === path) return
    lastPathRef.current = path

    const visitorId = getOrCreateVisitorId()
    const { deviceType, browser } = getDeviceInfo()

    supabase
      .from('page_views')
      .insert({
        visitor_id: visitorId,
        path,
        referrer: document.referrer || 'direct',
        device_type: deviceType,
        browser,
      })
      .then(({ error }) => {
        if (error) console.warn('Analytics tracking failed:', error.message)
      })
  }, [location.pathname])
}

/**
 * Track a project CTA click (optional; call from project cards/modals).
 * @param {string} projectId
 */
export function trackProjectClick(projectId) {
  if (!supabase || !projectId) return
  const visitorId = getOrCreateVisitorId()
  supabase
    .from('page_views')
    .insert({
      visitor_id: visitorId,
      path: typeof window !== 'undefined' ? window.location.pathname : '/',
      project_clicked: projectId,
    })
    .then(({ error }) => {
      if (error) console.warn('Project click tracking failed:', error.message)
    })
}
