import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { errorMessage } from '../../api/client'
import { Button, Field, Spinner } from '../../components/ui/ui'
import { isValidEmail } from '../../utils/format'

export default function LoginPage() {
  const { authed, authReady, authError, beginLogin, verifyOtp, resendOtp: resendOtpRequest } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const submitCredentials = async (event) => {
    event.preventDefault()
    if (busy) return
    if (!isValidEmail(email.trim()) || !password) {
      setError('تحقق من البريد الإلكتروني وكلمة المرور.')
      return
    }

    setError('')
    setNotice('')
    setBusy(true)
    try {
      await beginLogin(email.trim(), password)
      setPassword('')
      setStep(2)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const submitOtp = async (event) => {
    event.preventDefault()
    if (busy) return
    if (!/^\d{6}$/.test(otp)) {
      setError('أدخل رمزًا من 6 أرقام.')
      return
    }

    setError('')
    setNotice('')
    setBusy(true)
    try {
      await verifyOtp(otp)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleResendOtp = async () => {
    if (busy) return
    setError('')
    setNotice('')
    setBusy(true)
    try {
      const result = await resendOtpRequest()
      setNotice(result.detail)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (!authReady) return <Spinner />
  if (authed) return <Navigate to="/admin" replace />

  return (
    <div className="login">
      <div className="card login__card">
        <div className="login__icon">
          <Lock size={26} aria-hidden="true" />
        </div>
        <h1>تسجيل دخول المسؤول</h1>
        <p className="login__sub">
          {step === 1 ? 'أدخل بياناتك للمتابعة' : 'أدخل الرمز المرسل إلى بريدك الإلكتروني'}
        </p>
        {authError && <p className="notice notice--error" role="alert">{authError}</p>}

        {step === 1 ? (
          <form onSubmit={submitCredentials} noValidate>
            <Field label="البريد الإلكتروني" htmlFor="l-email">
              <input
                id="l-email"
                type="email"
                dir="ltr"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label="كلمة المرور" htmlFor="l-pass">
              <input
                id="l-pass"
                type="password"
                dir="ltr"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            {error && <p className="notice notice--error" role="alert">{error}</p>}
            <Button type="submit" loading={busy}>متابعة</Button>
          </form>
        ) : (
          <form onSubmit={submitOtp} noValidate>
            <Field label="رمز التحقق (OTP)" htmlFor="l-otp">
              <input
                id="l-otp"
                className="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              />
            </Field>
            {notice && <p className="notice notice--info" role="status">{notice}</p>}
            {error && <p className="notice notice--error" role="alert">{error}</p>}
            <Button type="submit" loading={busy}>دخول</Button>
            <Button type="button" variant="ghost" onClick={handleResendOtp} loading={busy}>
              إعادة إرسال الرمز
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setStep(1); setOtp(''); setError(''); setNotice('') }}
            >
              رجوع
            </Button>
          </form>
        )}

        <Link to="/" className="login__back">العودة للموقع</Link>
      </div>
    </div>
  )
}
