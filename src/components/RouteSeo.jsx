import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PUBLIC_SEO, SITE_URL } from '../constants/seo'

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export default function RouteSeo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
    const page = PUBLIC_SEO[path]
    setMeta('name', 'robots', page ? 'index, follow' : 'noindex, follow')
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!page) {
      canonical?.remove()
      document.title = 'Dhruv Thakar Portfolio'
      return
    }
    const url = `${SITE_URL}${path}`
    document.title = page.title
    setMeta('name', 'description', page.description)
    setMeta('property', 'og:title', page.title)
    setMeta('property', 'og:description', page.description)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', page.title)
    setMeta('name', 'twitter:description', page.description)
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [pathname])
  return null
}
