import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getExerciseCover } from '../lib/exerciseMedia'
import '../styles/ChildFlow.css'

export default function ExerciseDetailsPage({ exerciseId, onNavigate }) {
  const [exercise, setExercise] = useState(null)

  useEffect(() => {
    async function loadExercise() {
      const patientId = localStorage.getItem('patientId')
      const exerciseQuery = supabase
          .from('exercises')
          .select('*')
          .eq('id', exerciseId)
          .single()
      const assignmentQuery = patientId
        ? supabase
            .from('patient_exercises')
            .select('completed')
            .eq('patient_id', patientId)
            .eq('exercise_id', exerciseId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null })

      const [exerciseResult, assignmentResult] = await Promise.all([
        exerciseQuery,
        assignmentQuery,
      ])

      if (exerciseResult.error || assignmentResult.error) {
        console.error(exerciseResult.error || assignmentResult.error)
        return
      }

      if (assignmentResult.data?.completed) {
        onNavigate('childDashboard')
        return
      }

      setExercise(exerciseResult.data)
    }

    if (exerciseId) {
      loadExercise()
    }
  }, [exerciseId, onNavigate])

  if (!exercise) {
    return (
      <div className="exercise-details-page">
        <p>Oefening laden...</p>
      </div>
    )
  }

  const coverImage = getExerciseCover(exercise)

  return (
    <div className="exercise-details-page">
      <header className="exercise-header-bar">
        <button className="back-btn" onClick={() => onNavigate('childDashboard')}>
          ← Terug
        </button>

        <h1>{exercise.title}</h1>
      </header>

      <main className="exercise-details-container exercise-details-layout">
        <section className="exercise-visual-card">
          {exercise.video_url ? (
            <video className="child-exercise-video" controls>
              <source src={exercise.video_url} />
            </video>
          ) : (
            <div className="exercise-video-placeholder">
              {coverImage && (
                <img
                  src={coverImage}
                  alt={exercise.title}
                  className="child-exercise-cover"
                />
              )}
              <div className="play-button">▶</div>
              <p>Geen instructievideo beschikbaar</p>
            </div>
          )}

          <h2>{exercise.title}</h2>
          <p>
            Bekijk de oefening rustig en start daarna wanneer je klaar bent.
          </p>
        </section>

        <section className="exercise-content-card">
          <div className="exercise-info-cards">
            <div className="info-card">
              <span className="info-card-label">Beloning</span>
              <span className="info-card-value">+50 XP</span>
            </div>

            <div className="info-card">
              <span className="info-card-label">Niveau</span>
              <span className="info-card-value">{exercise.level || 'Makkelijk'}</span>
            </div>

            <div className="info-card">
              <span className="info-card-label">Duur</span>
              <span className="info-card-value">{exercise.duration || '2 min'}</span>
            </div>
          </div>

          <div className="description-section">
            <h3>Hoe doe je deze oefening?</h3>
            <p className="exercise-desc-text">
              Volg de instructievideo en voer de beweging rustig en gecontroleerd uit.
            </p>
          </div>

          <div className="instructions-section">
            <h3>Stap-voor-stap</h3>

            <ol className="instructions-list">
              <li>Zorg dat je voldoende ruimte hebt.</li>
              <li>Kijk eerst goed naar de instructievideo.</li>
              <li>Voer de oefening rustig uit.</li>
              <li>Herhaal: {exercise.reps || '10 herhalingen'}.</li>
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
