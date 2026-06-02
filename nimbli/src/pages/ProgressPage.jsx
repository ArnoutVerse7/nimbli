import '../styles/ChildFlow.css'

export default function ProgressPage({ onNavigate }) {
  const streakDays = 20
  const currentStreak = 3

  const weekProgress = [
    { day: 'Zo', completed: false },
    { day: 'Ma', completed: true },
    { day: 'Di', completed: true },
    { day: 'Wo', completed: true },
    { day: 'Do', completed: false },
    { day: 'Vr', completed: false },
    { day: 'Za', completed: false },
  ]

  return (
    <div className="progress-page">
      {/* Header */}
      <header className="progress-header">
        <button className="back-btn" onClick={() => onNavigate('childDashboard')}>
          ← Back
        </button>
        <h1>Jouw Voortgang</h1>
      </header>

      <div className="progress-container">
        {/* Streak Section */}
        <section className="streak-section">
          <div className="streak-card">
            <div className="streak-icon">🔥</div>
            <div className="streak-info">
              <div className="streak-number">{currentStreak}</div>
              <div className="streak-label">Dag Streak</div>
            </div>
          </div>

          <div className="streak-celebration">
            <h2>Streak van {currentStreak} dagen!</h2>
            <p>Keep it going! 🚀</p>
          </div>

          {/* Mascot */}
          <div className="streak-mascot">
            🎊
          </div>
        </section>

        {/* Week View */}
        <section className="week-progress">
          <h3>Deze week</h3>
          <div className="week-grid-large">
            {weekProgress.map((day, idx) => (
              <div key={idx} className={`week-day-large ${day.completed ? 'completed' : ''}`}>
                <div className="day-name">{day.day}</div>
                <div className="day-status">
                  {day.completed ? <span className="check">✓</span> : <span className="empty">○</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stat-card-large">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-number">{streakDays}</div>
              <div className="stat-text">day streak</div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="achievements-section">
          <h3>Behaald deze week</h3>
          <div className="achievements-grid">
            <div className="achievement-badge">
              <span className="badge-icon">🏆</span>
              <span className="badge-label">3x Oefening</span>
            </div>
            <div className="achievement-badge">
              <span className="badge-icon">⭐</span>
              <span className="badge-label">150 XP</span>
            </div>
            <div className="achievement-badge">
              <span className="badge-icon">🎯</span>
              <span className="badge-label">Perfect</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <button className="progress-cta" onClick={() => onNavigate('childDashboard')}>
          Terug naar Oefeningen
        </button>
      </div>
    </div>
  )
}
