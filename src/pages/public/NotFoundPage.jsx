import { Link } from 'react-router-dom'

export default function NotFoundPage({ title = 'الصفحة غير موجودة', text = 'الرابط الذي فتحته غير صحيح أو لم يعد متاحًا.' }) {
  return (
    <section className="section not-found">
      <div className="container">
        <p className="not-found__code">404</p>
        <h1>{title}</h1>
        <p>{text}</p>
        <Link to="/" className="btn btn--primary">
          العودة إلى الرئيسية
        </Link>
      </div>
    </section>
  )
}
