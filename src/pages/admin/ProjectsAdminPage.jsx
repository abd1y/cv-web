import { useEffect, useState } from 'react'
import { ImagePlus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import ResourceManager from '../../components/admin/ResourceManager'
import { useApp } from '../../context/AppContext'
import { apiRequest, errorMessage } from '../../api/client'
import { Button, Field, Modal, EmptyState } from '../../components/ui/ui'

export default function ProjectsAdminPage() {
  const [imagesProject, setImagesProject] = useState(null)
  return (
    <div>
      <ResourceManager
      title="المشاريع"
      listName="projects"
      itemLabel="مشروع"
      visibleKey="is_published"
      visibleLabels={['منشور', 'مسودة']}
      emptyText="لا توجد مشاريع بعد."
      columns={[
        {
          label: 'المشروع',
          render: (p) => (
            <div className="cell-media">
              <img src={p.cover} alt="" />
              <div>
                <strong>{p.title}</strong>
                {p.project_url ? (
                  <a href={p.project_url} target="_blank" rel="noopener noreferrer" dir="ltr">
                    {p.project_url}
                  </a>
                ) : (
                  <small dir="ltr">/{p.slug}</small>
                )}
              </div>
            </div>
          ),
        },
        {
          label: 'الصور',
          render: (project) => <Button variant="outline" onClick={() => setImagesProject(project)}>
            <ImagePlus size={16} aria-hidden="true" /> إدارة الصور ({project.screenshots?.length || 0})
          </Button>,
        },
        { label: 'الحالة', render: (p) => p.status || '—' },
        { label: 'مميز', render: (p) => (p.is_featured ? 'نعم' : 'لا') },
      ]}
      makeEmpty={() => ({
        title: '',
        slug: '',
        project_url: '',
        summary: '',
        status: '',
        is_featured: false,
        is_published: false,
        cover: '',
        description: '',
        how_it_works: '',
        technologies: [],
        screenshots: [],
      })}
      validate={(v) => {
        const e = {}
        if (v.project_url) {
          try {
            const url = new URL(v.project_url)
            if (!['http:', 'https:'].includes(url.protocol)) e.project_url = 'استخدم رابطًا يبدأ بـ http:// أو https://.'
          } catch {
            e.project_url = 'أدخل الرابط كاملًا، مثل https://example.com'
          }
        }
        return e
      }}
      getFields={(lists) => [
        { name: 'title', label: 'اسم المشروع', required: true },
        { name: 'project_url', label: 'رابط موقع المشروع', type: 'url', ltr: true, hint: 'رابط كامل يبدأ بـ https://، مثل https://example.com' },
        { name: 'summary', label: 'وصف مختصر', type: 'textarea', required: true },
        { name: 'status', label: 'حالة المشروع', hint: 'مثل: مكتمل، قيد التطوير' },
        { name: 'cover', label: 'صورة الغلاف', type: 'image' },
        { name: 'description', label: 'الوصف التفصيلي', type: 'textarea' },
        { name: 'how_it_works', label: 'آلية عمل المشروع', type: 'textarea' },
        {
          name: 'technologies',
          label: 'التقنيات المستخدمة',
          type: 'multi',
          emptyText: 'كتالوج التقنيات فارغ. أضف اللغات والأدوات التي استخدمتها في المشروع أولًا من صفحة',
          emptyHref: '/admin/skills',
          emptyLinkLabel: 'المهارات والتقنيات',
          options: lists.technologies.map((technology) => ({ value: technology.key, label: technology.name })),
        },
        { name: 'is_featured', label: 'مشروع مميز (يظهر أولًا)', type: 'checkbox' },
        { name: 'is_published', label: 'منشور', type: 'checkbox' },
      ]}
      />
      {imagesProject && <ProjectImagesManager project={imagesProject} onClose={() => setImagesProject(null)} />}
    </div>
  )
}

function ProjectImagesManager({ project, onClose }) {
  const { reload } = useApp()
  const [images, setImages] = useState([])
  const [file, setFile] = useState(null)
  const [altText, setAltText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const path = `/admin/projects/${project.id}/images/`

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setImages(await apiRequest(path))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [path])

  const add = async (event) => {
    event.preventDefault()
    if (!file || saving) return
    setSaving(true)
    setError('')
    try {
      const body = new FormData()
      body.append('image', file)
      body.append('alt_text', altText)
      await apiRequest(path, { method: 'POST', data: body })
      setFile(null)
      setAltText('')
      await load()
      await reload()
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  const chooseFile = (event) => {
    const candidate = event.target.files?.[0]
    if (!candidate) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(candidate.type) || candidate.size > 5 * 1024 * 1024) {
      setError('اختر JPG أو PNG أو WEBP بحجم لا يتجاوز 5MB.')
      setFile(null)
      event.target.value = ''
      return
    }
    setError('')
    setFile(candidate)
  }

  const remove = async (image) => {
    setError('')
    try {
      await apiRequest(`${path}${image.id}/`, { method: 'DELETE' })
      await load()
      await reload()
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  const move = async (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    setError('')
    try {
      await apiRequest(`${path}reorder/`, { method: 'POST', data: { ids: next.map((image) => image.id) } })
      await load()
      await reload()
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  return (
    <Modal title={`صور مشروع: ${project.title}`} onClose={onClose} wide>
      <form className="card form" onSubmit={add}>
        <Field label="صورة" htmlFor="project-image">
          <input id="project-image" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={chooseFile} />
        </Field>
        <Field label="وصف بديل" htmlFor="project-image-alt">
          <input id="project-image-alt" value={altText} onChange={(event) => setAltText(event.target.value)} />
        </Field>
        <Button type="submit" loading={saving} disabled={!file}>إضافة صورة</Button>
      </form>
      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {loading ? <EmptyState title="جارٍ تحميل الصور..." /> : images.length === 0 ? <EmptyState title="لا توجد صور إضافية." /> : (
        <div className="icon-grid">
          {images.map((image, index) => (
            <article key={image.id} className="card icon-card">
              <img src={image.image} alt={image.alt_text || ''} />
              <p>{image.alt_text}</p>
              <div className="row-actions">
                <button className="icon-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label="نقل للأعلى"><ArrowUp size={16} /></button>
                <button className="icon-btn" onClick={() => move(index, 1)} disabled={index === images.length - 1} aria-label="نقل للأسفل"><ArrowDown size={16} /></button>
                <button className="icon-btn icon-btn--danger" onClick={() => remove(image)} aria-label="حذف الصورة"><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Modal>
  )
}
