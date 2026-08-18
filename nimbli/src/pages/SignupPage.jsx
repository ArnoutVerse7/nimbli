import { useState } from 'react'
import Button from '../components/Button'
import CheckboxField from '../components/CheckboxField'
import TextInput from '../components/TextInput'
import PageShell from '../components/PageShell'
import { supabase } from '../lib/supabase'

export default function SignupPage({ onNavigate }) {
  const [accepted, setAccepted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    const activationCode = localStorage.getItem('pendingActivationCode')

    if (!activationCode) {
      setErrorMessage('Voer eerst de activatiecode van je kinesist in.')
      return
    }

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Vul alle velden in.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Je wachtwoord moet minstens 8 tekens bevatten.')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            role: 'parent',
          },
        },
      })

      if (error) {
        setErrorMessage(error.message || 'Account aanmaken is mislukt.')
        return
      }

      if (!data.session) {
        localStorage.setItem(
          'authNotice',
          'Account aangemaakt. Bevestig indien nodig je e-mailadres en log daarna in om het kinderprofiel te activeren.'
        )
        onNavigate('login')
        return
      }

      const { data: patientId, error: claimError } = await supabase.rpc('claim_patient', {
        p_activation_code: activationCode,
      })

      if (claimError) {
        setErrorMessage('Account gemaakt, maar de activatiecode is ongeldig of verlopen.')
        return
      }

      localStorage.setItem('patientId', patientId)
      localStorage.removeItem('pendingActivationCode')
      onNavigate('profileSelection')
    } catch (error) {
      console.error(error)
      setErrorMessage('Er ging iets mis bij het aanmaken van je account.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageShell activeRole="parent" onNavigate={onNavigate}>
      <div className="page-row">
        <Button variant="icon" type="button" onClick={() => onNavigate('login')}>
          ←
        </Button>
        <span className="page-label">Inloggen</span>
      </div>

      <div className="hero-copy">
        <h1>Maak een account aan.</h1>
        <p>Je code is herkend. Vul je gegevens aan om verder te gaan.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <TextInput
          label="Naam"
          placeholder="Naam"
          value={name}
          autoComplete="name"
          onChange={(event) => setName(event.target.value)}
        />
        <TextInput
          label="E-mail"
          type="email"
          placeholder="E-mail"
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextInput
          label="Wachtwoord"
          type="password"
          placeholder="Minstens 8 tekens"
          value={password}
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
        />
        <CheckboxField
          label="Ik ga akkoord met de gebruiksvoorwaarden en privacy overeenkomsten."
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
        />

        {errorMessage && (
          <p className="form-error-message">{errorMessage}</p>
        )}

        <Button type="submit" disabled={!accepted || isLoading}>
          {isLoading ? 'Account aanmaken...' : 'Account aanmaken'}
        </Button>
      </form>
    </PageShell>
  )
}
