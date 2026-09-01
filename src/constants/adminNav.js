import {
  Activity,
  Award,
  BarChart3,
  Briefcase,
  FileText,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Bell,
  Rocket,
  ScrollText,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react'

/**
 * Sidebar navigation for the admin portal.
 *
 * AdminSidebar splits this list at index 8: the first eight entries render
 * under "Primary" and everything after under "System". Insert new system pages
 * at index 8 or later, or they will silently move into the primary group.
 */
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
  { to: '/admin/system-health', label: 'System health', icon: Activity },
  { to: '/admin/cicd', label: 'CI/CD', icon: Rocket },
  { to: '/admin/logs', label: 'Logs', icon: ScrollText },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/account', label: 'Account profile', icon: UserRound },
]
