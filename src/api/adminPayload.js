const BUILTIN_ICONS = new Set([
  'react', 'js', 'html', 'css', 'python', 'django', 'drf', 'postgres', 'git', 'vite',
])

function projectSlug(title, projects, currentId) {
  const base = (title || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project'
  const used = new Set(projects.filter((project) => project.id !== currentId).map((project) => project.slug))
  let slug = base
  let suffix = 2
  while (used.has(slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  return slug
}

export function serializeResourcePayload(resource, values, previous, lists) {
  const payload = { ...values }
  delete payload.id
  delete payload.created_at
  delete payload.updated_at
  delete payload.projects_count
  delete payload.skills_count
  delete payload.technologies_count
  delete payload.screenshots

  if (resource === 'projects') {
    if (!payload.slug) payload.slug = projectSlug(values.title, lists.projects, values.id)
    const technologyIds = (values.technologies || []).map(
      (key) => lists.technologies.find((technology) => technology.key === key)?.id,
    ).filter(Boolean)
    payload.technology_ids = technologyIds
    delete payload.technologies
    if (values.cover?.file instanceof File) payload.cover = values.cover.file
    else {
      delete payload.cover
      if (previous?.cover && !values.cover) payload.remove_cover = true
    }
  } else if (resource === 'skills') {
    const customIcon = lists.icons.find((icon) => icon.key === values.icon_key)
    payload.icon = customIcon?.id || null
    payload.builtin_key = BUILTIN_ICONS.has(values.icon_key) ? values.icon_key : ''
    delete payload.icon_key
  } else if (resource === 'technologies') {
    payload.icon = values.icon || null
  } else if (resource === 'experience') {
    payload.start_date = values.start ? `${values.start}-01` : ''
    payload.end_date = values.end ? `${values.end}-01` : null
    delete payload.start
    delete payload.end
  } else if (resource === 'certificates') {
    payload.date = values.date ? `${values.date}-01` : ''
    if (values.image?.file instanceof File) payload.image = values.image.file
    else {
      delete payload.image
      if (previous?.image && !values.image) payload.remove_image = true
    }
  }
  return payload
}
