export default function ProfileCard({ label, selected, onClick }) {
  return (
    <button type="button" className={`profile-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="profile-card__icon" aria-hidden="true" />
      <span className="profile-card__label">{label}</span>
    </button>
  )
}
