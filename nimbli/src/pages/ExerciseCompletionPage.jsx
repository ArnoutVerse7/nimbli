import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/ChildFlow.css'

import mascotIcon from '../assets/logos/mascotte.png'
import trophyIcon from '../assets/logos/trophy.png'
import starIcon from '../assets/logos/star.png'

export default function ExerciseCompletionPage({ exerciseId, onNavigate }) {
  const [exercise, setExercise] = useState(null)

  useEffect(() => {
    async function loadExercise() {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single()

      if (error) {
        console.error(error)
        return
      }

      setExercise(data)
    }

    if (exerciseId) {
      loadExercise()
    }
  }, [exerciseId])

  if (!exercise) {
    return (
      <div className="exercise-completion-page">
        <p>Resultaat laden...</p>
      </div>
    )
  }

  return (
    <div className="exercise-completion-page">
      <div className="completion-container desktop-completion">
        <section className="completion-left">
          <img src={mascotIcon} alt="" className="completion-mascot-img" />
        </section>

        <section className="completion-right">
          <h1 className="completion-title">Fantastisch werk!</h1>

          <p className="completion-subtitle">
            Je hebt {exercise.title} succesvol afgerond!
          </p>

          <div className="results-cards">
            <div className="result-card">
              <div className="result-icon-circle yellow">
                <img src={starIcon} alt="" className="result-icon-img" />
              </div>
              <span className="result-label">XP verdiend</span>
              <span className="result-value">+50</span>
            </div>

            <div className="result-card">
              <div className="result-icon-circle purple">
                <img src={trophyIcon} alt="" className="result-icon-img" />
              </div>
              <span className="result-label">Juistheid</span>
              <span className="result-value">95%</span>
            </div>
          </div>

          <button
            className="completion-cta"
            onClick={() => onNavigate('childDashboard')}
          >
            Dat was het voor vandaag!
          </button>
        </section>
      </div>
    </div>
  )
}