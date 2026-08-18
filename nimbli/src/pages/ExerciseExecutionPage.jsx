import { useCallback, useState, useEffect, useRef } from 'react'
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { supabase } from '../lib/supabase'
import '../styles/ChildFlow.css'
import mascotIcon from '../assets/logos/mascotte.png'

export default function ExerciseExecutionPage({ exerciseId, onNavigate }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseLandmarkerRef = useRef(null)
  const animationRef = useRef(null)

  const [exercise, setExercise] = useState(null)
  const [timeLeft, setTimeLeft] = useState(120)
  const [isRunning, setIsRunning] = useState(true)
  const [cameraError, setCameraError] = useState('')
  const [poseStatus, setPoseStatus] = useState('Camera starten...')

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
      setTimeLeft(parseInt(data.duration) || 120)
    }

    if (exerciseId) loadExercise()
  }, [exerciseId])

  const drawPose = useCallback((landmarks) => {
    const canvas = canvasRef.current
    const video = videoRef.current

    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!landmarks || landmarks.length === 0) {
      setPoseStatus('Ga volledig in beeld staan')
      return
    }

    const points = landmarks[0]

    const importantPoints = [
      points[0],
      points[11],
      points[12],
      points[23],
      points[24],
      points[25],
      points[26],
      points[27],
      points[28],
    ]

    const bodyVisible = importantPoints.every(
      (point) => point && (point.visibility ?? 1) > 0.5
    )

    setPoseStatus(
      bodyVisible ? 'Volledig lichaam zichtbaar' : 'Stap wat verder achteruit'
    )

    const connections = [
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
      [24, 26],
      [26, 28],
    ]

    ctx.strokeStyle = bodyVisible ? '#20a98b' : '#f59e0b'
    ctx.lineWidth = 4

    connections.forEach(([start, end]) => {
      const p1 = points[start]
      const p2 = points[end]

      if (!p1 || !p2) return

      ctx.beginPath()
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height)
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height)
      ctx.stroke()
    })

    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = bodyVisible ? '#20a98b' : '#f59e0b'
    ctx.lineWidth = 3

    points.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 6, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    })
  }, [])

  const detectPose = useCallback(function detectCurrentPose() {
    const video = videoRef.current
    const poseLandmarker = poseLandmarkerRef.current

    if (!video || !poseLandmarker || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(detectCurrentPose)
      return
    }

    const results = poseLandmarker.detectForVideo(video, performance.now())
    drawPose(results.landmarks)

    animationRef.current = requestAnimationFrame(detectCurrentPose)
  }, [drawPose])

  useEffect(() => {
    let cameraStream = null

    async function setupPoseDetection() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )

        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        })

        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream
          videoRef.current.onloadeddata = detectPose
        }
      } catch (error) {
        console.error(error)
        setCameraError('Camera of pose detection kon niet gestart worden.')
      }
    }

    setupPoseDetection()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)

      cameraStream?.getTracks().forEach((track) => track.stop())
    }
  }, [detectPose])

  useEffect(() => {
    if (!isRunning || !exercise || poseStatus !== 'Volledig lichaam zichtbaar') return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onNavigate(`exerciseCompletion-${exerciseId}`)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, exercise, exerciseId, onNavigate, poseStatus])

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

  const bodyIsVisible = poseStatus === 'Volledig lichaam zichtbaar'

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

              <div className={`pose-status ${bodyIsVisible ? 'success' : 'warning'}`}>
                {poseStatus}
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

          <h1>{exercise.title}</h1>

          <section className="counter-section">
            <div className="timer-large">{formatTime(timeLeft)}</div>
            <div className="counter-label">Tijd over</div>
          </section>

          <div className="execution-instructions">
            <p>
              {bodyIsVisible
                ? 'Goed bezig! Je staat volledig in beeld.'
                : 'Stap wat verder achteruit zodat je hele lichaam zichtbaar is.'}
            </p>
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
