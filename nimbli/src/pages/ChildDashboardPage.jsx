import { useMemo, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
    formatExerciseScheduleRange,
    getWeekDates,
    isAssignmentPlannedForDate,
} from '../lib/exerciseSchedule'
import '../styles/ChildFlow.css'

import checkIcon from '../assets/logos/check.png'
import lockIcon from '../assets/logos/lock.png'
import starIcon from '../assets/logos/star.png'
import streakIcon from '../assets/logos/streak.png'
import trophyIcon from '../assets/logos/trophy.png'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'

const missions = [
    { title: 'Complete 1 oefening', progress: '80%', icon: checkIcon },
    { title: 'Verdien 10 XP', progress: '60%', icon: starIcon },
    { title: 'Maak je dag compleet', progress: '35%', icon: trophyIcon },
]

export default function ChildDashboardPage({ onNavigate }) {
    const [selectedExercise, setSelectedExercise] = useState(null)
    const [patient, setPatient] = useState(null)
    const [assignedExercises, setAssignedExercises] = useState([])

    useEffect(() => {
        async function loadPatientData() {
            const patientId = localStorage.getItem('patientId')

            if (!patientId) return

            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('*')
                .eq('id', patientId)
                .single()

            if (!patientError) {
                setPatient(patientData)
            }

            const { data: exerciseData, error: exerciseError } = await supabase
                .from('patient_exercises')
                .select(`
                    *,
                    exercises (*)
                `)
                .eq('patient_id', patientId)

            if (exerciseError) {
                console.error(exerciseError)
                return
            }

            const mappedExercises =
                exerciseData?.filter((item) => item.exercises).map((item) => ({
                    assignmentId: item.id,
                    id: item.exercises.id,
                    title: item.exercises.title,
                    duration: item.exercises.duration,
                    reps: item.exercises.reps,
                    cover_image: item.exercises.cover_image,
                    video_url: item.exercises.video_url,
                    completed: item.completed,
                    completion_percentage: item.completion_percentage,
                    assigned_at: item.assigned_at,
                    start_date: item.start_date,
                    end_date: item.end_date,
                })) || []

            setAssignedExercises(mappedExercises)
        }

        loadPatientData()
    }, [])

    const weekDays = useMemo(() => getWeekDates(0, 0), [])
    const todayExercises = assignedExercises.filter((item) =>
        isAssignmentPlannedForDate(item, new Date())
    )
    const roadNodes = Array.from({ length: 6 }, (_, index) => {
        const exercise = todayExercises[index] || null
        const status = !exercise
            ? 'locked'
            : exercise.completed
                ? 'done'
                : index === 0
                    ? 'active'
                    : 'open'

        return {
            id: exercise?.assignmentId || `locked-${index}`,
            label: `OEF. ${index + 1}`,
            icon: exercise?.completed ? checkIcon : exercise ? starIcon : lockIcon,
            status,
            exercise,
        }
    })

    return (
        <main className="child-road-page">
            <section className="child-dashboard-shell">
                <aside className="child-sidebar">
                    <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                    <button className="sidebar-link active" onClick={() => onNavigate('childDashboard')}>
                        Dashboard
                    </button>

                    <button className="sidebar-link" onClick={() => onNavigate('childMissions')}>
                        Dagelijkse missies
                    </button>

                    <button className="sidebar-link" onClick={() => onNavigate('childProfile')}>
                        Profiel
                    </button>

                    <button className="sidebar-link" onClick={() => onNavigate('login')}>
                        <img src={exitIcon} alt="Uitloggen" />
                    </button>
                </aside>

                <section className="child-main-area">
                    <header className="child-road-header">
                        <h1>Hallo {patient?.first_name || 'vriend'}!</h1>

                        <div className="child-road-stats">
                            <span><img src={trophyIcon} alt="" /> 3</span>
                            <span><img src={starIcon} alt="" /> 12 XP</span>
                            <span><img src={streakIcon} alt="" /> 20 days</span>
                        </div>
                    </header>

                    <div className="child-dashboard-content">
                        <section className="child-route-panel">
                            <div className="week-strip">
                                {weekDays.map((date) => {
                                    const plannedCount = assignedExercises.filter((item) =>
                                        isAssignmentPlannedForDate(item, date)
                                    ).length
                                    const isToday = date.toDateString() === new Date().toDateString()

                                    return (
                                        <div className="week-day" key={date.toISOString()}>
                                            <span>{date.toLocaleDateString('nl-BE', { weekday: 'short' }).slice(0, 2)}</span>
                                            <div className={`week-dot ${isToday ? 'today' : plannedCount ? 'planned' : ''}`}>
                                                {plannedCount || ''}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="child-road-map compact-map">
                                <div className="progress-line"></div>

                                {roadNodes.map((node, index) => (
                                    <button
                                        key={node.id}
                                        type="button"
                                        className={`road-node road-node-${index + 1} ${node.status} ${selectedExercise?.id === node.exercise?.id ? 'selected' : ''
                                            }`}
                                        onClick={() => {
                                            if (node.status !== 'locked' && node.exercise) {
                                                setSelectedExercise(node.exercise)
                                            }
                                        }}
                                    >
                                        <span className="road-node-circle">
                                            <img src={node.icon} alt="" />
                                        </span>
                                        <span className="road-node-label">{node.label}</span>
                                    </button>
                                ))}

                                {selectedExercise && (
                                    <div className="road-popup">
                                        <div className="road-popup-item">
                                            <div>
                                                <strong>{selectedExercise.title}</strong>
                                                <p>{selectedExercise.duration || '2 min'} · {selectedExercise.reps || '10 herhalingen'}</p>
                                                <small>{formatExerciseScheduleRange(selectedExercise)}</small>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => onNavigate(`exerciseDetails-${selectedExercise.id}`)}
                                            >
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {todayExercises.length === 0 && (
                                    <div className="child-no-exercises">
                                        <h3>Vandaag geen oefeningen</h3>
                                        <p>Geniet van je rustdag!</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <aside className="child-dashboard-side">
                            <section className="daily-widget">
                                <div className="widget-header">
                                    <h3>Dagmissies</h3>
                                    <button onClick={() => onNavigate('childMissions')}>Bekijk alles</button>
                                </div>

                                {missions.map((mission, index) => (
                                    <div className="dashboard-mission" key={index}>
                                        <img src={mission.icon} alt="" />
                                        <div>
                                            <strong>{mission.title}</strong>
                                            <div className="mission-progress small">
                                                <div style={{ width: mission.progress }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </aside>
                    </div>
                </section>
            </section>
        </main>
    )
}
