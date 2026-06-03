import { useState } from 'react'
import Button from '../components/Button'
import CodeInput from '../components/CodeInput'
import PageShell from '../components/PageShell'
import { supabase } from '../lib/supabase'
export default function ActivationCodePage({ onNavigate }) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const activationCode = code.join('').trim().toUpperCase()

    if (activationCode.length !== 6) {
      setErrorMessage('Voer een geldige activatiecode in.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('activation_code', activationCode)
        .single()

      if (error || !patient) {
        setErrorMessage('Activatiecode niet gevonden.')
        setIsLoading(false)
        return
      }

      localStorage.setItem('patientId', patient.id)
      localStorage.setItem('activationCode', activationCode)

      onNavigate('signup')
    } catch (error) {
      console.error(error)
      setErrorMessage('Er ging iets mis.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageShell>
      <div className="status-bar" />

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
        <h1>Voer je activatiecode in:</h1>
        <p>Deze app werkt enkel met een code van je kinesist.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <CodeInput values={code} onChange={setCode} />

        {errorMessage && (
          <p
            style={{
              color: '#dc2626',
              textAlign: 'center',
              marginTop: '12px',
            }}
          >
            {errorMessage}
          </p>
        )}

        <Button
          variant="secondary"
          type="button"
          className="help-link"
        >
          Geen code gekregen? Opnieuw versturen
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Controleren...' : 'Verder'}
        </Button>
      </form>
    </PageShell>
  )
}