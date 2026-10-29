import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import HomePage from '../pages/public/HomePage'
import ProjectDetailsPage from '../pages/public/ProjectDetailsPage'
import NotFoundPage from '../pages/public/NotFoundPage'
import { Spinner } from '../components/ui/ui'

// صفحات الإدارة تُحمّل عند الحاجة فقط، فلا يحمّل الزائر كودها
const LoginPage = lazy(() => import('../pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'))
const ProfilePage = lazy(() => import('../pages/admin/ProfilePage'))
const ProjectsAdminPage = lazy(() => import('../pages/admin/ProjectsAdminPage'))
const SkillsAdminPage = lazy(() => import('../pages/admin/SkillsAdminPage'))
const ExperienceAdminPage = lazy(() => import('../pages/admin/ExperienceAdminPage'))
const CertificatesAdminPage = lazy(() => import('../pages/admin/CertificatesAdminPage'))
const MessagesPage = lazy(() => import('../pages/admin/MessagesPage'))
const IconsPage = lazy(() => import('../pages/admin/IconsPage'))
const DesignPage = lazy(() => import('../pages/admin/DesignPage'))
const StatisticsPage = lazy(() => import('../pages/admin/StatisticsPage'))
const AccountPage = lazy(() => import('../pages/admin/AccountPage'))

// حماية للواجهة فقط (تجربة المستخدم). الحماية الفعلية يجب أن تكون في Backend.
function RequireAuth({ children }) {
  const { authed, authReady } = useAuth()
  const location = useLocation()
  if (!authReady) return <Spinner />
  if (!authed) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return children
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects/:slug" element={<ProjectDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="projects" element={<ProjectsAdminPage />} />
          <Route path="skills" element={<SkillsAdminPage />} />
          <Route path="experience" element={<ExperienceAdminPage />} />
          <Route path="certificates" element={<CertificatesAdminPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="icons" element={<IconsPage />} />
          <Route path="design" element={<DesignPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
