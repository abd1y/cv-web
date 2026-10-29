import axios from 'axios'
const defaultApiBase = 'https://cv-web-api.onrender.com/api/v1'
  ? 'https://cv-web-api.onrender.com/api/v1'
  : 'https://cv-web-api.onrender.com/api/v1'
const API_BASE = (import.meta.env.VITE_API_BASE_URL || defaultApiBase).replace(/\/+$/, '')
let csrfToken = ''
let onAuthExpired = null

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

export function getCsrfToken() {
  return csrfToken
}

export function setAuthExpiredHandler(handler) {
  onAuthExpired = handler
}

export async function refreshCsrf() {
  const { data } = await api.get('/auth/csrf/')
  csrfToken = data.csrfToken
  return csrfToken
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase()
  if (!['get', 'head', 'options', 'trace'].includes(method)) {
    if (!csrfToken) await refreshCsrf()
    config.headers.set('X-CSRFToken', csrfToken)
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.data?.csrfToken) csrfToken = response.data.csrfToken
    return response
  },
  (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail
    if (status === 403 && typeof detail === 'string' && detail.toLowerCase().includes('csrf')) {
      csrfToken = ''
    }
    if (status === 401 || (status === 403 && detail === 'غير مصرّح لك بالوصول.')) {
      onAuthExpired?.()
    }
    return Promise.reject(error)
  },
)

export function errorMessage(error) {
  const data = error?.response?.data
  if (typeof data?.detail === 'string') return data.detail
  if (data && typeof data === 'object') {
    const first = Object.values(data).flat().find((value) => typeof value === 'string')
    if (first) return first
  }
  return error?.message || 'تعذر الاتصال بالخادم.'
}

export async function apiRequest(path, config = {}) {
  const { data } = await api.request({ url: path, ...config })
  return data
}

export const authApi = {
  login: async (email, password) =>
    (await api.post('/auth/login/', { email, password })).data,
  verifyOtp: async (otp) =>
    (await api.post('/auth/verify-otp/', { otp })).data,
  resendOtp: async () =>
    (await api.post('/auth/resend-otp/')).data,
  logout: async () =>
    (await api.post('/auth/logout/')).data,
  me: async () =>
    (await api.get('/auth/me/')).data,
  changePassword: async (current_password, new_password) =>
    (await api.post('/auth/change-password/', { current_password, new_password })).data,
}
