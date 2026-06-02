import '../styles/ChildFlow.css'

import mascotIcon from '../assets/logos/mascotte.png'
import trophyIcon from '../assets/logos/trophy.png'
import starIcon from '../assets/logos/star.png'

export default function ExerciseCompletionPage({ exerciseId, onNavigate }) {
  const exercises = {
    1: { name: 'Jumping Jacks', xp: 50, accuracy: 89 },
    2: { name: 'Superheld Pose', xp: 50, accuracy: 95 },
  }

  const exercise = exercises[parseInt(exerciseId)] || exercises[1]

  return (
    <div className="exercise-completion-page">
      <div className="completion-container desktop-completion">
        <section className="completion-left">
          <img src={mascotIcon} alt="" className="completion-mascot-img" />
        </section>

        <section className="completion-right">
          <h1 className="completion-title">Fantastisch werk!</h1>
          <p className="completion-subtitle">Je hebt de oefening goed afgewerkt!</p>

          <div className="results-cards">
            <div className="result-card">
              <div className="result-icon-circle yellow">
                <img src={starIcon} alt="" className="result-icon-img" />
              </div>
              <span className="result-label">XP verdiend</span>
              <span className="result-value">+{exercise.xp}</span>
            </div>

            <div className="result-card">
              <div className="result-icon-circle purple">
                <img src={trophyIcon} alt="" className="result-icon-img" />
              </div>
              <span className="result-label">Juistheid</span>
              <span className="result-value">{exercise.accuracy}%</span>
            </div>
          </div>

          <button className="completion-cta" onClick={() => onNavigate('childDashboard')}>
            Dat was het voor vandaag!
          </button>
        </section>
      </div>
    </div>
  )
}