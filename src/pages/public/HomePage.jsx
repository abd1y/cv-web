import { useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { Hero, Projects, Skills, Experience, Certificates, Contact } from '../../components/public/Sections'
import { apiRequest } from '../../api/client'
import { ErrorState, Spinner } from '../../components/ui/ui'

const MAP = {
  hero: Hero,
  projects: Projects,
  skills: Skills,
  experience: Experience,
  certificates: Certificates,
  contact: Contact,
}

export default function HomePage() {
  const { sections, profile, loading, error, reload } = useApp()

  useEffect(() => {
    document.title = `${profile.name} | معرض الأعمال`
  }, [profile.name])

  useEffect(() => {
    apiRequest('/public/analytics/visit/', { method: 'POST', data: { kind: 'home' } })
      .catch((error) => console.warn('Home visit was not recorded:', error.response?.status || error.message))
  }, [])

  if (loading) return <Spinner />
  if (error) return <ErrorState text={error} onRetry={() => reload().catch(() => {})} />

  return (
    <>
      {sections
        .filter((s) => s.visible)
        .map((s) => {
          const sectionId = s.section_id || s.id
          const Component = MAP[sectionId]
          return Component ? <Component key={sectionId} /> : null
        })}
    </>
  )
}
