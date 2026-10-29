import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Wrench,
  Briefcase,
  Award,
  Inbox,
  Shapes,
  Palette,
  BarChart3,
  KeyRound,
  LogOut,
  Menu,
  X,
  Globe,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { errorMessage } from '../api/client'

const NAV = [
  { to: '/admin', label: 'نظرة عامة', Icon: LayoutDashboard, end: true },
  { to: '/admin/profile', label: 'الملف الشخصي', Icon: User },
  { to: '/admin/projects', label: 'المشاريع', Icon: FolderKanban },
  { to: '/admin/skills', label: 'المهارات', Icon: Wrench },
  { to: '/admin/experience', label: 'الخبرات', Icon: Briefcase },
  { to: '/admin/certificates', label: 'الشهادات', Icon: Award },
  { to: '/admin/messages', label: 'الرسائل', Icon: Inbox, badge: true },
  { to: '/admin/icons', label: 'الأيقونات', Icon: Shapes },
  { to: '/admin/design', label: 'التصميم', Icon: Palette },
  { to: '/admin/statistics', label: 'الإحصائيات', Icon: BarChart3 },
  { to: '/admin/account', label: 'الحساب', Icon: KeyRound },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const { logout } = useAuth()
  const { lists } = useApp()
  const navigate = useNavigate()
  const unread = lists.messages.filter((m) => !m.is_read).length

  const doLogout = async () => {
    setLogoutError('')
    try {
      await logout()
    } catch (error) {
      setLogoutError(errorMessage(error))
    }
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin">
      <aside className={`admin-side ${open ? 'admin-side--open' : ''}`}>
        <div className="admin-side__brand">لوحة الإدارة</div>
        <nav aria-label="قائمة الإدارة">
          {NAV.map(({ to, label, Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} className="admin-link" onClick={() => setOpen(false)}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
              {badge && unread > 0 && <span className="count">{unread}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side__foot">
          <Link to="/" className="admin-link" target="_blank">
            <Globe size={18} aria-hidden="true" /> <span>عرض الموقع</span>
          </Link>
          <button className="admin-link" onClick={doLogout}>
            <LogOut size={18} aria-hidden="true" /> <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      <div className="admin-main">
        <header className="admin-top">
          <button className="icon-btn admin-menu" onClick={() => setOpen((o) => !o)} aria-label="القائمة" aria-expanded={open}>
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
          <span className="demo-flag">إدارة محمية بجلسة Django بعد التحقق برمز OTP</span>
        </header>
        {logoutError && <p className="notice notice--error" role="alert">{logoutError}</p>}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
