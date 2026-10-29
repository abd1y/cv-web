import { useEffect, useRef, useState } from 'react'
import { Loader2, Inbox, AlertTriangle, X, ImagePlus } from 'lucide-react'

export function Button({ variant = 'primary', loading = false, disabled, children, ...rest }) {
  return (
    <button
      className={`btn btn--${variant}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && <Loader2 className="spin" size={16} aria-hidden="true" />}
      {children}
    </button>
  )
}

export function Spinner({ label = 'جارٍ التحميل...' }) {
  return (
    <div className="state" role="status">
      <Loader2 className="spin" size={28} aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export function EmptyState({ title, text }) {
  return (
    <div className="state">
      <Inbox size={34} aria-hidden="true" />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
    </div>
  )
}

export function ErrorState({ title = 'تعذر تحميل البيانات', text, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <AlertTriangle size={34} aria-hidden="true" />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  )
}

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <small className="field__hint">{hint}</small>}
      {error && (
        <small className="field__error" role="alert">
          {error}
        </small>
      )}
    </div>
  )
}

export function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`modal ${wide ? 'modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <header className="modal__head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="إغلاق">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ title = 'تأكيد الحذف', text, confirmLabel = 'حذف نهائي', onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false)
  const run = async () => {
    if (busy) return // منع النقر المزدوج
    setBusy(true)
    try {
      await onConfirm()
    } catch {
      setBusy(false)
    }
  }

  return (
    <Modal title={title} onClose={onCancel}>
      <p className="modal__text">{text}</p>
      <div className="modal__actions">
        <Button variant="outline" onClick={onCancel} disabled={busy}>
          إلغاء
        </Button>
        <Button variant="danger" onClick={run} loading={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

// رفع صورة مع معاينة قبل الحفظ (الرفع الفعلي يُربط لاحقًا مع Backend)
export function ImageUploader({ label, value, onChange }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (value?.file instanceof File) {
      const objectUrl = URL.createObjectURL(value.file)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
    setPreview('')
  }, [value])

  const image = value?.preview || preview || (typeof value === 'string' ? value : '')

  const pick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setError('الأنواع المسموحة: JPG وPNG وWEBP.')
    if (file.size > 5 * 1024 * 1024) return setError('الحد الأقصى لحجم الصورة 5 ميغابايت.')
    setError('')
    onChange({ file })
    e.target.value = ''
  }

  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="uploader">
        {image ? <img src={image} alt={`معاينة ${label}`} /> : <div className="uploader__empty"><ImagePlus size={26} aria-hidden="true" /></div>}
        <div className="uploader__actions">
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            {image ? 'تغيير الصورة' : 'اختيار صورة'}
          </Button>
          {image && (
            <Button type="button" variant="ghost" onClick={() => onChange('')}>
              إزالة
            </Button>
          )}
        </div>
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={pick} hidden />
      </div>
      {error && <small className="field__error" role="alert">{error}</small>}
    </div>
  )
}

// إشعار نجاح/خطأ بسيط
export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [toast, onClose])
  if (!toast) return null
  return (
    <div className={`toast toast--${toast.type}`} role="status" aria-live="polite">
      {toast.text}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState(null)
  return {
    toast,
    show: (text, type = 'success') => setToast({ text, type }),
    close: () => setToast(null),
  }
}
