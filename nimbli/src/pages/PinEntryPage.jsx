import { useState } from 'react'
import Button from '../components/Button'
import PageShell from '../components/PageShell'

const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

export default function PinEntryPage({ onNavigate }) {
  const [pin, setPin] = useState(['', '', '', ''])

  const handleKey = (digit) => {
    const next = [...pin]
    const firstEmpty = next.findIndex((value) => !value)
    if (firstEmpty >= 0) {
      next[firstEmpty] = digit
      setPin(next)
    }
  }

  return (
    <PageShell>
      <div className="status-bar" />
      <div className="hero-copy">
        <h1>Ouderdashboard</h1>
        <p>Vul je pincode in.</p>
      </div>

      <div className="pin-preview">
        {pin.map((digit, index) => (
          <div key={index} className="pin-circle">
            {digit}
          </div>
        ))}
      </div>

      <div className="pin-keypad">
        {keypad.map((digit) => (
          <button key={digit} type="button" className="pin-key" onClick={() => handleKey(digit)}>
            {digit}
          </button>
        ))}
      </div>

      <div className="page-row page-row--spaced">
        <Button type="button" onClick={() => onNavigate('parentDashboard')}>
          Ga verder
        </Button>
        <Button variant="secondary" type="button" onClick={() => onNavigate('profileSelection')}>
          annuleer
        </Button>
      </div>
    </PageShell>
  )
}
