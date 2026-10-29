// فحص أولي لكود SVG في الواجهة فقط لإظهار الأخطاء للمسؤول.
// ليس بديلًا عن التنظيف الأمني الإلزامي في Backend.

const FORBIDDEN_TAGS = ['script', 'foreignobject', 'iframe', 'object', 'embed', 'audio', 'video', 'style', 'animate', 'set']

export function validateSvg(code) {
  const errors = []
  const text = (code || '').trim()
  if (!text) return { ok: false, errors: ['كود SVG فارغ.'] }
  if (text.length > 20000) errors.push('حجم الكود كبير جدًا (الحد 20 ألف حرف).')

  const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
  if (doc.querySelector('parsererror')) {
    return { ok: false, errors: ['الكود ليس XML/SVG صحيحًا. راجع الوسوم المفتوحة والمغلقة.'] }
  }
  const root = doc.documentElement
  if (root.localName.toLowerCase() !== 'svg') errors.push('العنصر الجذر يجب أن يكون <svg>.')
  if (!root.getAttribute('viewBox')) errors.push('يُفضّل وجود viewBox حتى تتغير الأحجام بشكل صحيح.')

  doc.querySelectorAll('*').forEach((el) => {
    const tag = el.localName.toLowerCase()
    if (FORBIDDEN_TAGS.includes(tag)) errors.push(`عنصر غير مسموح: <${tag}>`)
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase()
      if (name.startsWith('on')) errors.push(`معالج حدث غير مسموح: ${attr.name}`)
      if ((name === 'href' || name === 'xlink:href') && !value.startsWith('#')) {
        errors.push('الروابط الخارجية غير مسموحة (يُسمح بالمراجع الداخلية #id فقط).')
      }
      if (value.includes('javascript:') || value.includes('data:text/html')) {
        errors.push('قيمة خطرة داخل أحد الخصائص.')
      }
      if (/url\(\s*['"]?\s*(https?:|\/\/)/.test(value)) errors.push('مراجع url() خارجية غير مسموحة.')
    }
  })
  const unique = [...new Set(errors)]
  return { ok: unique.length === 0, errors: unique }
}

// تحويل SVG تم فحصه إلى data URI يُعرض داخل <img> (لا ينفذ سكربتات ولا يحمّل موارد خارجية)
export function svgToDataUri(code) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(code.trim())}`
}
