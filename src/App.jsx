import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { PortfolioProvider } from './context/PortfolioContext'
import SkipLink from './components/SkipLink'
import Landing from './components/Landing'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProjectsPage from './pages/ProjectsPage'
import BeyondPage from './pages/BeyondPage'
import ExperiencePage from './pages/ExperiencePage'
import EducationPage from './pages/EducationPage'
import CertificationsPage from './pages/CertificationsPage'
import SkillsPage from './pages/SkillsPage'
import ContactPage from './pages/ContactPage'
import './index.css'

function LandingRoute() {
  return (
    <div className="theme-dark-blue-page min-h-screen text-[var(--color-text)]">
      <SkipLink />
      <Landing />
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#0a0e17', color: '#f1f5f9' }}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Page not found</h1>
        <p className="text-[var(--color-text-muted)] mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/home" className="text-[var(--color-accent)] font-semibold hover:underline">
          Go to Home
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <PortfolioProvider>
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
      </PortfolioProvider>
    </BrowserRouter>
  )
}
