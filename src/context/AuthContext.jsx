import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { api, authApi, errorMessage, refreshCsrf, setAuthExpiredHandler } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState('')
  const userRef = useRef(user)

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    setAuthExpiredHandler(() => {
      if (!userRef.current) return
      userRef.current = null
      setUser(null)
      setAuthError('انتهت الجلسة أو لم تعد صالحة. سجّل الدخول مجددًا.')
    })
    return () => setAuthExpiredHandler(null)
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([refreshCsrf(), authApi.me()])
      .then(([, result]) => {
        if (active) setUser(result.user)
      })
      .catch((error) => {
        if (!active) return
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          setAuthError(errorMessage(error))
        }
      })
      .finally(() => {
        if (active) setAuthReady(true)
      })
    return () => { active = false }
  }, [])

  const beginLogin = useCallback(async (email, password) => {
    setAuthError('')
    const result = await authApi.login(email, password)
    return result
  }, [])

  const verifyOtp = useCallback(async (otp) => {
    const result = await authApi.verifyOtp(otp)
    setUser(result.user)
    return result
  }, [])

  const resendOtp = useCallback(() => authApi.resendOtp(), [])

  const logout = useCallback(async () => {
    if (user) await authApi.logout()
    setUser(null)
    try {
      await refreshCsrf()
    } catch (error) {
      setAuthError(errorMessage(error))
    }
  }, [user])

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const result = await authApi.changePassword(currentPassword, newPassword)
    return result
  }, [])

  const value = useMemo(() => ({
    authed: Boolean(user),
    authReady,
    authError,
    user,
    beginLogin,
    verifyOtp,
    resendOtp,
    logout,
    changePassword,
    api,
  }), [user, authReady, authError, beginLogin, verifyOtp, resendOtp, logout, changePassword])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
