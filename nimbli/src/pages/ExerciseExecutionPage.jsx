import { useState, useEffect } from 'react'
import '../styles/ChildFlow.css'
import mascotIcon from '../assets/logos/mascotte.png'

export default function ExerciseExecutionPage({ exerciseId, onNavigate }) {
  const [timeLeft, setTimeLeft] = useState(300)
  const [repsLeft, setRepsLeft] = useState(10)
  const [isRunning, setIsRunning] = useState(true)

  const exercises = {
    1: { name: 'Jumping Jacks', type: 'reps', totalReps: 10 },
    2: { name: 'Superheld Pose', type: 'time', totalTime: 180 },
  }

  const exercise = exercises[parseInt(exerciseId)] || exercises[1]

  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      if (exercise.type === 'reps') {
        setRepsLeft((prev) => {
          if (prev <= 1) {
            onNavigate(`exerciseCompletion-${exerciseId}`)
            return 0
          }
          return prev - 1
        })
      } else {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onNavigate(`exerciseCompletion-${exerciseId}`)
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, exercise.type, exerciseId, onNavigate])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress =
    exercise.type === 'reps'
      ? ((exercise.totalReps - repsLeft) / exercise.totalReps) * 100
      : ((exercise.totalTime - timeLeft) / exercise.totalTime) * 100

  return (
    <div className="exercise-execution-page">
      <header className="execution-header">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <main className="execution-container execution-layout">
        <section className="pose-camera-card">
          <div className="camera-placeholder">
            <span className="camera-icon">📷</span>
            <h2>Camera preview</h2>
            <p>Hier komt later MediaPipe Pose detectie.</p>
          </div>
        </section>

        <section className="exercise-live-panel">
          <div className="execution-mascot">
            <img
              src={mascotIcon}
              alt="Nimbli mascotte"
              className="execution-mascot-img"
            />
          </div>

          <h1>{exercise.name}</h1>

          <section className="counter-section">
            {exercise.type === 'reps' ? (
              <>
                <div className="counter-large">{repsLeft}</div>
                <div className="counter-label">Herhalingen</div>
              </>
            ) : (
              <>
                <div className="timer-large">{formatTime(timeLeft)}</div>
                <div className="counter-label">Tijd over</div>
              </>
            )}
          </section>

          <div className="execution-instructions">
            <p>Goed bezig! Blijf doorgaan</p>
          </div>

          <div className="execution-controls">
            <button
              className="control-button pause-btn"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? '⏸ Pauze' : '▶ Verder'}
            </button>

            <button
              className="control-button skip-btn"
              onClick={() => onNavigate(`exerciseCompletion-${exerciseId}`)}
            >
              Stop
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}