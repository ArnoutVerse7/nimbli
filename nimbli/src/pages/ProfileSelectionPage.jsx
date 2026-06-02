import { useState } from 'react'
import Button from '../components/Button'
import PageShell from '../components/PageShell'
import ProfileCard from '../components/ProfileCard'

export default function ProfileSelectionPage({ onNavigate }) {
  const [selected, setSelected] = useState('Ouder')

  return (
    <PageShell>
      <div className="status-bar" />
      <div className="hero-copy">
        <h1>Kies jouw profiel.</h1>
      </div>

      <div className="profile-grid">
        <ProfileCard label="Ouder" selected={selected === 'Ouder'} onClick={() => setSelected('Ouder')} />
        <ProfileCard label="Kind" selected={selected === 'Kind'} onClick={() => setSelected('Kind')} />
      </div>

      <Button
        type="button"
        onClick={() => onNavigate(selected === 'Ouder' ? 'parentDashboard' : 'childDashboard')}
      >
        Continue
      </Button>
    </PageShell>
  )
}
