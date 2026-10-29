import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Check, Copy, ExternalLink, Linkedin, MessageCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { TechList } from '../../components/public/Sections'
import NotFoundPage from './NotFoundPage'
import { apiRequest } from '../../api/client'
import { ErrorState, Spinner } from '../../components/ui/ui'

export default function ProjectDetailsPage() {
  const { slug } = useParams()
  const { loading: appLoading, error: appError } = useApp()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [zoom, setZoom] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    apiRequest(`/public/projects/${encodeURIComponent(slug)}/`)
      .then((data) => {
        if (active) setProject({
          ...data,
          cover: data.cover || '',
          technologies: (data.technologies || []).map((technology) => technology.key),
          screenshots: data.screenshots || [],
        })
      })
      .catch((requestError) => {
        if (!active && requestError.response?.status === 404) return
        if (active && requestError.response?.status === 404) setProject(null)
        else if (active) setError(appError || 'تعذر تحميل بيانات المشروع.')
      })
      .finally(() => { if (active) setLoading(false) })
    apiRequest('/public/analytics/visit/', {
      method: 'POST',
      data: { kind: 'project', project_slug: slug },
    }).catch((requestError) => console.warn('Project visit was not recorded:', requestError.response?.status || requestError.message))
    return () => { active = false }
  }, [slug])

  useEffect(() => {
    if (project) document.title = `${project.title} | معرض الأعمال`
  }, [project])

  if (loading || appLoading) return <Spinner />
  if (error) return <ErrorState text={error} />
  if (!project) {
    return <NotFoundPage title="المشروع غير موجود" text="قد يكون الرابط خاطئًا أو أن المشروع غير متاح للعرض." />
  }

  const url = window.location.href
  const shareText = encodeURIComponent(`${project.title} - ${url}`)
  const whatsapp = `https://wa.me/?text=${shareText}`
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const t = document.createElement('textarea')
      t.value = url
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <article className="section project-page">
      <div className="container">
        <Link to="/" className="back-link">
          <ArrowRight size={18} aria-hidden="true" /> الرجوع للرئيسية
        </Link>

        <header className="project-page__head">
          <div className="project-page__badges">
            {project.is_featured && <span className="badge badge--accent">مميز</span>}
            {project.status && <span className="badge">{project.status}</span>}
          </div>
          <h1>{project.title}</h1>
          <p className="project-page__summary">{project.summary}</p>
          <div className="project-page__actions">
            {project.project_url && (
              <a className="btn btn--primary" href={project.project_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} aria-hidden="true" /> زيارة موقع المشروع
              </a>
            )}
            <a className="btn btn--outline" href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} aria-hidden="true" /> مشاركة عبر WhatsApp
            </a>
            <a className="btn btn--outline" href={linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin size={16} aria-hidden="true" /> مشاركة عبر LinkedIn
            </a>
            <button className="btn btn--outline" onClick={copy} aria-live="polite">
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? 'تم النسخ' : 'نسخ الرابط'}
            </button>
          </div>
        </header>

        <img className="project-page__cover" src={project.cover} alt={`غلاف مشروع ${project.title}`} />

        <div className="project-page__grid">
          <div>
            {project.description && (
              <section>
                <h2>وصف المشروع</h2>
                <p>{project.description}</p>
              </section>
            )}
            {project.how_it_works && (
              <section>
                <h2>آلية عمل المشروع</h2>
                <p>{project.how_it_works}</p>
              </section>
            )}
          </div>
          {project.technologies.length > 0 && (
            <aside className="card project-page__tech">
              <h2>التقنيات المستخدمة</h2>
              <TechList keys={project.technologies} />
            </aside>
          )}
        </div>

        {project.screenshots.length > 0 && (
          <section>
            <h2>لقطات من المشروع</h2>
            <div className="shots">
              {project.screenshots.map((src, i) => (
                <button key={src.id} className="shots__item" onClick={() => setZoom(src)} aria-label={`تكبير اللقطة رقم ${i + 1}`}>
                  <img src={src.image} alt={src.alt_text || `لقطة ${i + 1} من ${project.title}`} loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {zoom && (
        <div className="lightbox" onClick={() => setZoom(null)} role="dialog" aria-modal="true" aria-label="عرض اللقطة">
          <img src={zoom.image} alt={zoom.alt_text || 'لقطة مكبّرة'} />
        </div>
      )}
    </article>
  )
}
