import { useApp } from '../../context/AppContext'
import SocialLinks from './SocialLinks'

export default function Footer() {
  const { profile } = useApp()
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.name}. {profile.footerText}
        </p>
        <SocialLinks profile={profile} small />
      </div>
    </footer>
  )
}
