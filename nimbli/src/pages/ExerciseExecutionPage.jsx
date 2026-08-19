import { useCallback, useEffect, useRef, useState } from 'react'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import { supabase } from '../lib/supabase'
import {
  evaluateExercisePose,
  getExerciseTrackingType,
  getTrackingDefinition,
  parseDurationSeconds,
  parseRepetitionTarget,
} from '../lib/poseExerciseEvaluator'
import '../styles/ChildFlow.css'
import mascotIcon from '../assets/logos/mascotte.png'

const poseConnections = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
]

const clampPercentage = (value) => Math.min(100, Math.max(0, value))

export default function ExerciseExecutionPage({ exerciseId, onNavigate }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseLandmarkerRef = useRef(null)
  const animationRef = useRef(null)
  const exerciseRef = useRef(null)
  const isRunningRef = useRef(true)
  const poseIsCorrectRef = useRef(false)
  const targetRepsRef = useRef(10)
  const repCountRef = useRef(0)
  const movementRef = useRef({ workReached: false, lastRepAt: 0 })
  const qualityRef = useRef({ scoreTotal: 0, frames: 0 })
  const finishedRef = useRef(false)
  const lastUiUpdateRef = useRef(0)

  const [exercise, setExercise] = useState(null)
  const [trackingMode, setTrackingMode] = useState('repetitions')
  const [targetReps, setTargetReps] = useState(10)
  const [repCount, setRepCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120)
  const [isRunning, setIsRunning] = useState(true)
  const [cameraError, setCameraError] = useState('')
  const [poseFeedback, setPoseFeedback] = useState('Camera starten...')
  const [feedbackTone, setFeedbackTone] = useState('warning')
  const [bodyVisible, setBodyVisible] = useState(false)
  const [liveAccuracy, setLiveAccuracy] = useState(0)
  const [metrics, setMetrics] = useState([])

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
        setCameraError('De oefening kon niet geladen worden.')
        return
      }

      if (assignmentResult.data?.completed) {
        onNavigate('childDashboard')
        return
      }

      const data = exerciseResult.data

      const trackingType = getExerciseTrackingType(data)
      const definition = getTrackingDefinition(trackingType)
      const repetitions = parseRepetitionTarget(data.reps)

      exerciseRef.current = { ...data, tracking_type: trackingType }
      targetRepsRef.current = repetitions
      repCountRef.current = 0
      movementRef.current = { workReached: false, lastRepAt: 0 }
      qualityRef.current = { scoreTotal: 0, frames: 0 }
      finishedRef.current = false
      poseIsCorrectRef.current = false

      setExercise(data)
      setTrackingMode(definition.mode)
      setTargetReps(repetitions)
      setRepCount(0)
      setTimeLeft(parseDurationSeconds(data.duration))
      setLiveAccuracy(0)
    }

    if (exerciseId) loadExercise()
  }, [exerciseId, onNavigate])

  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  const completeExercise = useCallback(() => {
    if (finishedRef.current || !exerciseRef.current) return

    finishedRef.current = true
    isRunningRef.current = false
    setIsRunning(false)

    const { scoreTotal, frames } = qualityRef.current
    const accuracy = clampPercentage(
      frames > 0 ? Math.round(scoreTotal / frames) : 0
    )
    const xp = Math.max(10, Math.round(accuracy / 2))
    const definition = getTrackingDefinition(
      getExerciseTrackingType(exerciseRef.current)
    )

    sessionStorage.setItem(
      `exerciseResult:${exerciseId}`,
      JSON.stringify({
        completed: true,
        accuracy,
        xp,
        repetitions: repCountRef.current,
        targetRepetitions:
          definition.mode === 'repetitions' ? targetRepsRef.current : 0,
        completedAt: new Date().toISOString(),
      })
    )

    onNavigate(`exerciseCompletion-${exerciseId}`)
  }, [exerciseId, onNavigate])

  const drawAndEvaluatePose = useCallback((landmarks, timestamp) => {
    const canvas = canvasRef.current
    const video = videoRef.current

    if (!canvas || !video || !video.videoWidth || !video.videoHeight) return

    const context = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.clearRect(0, 0, canvas.width, canvas.height)

    const points = landmarks?.[0]
    const evaluation = evaluateExercisePose(exerciseRef.current, points)
    const correctPose = evaluation.bodyVisible && evaluation.isCorrectPosition
    poseIsCorrectRef.current = correctPose

    const shouldUpdateUi = timestamp - lastUiUpdateRef.current > 120

    if (shouldUpdateUi) {
      lastUiUpdateRef.current = timestamp
      setPoseFeedback(evaluation.feedback)
      setFeedbackTone(evaluation.tone)
      setBodyVisible(evaluation.bodyVisible)
      setMetrics(evaluation.metrics)
    }

    if (isRunningRef.current && evaluation.bodyVisible && !finishedRef.current) {
      qualityRef.current.scoreTotal += clampPercentage(evaluation.score)
      qualityRef.current.frames += 1

      if (shouldUpdateUi) {
        setLiveAccuracy(Math.round(
          qualityRef.current.scoreTotal / qualityRef.current.frames
        ))
      }

      const trackingType = getExerciseTrackingType(exerciseRef.current)
      const definition = getTrackingDefinition(trackingType)

      if (definition.mode === 'repetitions') {
        if (evaluation.phase === definition.workPhase && correctPose) {
          movementRef.current.workReached = true
        }

        const returnedCorrectly = evaluation.phase === definition.restPhase
          && correctPose
          && movementRef.current.workReached
          && timestamp - movementRef.current.lastRepAt > 700

        if (returnedCorrectly) {
          const nextCount = repCountRef.current + 1
          repCountRef.current = nextCount
          movementRef.current = { workReached: false, lastRepAt: timestamp }
          setRepCount(nextCount)

          if (nextCount >= targetRepsRef.current) completeExercise()
        }
      }
    }

    const poseColor = !evaluation.bodyVisible
      ? '#ef5350'
      : correctPose
        ? '#2bb39b'
        : '#fbb92a'

    context.strokeStyle = poseColor
    context.lineWidth = 4

    poseConnections.forEach(([start, end]) => {
      const startPoint = points?.[start]
      const endPoint = points?.[end]

      if (!startPoint || !endPoint) return
      if ((startPoint.visibility ?? 1) < 0.35 || (endPoint.visibility ?? 1) < 0.35) return

      context.beginPath()
      context.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height)
      context.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height)
      context.stroke()
    })

    context.fillStyle = '#ffffff'
    context.strokeStyle = poseColor
    context.lineWidth = 3

    points?.forEach((point, index) => {
      if (index < 11 || (point.visibility ?? 1) < 0.35) return

      context.beginPath()
      context.arc(point.x * canvas.width, point.y * canvas.height, 6, 0, 2 * Math.PI)
      context.fill()
      context.stroke()
    })
  }, [completeExercise])

  const detectPose = useCallback(function detectCurrentPose() {
    const video = videoRef.current
    const poseLandmarker = poseLandmarkerRef.current

    if (!video || !poseLandmarker || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(detectCurrentPose)
      return
    }

    const timestamp = performance.now()
    const results = poseLandmarker.detectForVideo(video, timestamp)
    drawAndEvaluatePose(results.landmarks, timestamp)
    animationRef.current = requestAnimationFrame(detectCurrentPose)
  }, [drawAndEvaluatePose])

  useEffect(() => {
    let cameraStream = null
    let cancelled = false

    async function setupPoseDetection() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
        )

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.6,
          minPosePresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        })

        if (cancelled) {
          poseLandmarker.close()
          return
        }

        poseLandmarkerRef.current = poseLandmarker
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        })

        if (cancelled) {
          cameraStream.getTracks().forEach((track) => track.stop())
          return
        }

        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream
          videoRef.current.onloadeddata = detectPose
        }
      } catch (error) {
        console.error(error)
        setCameraError('Camera of pose-detectie kon niet gestart worden.')
      }
    }

    setupPoseDetection()

    return () => {
      cancelled = true
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      cameraStream?.getTracks().forEach((track) => track.stop())
      poseLandmarkerRef.current?.close()
      poseLandmarkerRef.current = null
    }
  }, [detectPose])

  useEffect(() => {
    if (trackingMode !== 'time' || !exercise) return undefined

    const timer = window.setInterval(() => {
      if (!isRunningRef.current || !poseIsCorrectRef.current || finishedRef.current) return

      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          window.queueMicrotask(completeExercise)
          return 0
        }

        return currentTime - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [completeExercise, exercise, trackingMode])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const stopExercise = () => {
    finishedRef.current = true
    isRunningRef.current = false
    setIsRunning(false)
    sessionStorage.removeItem(`exerciseResult:${exerciseId}`)
    onNavigate(`exerciseDetails-${exerciseId}`)
  }

  if (!exercise) {
    return (
      <div className="exercise-execution-page">
        <p>Oefening laden...</p>
      </div>
    )
  }

  const progress = trackingMode === 'repetitions'
    ? clampPercentage((repCount / targetReps) * 100)
    : clampPercentage(
      ((parseDurationSeconds(exercise.duration) - timeLeft)
        / parseDurationSeconds(exercise.duration)) * 100
    )

  return (
    <div className="exercise-execution-page">
      <main className="execution-container execution-layout">
        <section className="pose-camera-card">
          {cameraError ? (
            <div className="camera-placeholder">
              <span className="camera-icon">📷</span>
              <h2>Camera niet beschikbaar</h2>
              <p>{cameraError}</p>
            </div>
          ) : (
            <div className="pose-camera-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="pose-camera-video"
              />

              <canvas ref={canvasRef} className="pose-canvas" />

              <div className={`pose-status ${bodyVisible ? feedbackTone : 'warning'}`}>
                {bodyVisible ? 'Lichaam gedetecteerd' : 'Ga volledig in beeld staan'}
              </div>
            </div>
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

          <div>
            <h1>{exercise.title}</h1>
            <p className="tracking-label">
              {trackingMode === 'repetitions' ? 'Bewegingscontrole' : 'Houdingscontrole'}
            </p>
          </div>

          <section className="counter-section">
            <div className="timer-large">
              {trackingMode === 'repetitions'
                ? `${repCount}/${targetReps}`
                : formatTime(timeLeft)}
            </div>
            <div className="counter-label">
              {trackingMode === 'repetitions' ? 'Correcte herhalingen' : 'Correcte tijd over'}
            </div>
          </section>

          <div className="execution-progress" aria-label={`${Math.round(progress)} procent voltooid`}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className={`execution-feedback ${feedbackTone}`}>
            {poseFeedback}
          </div>

          <div className="pose-metrics">
            {metrics.map((metric) => (
              <div key={metric.label} className="pose-metric">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
            <div className="pose-metric">
              <span>Live juistheid</span>
              <strong>{liveAccuracy}%</strong>
            </div>
          </div>

          <div className="execution-controls">
            <button
              className="control-button pause-btn"
              onClick={() => setIsRunning((current) => !current)}
            >
              {isRunning ? '⏸ Pauze' : '▶ Verder'}
            </button>

            <button
              className="control-button skip-btn"
              onClick={stopExercise}
            >
              Stoppen
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
