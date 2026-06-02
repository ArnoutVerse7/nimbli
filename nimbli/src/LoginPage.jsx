import { useState } from 'react'
import logo from './assets/logos/nimbli-logo.png'
import Button from './components/Button'
import TextInput from './components/TextInput'
import PageShell from './components/PageShell'

function LoginPage({ onNavigate }) {
  const [code, setCode] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onNavigate('activation')
  }

  return (
    <PageShell>
      <div className="status-bar" />

      <img src={logo} className="brand-logo" alt="nimbli logo" />

      <div className="hero-graphic" aria-hidden="true">
        <div className="circle large" />
        <div className="circle small" />
        <div className="bar bar-1" />
        <div className="bar bar-2" />
        <div className="bar bar-3" />
      </div>

      <div className="hero-copy">
        <h1>Welkom bij Nimbli</h1>
        <p>Log in of meld je aan met een code die je van de kinesist hebt gekregen.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <TextInput label="Code" placeholder="Email" value={code} onChange={(event) => setCode(event.target.value)} />
        <TextInput label="Wachtwoord" type="password" placeholder="Wachtwoord" />

        <Button type="submit">Inloggen</Button>
        <Button variant="secondary" type="button" onClick={() => onNavigate('activation')}>
          Aanmelden met code
        </Button>
      </form>

      <div className="footer-links">
        <a href="#">Privacy</a>
        <span className="separator">•</span>
        <a href="#">Gebruiksvoorwaarden</a>
      </div>
    </PageShell>
  )
}

export default LoginPage
