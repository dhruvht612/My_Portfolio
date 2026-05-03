import {
  Award,
  BarChart3,
  Briefcase,
  FileText,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Sparkles,
  UserRound,
} from 'lucide-react'

/** Sidebar navigation for the admin portal. */
export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/profile', label: 'Profile', icon: UserRound },
  { to: '/admin/experiences', label: 'Experiences', icon: Briefcase },
  { to: '/admin/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/admin/skills', label: 'Skills', icon: Sparkles },
  { to: '/admin/certifications', label: 'Certifications', icon: Award },
  { to: '/admin/blog', label: 'Blog', icon: FileText },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/education', label: 'Education', icon: GraduationCap },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]
