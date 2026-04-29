import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { PortfolioProvider } from './context/PortfolioContext'
import ParticlesBackground from './components/ui/particles-bg'
import SkipLink from './components/SkipLink'
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

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'transparent', color: '#f1f5f9' }}>
      <div className="text-center max-w-lg">
        {/* Large 404 with gradient */}
        <h1
          className="text-[8rem] md:text-[10rem] font-extrabold leading-none mb-2"
          style={{
            background: 'linear-gradient(135deg, #7dd3fc 0%, #4169e1 50%, #3b82f6 100%)',
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
    <div className="min-h-screen text-[var(--color-text)]" style={{ position: 'relative', background: 'transparent' }}>
      <ParticlesBackground />
      <div className="liquid-glass-overlay" aria-hidden="true" />
      <div style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <BrowserRouter>
          <PortfolioProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingRoute />} />
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
          </PortfolioProvider>
        </BrowserRouter>
      </div>
    </div>
  )
}
