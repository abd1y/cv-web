import { HashRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'

// HashRouter: يعمل على GitHub Pages دون إعداد إضافي (الروابط تبدأ بـ #/).
// عند الانتقال لاستضافة تدعم إعادة الكتابة (Netlify / Cloudflare Pages) استبدله بـ BrowserRouter.
export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </HashRouter>
  )
}
