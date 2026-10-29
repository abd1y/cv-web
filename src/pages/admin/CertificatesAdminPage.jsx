import ResourceManager from '../../components/admin/ResourceManager'
import { formatMonth } from '../../utils/format'

export default function CertificatesAdminPage() {
  return (
    <ResourceManager
      title="الشهادات والورشات"
      listName="certificates"
      itemLabel="شهادة"
      visibleKey="is_visible"
      columns={[
        {
          label: 'الشهادة',
          render: (c) => (
            <div>
              <strong>{c.title}</strong>
              <small>{c.issuer}</small>
            </div>
          ),
        },
        { label: 'التاريخ', render: (c) => formatMonth(c.date) || '—' },
      ]}
      makeEmpty={() => ({ title: '', issuer: '', description: '', date: '', image: '', is_visible: true })}
      getFields={() => [
        { name: 'title', label: 'اسم الشهادة أو الورشة', required: true },
        { name: 'issuer', label: 'الجهة المقدمة', required: true },
        { name: 'description', label: 'وصف مختصر', type: 'textarea' },
        { name: 'date', label: 'التاريخ', type: 'month' },
        { name: 'image', label: 'صورة (اختيارية)', type: 'image' },
        { name: 'is_visible', label: 'ظاهرة في الموقع', type: 'checkbox' },
      ]}
    />
  )
}
