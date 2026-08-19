import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { PortfolioProvider } from './context/PortfolioContext'
import { ThemeProvider } from './context/ThemeContext'
import { useAuth } from './hooks/useAuth'
import ParticlesBackground from './components/ui/particles-bg'
import CursorGlow from './components/ui/cursor-glow'
import SkipLink from './components/SkipLink'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './components/Landing'
import Layout from './components/Layout'
import './index.css'

// Lazy-loaded page components for better initial bundle size
const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const BeyondPage = lazy(() => import('./pages/BeyondPage'))
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'))
const EducationPage = lazy(() => import('./pages/EducationPage'))
const CertificationsPage = lazy(() => import('./pages/CertificationsPage'))
const SkillsPage = lazy(() => import('./pages/SkillsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const DevSupabaseStatus = import.meta.env.DEV ? lazy(() => import('./pages/DevSupabaseStatus')) : null
const StyleGuide = import.meta.env.DEV ? lazy(() => import('./pages/StyleGuide')) : null

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'))
const AdminExperiences = lazy(() => import('./pages/admin/AdminExperiences'))
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'))
const AdminSkills = lazy(() => import('./pages/admin/AdminSkills'))
const AdminCertifications = lazy(() => import('./pages/admin/AdminCertifications'))
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'))
const AdminBlogEditor = lazy(() => import('./pages/admin/AdminBlogEditor'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))
const AdminEducation = lazy(() => import('./pages/admin/AdminEducation'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminSystemHealth = lazy(() => import('./pages/admin/AdminSystemHealth'))
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'))
const AdminAccountProfile = lazy(() => import('./pages/admin/AdminAccountProfile'))

function ProtectedRoute({ children }) {
  const { session, loading, configured } = useAuth()
  if (!configured) return <Navigate to="/admin/login" replace />
  if (loading) return <PageLoader />
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
      <div className="text-center space-y-4">
        <div
          className="mx-auto h-10 w-10 rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]"
          style={{ animation: 'spin 0.7s linear infinite' }}
        />
        <p className="text-sm text-[var(--color-text-muted)] font-medium tracking-wide">Loading...</p>
      </div>
    </div>
  )
}

function LandingRoute() {
  return (
    <div className="min-h-screen text-[var(--color-text)] relative z-10" style={{ background: 'transparent' }}>
      <SkipLink />
      <Landing />
    </div>
  )
}

/** Public site: static backdrop + particles + glass. Authenticated admin (`/admin/*` except login): backdrop only. */
function AmbientLayers() {
  const { pathname } = useLocation()
  // Decorative layers mount after the browser is idle so first paint is content, not canvases.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const start = () => setReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(start, 350)
    return () => window.clearTimeout(id)
  }, [])

  if (!ready) return null
  const adminApp = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
  /* The admin console is dark-only (see .admin-scope in styles/tokens.css). The
     backdrop renders outside that subtree, so it has to opt in separately or a light
     public theme would show a pale canvas behind the dark admin panels. */
  const isAdminRoute = pathname.startsWith('/admin')
  return (
    <div className={`ambient-fade-in${isAdminRoute ? ' admin-scope' : ''}`}>
      {/* Fixed canvas behind everything. This hardcoded #070b14 was why the theme
          toggle looked broken: every page sets background:transparent, so this layer
          — not <body> — is what the visitor actually sees, and it stayed near-black
          in light mode. It reads --backdrop-* tokens now. */}
      <div className="ambient-backdrop" aria-hidden>
        <div className="ambient-backdrop-gradient" />
      </div>
      {!adminApp ? (
        <>
          <ParticlesBackground />
          <CursorGlow />
          <div className="liquid-glass-overlay" aria-hidden="true" />
        </>
      ) : null}
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'transparent', color: 'var(--color-text)' }}>
      <div className="text-center max-w-lg">
        {/* Large 404 with gradient */}
        <h1
          className="text-[8rem] md:text-[10rem] font-extrabold leading-none mb-2"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-blue) 50%, var(--color-blue) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 40px rgba(125, 211, 252, 0.25))',
          }}
        >
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[var(--color-text)]">
          Page Not Found
        </h2>
        <p className="text-[var(--color-text-muted)] mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/home"
            className="theme-btn theme-btn-primary px-6 py-3 text-sm"
          >
            <i className="fas fa-home mr-2" aria-hidden />
            Go Home
          </Link>
          <Link
            to="/projects"
            className="theme-btn theme-btn-secondary px-6 py-3 text-sm"
          >
            <i className="fas fa-code mr-2" aria-hidden />
            View Projects
          </Link>
          <Link
            to="/contact"
            className="theme-btn theme-btn-secondary px-6 py-3 text-sm"
          >
            <i className="fas fa-envelope mr-2" aria-hidden />
            Contact Me
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <div className="min-h-screen text-[var(--color-text)]" style={{ position: 'relative', background: 'transparent' }}>
        <AmbientLayers />
        <div style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
          <PortfolioProvider>
            <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingRoute />} />
                {import.meta.env.DEV && DevSupabaseStatus ? (
                  <Route path="dev/supabase" element={<DevSupabaseStatus />} />
                ) : null}
                {import.meta.env.DEV && StyleGuide ? (
                  <Route path="styleguide" element={<StyleGuide />} />
                ) : null}
                <Route path="admin/login" element={<AdminLogin />} />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="experiences" element={<AdminExperiences />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="skills" element={<AdminSkills />} />
                  <Route path="certifications" element={<AdminCertifications />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="blog/new" element={<AdminBlogEditor />} />
                  <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="education" element={<AdminEducation />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="system-health" element={<AdminSystemHealth />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="account" element={<AdminAccountProfile />} />
                </Route>
                <Route element={<Layout />}>
                  <Route path="home" element={<HomePage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="beyond" element={<BeyondPage />} />
                  <Route path="experience" element={<ExperiencePage />} />
                  <Route path="education" element={<EducationPage />} />
                  <Route path="certifications" element={<CertificationsPage />} />
                  <Route path="skills" element={<SkillsPage />} />
                  <Route path="contact" element={<ContactPage />} />
                </Route>
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
            </ErrorBoundary>
          </PortfolioProvider>
        </div>
      </div>
      </ThemeProvider>
      {/* Vercel Web Analytics. The `/react` entrypoint, not `/next` — that one pulls in
          next/navigation, which does not exist here. Inside BrowserRouter so client-side
          route changes are counted; it stays inert off Vercel. */}
      <Analytics />
    </BrowserRouter>
  )
}
