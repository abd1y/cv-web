import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Footer from '../components/public/Footer'

export default function PublicLayout() {
  const { profile, sections } = useApp()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // عند تغيير الصفحة: أعد التمرير للأعلى (إلا إذا طُلب قسم معيّن)
  useEffect(() => {
    if (location.pathname !== '/') window.scrollTo(0, 0)
  }, [location.pathname])

  const goTo = (id) => {
    setOpen(false)
    const scroll = () => document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(scroll, 120)
    } else {
      scroll()
    }
  }

  const links = sections
    .filter((section) => section.visible && (section.section_id || section.id) !== 'hero')
    .map((section) => ({ ...section, key: section.section_id || section.id }))

  return (
    <div className="site">
      <a href="#main" className="skip-link">
        تخطي إلى المحتوى
      </a>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand" onClick={() => window.scrollTo(0, 0)}>
            {profile.name}
          </Link>
          <nav className={`nav ${open ? 'nav--open' : ''}`} aria-label="التنقل الرئيسي">
            {links.map((s) => (
              <button key={s.key} className="nav__link" onClick={() => goTo(s.key)}>
                {s.label}
              </button>
            ))}
          </nav>
          <button
            className="icon-btn nav-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={open}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
