import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Button, Field, Modal, ConfirmDialog, EmptyState, ImageUploader, Toast, useToast } from '../ui/ui'
import { errorMessage } from '../../api/client'

export default function ResourceManager({
  title,
  listName,
  columns,
  getFields,
  makeEmpty,
  visibleKey,
  visibleLabels = ['ظاهر', 'مخفي'],
  validate,
  itemLabel = 'عنصر',
  emptyText = 'لم تُضف أي عناصر بعد.',
  sortable = true,
}) {
  const { lists, loading, error, saveResource, removeResource, patchResource, reorderResource, reload } = useApp()
  const items = lists[listName]
  const fields = getFields(lists)
  const [editing, setEditing] = useState(null) // { values, isNew }
  const [deleting, setDeleting] = useState(null)
  const [query, setQuery] = useState('')
  const { toast, show, close } = useToast()
  const filteredItems = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    return needle ? items.filter((item) => JSON.stringify(item).toLocaleLowerCase().includes(needle)) : items
  }, [items, query])

  const move = async (item, dir) => {
    if (!sortable) return
    const index = items.findIndex((entry) => entry.id === item.id)
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    try {
      await reorderResource(listName, next)
      show('تم تحديث الترتيب')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
    }
  }

  const toggleVisible = async (item) => {
    try {
      await patchResource(listName, item.id, { [visibleKey]: !item[visibleKey] })
      show('تم تحديث الحالة')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
    }
  }

  const confirmDelete = async () => {
    try {
      await removeResource(listName, deleting.id)
      setDeleting(null)
      show('تم الحذف')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
      throw requestError
    }
  }

  const save = async (values) => {
    try {
      await saveResource(listName, values, editing.isNew, editing.values)
      show(editing.isNew ? `تمت إضافة ${itemLabel} جديد` : 'تم حفظ التعديلات')
      setEditing(null)
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
      throw requestError
    }
  }

  return (
    <div>
      <div className="admin-head">
        <h1>{title}</h1>
        <Button onClick={() => setEditing({ values: makeEmpty(), isNew: true })}>
          <Plus size={18} aria-hidden="true" /> إضافة {itemLabel}
        </Button>
      </div>

      {error && <div className="notice notice--error" role="alert">{error} <button onClick={() => reload().catch(() => {})}>إعادة المحاولة</button></div>}
      {loading ? <div className="card"><EmptyState title="جارٍ تحميل البيانات..." /></div> : items.length === 0 ? (
        <div className="card">
          <EmptyState title={emptyText} />
        </div>
      ) : (
        <>
        <label className="field resource-search">
          <span className="field__label">بحث</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                {sortable && <th className="col-order">الترتيب</th>}
                {columns.map((c) => (
                  <th key={c.label}>{c.label}</th>
                ))}
                {visibleKey && <th>الحالة</th>}
                <th className="col-actions">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id}>
                  {sortable && <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => move(item, -1)} disabled={items.findIndex((entry) => entry.id === item.id) === 0} aria-label="نقل للأعلى">
                        <ArrowUp size={16} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => move(item, 1)}
                        disabled={items.findIndex((entry) => entry.id === item.id) === items.length - 1}
                        aria-label="نقل للأسفل"
                      >
                        <ArrowDown size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>}
                  {columns.map((c) => (
                    <td key={c.label} data-label={c.label}>
                      {c.render(item)}
                    </td>
                  ))}
                  {visibleKey && (
                    <td data-label="الحالة">
                      <button
                        className={`pill ${item[visibleKey] ? 'pill--on' : 'pill--off'}`}
                        onClick={() => toggleVisible(item)}
                        aria-label={item[visibleKey] ? 'إخفاء' : 'إظهار'}
                      >
                        {item[visibleKey] ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
                        {item[visibleKey] ? visibleLabels[0] : visibleLabels[1]}
                      </button>
                    </td>
                  )}
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => setEditing({ values: { ...item }, isNew: false })} aria-label="تعديل">
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button className="icon-btn icon-btn--danger" onClick={() => setDeleting(item)} aria-label="حذف">
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {editing && (
        <FormModal
          title={editing.isNew ? `إضافة ${itemLabel}` : `تعديل ${itemLabel}`}
          fields={fields}
          initial={editing.values}
          isNew={editing.isNew}
          items={items}
          validate={validate}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          text={`سيتم حذف «${deleting.title || deleting.name}» نهائيًا ولا يمكن التراجع.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
      <Toast toast={toast} onClose={close} />
    </div>
  )
}

function FormModal({ title, fields, initial, isNew, items, validate, onSave, onClose }) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (name, value) => setValues((v) => ({ ...v, [name]: value }))

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    const errs = {}
    fields.forEach((f) => {
      if (f.required && !String(values[f.name] ?? '').trim()) errs[f.name] = 'هذا الحقل مطلوب.'
    })
    Object.assign(errs, validate?.(values, items, isNew) || {})
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSave(values)
    } catch {
      setSaving(false)
      return
    }
    setSaving(false)
  }

  return (
    <Modal title={title} onClose={onClose} wide>
      <form onSubmit={submit} noValidate>
        {fields.map((f) => {
          const id = `f-${f.name}`
          if (f.type === 'image') {
            return <ImageUploader key={f.name} label={f.label} value={values[f.name]} onChange={(v) => set(f.name, v)} />
          }
          if (f.type === 'checkbox') {
            return (
              <div key={f.name} className="field field--check">
                <label>
                  <input type="checkbox" checked={!!values[f.name]} onChange={(e) => set(f.name, e.target.checked)} /> {f.label}
                </label>
              </div>
            )
          }
          if (f.type === 'multi') {
            return (
              <div key={f.name} className="field">
                <span className="field__label">{f.label}</span>
                {f.options.length === 0 ? (
                  <p className="field__hint">
                    {f.emptyText || 'لا توجد خيارات بعد.'}{' '}
                    {f.emptyHref && <Link to={f.emptyHref}>{f.emptyLinkLabel || 'إدارة الخيارات'}</Link>}
                  </p>
                ) : (
                  <div className="checks">
                    {f.options.map((o) => (
                      <label key={o.value} className="check-chip">
                        <input
                          type="checkbox"
                          checked={values[f.name].includes(o.value)}
                          onChange={(e) =>
                            set(
                              f.name,
                              e.target.checked ? [...values[f.name], o.value] : values[f.name].filter((x) => x !== o.value)
                            )
                          }
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          }
          return (
            <Field key={f.name} label={f.label + (f.required ? ' *' : '')} error={errors[f.name]} hint={f.hint} htmlFor={id}>
              {f.type === 'textarea' ? (
                <textarea id={id} rows={4} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === 'select' ? (
                <select id={id} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  type={f.type || 'text'}
                  dir={f.ltr ? 'ltr' : undefined}
                  value={values[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </Field>
          )
        })}
        <div className="modal__actions">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
          <Button type="submit" loading={saving}>
            حفظ
          </Button>
        </div>
      </form>
    </Modal>
  )
}
