import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
    formatExerciseScheduleRange,
    getWeekDates,
    isAssignmentPlannedForDate,
} from '../lib/exerciseSchedule'
import { getExerciseCover } from '../lib/exerciseMedia'
import { getChildProgress, toProgress } from '../lib/childProgress'
import ChildSidebar from '../components/ChildSidebar'
import ChildIcon, { MissionIcon } from '../components/ChildIcon'
import '../styles/ChildFlow.css'

import mascotIcon from '../assets/logos/mascotte.png'
import starIcon from '../assets/logos/star.png'
import streakIcon from '../assets/logos/streak.png'
import trophyIcon from '../assets/logos/trophy.png'

export default function ChildDashboardPage({ onNavigate }) {
    const [selectedExercise, setSelectedExercise] = useState(null)
    const [patient, setPatient] = useState(null)
    const [assignedExercises, setAssignedExercises] = useState([])

    useEffect(() => {
        async function loadPatientData() {
            const patientId = localStorage.getItem('patientId')

            if (!patientId) return

            const [patientResult, exerciseResult] = await Promise.all([
                supabase
                    .from('patients')
                    .select('*')
                    .eq('id', patientId)
                    .single(),
                supabase
                    .from('patient_exercises')
                    .select(`
                        *,
                        exercises (*)
                    `)
                    .eq('patient_id', patientId)
                    .order('assigned_at', { ascending: true }),
            ])

            if (!patientResult.error) setPatient(patientResult.data)

            if (exerciseResult.error) {
                console.error(exerciseResult.error)
                return
            }

            const mappedExercises =
                exerciseResult.data?.filter((item) => item.exercises).map((item) => ({
                    assignmentId: item.id,
                    id: item.exercises.id,
                    title: item.exercises.title,
                    description: item.exercises.description,
                    duration: item.exercises.duration,
                    reps: item.exercises.reps,
                    cover_image: item.exercises.cover_image,
                    video_url: item.exercises.video_url,
                    completed: item.completed,
                    completion_percentage: item.completion_percentage,
                    xp_earned: item.xp_earned,
                    completed_at: item.completed_at,
                    assigned_at: item.assigned_at,
                    start_date: item.start_date,
                    end_date: item.end_date,
                })) || []

            const exercisesForToday = mappedExercises.filter((item) =>
                isAssignmentPlannedForDate(item, new Date())
            )

            setAssignedExercises(mappedExercises)
            setSelectedExercise(
                exercisesForToday.find((item) => !item.completed)
                || null
            )
        }

        loadPatientData()
    }, [])

    const weekDays = useMemo(() => getWeekDates(0, 1), [])
    const {
        todayExercises,
        completedExercises,
        completedToday,
        totalXp,
        completionStreak,
        missions: missionProgress,
    } = getChildProgress(assignedExercises)
    const firstIncompleteIndex = todayExercises.findIndex((item) => !item.completed)

    const roadNodes = Array.from({ length: 6 }, (_, index) => {
        const exercise = todayExercises[index] || null
        const status = !exercise
            ? 'locked'
            : exercise.completed
                ? 'done'
                : index === firstIncompleteIndex
                    ? 'active'
                    : 'open'

        return {
            id: exercise?.assignmentId || `locked-${index}`,
            label: exercise?.completed
                ? 'Voltooid'
                : exercise
                    ? `Oefening ${index + 1}`
                    : 'Vergrendeld',
            status,
            exercise,
        }
    })

    const pathProgress = todayExercises.length
        ? toProgress(completedToday.length, todayExercises.length)
        : 0
    const selectedCover = getExerciseCover(selectedExercise)
    const missions = missionProgress

    return (
        <main className="child-road-page">
            <section className="child-dashboard-shell">
                <ChildSidebar active="dashboard" onNavigate={onNavigate} />

                <section className="child-main-area">
                    <header className="child-road-header">
                        <div className="child-header-copy">
                            <span>Jouw beweegavontuur</span>
                            <h1>Hallo {patient?.first_name || 'vriend'}!</h1>
                        </div>

                        <div className="child-road-stats">
                            <span>
                                <img src={trophyIcon} alt="" />
                                <span><strong>{completedExercises.length}</strong><small>klaar</small></span>
                            </span>
                            <span>
                                <img src={starIcon} alt="" />
                                <span><strong>{totalXp} XP</strong><small>verzameld</small></span>
                            </span>
                            <span>
                                <img src={streakIcon} alt="" />
                                <span><strong>{completionStreak}</strong><small>dagreeks</small></span>
                            </span>
                        </div>
                    </header>

                    <div className="child-dashboard-content">
                        <div className="child-dashboard-primary">
                            <section className="child-week-card">
                                <div className="child-section-heading">
                                    <div>
                                        <span>Deze week</span>
                                        <h2>Jouw oefenweek</h2>
                                    </div>
                                    <strong>{completedToday.length}/{todayExercises.length} vandaag</strong>
                                </div>

                                <div className="week-strip">
                                    {weekDays.map((date) => {
                                        const plannedExercises = assignedExercises.filter((item) =>
                                            isAssignmentPlannedForDate(item, date)
                                        )
                                        const plannedCount = plannedExercises.length
                                        const completedCount = plannedExercises.filter((item) => item.completed).length
                                        const isToday = date.toDateString() === new Date().toDateString()
                                        const isComplete = plannedCount > 0 && completedCount === plannedCount

                                        return (
                                            <div className={`week-day ${isToday ? 'today' : ''}`} key={date.toISOString()}>
                                                <span>{date.toLocaleDateString('nl-BE', { weekday: 'short' }).slice(0, 2)}</span>
                                                <div className={`week-dot ${isComplete ? 'done' : plannedCount ? 'planned' : ''}`}>
                                                    {date.getDate()}
                                                </div>
                                                <small>{plannedCount ? `${plannedCount} oef.` : 'Rust'}</small>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>

                            <section className="child-route-panel">
                                <div className="child-section-heading">
                                    <div>
                                        <span>Vandaag</span>
                                        <h2>Jouw oefeningenpad</h2>
                                    </div>
                                    <strong>{pathProgress}% voltooid</strong>
                                </div>

                                <div
                                    className="child-road-map compact-map"
                                    style={{ '--path-progress': `${pathProgress}%` }}
                                >
                                    <div className="progress-line"><span /></div>

                                    <div className="child-road-nodes">
                                        {roadNodes.map((node) => (
                                            <button
                                                key={node.id}
                                                type="button"
                                                className={`road-node ${node.status} ${
                                                    selectedExercise?.assignmentId === node.exercise?.assignmentId
                                                        ? 'selected'
                                                        : ''
                                                }`}
                                                disabled={node.status === 'locked' || node.status === 'done'}
                                                onClick={() => {
                                                    if (node.exercise && !node.exercise.completed) {
                                                        setSelectedExercise(node.exercise)
                                                    }
                                                }}
                                            >
                                                <span className="road-node-circle">
                                                    <ChildIcon
                                                        name={
                                                            node.status === 'done'
                                                                ? 'check'
                                                                : node.status === 'active'
                                                                    ? 'star'
                                                                    : node.status === 'open'
                                                                        ? 'moon'
                                                                        : 'lock'
                                                        }
                                                    />
                                                </span>
                                                <span className="road-node-label">{node.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedExercise ? (
                                    <article className="child-selected-exercise">
                                        <div className="child-selected-cover">
                                            {selectedCover ? (
                                                <img src={selectedCover} alt={selectedExercise.title} />
                                            ) : (
                                                <span>Oefening</span>
                                            )}
                                        </div>

                                        <div className="child-selected-copy">
                                            <span>Klaar om te starten</span>
                                            <h3>{selectedExercise.title}</h3>
                                            <p>
                                                {selectedExercise.duration || '2 min'} ·{' '}
                                                {selectedExercise.reps || '10 herhalingen'}
                                            </p>
                                            <small>{formatExerciseScheduleRange(selectedExercise)}</small>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onNavigate(`exerciseDetails-${selectedExercise.id}`)}
                                        >
                                            Start oefening
                                        </button>
                                    </article>
                                ) : todayExercises.length > 0 ? (
                                    <div className="child-rest-card child-completed-card">
                                        <img src={mascotIcon} alt="Nimbli mascotte" />
                                        <div>
                                            <h3>Alles voltooid voor vandaag!</h3>
                                            <p>Goed gedaan. Je voltooide oefeningen kunnen niet opnieuw gestart worden.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="child-rest-card">
                                        <img src={mascotIcon} alt="Nimbli mascotte" />
                                        <div>
                                            <h3>Vandaag is een rustdag</h3>
                                            <p>Je kinesist heeft voor vandaag geen oefeningen gepland.</p>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>

                        <aside className="child-dashboard-side">
                            <section className="daily-widget">
                                <div className="widget-header">
                                    <div>
                                        <span>Extra uitdaging</span>
                                        <h3>Dagmissies</h3>
                                    </div>
                                    <button onClick={() => onNavigate('childMissions')}>Bekijk alles</button>
                                </div>

                                {missions.map((mission) => (
                                    <div className={`dashboard-mission ${mission.id}`} key={mission.title}>
                                        <span className={`dashboard-mission-icon ${mission.id}`}>
                                            <MissionIcon missionId={mission.id} />
                                        </span>
                                        <div>
                                            <strong>{mission.title}</strong>
                                            <small>{mission.detail}</small>
                                            <div className="mission-progress small">
                                                <div style={{ width: `${mission.progress}%` }} />
                                            </div>
                                        </div>
                                        <span className={`dashboard-mission-reward ${mission.completed ? 'completed' : ''}`}>
                                            <ChildIcon name="chest" />
                                        </span>
                                    </div>
                                ))}
                            </section>

                            <section className="child-motivation-card">
                                <img src={mascotIcon} alt="Nimbli mascotte" />
                                <div>
                                    <span>Tip van Nimbli</span>
                                    <h3>Rustig en correct bewegen</h3>
                                    <p>Neem je tijd. Een oefening goed doen is belangrijker dan snel klaar zijn.</p>
                                </div>
                            </section>
                        </aside>
                    </div>
                </section>
            </section>
        </main>
    )
}
