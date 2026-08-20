import logo from '../assets/logos/nimbli-logo.png'

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  schedule: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2M8 18h2" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.5 1A7 7 0 0 0 14.3 5L14 2.3h-4L9.7 5a7 7 0 0 0-2.1 1.9l-2.5-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.5-1A7 7 0 0 0 9.7 19l.3 2.7h4l.3-2.7a7 7 0 0 0 2.1-1.9l2.5 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
    </svg>
  ),
}

export default function ParentSidebar({ active, onSelect, onLogout }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'schedule', label: 'Oefenplanning' },
    { id: 'settings', label: 'Instellingen' },
  ]

  return (
    <aside className="parent-sidebar">
      <img src={logo} alt="Nimbli" className="parent-logo" />
      <p className="parent-sidebar-label">Ouderportaal</p>

      <nav className="parent-sidebar-nav" aria-label="Oudernavigatie">
        {links.map((link) => (
          <button
            key={link.id}
            className={`parent-sidebar-link ${active === link.id ? 'active' : ''}`}
            onClick={() => onSelect(link.id)}
          >
            <span className="parent-sidebar-icon">{icons[link.id]}</span>
            <span>{link.label}</span>
          </button>
        ))}
      </nav>

      <button className="parent-sidebar-link parent-logout-link" onClick={onLogout}>
        <span className="parent-sidebar-icon">{icons.logout}</span>
        <span>Uitloggen</span>
      </button>
    </aside>
  )
}
