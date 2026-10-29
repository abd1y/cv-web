import { useState } from 'react'
import { Button, Field, Toast, useToast } from '../../components/ui/ui'
import { authApi, errorMessage } from '../../api/client'

export default function AccountPage() {
  const [v, setV] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { toast, show, close } = useToast()
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    const errs = {}
    if (!v.current) errs.current = 'أدخل كلمة المرور الحالية.'
    if (v.next.length < 12) errs.next = 'كلمة المرور الجديدة 12 حرفًا على الأقل.'
    if (v.confirm !== v.next) errs.confirm = 'التأكيد لا يطابق كلمة المرور الجديدة.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await authApi.changePassword(v.current, v.next)
      setV({ current: '', next: '', confirm: '' })
      show('تم تغيير كلمة المرور')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="admin-head">
        <h1>الحساب</h1>
      </div>
      <form className="card form form--narrow" onSubmit={submit} noValidate>
        <h2>تغيير كلمة المرور</h2>
        <Field label="كلمة المرور الحالية" error={errors.current} htmlFor="a-cur">
          <input id="a-cur" type="password" dir="ltr" autoComplete="current-password" value={v.current} onChange={set('current')} />
        </Field>
        <Field label="كلمة المرور الجديدة" error={errors.next} htmlFor="a-new">
          <input id="a-new" type="password" dir="ltr" autoComplete="new-password" value={v.next} onChange={set('next')} />
        </Field>
        <Field label="تأكيد كلمة المرور" error={errors.confirm} htmlFor="a-conf">
          <input id="a-conf" type="password" dir="ltr" autoComplete="new-password" value={v.confirm} onChange={set('confirm')} />
        </Field>
        <Button type="submit" loading={saving}>تغيير كلمة المرور</Button>
      </form>
      <Toast toast={toast} onClose={close} />
    </div>
  )
}
