import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiRequest, errorMessage } from '../api/client'
import {
  deleteResource as deleteAdminResource,
  patchResource,
  reorderResource,
  saveDesign as saveAdminDesign,
  saveProfile as saveAdminProfile,
  saveResource as saveAdminResource,
  saveIcon as saveAdminIcon,
  updateSection,
  reorderSections as reorderAdminSections,
} from '../api/admin'
import { useAuth } from './AuthContext'
import { safeDesign, applyDesign, defaultDesign } from '../utils/design'

const AppContext = createContext(null)

const EMPTY_PROFILE = {
  name: '', title: '', bio: '', phone: '', province: '', email: '', whatsapp: '',
  linkedin: '', github: '', image: '', footer_text: '',
}
const EMPTY_LISTS = {
  projects: [], skills: [], technologies: [], experience: [], certificates: [],
  messages: [], icons: [],
}

function publicProject(project) {
  return {
    ...project,
    cover: project.cover || '',
    technologies: (project.technologies || []).map((technology) => technology.key),
    screenshots: project.screenshots || [],
  }
}

function adminProject(project) {
  return {
    ...project,
    cover: project.cover || '',
    technologies: (project.technologies || []).map((technology) => technology.key),
    technology_ids: (project.technologies || []).map((technology) => technology.id),
    screenshots: project.screenshots || [],
  }
}

function normalizeSkill(skill) {
  return {
    ...skill,
    icon_key: skill.icon?.key || skill.builtin_key || '',
  }
}

function publicIcons(data) {
  const all = [
    ...(data.skills || []).map((skill) => skill.icon),
    ...(data.technologies || []).map((technology) => technology.icon),
    ...(data.projects || []).flatMap((project) => (project.technologies || []).map((technology) => technology.icon)),
  ]
  return [...new Map(all.filter(Boolean).map((icon) => [icon.id, { ...icon, is_active: true }])).values()]
}

function normalizeExperience(item) {
  return {
    ...item,
    start: item.start_date?.slice(0, 7) || '',
    end: item.end_date?.slice(0, 7) || '',
  }
}

function normalizeCertificate(item) {
  return { ...item, image: item.image || '' }
}

function normalizeSection(section) {
  return {
    ...section,
    id: section.id ?? section.section_id,
    section_id: section.section_id || section.id,
    visible: section.is_visible,
    locked: section.is_locked || false,
  }
}

function normalizeDesign(design) {
  if (!design) return safeDesign(null, defaultDesign)
  return safeDesign({
    ...design,
    heroBg: design.hero_bg,
  }, defaultDesign)
}

function normalizeProfile(profile) {
  return profile ? { ...EMPTY_PROFILE, ...profile, footerText: profile.footer_text || '' } : EMPTY_PROFILE
}

function normalizePublicData(data) {
  return {
    profile: normalizeProfile(data.profile),
    design: normalizeDesign(data.design),
    sections: (data.sections || []).map(normalizeSection),
    lists: {
      ...EMPTY_LISTS,
      projects: (data.projects || []).map(publicProject),
      skills: (data.skills || []).map(normalizeSkill),
      technologies: data.technologies || [],
      experience: (data.experience || []).map(normalizeExperience),
      certificates: (data.certificates || []).map(normalizeCertificate),
      icons: publicIcons(data),
    },
  }
}

async function fetchPublicData() {
  const [profile, design, sections, projects, skills, technologies, experience, certificates] =
    await Promise.all([
      apiRequest('/public/profile/'),
      apiRequest('/public/design/'),
      apiRequest('/public/sections/'),
      apiRequest('/public/projects/'),
      apiRequest('/public/skills/'),
      apiRequest('/public/technologies/'),
      apiRequest('/public/experience/'),
      apiRequest('/public/certificates/'),
    ])
  return normalizePublicData({ profile, design, sections, projects, skills, technologies, experience, certificates })
}

