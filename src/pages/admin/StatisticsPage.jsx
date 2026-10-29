import { useEffect, useState } from 'react'
import { apiRequest, errorMessage } from '../../api/client'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/ui'

const RANGES = [
  { key: 7, label: 'آخر 7 أيام' },
  { key: 30, label: 'آخر 30 يومًا' },
  { key: 365, label: 'آخر 365 يومًا' },
]

export default function StatisticsPage() {
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    apiRequest(`/admin/analytics/summary/?days=${days}`)
      .then((data) => { if (active) setStats(data) })
      .catch((requestError) => { if (active) setError(errorMessage(requestError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [days])

  if (loading) return <Spinner />
  if (error) return <ErrorState text={error} />

  const topProjects = stats?.top_projects || []
  const max = Math.max(1, ...topProjects.map((project) => project.visits))

  return (
    <div>
      <div className="admin-head">
        <h1>الإحصائيات</h1>
        <div className="seg" role="group" aria-label="الفترة الزمنية">
          {RANGES.map((range) => (
            <button key={range.key} className={`seg__btn ${days === range.key ? 'seg__btn--on' : ''}`} onClick={() => setDays(range.key)} aria-pressed={days === range.key}>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <strong>{(stats?.total || 0).toLocaleString('ar-EG')}</strong>
          <span>إجمالي الزيارات</span>
        </div>
        <div className="card stat-card">
          <strong>{(stats?.unique_visitors || 0).toLocaleString('ar-EG')}</strong>
          <span>زوار فريدون (تقديري)</span>
        </div>
        <div className="card stat-card">
          <strong>{(stats?.home_visits || 0).toLocaleString('ar-EG')}</strong>
          <span>زيارات الصفحة الرئيسية</span>
        </div>
        <div className="card stat-card">
          <strong>{(stats?.project_visits || 0).toLocaleString('ar-EG')}</strong>
          <span>زيارات المشاريع</span>
        </div>
      </div>

      <section className="card form">
        <h2>المشاريع حسب الزيارات</h2>
        {topProjects.length === 0 ? <EmptyState title="لا توجد زيارات مشاريع في هذه الفترة." /> : (
          <ol className="bars">
            {topProjects.map((project, index) => (
              <li key={project.project_id}>
                <span className="bars__label">{index + 1}. {project.project_title}</span>
                <span className="bars__track">
                  <span className="bars__fill" style={{ width: `${(project.visits / max) * 100}%` }} />
                </span>
                <strong>{project.visits.toLocaleString('ar-EG')}</strong>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
