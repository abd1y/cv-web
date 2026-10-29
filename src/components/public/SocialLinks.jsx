import { Mail, MessageCircle, Linkedin, Github } from 'lucide-react'

// يعرض فقط روابط الملف الشخصي التي أعادها Backend.
export default function SocialLinks({ profile, small = false }) {
  const items = [
    { key: 'email', label: 'Gmail', href: profile.email && `mailto:${profile.email}`, Icon: Mail },
    { key: 'whatsapp', label: 'WhatsApp', href: profile.whatsapp, Icon: MessageCircle },
    { key: 'linkedin', label: 'LinkedIn', href: profile.linkedin, Icon: Linkedin },
    { key: 'github', label: 'GitHub', href: profile.github, Icon: Github },
  ].filter((i) => i.href)

  if (!items.length) return null
  return (
    <ul className={`social ${small ? 'social--small' : ''}`}>
      {items.map(({ key, label, href, Icon }) => (
        <li key={key}>
          <a
            href={href}
            target={key === 'email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
          >
            <Icon size={small ? 18 : 22} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  )
}
