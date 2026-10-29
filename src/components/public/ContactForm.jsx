import { useState, useRef } from 'react'
import { Button, Field } from '../ui/ui'
import { isValidEmail } from '../../utils/format'
import { apiRequest, errorMessage } from '../../api/client'

const empty = { name: '', email: '', message: '', website: '' } // website = Honeypot

export default function ContactForm() {
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const sending = useRef(false)

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (values.name.trim().length < 2) e.name = 'اكتب اسمك (حرفان على الأقل).'
    if (!isValidEmail(values.email.trim())) e.email = 'أدخل بريدًا إلكترونيًا صحيحًا.'
    if (values.message.trim().length < 10) e.message = 'الرسالة قصيرة جدًا (10 أحرف على الأقل).'
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (sending.current) return // منع الإرسال المكرر
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    sending.current = true
    setStatus('sending')
    try {
      await apiRequest('/public/contact/', {
        method: 'POST',
        data: {
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          website: values.website,
        },
      })
      setStatus('success')
      setValues(empty)
    } catch (error) {
      setErrors((previous) => ({ ...previous, submit: errorMessage(error) }))
      setStatus('error')
    } finally {
      sending.current = false
    }
  }

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <Field label="الاسم" error={errors.name} htmlFor="c-name">
        <input id="c-name" value={values.name} onChange={set('name')} autoComplete="name" maxLength={100} />
      </Field>
      <Field label="البريد الإلكتروني" error={errors.email} htmlFor="c-email">
        <input
          id="c-email"
          type="email"
          dir="ltr"
          value={values.email}
          onChange={set('email')}
          autoComplete="email"
          maxLength={150}
        />
      </Field>
      <Field label="الرسالة" error={errors.message} htmlFor="c-message">
        <textarea id="c-message" rows={5} value={values.message} onChange={set('message')} maxLength={2000} />
      </Field>

      {/* Honeypot: مخفي عن المستخدمين، تملؤه الروبوتات فقط */}
      <div className="hp" aria-hidden="true">
        <label>
          لا تملأ هذا الحقل
          <input tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
        </label>
      </div>

      <Button type="submit" loading={status === 'sending'}>
        إرسال الرسالة
      </Button>

      {status === 'success' && (
        <p className="notice notice--success" role="status">
          تم استلام رسالتك بنجاح.
        </p>
      )}
      {status === 'error' && (
        <p className="notice notice--error" role="alert">
          {errors.submit || 'تعذر إرسال الرسالة الآن. حاول مرة أخرى لاحقًا.'}
        </p>
      )}
    </form>
  )
}
