import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/ChildFlow.css'

import mascotIcon from '../assets/logos/mascotte.png'
import trophyIcon from '../assets/logos/trophy.png'
import starIcon from '../assets/logos/star.png'

const emptyResult = {
  completed: false,
  accuracy: 0,
  xp: 0,
  repetitions: 0,
  targetRepetitions: 0,
}

export default function ExerciseCompletionPage({ exerciseId, onNavigate }) {
  const saveInProgressRef = useRef(false)
  const [exercise, setExercise] = useState(null)
  const [result] = useState(() => {
    try {
      const storedResult = sessionStorage.getItem(`exerciseResult:${exerciseId}`)
      return storedResult ? { ...emptyResult, ...JSON.parse(storedResult) } : emptyResult
    } catch (error) {
      console.error('Ongeldig oefenresultaat:', error)
      return emptyResult
    }
  })
  const [isSavingResult, setIsSavingResult] = useState(result.completed)
  const [saveError, setSaveError] = useState('')

  const saveCompletion = useCallback(async () => {
    if (!result.completed) {
      setIsSavingResult(false)
      return
    }

    if (saveInProgressRef.current) return

    const patientId = localStorage.getItem('patientId')

    if (!patientId) {
      setSaveError('De gekoppelde patiënt kon niet gevonden worden.')
      setIsSavingResult(false)
      return
    }

    saveInProgressRef.current = true
    setIsSavingResult(true)
    setSaveError('')

    const completion = {
      completed: true,
      completion_percentage: 100,
      accuracy_percentage: Math.min(100, Math.max(0, Math.round(result.accuracy))),
      xp_earned: Math.min(50, Math.max(0, Math.round(result.xp))),
      completed_at: result.completedAt || new Date().toISOString(),
    }

    let { data, error } = await supabase
      .from('patient_exercises')
      .update(completion)
      .eq('patient_id', patientId)
      .eq('exercise_id', exerciseId)
      .select('id')
      .maybeSingle()

    // Compatibility fallback for databases where only the secure RPC may update results.
    if (error || !data) {
      const rpcResult = await supabase.rpc('complete_patient_exercise', {
        p_patient_id: patientId,
        p_exercise_id: exerciseId,
        p_accuracy_percentage: completion.accuracy_percentage,
        p_xp_earned: completion.xp_earned,
      })

      data = rpcResult.data
      error = rpcResult.error
    }

    if (error || !data) {
      console.error(error || 'Geen oefentoewijzing gevonden.')
      setSaveError('Het resultaat kon niet worden opgeslagen. Probeer opnieuw.')
    } else {
      sessionStorage.removeItem(`exerciseResult:${exerciseId}`)
    }

    saveInProgressRef.current = false
    setIsSavingResult(false)
  }, [exerciseId, result])

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
      await saveCompletion()
    }

    if (exerciseId) loadExercise()
  }, [exerciseId, saveCompletion])

  if (!exercise) {
    return (
      <div className="exercise-completion-page">
        <p>Resultaat laden...</p>
      </div>
    )
  }

  if (!result.completed) {
    return (
      <div className="exercise-completion-page">
        <div className="completion-container missing-result-card">
          <h1>Geen oefenresultaat gevonden</h1>
          <p>Start de oefening opnieuw zodat Nimbli je beweging kan beoordelen.</p>
          <button
            className="completion-cta"
            onClick={() => onNavigate(`exerciseDetails-${exerciseId}`)}
          >
            Terug naar de oefening
          </button>
        </div>
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
              <span className="result-value">+{result.xp}</span>
            </div>

            <div className="result-card">
              <div className="result-icon-circle purple">
                <img src={trophyIcon} alt="" className="result-icon-img" />
              </div>
              <span className="result-label">Juistheid</span>
              <span className="result-value">{result.accuracy}%</span>
            </div>
          </div>

          {result.targetRepetitions > 0 && (
            <p className="completion-repetitions">
              {result.repetitions} van {result.targetRepetitions} herhalingen correct uitgevoerd
            </p>
          )}

          {saveError && <p className="completion-save-error">{saveError}</p>}

          <button
            className="completion-cta"
            disabled={isSavingResult}
            onClick={() => {
              if (saveError) {
                saveCompletion()
              } else {
                onNavigate('childDashboard')
              }
            }}
          >
            {isSavingResult
              ? 'Resultaat opslaan...'
              : saveError
                ? 'Opnieuw proberen'
                : 'Dat was het voor vandaag!'}
          </button>
        </section>
      </div>
    </div>
  )
}
