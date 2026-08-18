import logo from '../assets/logos/nimbli-logo.png'
import mascot from '../assets/logos/mascotte.png'

export default function PageShell({ children }) {
  return (
    <main className="app-shell">
      <div className="auth-layout">
        <aside className="auth-brand-panel">
          <div className="auth-brand-logo-wrap">
            <img src={logo} alt="Nimbli" className="auth-brand-logo" />
          </div>

          <div className="auth-brand-copy">
            <span className="auth-brand-pill">Samen sterker bewegen</span>
            <h2>Revalidatie die kinderen blijft motiveren.</h2>
            <p>
              Nimbli verbindt kinesisten, ouders en kinderen in één helder
              oefentraject.
            </p>

            <div className="auth-benefits" aria-label="Voordelen van Nimbli">
              <span>Oefeningen op maat</span>
              <span>Voortgang in één overzicht</span>
              <span>Motivatie door speelse feedback</span>
            </div>
          </div>

          <img src={mascot} alt="" className="auth-mascot" aria-hidden="true" />
          <div className="auth-shape auth-shape--one" aria-hidden="true" />
          <div className="auth-shape auth-shape--two" aria-hidden="true" />
        </aside>

        <section className="login-card">
          <img src={logo} alt="Nimbli" className="auth-mobile-logo" />
          <div className="login-card-content">{children}</div>
        </section>
      </div>
    </main>
  )
}
