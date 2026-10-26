import { readFileSync } from 'node:fs'
import { render, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RouteSeo from './RouteSeo'
import { PUBLIC_SEO, SITE_URL } from '../constants/seo'

afterEach(cleanup)

it('lists exactly the public routes in valid sitemap XML and matches real route declarations', () => {
  const source = readFileSync('public/sitemap.xml', 'utf8')
  const xml = new DOMParser().parseFromString(source, 'application/xml')
  expect(xml.querySelector('parsererror')).toBeNull()
  expect(xml.documentElement.namespaceURI).toBe('http://www.sitemaps.org/schemas/sitemap/0.9')
  const urls = [...xml.querySelectorAll('loc')].map((node) => node.textContent)
  expect(urls.sort()).toEqual(Object.keys(PUBLIC_SEO).map((path) => `${SITE_URL}${path}`).sort())
  expect(new Set(urls).size).toBe(urls.length)
  const app = readFileSync('src/App.jsx', 'utf8')
  for (const path of Object.keys(PUBLIC_SEO).filter((path) => path !== '/')) {
    expect(app).toContain(`<Route path="${path.slice(1)}" element={<`)
  }
  expect(readFileSync('public/robots.txt', 'utf8')).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
})

it('sets route-specific canonical metadata without query strings or anchors', async () => {
  render(<MemoryRouter initialEntries={['/projects?source=test#projects']}><RouteSeo /></MemoryRouter>)
  await waitFor(() => expect(document.title).toBe(PUBLIC_SEO['/projects'].title))
  expect(document.querySelector('link[rel="canonical"]').href).toBe(`${SITE_URL}/projects`)
  expect(document.querySelector('meta[name="description"]').content).toBe(PUBLIC_SEO['/projects'].description)
  expect(document.querySelector('meta[name="robots"]').content).toBe('index, follow')
})

it('removes public canonical tags and prevents indexing private or unknown routes', () => {
  for (const path of ['/admin/login', '/admin/projects', '/404', '/missing']) {
    const view = render(<MemoryRouter initialEntries={[path]}><RouteSeo /></MemoryRouter>)
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.querySelector('meta[name="robots"]').content).toBe('noindex, follow')
    view.unmount()
  }
})
