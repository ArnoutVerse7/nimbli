import { useState } from 'react'
import { supabase } from './lib/supabase'
import logo from './assets/logos/nimbli-logo.png'
import Button from './components/Button'
import TextInput from './components/TextInput'
import PageShell from './components/PageShell'

function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const { data, error } = await supabase
      .from('parents')
      .select('*')

    setIsLoading(false)

    if (error) {
      console.error(error)
      setErrorMessage('Er ging iets mis bij het inloggen.')
      return
    }

    const parent = data.find((parent) => {
      return (
        parent.email?.trim().toLowerCase() === email.trim().toLowerCase() &&
        parent.password?.trim() === password.trim()
      )
    })

    if (!parent) {
      setErrorMessage('Ongeldig e-mailadres of wachtwoord.')
      return
    }

    onNavigate('profileSelection')
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
        <h1>Welkom terug</h1>
        <p>Log in als ouder of kind, of meld je voor de eerste keer aan met een activatiecode.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <TextInput
          label="E-mail"
          placeholder="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <TextInput
          label="Wachtwoord"
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {errorMessage && (
          <p className="form-error-message">{errorMessage}</p>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Inloggen...' : 'Inloggen'}
        </Button>

        <Button
          variant="secondary"
          type="button"
          onClick={() => onNavigate('activation')}
        >
          Eerste keer? Aanmelden met code
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