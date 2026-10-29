import ResourceManager from '../../components/admin/ResourceManager'
import { formatMonth } from '../../utils/format'

export default function ExperienceAdminPage() {
  return (
    <ResourceManager
      title="الخبرات الوظيفية"
      listName="experience"
      itemLabel="خبرة"
      visibleKey="is_visible"
      columns={[
        {
          label: 'الخبرة',
          render: (e) => (
            <div>
              <strong>{e.title}</strong>
              <small>{e.company}</small>
            </div>
          ),
        },
        { label: 'الفترة', render: (e) => `${formatMonth(e.start) || '—'} → ${e.end ? formatMonth(e.end) : 'الآن'}` },
      ]}
      makeEmpty={() => ({ title: '', company: '', description: '', start: '', end: '', is_visible: true })}
      validate={(v) => (v.start && v.end && v.end < v.start ? { end: 'تاريخ النهاية قبل تاريخ البداية.' } : {})}
      getFields={() => [
        { name: 'title', label: 'المسمى الوظيفي', required: true },
        { name: 'company', label: 'اسم الشركة', required: true },
        { name: 'description', label: 'وصف الخبرة', type: 'textarea' },
        { name: 'start', label: 'تاريخ البداية', type: 'month' },
        { name: 'end', label: 'تاريخ النهاية', type: 'month', hint: 'اتركه فارغًا إذا كنت ما زلت تعمل.' },
        { name: 'is_visible', label: 'ظاهرة في الموقع', type: 'checkbox' },
      ]}
    />
  )
}
