import { apiRequest } from './client'
import { serializeResourcePayload } from './adminPayload.js'

const PATHS = {
  projects: 'projects',
  skills: 'skills',
  technologies: 'technologies',
  experience: 'experiences',
  certificates: 'certificates',
  icons: 'icons',
}

function toFormData(payload) {
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return
    if (Array.isArray(value)) {
      value.forEach((item) => form.append(key, String(item)))
    } else if (value instanceof File) {
      form.append(key, value)
    } else if (value !== null && typeof value === 'object') {
      form.append(key, JSON.stringify(value))
    } else {
      form.append(key, value === null ? '' : String(value))
    }
  })
  return form
}

function requestConfig(method, data) {
  const hasFile = Object.values(data).some((value) => value instanceof File)
  return {
    method,
    data: hasFile ? toFormData(data) : data,
  }
}

export async function saveResource(resource, values, isNew, previous, lists) {
  const path = PATHS[resource]
  if (!path) throw new Error('هذا المورد غير مدعوم.')
  const payload = serializeResourcePayload(resource, values, previous, lists)
  const itemPath = isNew ? `/admin/${path}/` : `/admin/${path}/${values.id}/`
  const hasFile = Object.values(payload).some((value) => value instanceof File)
  const clearTechnologies = resource === 'projects' && !isNew && hasFile && payload.technology_ids?.length === 0
  if (clearTechnologies) delete payload.technology_ids
  const result = await apiRequest(itemPath, requestConfig(isNew ? 'POST' : 'PATCH', payload))
  if (clearTechnologies) {
    await apiRequest(`/admin/projects/${values.id}/`, { method: 'PATCH', data: { technology_ids: [] } })
  }
  return result
}

export function deleteResource(resource, id) {
  return apiRequest(`/admin/${PATHS[resource]}/${id}/`, { method: 'DELETE' })
}

export function patchResource(resource, id, patch) {
  return apiRequest(`/admin/${PATHS[resource]}/${id}/`, { method: 'PATCH', data: patch })
}

export function reorderResource(resource, ids) {
  return apiRequest(`/admin/${PATHS[resource]}/reorder/`, { method: 'POST', data: { ids } })
}

export async function saveProfile(values, previous) {
  const payload = { ...values }
  delete payload.updated_at
  if (values.footerText !== undefined) {
    payload.footer_text = values.footerText
    delete payload.footerText
  }
  if (values.image?.file instanceof File) payload.image = values.image.file
  else {
    delete payload.image
    if (previous?.image && !values.image) payload.remove_image = true
  }
  return apiRequest('/admin/profile/', requestConfig('PATCH', payload))
}

export function saveDesign(values) {
  return apiRequest('/admin/design/', {
    method: 'PATCH',
    data: {
      primary: values.primary,
      secondary: values.secondary,
      bg: values.bg,
      text: values.text,
      hero_bg: values.heroBg,
      font: values.font,
      radius: values.radius,
      spacing: values.spacing,
    },
  })
}

export function updateSection(id, is_visible) {
  return apiRequest(`/admin/sections/${id}/`, { method: 'PATCH', data: { is_visible } })
}

export function reorderSections(ids) {
  return apiRequest('/admin/sections/reorder/', { method: 'POST', data: { ids } })
}

export function saveIcon(values, isNew) {
  const path = isNew ? '/admin/icons/' : `/admin/icons/${values.id}/`
  const payload = { ...values }
  delete payload.id
  delete payload.created_at
  delete payload.updated_at
  delete payload.skills_count
  delete payload.technologies_count
  return apiRequest(path, { method: isNew ? 'POST' : 'PATCH', data: payload })
}
