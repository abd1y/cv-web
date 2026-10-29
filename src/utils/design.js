// تحقق صارم من قيم التصميم قبل تطبيقها: لا CSS ولا JS عشوائي، فقط قيم من قوائم مسموحة.

export const defaultDesign = {
  primary: '#0f766e',
  secondary: '#b45309',
  bg: '#f7f5f0',
  text: '#1f2937',
  heroBg: '#e3f1ee',
  font: 'cairo',
  radius: 'md',
  spacing: 'normal',
}

export const FONT_OPTIONS = {
  cairo: { label: 'Cairo', stack: "'Cairo', system-ui, sans-serif" },
  tajawal: { label: 'Tajawal', stack: "'Tajawal', system-ui, sans-serif" },
}

export const RADIUS_OPTIONS = {
  sm: { label: 'صغيرة', value: '6px' },
  md: { label: 'متوسطة', value: '14px' },
  lg: { label: 'كبيرة', value: '24px' },
}

export const SPACING_OPTIONS = {
  compact: { label: 'مضغوطة', value: '56px' },
  normal: { label: 'عادية', value: '80px' },
  relaxed: { label: 'مريحة', value: '104px' },
}

const HEX = /^#[0-9a-fA-F]{6}$/
const COLOR_KEYS = ['primary', 'secondary', 'bg', 'text', 'heroBg']

export function safeDesign(input, fallback) {
  const out = { ...fallback }
  if (!input || typeof input !== 'object') return out
  for (const key of COLOR_KEYS) {
    if (typeof input[key] === 'string' && HEX.test(input[key])) out[key] = input[key]
  }
  if (input.font in FONT_OPTIONS) out.font = input.font
  if (input.radius in RADIUS_OPTIONS) out.radius = input.radius
  if (input.spacing in SPACING_OPTIONS) out.spacing = input.spacing
  return out
}

export function applyDesign(design) {
  const root = document.documentElement.style
  root.setProperty('--primary', design.primary)
  root.setProperty('--secondary', design.secondary)
  root.setProperty('--bg', design.bg)
  root.setProperty('--text', design.text)
  root.setProperty('--hero-bg', design.heroBg)
  root.setProperty('--font', FONT_OPTIONS[design.font].stack)
  root.setProperty('--radius', RADIUS_OPTIONS[design.radius].value)
  root.setProperty('--section-gap', SPACING_OPTIONS[design.spacing].value)
}

// نسبة التباين بين لونين (WCAG) لتحذير المسؤول من ألوان ضعيفة القراءة
function luminance(hex) {
  const c = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

export function contrastRatio(a, b) {
  const l1 = luminance(a)
  const l2 = luminance(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}
