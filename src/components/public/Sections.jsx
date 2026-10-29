import { Link } from 'react-router-dom'
import { Phone, MapPin, ExternalLink } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { EmptyState } from '../ui/ui'
import AppIcon from '../AppIcon'
import SocialLinks from './SocialLinks'
import ContactForm from './ContactForm'
import { formatMonth } from '../../utils/format'

function SectionShell({ id, title, children }) {
  return (
    <section id={`section-${id}`} className="section">
      <div className="container">
        <h2 className="section__title">{title}</h2>
        {children}
      </div>
    </section>
  )
}

export function Hero() {
  const { profile } = useApp()
  return (
    <section id="section-hero" className="hero" 
    style={{backgroundImage:`url(${profile.image})`}}>
      <div className="container hero__inner">
        <div className="hero__text">
          <p className="hero__eyebrow">{profile.title}</p>
          <h1>{profile.name}</h1>
          <p className="hero__bio">{profile.bio}</p>
          <ul className="hero__meta">
            {profile.phone && (
              <li>
                <Phone size={18} aria-hidden="true" />
                <a href={`tel:${profile.phone.replace(/\s/g, '')}`} dir="ltr">
                  {profile.phone}
                </a>
              </li>
            )}
            {profile.province && (
              <li>
                <MapPin size={18} aria-hidden="true" />
                <span>{profile.province}</span>
              </li>
            )}
          </ul>
          <SocialLinks profile={profile} />
        </div>

      </div>
    </section>
  )
}

export function Projects() {
  const { lists } = useApp()
  // المنشورة فقط، والمميزة أولًا (يحافظ على ترتيب الإدارة داخل كل مجموعة)
  const published = lists.projects.filter((p) => p.is_published)
  const items = [...published.filter((p) => p.is_featured), ...published.filter((p) => !p.is_featured)]
  return (
    <SectionShell id="projects" title="المشاريع">
      {items.length === 0 ? (
        <EmptyState title="لا توجد مشاريع منشورة حاليًا" text="ستظهر المشاريع هنا فور نشرها." />
      ) : (
        <div className="grid grid--projects">
          {items.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`} className="card project-card">
              <div className="project-card__cover">
                <img src={p.cover} alt={`غلاف مشروع ${p.title}`} loading="lazy" />
                <div className="project-card__badges">
                  {p.is_featured && <span className="badge badge--accent">مميز</span>}
                  {p.status && <span className="badge">{p.status}</span>}
                </div>
              </div>
              <div className="project-card__body">
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
                <span className="project-card__more">
                  عرض التفاصيل <ExternalLink size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </SectionShell>
  )
}

export function Skills() {
  const { lists } = useApp()
  const items = lists.skills.filter((s) => s.is_visible)
  return (
    <SectionShell id="skills" title="المهارات والتقنيات">
      {items.length === 0 ? (
        <EmptyState title="لم تُضف مهارات بعد" />
      ) : (
        <ul className="skills">
          {items.map((s) => (
            <li key={s.id} className="skill">
              <AppIcon iconKey={s.icon_key} customIcon={s.icon} label={s.name} size={44} />
              <span>{s.name}</span>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  )
}

export function Experience() {
  const { lists } = useApp()
  const items = lists.experience.filter((e) => e.is_visible)
  return (
    <SectionShell id="experience" title="الخبرات الوظيفية">
      {items.length === 0 ? (
        <EmptyState title="لا توجد خبرات لعرضها" />
      ) : (
        <ol className="timeline">
          {items.map((e) => (
            <li key={e.id} className="timeline__item">
              <div className="card timeline__card">
                <h3>{e.title}</h3>
                <p className="timeline__company">{e.company}</p>
                {(e.start || e.end) && (
                  <p className="timeline__date">
                    {formatMonth(e.start)} — {e.end ? formatMonth(e.end) : 'حتى الآن'}
                  </p>
                )}
                <p>{e.description}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionShell>
  )
}

export function Certificates() {
  const { lists } = useApp()
  const items = lists.certificates.filter((c) => c.is_visible)
  return (
    <SectionShell id="certificates" title="الشهادات والورشات">
      {items.length === 0 ? (
        <EmptyState title="لا توجد شهادات لعرضها" />
      ) : (
        <div className="grid grid--certs">
          {items.map((c) => (
            <article key={c.id} className="card cert">
              {c.image && <img src={c.image} alt={`صورة ${c.title}`} loading="lazy" />}
              <div className="cert__body">
                <h3>{c.title}</h3>
                <p className="cert__issuer">{c.issuer}</p>
                {c.date && <p className="cert__date">{formatMonth(c.date)}</p>}
                {c.description && <p>{c.description}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionShell>
  )
}

export function Contact() {
  return (
    <SectionShell id="contact" title="تواصل معي">
      <div className="contact">
        <ContactForm />
      </div>
    </SectionShell>
  )
}

export function TechList({ keys }) {
  const { lists } = useApp()
  return (
    <ul className="tech-list">
      {keys.map((key) => {
        const technology = lists.technologies.find((item) => item.key === key)
        return (
          <li key={key} className="tech-chip">
            <AppIcon iconKey={key} customIcon={technology?.icon} label={technology?.name || key} size={26} />
            <span>{technology?.name || key}</span>
          </li>
        )
      })}
    </ul>
  )
}
