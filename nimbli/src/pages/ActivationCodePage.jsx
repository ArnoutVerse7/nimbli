import { useState } from 'react'
import Button from '../components/Button'
import CodeInput from '../components/CodeInput'
import PageShell from '../components/PageShell'

export default function ActivationCodePage({ onNavigate }) {
  const [code, setCode] = useState(['', '', '', '', '', ''])

  const handleSubmit = (event) => {
    event.preventDefault()
    onNavigate('signup')
  }

  return (
    <PageShell>
      <div className="status-bar" />
      <div className="page-row">
        <Button variant="icon" type="button" onClick={() => onNavigate('login')}>
          ←
        </Button>
      </div>

      <div className="hero-copy">
        <h1>Voer je activatiecode in:</h1>
        <p>Deze app werkt enkel met een code van je kinesist.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <CodeInput values={code} onChange={setCode} />
        <Button variant="secondary" type="button" className="help-link">
          Geen code gekregen? Opnieuw versturen
        </Button>
        <Button type="submit">Verder</Button>
      </form>
    </PageShell>
  )
}
