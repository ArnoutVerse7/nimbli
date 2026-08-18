import logo from '../assets/logos/nimbli-logo.png'

export default function PageShell({
  children,
  sidebarTitle = 'Welkom bij Nimbli',
  sidebarText = 'Samen werken aan een helder en motiverend oefentraject.',
}) {
  return (
    <main className="app-shell">
      <div className="auth-layout">
        <aside className="auth-brand-panel">
          <img src={logo} alt="Nimbli" className="auth-brand-logo" />

          <div className="auth-brand-copy">
            <h2>{sidebarTitle}</h2>
            <p>{sidebarText}</p>
          </div>

          <div className="auth-brand-footer">
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
