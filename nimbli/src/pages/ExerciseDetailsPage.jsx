import '../styles/ChildFlow.css'

export default function ExerciseDetailsPage({ exerciseId, onNavigate }) {
  const exercises = {
    1: {
      id: 1,
      name: 'Jumping Jacks',
      description: 'Spring met je armen en benen open en dicht.',
      difficulty: 'Easy',
      space: 'Standing, 1m²',
      reward: 50,
      time: '5 min',
      reps: '10×',
      emoji: '🤸',
      instructions: [
        'Ga rechtop staan met je voeten samen.',
        'Spring terwijl je armen en benen opent.',
        'Spring terug naar de startpositie.',
        'Herhaal dit 10 keer.',
      ],
    },
    2: {
      id: 2,
      name: 'Superheld Pose',
      description: 'Sta stevig en houd de superheldpose vast.',
      difficulty: 'Medium',
      space: 'Standing, 1m²',
      reward: 50,
      time: '3 min',
      reps: '3× hold',
      emoji: '🦸',
      instructions: [
        'Zet je voeten op schouderbreedte.',
        'Plaats je handen op je heupen.',
        'Borst vooruit en kijk recht voor je.',
        'Houd dit 30 seconden vast.',
      ],
    },
  }

  const exercise = exercises[parseInt(exerciseId)] || exercises[1]

  return (
    <div className="exercise-details-page">
      <header className="exercise-header-bar">
        <button className="back-btn" onClick={() => onNavigate('childDashboard')}>
          ← Terug
        </button>
        <h1>{exercise.name}</h1>
      </header>

      <main className="exercise-details-container exercise-details-layout">
        <section className="exercise-visual-card">
          <div className="exercise-video-placeholder">
            <div className="play-button">▶</div>
            <p>Instructievideo komt hier</p>
          </div><h2>{exercise.name}</h2>
          <p>{exercise.description}</p>
        </section>

        <section className="exercise-content-card">
          <div className="exercise-info-cards">
            <div className="info-card">
              <span className="info-card-label">Beloning</span>
              <span className="info-card-value">+{exercise.reward} XP</span>
            </div>

            <div className="info-card">
              <span className="info-card-label">Niveau</span>
              <span className="info-card-value">{exercise.difficulty}</span>
            </div>

            <div className="info-card">
              <span className="info-card-label">Ruimte</span>
              <span className="info-card-value">{exercise.space}</span>
            </div>
          </div>

          <div className="description-section">
            <h3>Hoe doe je deze oefening?</h3>
            <p className="exercise-desc-text">{exercise.description}</p>
          </div>

          <div className="instructions-section">
            <h3>Stap-voor-stap</h3>
            <ol className="instructions-list">
              {exercise.instructions.map((instruction, idx) => (
                <li key={idx}>{instruction}</li>
              ))}
            </ol>
          </div>

          <button
            className="large-cta-button"
            onClick={() => onNavigate(`exerciseExecution-${exercise.id}`)}
          >
            Start oefening
          </button>
        </section>
      </main>
    </div>
  )
}