async function fetchAdminData() {
  const [profile, design, sections, projects, skills, technologies, experience, certificates, icons, messages] =
    await Promise.all([
      apiRequest('/admin/profile/'),
      apiRequest('/admin/design/'),
      apiRequest('/admin/sections/'),
      apiRequest('/admin/projects/'),
      apiRequest('/admin/skills/'),
      apiRequest('/admin/technologies/'),
      apiRequest('/admin/experiences/'),
      apiRequest('/admin/certificates/'),
      apiRequest('/admin/icons/'),
      apiRequest('/admin/messages/?page_size=100'),
    ])
  return {
    profile: normalizeProfile(profile),
    design: normalizeDesign(design),
    sections: sections.map(normalizeSection),
    lists: {
      ...EMPTY_LISTS,
      projects: projects.map(adminProject),
      skills: skills.map((skill) => ({
        ...normalizeSkill(skill),
        icon: icons.find((icon) => icon.id === skill.icon) || null,
        icon_key: icons.find((icon) => icon.id === skill.icon)?.key || skill.builtin_key || '',
      })),
      technologies: technologies.map((technology) => ({
        ...technology,
        icon: icons.find((icon) => icon.id === technology.icon) || null,
      })),
      experience: experience.map(normalizeExperience),
      certificates: certificates.map(normalizeCertificate),
      icons,
      messages: messages.results || [],
    },
  }
}

export function AppProvider({ children }) {
  const { authed, authReady } = useAuth()
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [lists, setLists] = useState(EMPTY_LISTS)
  const [design, setDesign] = useState(defaultDesign)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!authReady) return
    setLoading(true)
    setError('')
    try {
      const data = authed ? await fetchAdminData() : await fetchPublicData()
      setProfile(data.profile)
      setDesign(data.design)
      setSections(data.sections)
      setLists(data.lists)
    } catch (requestError) {
      setError(errorMessage(requestError))
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [authed, authReady])

  useEffect(() => {
    reload().catch(() => {})
  }, [reload])

  useEffect(() => {
    applyDesign(design)
  }, [design])

  const setList = useCallback((name, updater) => {
    setLists((previous) => ({
      ...previous,
      [name]: typeof updater === 'function' ? updater(previous[name]) : updater,
    }))
  }, [])

  const saveResource = useCallback(async (name, values, isNew, previous) => {
    const result = await saveAdminResource(name, values, isNew, previous, lists)
    await reload()
    return result
  }, [lists, reload])

  const removeResource = useCallback(async (name, id) => {
    await deleteAdminResource(name, id)
    await reload()
  }, [reload])

  const patchAdminResource = useCallback(async (name, id, patch) => {
    await patchResource(name, id, patch)
    await reload()
  }, [reload])

  const reorderAdminResource = useCallback(async (name, items) => {
    await reorderResource(name, items.map((item) => item.id))
    await reload()
  }, [reload])

  const saveProfile = useCallback(async (values, previous) => {
    await saveAdminProfile(values, previous)
    await reload()
  }, [reload])

  const saveDesign = useCallback(async (values) => {
    await saveAdminDesign(values)
    await reload()
  }, [reload])

  const toggleSection = useCallback(async (section) => {
    const updated = await updateSection(section.id, !section.visible)
    setSections((previous) => previous.map((item) => item.id === section.id ? normalizeSection(updated) : item))
  }, [])

  const reorderSectionItems = useCallback(async (items) => {
    await reorderAdminSections(items.map((section) => section.id))
    await reload()
  }, [reload])

  const resetDesign = useCallback(() => setDesign({ ...defaultDesign }), [])

  const saveIcon = useCallback(async (values, isNew) => {
    await saveAdminIcon(values, isNew)
    await reload()
  }, [reload])

  const value = {
    profile, setProfile, lists, setLists, setList, design, setDesign, sections, setSections,
    loading, error, reload, saveResource, removeResource, patchResource: patchAdminResource,
    reorderResource: reorderAdminResource, saveProfile, saveDesign, toggleSection,
    reorderSections: reorderSectionItems, resetDesign, saveIcon,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
