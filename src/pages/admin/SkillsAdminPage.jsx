import ResourceManager from '../../components/admin/ResourceManager'
import AppIcon from '../../components/AppIcon'
import { builtinIcons } from '../../data/builtinIcons'

export default function SkillsAdminPage() {
  return (
    <div>
    <ResourceManager
      title="المهارات والتقنيات"
      listName="skills"
      itemLabel="مهارة"
      visibleKey="is_visible"
      columns={[
        {
          label: 'المهارة',
          render: (s) => (
            <div className="cell-media">
              <AppIcon iconKey={s.icon_key} customIcon={s.icon} label={s.name} size={34} />
              <strong>{s.name}</strong>
            </div>
          ),
        },
        { label: 'مفتاح الأيقونة', render: (s) => <code dir="ltr">{s.icon_key || '—'}</code> },
      ]}
      makeEmpty={() => ({ name: '', icon_key: 'react', is_visible: true })}
      getFields={(lists) => [
        { name: 'name', label: 'اسم المهارة', required: true },
        {
          name: 'icon_key',
          label: 'الأيقونة',
          type: 'select',
          hint: 'يمكنك إضافة أيقونات جديدة من صفحة الأيقونات وستظهر هنا مباشرة.',
          options: [
            ...builtinIcons.map((icon) => ({ value: icon.key, label: `${icon.name} (محلية)` })),
            ...lists.icons.map((icon) => ({
              value: icon.key,
              label: `${icon.name_ar} (مخصصة${icon.is_active ? '' : '، معطلة'})`,
            })),
          ],
        },
        { name: 'is_visible', label: 'ظاهرة في الموقع', type: 'checkbox' },
      ]}
    />
    <ResourceManager
      title="كتالوج التقنيات"
      listName="technologies"
      itemLabel="تقنية"
      sortable={false}
      emptyText="لا توجد تقنيات في الكتالوج."
      columns={[
        { label: 'الاسم', render: (technology) => <strong>{technology.name}</strong> },
        { label: 'المفتاح', render: (technology) => <code dir="ltr">{technology.key}</code> },
        { label: 'عدد المشاريع', render: (technology) => technology.projects_count ?? '—' },
      ]}
      makeEmpty={() => ({ key: '', name: '', icon: '' })}
      validate={(value, items) => ({
        ...(items.some((item) => item.key === value.key && item.id !== value.id) ? { key: 'هذا المفتاح مستخدم.' } : {}),
      })}
      getFields={(lists) => [
        { name: 'key', label: 'المفتاح', required: true, ltr: true, hint: 'مثال: react أو django' },
        { name: 'name', label: 'الاسم', required: true },
        {
          name: 'icon',
          label: 'أيقونة مخصصة',
          type: 'select',
          options: [
            { value: '', label: 'أيقونة احتياطية' },
            ...lists.icons.map((icon) => ({
              value: icon.id,
              label: `${icon.name_ar}${icon.is_active ? '' : ' (معطلة)'}`,
            })),
          ],
        },
      ]}
    />
    </div>
  )
}
