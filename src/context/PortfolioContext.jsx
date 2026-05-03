/**
 * Portfolio data layer.
 *
 * When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`) are set, we fetch the slice
 * that used to live only in `src/data/*` from Supabase on mount. While that request
 * is in flight, the UI still renders the bundled static data so there is no empty
 * flash. On failure, we keep static data and record `__error` for diagnostics.
 */
import { createContext, useContext, useMemo } from 'react'
import { aboutTabs as staticAboutTabs } from '../data/about'
import { PROJECT_FILTERS as staticProjectFilters, projects as staticProjects } from '../data/projects'
import { certifications as staticCertifications } from '../data/certifications'
import { experienceByOrg as staticExperienceByOrg } from '../data/experience'
import { skillGroups as staticSkillGroups } from '../data/skills'
import {
  beyondStats,
  educationHighlights,
  focusAreas,
  goals,
} from '../data/portfolioExtras'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useSupabasePortfolioSlice } from '../hooks/useSupabasePortfolioSlice'

export { beyondStats, educationHighlights, focusAreas, goals }

/** Static fallback — same data as before the Supabase refactor. */
const STATIC_PORTFOLIO_SLICE = {
  aboutTabs: staticAboutTabs,
  projects: staticProjects,
  PROJECT_FILTERS: staticProjectFilters,
  certifications: staticCertifications,
  experienceByOrg: staticExperienceByOrg,
  skillGroups: staticSkillGroups,
  focusAreas,
  educationHighlights,
  beyondStats,
  goals,
}

export const navLinks = [
  { id: 'home', path: '/home', label: 'Home' },
  { id: 'about', path: '/about', label: 'About' },
  { id: 'projects', path: '/projects', label: 'Projects' },
  { id: 'beyond', path: '/beyond', label: 'Beyond' },
  { id: 'experience', path: '/experience', label: 'Experience' },
  { id: 'skills', path: '/skills', label: 'Skills' },
  { id: 'education', path: '/education', label: 'Education' },
  { id: 'certifications', path: '/certifications', label: 'Certifications' },
  { id: 'contact', path: '/contact', label: 'Contact' },
]

export const typedRoles = [
  'Computer Science Student',
  'Full-Stack Developer',
  'Embedded Systems Enthusiast',
  'Community Builder',
]

export const heroSocials = [
  { href: 'https://github.com/dhruvht612', label: "Visit Dhruv's GitHub profile (opens in new tab)", icon: 'fab fa-github', ring: 'focus:ring-[#5b7cf5]', tooltip: 'GitHub' },
  { href: 'https://linkedin.com/in/dhruv-thakar-ba46aa296', label: "Visit Dhruv's LinkedIn profile (opens in new tab)", icon: 'fab fa-linkedin', ring: 'focus:ring-[#4169E1]', tooltip: 'LinkedIn' },
  { href: 'mailto:thakardhruvh@gmail.com', label: 'Send email to thakardhruvh@gmail.com', icon: 'fas fa-envelope', ring: 'focus:ring-[#facc15]', tooltip: 'Email' },
  { href: 'https://www.instagram.com/dhruv_200612/?hl=en', label: "Visit Dhruv's Instagram profile (opens in new tab)", icon: 'fab fa-instagram', ring: 'focus:ring-[#ec4899]', tooltip: 'Instagram' },
]

export const quickStats = [
  { value: '9', label: 'Projects', accent: 'text-theme-accent' },
  { value: '5+', label: 'Technologies', accent: 'text-theme-accent-hover' },
  { value: '2028', label: 'Graduation', accent: 'text-theme-accent' },
]

export const aboutCounters = [
  { target: 9, label: 'Projects', accent: 'text-theme-accent', suffix: '' },
  { target: 6, label: 'Technologies Mastered', accent: 'text-theme-accent-hover', suffix: '+' },
  { target: 3, label: 'Years of Experience', accent: 'text-theme-accent', suffix: '' },
  { target: 5, label: 'Leadership Roles', accent: 'text-theme-accent-hover', suffix: '+' },
]

export const projectStats = [
  { value: '9', label: 'Projects', gradient: 'from-[var(--color-blue-soft)] to-[var(--color-accent)]/20', accent: 'text-theme-accent' },
  { value: '10+', label: 'Technologies', gradient: 'from-[var(--color-accent)]/10 to-[var(--color-blue-soft)]', accent: 'text-theme-accent-hover' },
  { value: 'Full-Stack', label: 'Focus', gradient: 'from-[var(--color-blue-soft)] to-[var(--color-orange)]/10', accent: 'text-theme-accent' },
  { value: '2025', label: 'Latest Update', gradient: 'from-[var(--color-orange)]/10 to-[var(--color-accent)]/20', accent: 'text-theme-accent-hover' },
]

