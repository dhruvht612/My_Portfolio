import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { PortfolioProvider } from './context/PortfolioContext'
import { useAuth } from './hooks/useAuth'
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
const DevSupabaseStatus = import.meta.env.DEV ? lazy(() => import('./pages/DevSupabaseStatus')) : null

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
                {import.meta.env.DEV && DevSupabaseStatus ? (
                  <Route path="dev/supabase" element={<DevSupabaseStatus />} />
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
          </PortfolioProvider>
        </BrowserRouter>
      </div>
    </div>
  )
}
