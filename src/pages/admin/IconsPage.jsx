import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Power } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button, Field, Modal, ConfirmDialog, EmptyState, Toast, useToast } from '../../components/ui/ui'
import { validateSvg, svgToDataUri } from '../../utils/svg'
import { errorMessage } from '../../api/client'

const empty = {
  name_ar: '',
  key: '',
  svg: '',
  category: 'tech',
  description: '',
  aria_label: '',
  is_active: true,
}

const CATEGORIES = [
  { value: 'tech', label: 'تقنية' },
  { value: 'social', label: 'تواصل اجتماعي' },
  { value: 'general', label: 'عام' },
]

export default function IconsPage() {
  const { lists, saveIcon, removeResource, patchResource, loading, error, reload } = useApp()
  const icons = lists.icons
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { toast, show, close } = useToast()

  // المواضع التي تستخدم الأيقونة (من الربط بالمفتاح): مهارات + تقنيات المشاريع
  const usages = (key) => {
    const skills = lists.skills.filter((s) => s.icon_key === key).map((s) => `مهارة: ${s.name}`)
    const projects = lists.projects.filter((p) => p.technologies.includes(key)).map((p) => `تقنية في مشروع: ${p.title}`)
    return [...skills, ...projects]
  }

  const toggle = async (icon) => {
    try {
      await patchResource('icons', icon.id, { is_active: !icon.is_active })
      show(icon.is_active ? 'تم تعطيل الأيقونة' : 'تم تفعيل الأيقونة')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
    }
  }

  const save = async (values) => {
    try {
      await saveIcon(values, !values.id)
      setEditing(null)
      show('تم حفظ الأيقونة')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
      throw requestError
    }
  }

  const remove = async () => {
    try {
      await removeResource('icons', deleting.id)
      setDeleting(null)
      show('تم حذف الأيقونة')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
      throw requestError
    }
  }

  const deletingUsages = deleting ? usages(deleting.key) : []

  return (
    <div>
      <div className="admin-head">
        <h1>أيقونات SVG المخصصة</h1>
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus size={18} aria-hidden="true" /> إضافة أيقونة
        </Button>
      </div>
      <p className="muted-note">
        تُعرض الأيقونات المخصصة عبر وسم صورة آمن، وإذا عُطّلت أو حُذفت تظهر أيقونة بديلة محلية. التنظيف الأمني النهائي يتم في Backend.
      </p>

      {error && <div className="notice notice--error" role="alert">{error} <button onClick={() => reload().catch(() => {})}>إعادة المحاولة</button></div>}
      {loading ? <div className="card"><EmptyState title="جارٍ تحميل الأيقونات..." /></div> : icons.length === 0 ? (
        <div className="card">
          <EmptyState title="لا توجد أيقونات مخصصة" text="أضف أيقونة SVG لتظهر في المهارات والتقنيات." />
        </div>
      ) : (
        <div className="icon-grid">
          {icons.map((icon) => {
            const u = usages(icon.key)
            return (
              <article key={icon.id} className={`card icon-card ${icon.is_active ? '' : 'icon-card--off'}`}>
                <div className="icon-card__preview">
                  {validateSvg(icon.svg).ok ? <img src={svgToDataUri(icon.svg)} alt={icon.aria_label || icon.name_ar} /> : <span>غير صالحة</span>}
                </div>
                <h3>{icon.name_ar}</h3>
                <code dir="ltr">{icon.key}</code>
                <small>{CATEGORIES.find((category) => category.value === icon.category)?.label || icon.category} · {u.length} موضع</small>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => toggle(icon)} aria-label={icon.is_active ? 'تعطيل' : 'تفعيل'} title={icon.is_active ? 'تعطيل' : 'تفعيل'}>
                    <Power size={16} aria-hidden="true" />
                  </button>
                  <button className="icon-btn" onClick={() => setEditing({ ...icon })} aria-label="تعديل">
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button className="icon-btn icon-btn--danger" onClick={() => setDeleting(icon)} aria-label="حذف">
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {editing && <IconForm initial={editing} icons={icons} onSave={save} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          text={
            deletingUsages.length
              ? `الأيقونة «${deleting.name_ar}» مستخدمة في: ${deletingUsages.join('، ')}. عند الحذف ستظهر أيقونة بديلة في هذه المواضع.`
              : `سيتم حذف الأيقونة «${deleting.name_ar}» نهائيًا. لا تستخدمها أي مواضع.`
          }
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
        />
      )}
      <Toast toast={toast} onClose={close} />
    </div>
  )
}

function IconForm({ initial, icons, onSave, onClose }) {
  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

  const check = useMemo(() => (v.svg.trim() ? validateSvg(v.svg) : null), [v.svg])

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    const errs = {}
    if (!v.name_ar.trim()) errs.name_ar = 'الاسم مطلوب.'
    if (!/^[a-z0-9_-]+$/.test(v.key)) errs.key = 'مفتاح إنجليزي: حروف صغيرة وأرقام و - و _ فقط.'
    else if (icons.some((i) => i.key === v.key && i.id !== v.id)) errs.key = 'هذا المفتاح مستخدم.'
    if (!check?.ok) errs.svg = 'صحّح أخطاء كود SVG أولًا.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSave({ ...v, svg: v.svg.trim(), aria_label: v.aria_label || v.name_ar })
    } catch {
      setSaving(false)
      return
    }
    setSaving(false)
  }

  return (
    <Modal title={v.id ? 'تعديل أيقونة' : 'إضافة أيقونة'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="الاسم بالعربية *" error={errors.name_ar} htmlFor="i-name">
            <input id="i-name" value={v.name_ar} onChange={set('name_ar')} />
          </Field>
          <Field label="المفتاح (key) *" error={errors.key} htmlFor="i-key" hint="فريد، مثل: tailwind">
            <input id="i-key" dir="ltr" value={v.key} onChange={set('key')} disabled={!!v.id} />
          </Field>
          <Field label="التصنيف" htmlFor="i-cat">
            <select id="i-cat" value={v.category} onChange={set('category')}>
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Accessible Label" htmlFor="i-aria" hint="وصف يقرؤه قارئ الشاشة">
            <input id="i-aria" value={v.aria_label} onChange={set('aria_label')} />
          </Field>
        </div>
        <Field label="وصف اختياري" htmlFor="i-desc">
          <input id="i-desc" value={v.description} onChange={set('description')} />
        </Field>
        <Field label="كود SVG *" error={errors.svg} htmlFor="i-svg">
          <textarea id="i-svg" dir="ltr" rows={6} className="code" value={v.svg} onChange={set('svg')} placeholder='<svg viewBox="0 0 24 24" ...>' />
        </Field>

        <div className="svg-preview">
          <span className="field__label">المعاينة</span>
          {!check ? (
            <p className="muted-note">الصق كود SVG لعرض المعاينة.</p>
          ) : check.ok ? (
            <div className="svg-preview__sizes">
              {[24, 40, 64].map((s) => (
                <img key={s} src={svgToDataUri(v.svg)} width={s} height={s} alt={`معاينة ${s}px`} />
              ))}
            </div>
          ) : (
            <ul className="svg-errors" role="alert">
              {check.errors.map((er) => (
                <li key={er}>{er}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="field field--check">
          <label>
            <input type="checkbox" checked={v.is_active} onChange={(e) => setV((x) => ({ ...x, is_active: e.target.checked }))} /> مفعّلة
          </label>
        </div>
        <div className="modal__actions">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
          <Button type="submit" loading={saving}>
            حفظ
          </Button>
        </div>
      </form>
    </Modal>
  )
}
