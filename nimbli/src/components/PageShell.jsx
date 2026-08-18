import logo from '../assets/logos/nimbli-logo.png'
import userIcon from '../assets/logos/user.png'
import profileIcon from '../assets/logos/profile.png'

export default function PageShell({
  children,
  activeRole = 'kinesist',
  onNavigate,
}) {
  return (
    <main className="app-shell">
      <div className="auth-layout">
        <aside className="auth-sidebar">
          <img src={logo} alt="Nimbli" className="auth-sidebar-logo" />

          <span className="auth-sidebar-label">Aanmelden als</span>

          <nav className="auth-sidebar-nav" aria-label="Kies je omgeving">
            <button
              type="button"
              className={`auth-sidebar-link ${activeRole === 'kinesist' ? 'active' : ''}`}
              onClick={() => onNavigate('kinesistLogin')}
            >
              <img src={userIcon} alt="" />
              <span>Kinesist</span>
            </button>

            <button
              type="button"
              className={`auth-sidebar-link ${activeRole === 'parent' ? 'active' : ''}`}
              onClick={() => onNavigate('login')}
            >
              <img src={profileIcon} alt="" />
              <span>Ouder &amp; kind</span>
            </button>
          </nav>

          <div className="auth-sidebar-footer">
            <a href="#">Privacy</a>
            <span>·</span>
            <a href="#">Gebruiksvoorwaarden</a>
          </div>
        </aside>

        <section className="login-card">
          <div className="login-card-content">{children}</div>
        </section>
      </div>
    </main>
  )
}
