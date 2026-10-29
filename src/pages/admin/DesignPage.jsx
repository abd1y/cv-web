import { useState } from 'react'
import { ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, AlertTriangle, Save } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button, Toast, useToast } from '../../components/ui/ui'
import { FONT_OPTIONS, RADIUS_OPTIONS, SPACING_OPTIONS, contrastRatio, defaultDesign } from '../../utils/design'
import { errorMessage } from '../../api/client'

const COLORS = [
  { key: 'primary', label: 'اللون الأساسي' },
  { key: 'secondary', label: 'اللون الثانوي' },
  { key: 'bg', label: 'لون الخلفية' },
  { key: 'text', label: 'لون النصوص' },
  { key: 'heroBg', label: 'خلفية الواجهة الرئيسية' },
]

export default function DesignPage() {
  const { design, setDesign, sections, setSections, resetDesign, saveDesign, reorderSections, toggleSection } = useApp()
  const { toast, show, close } = useToast()
  const [saving, setSaving] = useState(false)

  const setColor = (k) => (e) => setDesign((d) => ({ ...d, [k]: e.target.value }))

  const moveSection = (i, dir) => {
    const t = i + dir
    if (t < 1 || t >= sections.length) return // الواجهة الرئيسية ثابتة في الأعلى
    setSections((prev) => {
      const next = [...prev]
      ;[next[i], next[t]] = [next[t], next[i]]
      return next
    })
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      await saveDesign(design)
      show('تم حفظ إعدادات التصميم')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveOrder = async () => {
    try {
      await reorderSections(sections)
      show('تم حفظ ترتيب الأقسام')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
    }
  }

  const toggle = async (section) => {
    try {
      await toggleSection(section)
      show('تم تحديث ظهور القسم')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
    }
  }

  const textContrast = contrastRatio(design.text, design.bg)
  const primaryContrast = contrastRatio('#ffffff', design.primary)

  return (
    <div>
      <div className="admin-head">
        <h1>إعدادات التصميم</h1>
        <div className="row-actions">
          <Button variant="outline" onClick={saveOrder}>
            حفظ ترتيب الأقسام
          </Button>
          <Button variant="outline" onClick={async () => {
            resetDesign()
            setSaving(true)
            try {
              await saveDesign(defaultDesign)
              show('تمت استعادة الإعدادات الافتراضية')
            } catch (requestError) {
              show(errorMessage(requestError), 'error')
            } finally {
              setSaving(false)
            }
          }} disabled={saving}>
            <RotateCcw size={16} aria-hidden="true" /> استعادة الافتراضي
          </Button>
          <Button onClick={save} loading={saving}><Save size={16} aria-hidden="true" /> حفظ التصميم</Button>
        </div>
      </div>

      <div className="design-grid">
        <section className="card form">
          <h2>الألوان</h2>
          <div className="color-list">
            {COLORS.map((c) => (
              <label key={c.key} className="color-row">
                <span>{c.label}</span>
                <span className="color-row__ctl">
                  <code dir="ltr">{design[c.key]}</code>
                  <input type="color" value={design[c.key]} onChange={setColor(c.key)} aria-label={c.label} />
                </span>
              </label>
            ))}
          </div>
          {(textContrast < 4.5 || primaryContrast < 4.5) && (
            <p className="notice notice--info" role="status">
              <AlertTriangle size={14} aria-hidden="true" /> تباين الألوان ضعيف
              {textContrast < 4.5 ? ' بين النص والخلفية' : ''}
              {primaryContrast < 4.5 ? ' بين اللون الأساسي والنص الأبيض على الأزرار' : ''}. يُفضّل نسبة 4.5 فأكثر.
            </p>
          )}

          <h2>الخط والأحجام</h2>
          <div className="field">
            <label htmlFor="d-font">الخط</label>
            <select id="d-font" value={design.font} onChange={(e) => setDesign((d) => ({ ...d, font: e.target.value }))}>
              {Object.entries(FONT_OPTIONS).map(([k, f]) => (
                <option key={k} value={k}>{f.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="d-radius">استدارة الزوايا</label>
            <select id="d-radius" value={design.radius} onChange={(e) => setDesign((d) => ({ ...d, radius: e.target.value }))}>
              {Object.entries(RADIUS_OPTIONS).map(([k, r]) => (
                <option key={k} value={k}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="d-spacing">المسافات بين الأقسام</label>
            <select id="d-spacing" value={design.spacing} onChange={(e) => setDesign((d) => ({ ...d, spacing: e.target.value }))}>
              {Object.entries(SPACING_OPTIONS).map(([k, s]) => (
                <option key={k} value={k}>{s.label}</option>
              ))}
            </select>
          </div>
          <p className="muted-note">صورة الواجهة الرئيسية تُغيَّر من صفحة «الملف الشخصي».</p>
        </section>

        <section className="card form">
          <h2>ترتيب الأقسام وإظهارها</h2>
          <ol className="section-list">
            {sections.map((s, i) => (
              <li key={s.id} className="section-row">
                <span>{s.label}{s.locked && <small> (ثابت)</small>}</span>
                <span className="row-actions">
                  <button className="icon-btn" onClick={() => moveSection(i, -1)} disabled={s.locked || i <= 1} aria-label={`نقل ${s.label} للأعلى`}>
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button className="icon-btn" onClick={() => moveSection(i, 1)} disabled={s.locked || i === sections.length - 1} aria-label={`نقل ${s.label} للأسفل`}>
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button
                    className={`pill ${s.visible ? 'pill--on' : 'pill--off'}`}
                    onClick={() => toggle(s)}
                    disabled={s.locked}
                    aria-label={s.visible ? `إخفاء ${s.label}` : `إظهار ${s.label}`}
                  >
                    {s.visible ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
                    {s.visible ? 'ظاهر' : 'مخفي'}
                  </button>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <Toast toast={toast} onClose={close} />
    </div>
  )
}
