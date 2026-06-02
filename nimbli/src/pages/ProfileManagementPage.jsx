import Button from '../components/Button'
import PageShell from '../components/PageShell'
import ProfileCard from '../components/ProfileCard'

export default function ProfileManagementPage({ onNavigate }) {
  return (
    <PageShell>
      <div className="status-bar" />
      <div className="hero-copy">
        <h1>Kies jouw profiel.</h1>
      </div>

      <div className="profile-grid">
        <ProfileCard label="Ouder" onClick={() => onNavigate('pinEntry')} />
        <ProfileCard label="Kind" onClick={() => onNavigate('pinEntry')} />
      </div>

      <Button type="button" onClick={() => onNavigate('pinEntry')}>
        Manage profiles
      </Button>
    </PageShell>
  )
}
