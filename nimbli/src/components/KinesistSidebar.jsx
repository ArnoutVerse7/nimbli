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
    exercises: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 8.5h10M7 15.5h10M4.5 6v5M19.5 6v5M4.5 13v5M19.5 13v5" />
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

export default function KinesistSidebar({ active = 'dashboard', onNavigate }) {
    const links = [
        { id: 'dashboard', label: 'Dashboard', page: 'kinesistDashboard' },
        { id: 'exercises', label: 'Oefeningen', page: 'kinesistExercises' },
        { id: 'settings', label: 'Instellingen', page: 'kinesistSettings' },
    ]

    return (
        <aside className="child-sidebar kine-sidebar">
            <img src={logo} alt="Nimbli" className="child-sidebar-logo" />
            <p className="kine-sidebar-label">Kinesistportaal</p>

            <nav className="kine-sidebar-nav" aria-label="Kinesistnavigatie">
                {links.map((link) => (
                    <button
                        key={link.id}
                        className={`sidebar-link ${active === link.id ? 'active' : ''}`}
                        onClick={() => onNavigate(link.page)}
                    >
                        <span className="sidebar-link-icon">{icons[link.id]}</span>
                        <span>{link.label}</span>
                    </button>
                ))}
            </nav>

            <button
                className="sidebar-link kine-logout-link"
                onClick={() => onNavigate('kinesistLogin')}
            >
                <span className="sidebar-link-icon">{icons.logout}</span>
                <span>Uitloggen</span>
            </button>
        </aside>
    )
}
