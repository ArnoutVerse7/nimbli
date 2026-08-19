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
    missions: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" />
            <path d="m15 9 5-5M17 4h3v3" />
        </svg>
    ),
    profile: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
    ),
    logout: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
        </svg>
    ),
}

export default function ChildSidebar({ active = 'dashboard', onNavigate }) {
    const links = [
        { id: 'dashboard', label: 'Dashboard', page: 'childDashboard' },
        { id: 'missions', label: 'Missies', page: 'childMissions' },
        { id: 'profile', label: 'Profiel', page: 'childProfile' },
    ]

    return (
        <aside className="child-sidebar child-portal-sidebar">
            <img src={logo} alt="Nimbli" className="child-sidebar-logo" />
            <p className="child-sidebar-label">Kinderportaal</p>

            <nav className="child-sidebar-nav" aria-label="Kindernavigatie">
                {links.map((link) => (
                    <button
                        key={link.id}
                        type="button"
                        className={`sidebar-link child-sidebar-link ${active === link.id ? 'active' : ''}`}
                        onClick={() => onNavigate(link.page)}
                    >
                        <span className="child-sidebar-icon">{icons[link.id]}</span>
                        <span>{link.label}</span>
                    </button>
                ))}
            </nav>

            <button
                type="button"
                className="sidebar-link child-sidebar-link child-logout-link"
                onClick={() => onNavigate('login')}
            >
                <span className="child-sidebar-icon">{icons.logout}</span>
                <span>Uitloggen</span>
            </button>
        </aside>
    )
}
