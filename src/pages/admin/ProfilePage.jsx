import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Button, Field, ImageUploader, Toast, useToast } from '../../components/ui/ui'
import { isValidEmail } from '../../utils/format'
import { errorMessage } from '../../api/client'

export default function ProfilePage() {
  const { profile, saveProfile, loading } = useApp()
  const [v, setV] = useState(profile)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { toast, show, close } = useToast()

  useEffect(() => {
    if (!loading) setV(profile)
  }, [profile, loading])

  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    const errs = {}
    if (!v.name.trim()) errs.name = 'الاسم مطلوب.'
    if (v.email && !isValidEmail(v.email)) errs.email = 'بريد غير صحيح.'
    ;['whatsapp', 'linkedin', 'github'].forEach((k) => {
      if (v[k] && !/^https:\/\//.test(v[k])) errs[k] = 'يجب أن يبدأ الرابط بـ https://'
    })
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await saveProfile(v, profile)
      show('تم حفظ الملف الشخصي')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="admin-head">
        <h1>الملف الشخصي</h1>
      </div>
      <form className="card form" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="الاسم *" error={errors.name} htmlFor="p-name">
            <input id="p-name" value={v.name} onChange={set('name')} />
          </Field>
          <Field label="المسمى" htmlFor="p-title">
            <input id="p-title" value={v.title} onChange={set('title')} />
          </Field>
        </div>
        <Field label="نبذة تعريفية قصيرة" htmlFor="p-bio">
          <textarea id="p-bio" rows={3} value={v.bio} onChange={set('bio')} />
        </Field>
        <ImageUploader label="الصورة الشخصية" value={v.image} onChange={(image) => setV((x) => ({ ...x, image }))} />
        <div className="form-grid">
          <Field label="رقم الهاتف" htmlFor="p-phone">
            <input id="p-phone" dir="ltr" value={v.phone} onChange={set('phone')} />
          </Field>
          <Field label="المحافظة" hint="المحافظة فقط دون عنوان تفصيلي" htmlFor="p-prov">
            <input id="p-prov" value={v.province} onChange={set('province')} />
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Gmail" error={errors.email} htmlFor="p-email">
            <input id="p-email" type="email" dir="ltr" value={v.email} onChange={set('email')} />
          </Field>
          <Field label="WhatsApp (رابط)" error={errors.whatsapp} htmlFor="p-wa">
            <input id="p-wa" dir="ltr" value={v.whatsapp} onChange={set('whatsapp')} />
          </Field>
          <Field label="LinkedIn (رابط)" error={errors.linkedin} htmlFor="p-li">
            <input id="p-li" dir="ltr" value={v.linkedin} onChange={set('linkedin')} />
          </Field>
          <Field label="GitHub (رابط)" error={errors.github} htmlFor="p-gh">
            <input id="p-gh" dir="ltr" value={v.github} onChange={set('github')} />
          </Field>
        </div>
        <Field label="نص حقوق الملكية في Footer" htmlFor="p-foot">
          <input id="p-foot" value={v.footerText} onChange={set('footerText')} />
        </Field>
        <Button type="submit" loading={saving}>حفظ التغييرات</Button>
      </form>
      <Toast toast={toast} onClose={close} />
    </div>
  )
}
