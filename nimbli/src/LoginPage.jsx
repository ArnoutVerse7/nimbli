import { useState } from 'react'
import { supabase } from './lib/supabase'
import logo from './assets/logos/nimbli-logo.png'
import Button from './components/Button'
import TextInput from './components/TextInput'
import PageShell from './components/PageShell'
import { selectFirstPatientForParent, signOutAndClearLocalData } from './lib/auth'

function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [noticeMessage] = useState(() => {
    const message = localStorage.getItem('authNotice') || ''
    localStorage.removeItem('authNotice')
    return message
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError || !authData.user) {
        setErrorMessage('Ongeldig e-mailadres of wachtwoord.')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError || profile?.role !== 'parent') {
        await signOutAndClearLocalData()
        setErrorMessage('Dit is geen ouderaccount. Gebruik de kinesistlogin.')
        return
      }

      const pendingCode = localStorage.getItem('pendingActivationCode')

      if (pendingCode) {
        const { data: patientId, error: claimError } = await supabase.rpc('claim_patient', {
          p_activation_code: pendingCode,
        })

        if (claimError) {
          localStorage.removeItem('pendingActivationCode')
          setErrorMessage('Je bent ingelogd, maar de activatiecode is ongeldig of verlopen.')
          return
        }

        localStorage.setItem('patientId', patientId)
        localStorage.removeItem('pendingActivationCode')
      } else {
        const { patient, error: patientError } = await selectFirstPatientForParent(authData.user.id)

        if (patientError) throw patientError

        if (!patient) {
          setErrorMessage('Dit ouderaccount is nog niet aan een kind gekoppeld. Gebruik eerst je activatiecode.')
          return
        }
      }

      onNavigate('profileSelection')
    } catch (error) {
      console.error(error)
      setErrorMessage('Er ging iets mis bij het inloggen.')
    } finally {
      setIsLoading(false)
    }
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
          type="email"
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

        {noticeMessage && (
          <p className="form-success-message">{noticeMessage}</p>
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
