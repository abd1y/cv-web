import { useEffect, useMemo, useState } from 'react'
import { Trash2, MailCheck, MailOpen, Send } from 'lucide-react'
import { apiRequest, errorMessage } from '../../api/client'
import { Button, ConfirmDialog, EmptyState, Toast, useToast } from '../../components/ui/ui'

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const { toast, show, close } = useToast()

  const loadMessages = async (targetPage = page) => {
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest(`/admin/messages/?page=${targetPage}&page_size=100`)
      setMessages(data.results)
      setCount(data.count)
      setPage(targetPage)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMessages(1) }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    return needle ? messages.filter((message) =>
      `${message.name} ${message.email} ${message.message}`.toLocaleLowerCase().includes(needle),
    ) : messages
  }, [messages, query])

  const open = async (message) => {
    try {
      const detail = await apiRequest(`/admin/messages/${message.id}/`)
      if (!detail.is_read) {
        await apiRequest(`/admin/messages/${message.id}/`, { method: 'PATCH', data: { is_read: true } })
        await loadMessages()
        detail.is_read = true
      }
      setSelected(detail)
      setReply('')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
    }
  }

  const toggleRead = async () => {
    if (!selected) return
    try {
      const updated = await apiRequest(`/admin/messages/${selected.id}/`, {
        method: 'PATCH',
        data: { is_read: !selected.is_read },
      })
      setSelected(updated)
      await loadMessages()
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
    }
  }

  const sendReply = async () => {
    if (!selected || sending || reply.trim().length < 3) return
    setSending(true)
    try {
      await apiRequest(`/admin/messages/${selected.id}/reply/`, {
        method: 'POST',
        data: { body: reply.trim() },
      })
      setReply('')
      setSelected(await apiRequest(`/admin/messages/${selected.id}/`))
      await loadMessages()
      show('تم إرسال الرد بالبريد الإلكتروني')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
      if (requestError.response?.status === 502) {
        setSelected(await apiRequest(`/admin/messages/${selected.id}/`).catch(() => selected))
        await loadMessages()
      }
    } finally {
      setSending(false)
    }
  }

  const remove = async () => {
    try {
      await apiRequest(`/admin/messages/${deleting.id}/`, { method: 'DELETE' })
      if (selected?.id === deleting.id) setSelected(null)
      setDeleting(null)
      await loadMessages(page)
      show('تم حذف الرسالة')
    } catch (requestError) {
      show(errorMessage(requestError), 'error')
      throw requestError
    }
  }

  return (
    <div>
      <div className="admin-head">
        <h1>الرسائل الواردة</h1>
      </div>
      {error && <p className="notice notice--error" role="alert">{error} <button onClick={() => loadMessages()}>إعادة المحاولة</button></p>}
      {loading ? <div className="card"><EmptyState title="جارٍ تحميل الرسائل..." /></div> : messages.length === 0 ? (
        <div className="card"><EmptyState title="لا توجد رسائل" text="ستظهر هنا الرسائل القادمة من نموذج التواصل." /></div>
      ) : (
        <>
          <label className="field">
            <span className="field__label">بحث في الرسائل</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <div className="messages">
            <ul className="card msg-list">
              {filtered.map((message) => (
                <li key={message.id}>
                  <button className={`msg-item ${message.id === selected?.id ? 'msg-item--active' : ''}`} onClick={() => open(message)}>
                    <span className={`dot ${message.is_read ? '' : 'dot--new'}`} aria-label={message.is_read ? 'مقروءة' : 'غير مقروءة'} />
                    <span className="msg-item__text">
                      <strong>{message.name}</strong>
                      <small>{message.message}</small>
                    </span>
                    {message.is_replied && <MailCheck size={16} aria-label="تم الرد" />}
                  </button>
                </li>
              ))}
            </ul>

            <div className="card msg-detail">
              {!selected ? <EmptyState title="اختر رسالة لعرضها" /> : (
                <>
                  <header>
                    <h2>{selected.name}</h2>
                    <p dir="ltr" className="msg-meta">{selected.email}</p>
                    <p className="msg-meta">{selected.created_at}</p>
                  </header>
                  <p className="msg-body">{selected.message}</p>
                  {selected.notify_error && <p className="notice notice--error">{selected.notify_error}</p>}
                  {selected.replies?.map((item) => (
                    <article key={item.id} className="card">
                      <p>{item.body}</p>
                      <small>{item.delivery_status} · {item.sent_at || 'لم يُرسل'}</small>
                    </article>
                  ))}
                  <div className="msg-tools">
                    <Button variant="outline" onClick={toggleRead}>
                      <MailOpen size={16} aria-hidden="true" /> {selected.is_read ? 'تحديد كغير مقروءة' : 'تحديد كمقروءة'}
                    </Button>
                    <Button variant="danger" onClick={() => setDeleting(selected)}>
                      <Trash2 size={16} aria-hidden="true" /> حذف
                    </Button>
                  </div>
                  <div className="field">
                    <label htmlFor="reply">الرد عبر البريد الإلكتروني</label>
                    <textarea id="reply" rows={4} value={reply} onChange={(event) => setReply(event.target.value)} />
                  </div>
                  <Button onClick={sendReply} loading={sending} disabled={reply.trim().length < 3}>
                    <Send size={16} aria-hidden="true" /> إرسال الرد
                  </Button>
                </>
              )}
            </div>
          </div>
          {count > 100 && (
            <div className="row-actions">
              <Button variant="outline" disabled={page <= 1} onClick={() => loadMessages(page - 1)}>السابق</Button>
              <span>{page} / {Math.ceil(count / 100)}</span>
              <Button variant="outline" disabled={page >= Math.ceil(count / 100)} onClick={() => loadMessages(page + 1)}>التالي</Button>
            </div>
          )}
        </>
      )}
      {deleting && <ConfirmDialog text={`سيتم حذف رسالة «${deleting.name}» نهائيًا.`} onConfirm={remove} onCancel={() => setDeleting(null)} />}
      <Toast toast={toast} onClose={close} />
    </div>
  )
}