export const contactCards = [
  { title: 'Email', value: 'thakardhruvh@gmail.com', icon: 'fas fa-envelope', href: 'mailto:thakardhruvh@gmail.com', accent: 'from-[var(--color-blue-soft)] to-[var(--color-blue-medium)]' },
  { title: 'Location', value: 'Oshawa, Ontario, Canada', icon: 'fas fa-map-marker-alt', accent: 'from-[var(--color-blue-medium)] to-[var(--color-blue-soft)]' },
  { title: 'Availability', value: 'Open to Opportunities', icon: 'fas fa-check-circle', accent: 'from-[var(--color-success)]/20 to-emerald-500/20' },
]

export const altContactLinks = [
  { label: 'GitHub Profile', href: 'https://github.com/dhruvht612', icon: 'fab fa-github', hover: 'hover:bg-theme-blue hover:border-theme-blue' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/dhruv-thakar', icon: 'fab fa-linkedin', hover: 'hover:bg-[#0077b5] hover:border-[#0077b5]' },
  {
    label: 'Resume · Systems Analyst',
    href: '/Dhruv_Thakar_Systems_Analyst_Resume.pdf',
    download: 'Dhruv_Thakar_Systems_Analyst_Resume.pdf',
    icon: 'fas fa-download',
    hover: 'hover:bg-theme-blue hover:border-theme-blue',
  },
  {
    label: 'Resume · Data Analyst',
    href: '/Dhruv_Thakar_Data_Analyst_Resume.pdf',
    download: 'Dhruv_Thakar_Data_Analyst_Resume.pdf',
    icon: 'fas fa-download',
    hover: 'hover:bg-theme-blue hover:border-theme-blue',
  },
  {
    label: 'Resume · Software Developer',
    href: '/Dhruv_Thakar_Software_Developer_Resume.pdf',
    download: 'Dhruv_Thakar_Software_Developer_Resume.pdf',
    icon: 'fas fa-download',
    hover: 'hover:bg-theme-blue hover:border-theme-blue',
  },
]

export const footerBadges = [
  'https://img.shields.io/badge/HTML5-%23E34F26.svg?&style=flat&logo=html5&logoColor=white',
  'https://img.shields.io/badge/Tailwind-%2306B6D4.svg?&style=flat&logo=tailwind-css&logoColor=white',
  'https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?&style=flat&logo=javascript&logoColor=black',
]

export const initialChatMessages = [{ id: 1, from: 'bot', text: 'Hey there! 👋 Ready to build something amazing together?' }]

const PortfolioContext = createContext(null)

export function PortfolioProvider({ children }) {
  const { data: remoteSlice, loading: remoteLoading, error: remoteError } = useSupabasePortfolioSlice()

  const meta = useMemo(() => {
    if (!isSupabaseConfigured || !supabase) {
      return { __source: 'fallback', __loading: false, __error: null }
    }
    if (remoteLoading) {
      return { __source: 'pending', __loading: true, __error: null }
    }
    if (remoteError) {
      console.warn('Supabase fetch failed, using fallback data:', remoteError)
      return { __source: 'fallback', __loading: false, __error: remoteError }
    }
    if (remoteSlice) {
      return { __source: 'supabase', __loading: false, __error: null }
    }
    return { __source: 'fallback', __loading: false, __error: null }
  }, [remoteLoading, remoteError, remoteSlice])

  const slice = remoteSlice ?? STATIC_PORTFOLIO_SLICE

  const value = useMemo(
    () => ({
      navLinks,
      typedRoles,
      heroSocials,
      quickStats,
      aboutCounters,
      projectStats,
      beyondStats: slice.beyondStats,
      goals: slice.goals,
      contactCards,
      altContactLinks,
      footerBadges,
      focusAreas: slice.focusAreas,
      educationHighlights: slice.educationHighlights,
      initialChatMessages,
      aboutTabs: slice.aboutTabs,
      PROJECT_FILTERS: slice.PROJECT_FILTERS,
      projects: slice.projects,
      certifications: slice.certifications,
      experienceByOrg: slice.experienceByOrg,
      skillGroups: slice.skillGroups,
      __source: meta.__source,
      __loading: meta.__loading,
      __error: meta.__error,
    }),
    [slice, meta.__source, meta.__loading, meta.__error],
  )

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider')
  return ctx
}
