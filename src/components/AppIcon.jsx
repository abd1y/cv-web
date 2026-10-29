import { Code2 } from 'lucide-react'
import { svgToDataUri, validateSvg } from '../utils/svg'

// أيقونات أساسية محلية: تعمل دون أي اعتماد على API
const LOCAL = {
  react: { text: 'Re', bg: '#0e7490' },
  js: { text: 'JS', bg: '#a16207' },
  html: { text: 'H5', bg: '#c2410c' },
  css: { text: 'C3', bg: '#1d4ed8' },
  python: { text: 'Py', bg: '#1e40af' },
  django: { text: 'Dj', bg: '#166534' },
  drf: { text: 'DRF', bg: '#991b1b' },
  postgres: { text: 'Pg', bg: '#1e3a8a' },
  git: { text: 'Git', bg: '#b91c1c' },
  vite: { text: 'Vi', bg: '#6d28d9' },
}

export function hasLocalIcon(key) {
  return key in LOCAL
}

// ترتيب الاختيار: أيقونة مخصصة مفعّلة ← أيقونة محلية ← أيقونة بديلة.
// الأيقونات المخصصة تُعرض عبر <img> فقط (لا dangerouslySetInnerHTML).
export default function AppIcon({ iconKey, customIcon = null, label = '', size = 40 }) {
  const custom = customIcon?.is_active === false ? null : customIcon
  const style = { width: size, height: size }

  if (custom && validateSvg(custom.svg).ok) {
    return (
      <img
        className="app-icon"
        style={style}
        src={svgToDataUri(custom.svg)}
        alt={custom.aria_label || label}
        loading="lazy"
      />
    )
  }
  const local = LOCAL[iconKey]
  if (local) {
    return (
      <span
        className="app-icon app-icon--badge"
        style={{ ...style, background: local.bg, fontSize: size * (local.text.length > 2 ? 0.3 : 0.38) }}
        role="img"
        aria-label={label || iconKey}
      >
        {local.text}
      </span>
    )
  }
  return (
    <span className="app-icon app-icon--fallback" style={style} role="img" aria-label={label || 'أيقونة'}>
      <Code2 size={size * 0.55} aria-hidden="true" />
    </span>
  )
}
