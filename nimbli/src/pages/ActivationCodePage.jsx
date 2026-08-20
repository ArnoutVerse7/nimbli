import { useState } from 'react'
import Button from '../components/Button'
import CodeInput from '../components/CodeInput'
import PageShell from '../components/PageShell'
import { supabase } from '../lib/supabase'
export default function ActivationCodePage({ onNavigate }) {
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const activationCode = code.trim().toUpperCase()

    if (activationCode.length !== 6) {
      setErrorMessage('Voer een geldige activatiecode in.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const { data: userData } = await supabase.auth.getUser()

      if (userData.user) {
        const { data: patientId, error } = await supabase.rpc('claim_patient', {
          p_activation_code: activationCode,
        })

        if (error) {
          setErrorMessage('Activatiecode is ongeldig of verlopen.')
          return
        }

        localStorage.setItem('patientId', patientId)
        localStorage.removeItem('pendingActivationCode')
        onNavigate('profileSelection')
        return
      }

      localStorage.setItem('pendingActivationCode', activationCode)
      onNavigate('signup')
    } catch (error) {
      console.error(error)
      setErrorMessage('Er ging iets mis.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageShell activeRole="parent" onNavigate={onNavigate}>
      <div className="page-row">
        <Button
          variant="icon"
          type="button"
          onClick={() => onNavigate('login')}
        >
          ←
        </Button>
      </div>

      <div className="hero-copy">
        <h1>Voer je activatiecode in.</h1>
        <p>Daarmee koppelen we het juiste kindprofiel aan je account.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <CodeInput value={code} onChange={setCode} />

        {errorMessage && (
          <p className="form-error-message">
            {errorMessage}
          </p>
        )}

        <Button
          variant="secondary"
          type="button"
          className="help-link"
        >
          Geen code ontvangen? Neem contact op met je kinesist
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Controleren...' : 'Verder'}
        </Button>
      </form>
    </PageShell>
  )
}
