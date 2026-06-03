import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/ChildFlow.css'
import mascotIcon from '../assets/logos/mascotte.png'

export default function ExerciseExecutionPage({ exerciseId, onNavigate }) {
  const videoRef = useRef(null)

  const [exercise, setExercise] = useState(null)
  const [timeLeft, setTimeLeft] = useState(120)
  const [isRunning, setIsRunning] = useState(true)
  const [cameraError, setCameraError] = useState('')

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

      const durationNumber = parseInt(data.duration) || 120
      setTimeLeft(durationNumber)
    }

    if (exerciseId) {
      loadExercise()
    }
  }, [exerciseId])

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error(error)
        setCameraError('Camera kon niet gestart worden.')
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!isRunning || !exercise) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onNavigate(`exerciseCompletion-${exerciseId}`)
          return 0
        }

        return prev - 1
      })
    }, 1500)

    return () => clearInterval(timer)
  }, [isRunning, exercise, exerciseId, onNavigate])

  const totalDuration = (parseInt(exercise?.duration) || 2)
  const progress =
    ((totalDuration - timeLeft) / totalDuration) * 100

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!exercise) {
    return (
      <div className="exercise-execution-page">
        <p>Oefening laden...</p>
      </div>
    )
  }

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
          {cameraError ? (
            <div className="camera-placeholder">
              <span className="camera-icon">📷</span>
              <h2>Camera niet beschikbaar</h2>
              <p>{cameraError}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="pose-camera-video"
            />
          )}
        </section>

        <section className="exercise-live-panel">
          <div className="execution-mascot">
            <img
              src={mascotIcon}
              alt="Nimbli mascotte"
              className="execution-mascot-img"
            />
          </div>

          <h1>{exercise.title}</h1>

          <section className="counter-section">
            <div className="timer-large">{formatTime(timeLeft)}</div>
            <div className="counter-label">Tijd over</div>
          </section>

          <div className="execution-instructions">
            <p>Goed bezig! Blijf rustig en gecontroleerd bewegen.</p>
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