import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Inbox, Eye, Users } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { apiRequest, errorMessage } from '../../api/client'

export default function DashboardPage() {
  const { lists } = useApp()
  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState('')
  const published = lists.projects.filter((p) => p.is_published).length
  const unread = lists.messages.filter((m) => !m.is_read).length

  useEffect(() => {
    apiRequest('/admin/analytics/summary/?days=30')
      .then(setStats)
      .catch((error) => setStatsError(errorMessage(error)))
  }, [])

  const cards = [
    { label: 'مشاريع منشورة', value: `${published} / ${lists.projects.length}`, Icon: FolderKanban, to: '/admin/projects' },
    { label: 'رسائل غير مقروءة', value: unread, Icon: Inbox, to: '/admin/messages' },
    { label: 'زيارات (30 يومًا)', value: stats?.total ?? '—', Icon: Eye, to: '/admin/statistics' },
    { label: 'زوار فريدون تقريبًا', value: stats?.unique_visitors ?? '—', Icon: Users, to: '/admin/statistics' },
  ]

  return (
    <div>
      <div className="admin-head">
        <h1>نظرة عامة</h1>
      </div>
      {statsError && <p className="notice notice--error" role="alert">{statsError}</p>}
      <div className="stat-grid">
        {cards.map(({ label, value, Icon, to }) => (
          <Link key={label} to={to} className="card stat-card">
            <Icon size={22} aria-hidden="true" />
            <strong>{value}</strong>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
