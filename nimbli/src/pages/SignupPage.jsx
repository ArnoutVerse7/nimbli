import { useState } from 'react'
import Button from '../components/Button'
import CheckboxField from '../components/CheckboxField'
import TextInput from '../components/TextInput'
import PageShell from '../components/PageShell'

export default function SignupPage({ onNavigate }) {
  const [accepted, setAccepted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    onNavigate('pinCreate')
  }

  return (
    <PageShell>
      <div className="status-bar" />
      <div className="page-row">
        <Button variant="icon" type="button" onClick={() => onNavigate('login')}>
          ←
        </Button>
        <span className="page-label">Inloggen</span>
      </div>

      <div className="hero-copy">
        <h1>Maak een account aan.</h1>
        <p>We hebben je code herkend.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <TextInput label="Naam" placeholder="Naam" />
        <TextInput label="E-mail" type="email" placeholder="E-mail" />
        <TextInput label="Wachtwoord" type="password" placeholder="Wachtwoord" />
        <CheckboxField
          label="Ik ga akkoord met de gebruiksvoorwaarden en privacy overeenkomsten."
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
        />
        <Button type="submit" disabled={!accepted}>
          Account aanmaken
        </Button>
      </form>
    </PageShell>
  )
}
