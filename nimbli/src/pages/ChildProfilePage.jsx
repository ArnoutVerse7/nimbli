import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getChildProgress } from '../lib/childProgress'
import '../styles/ChildFlow.css'
import ChildSidebar from '../components/ChildSidebar'
import ChildIcon, { MissionIcon } from '../components/ChildIcon'

import mascotte from '../assets/logos/mascotte.png'
import trophyIcon from '../assets/logos/trophy.png'
import starIcon from '../assets/logos/star.png'
import streakIcon from '../assets/logos/streak.png'

export default function ChildProfilePage({ onNavigate }) {
    const [patient, setPatient] = useState(null)
    const [assignedExercises, setAssignedExercises] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')

    useEffect(() => {
        async function loadProfile() {
            const patientId = localStorage.getItem('patientId')

            if (!patientId) {
                setLoadError('De gekoppelde patiënt kon niet gevonden worden.')
                setIsLoading(false)
                return
            }

            const [patientResult, exerciseResult] = await Promise.all([
                supabase
                    .from('patients')
                    .select('id, first_name, last_name, age, goal')
                    .eq('id', patientId)
                    .single(),
                supabase
                    .from('patient_exercises')
                    .select(`
                        id,
                        completed,
                        xp_earned,
                        completed_at,
                        start_date,
                        end_date
                    `)
                    .eq('patient_id', patientId)
                    .order('assigned_at', { ascending: true }),
            ])

            if (patientResult.error || exerciseResult.error) {
                console.error(patientResult.error || exerciseResult.error)
                setLoadError('Het profiel kon niet geladen worden.')
            } else {
                setPatient(patientResult.data)
                setAssignedExercises(exerciseResult.data || [])
            }

            setIsLoading(false)
        }

        loadProfile()
    }, [])

    const {
        completedExercises,
        totalXp,
        completionStreak,
        missions,
    } = getChildProgress(assignedExercises)
    return (
        <main className="child-road-page">
            <section className="child-dashboard-shell">
                <ChildSidebar active="profile" onNavigate={onNavigate} />

                <section className="child-main-area">
                    <header className="child-road-header">
                        <h1>Profiel</h1>

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

                    <div className="profile-content">
                        <section className="profile-main-card">
                            {loadError && <p className="form-error">{loadError}</p>}
                            <img src={mascotte} alt="Mascotte" className="profile-mascot" />
                            <h2>
                                {patient
                                    ? `${patient.first_name} ${patient.last_name}`
                                    : 'Profiel laden...'}
                            </h2>

                            {patient && (
                                <div className="profile-patient-details">
                                    <span>{patient.age} jaar</span>
                                    <span>{patient.goal}</span>
                                </div>
                            )}

                            <div className="profile-stats-grid">
                                <div><strong>{completionStreak}</strong><span>dagen op rij</span></div>
                                <div><strong>{totalXp}</strong><span>XP verzameld</span></div>
                                <div><strong>{completedExercises.length}</strong><span>oefeningen voltooid</span></div>
                            </div>
                        </section>

                        <section className="profile-side-card">
                            <h3>Dagmissies</h3>

                            {isLoading && <p>Missies laden...</p>}

                            {!isLoading && !loadError && missions.map((mission) => (
                                <div
                                    className={`mini-mission ${mission.id} ${mission.completed ? 'completed' : ''}`}
                                    key={mission.id}
                                >
                                    <span className={`mini-mission-icon ${mission.id}`}>
                                        <MissionIcon missionId={mission.id} />
                                    </span>
                                    <div>
                                        <strong>{mission.title}</strong>
                                        <small>{mission.detail}</small>
                                        <div className="mission-progress small">
                                            <div style={{ width: `${mission.progress}%` }} />
                                        </div>
                                    </div>
                                    <span className={`mini-mission-reward ${mission.completed ? 'completed' : ''}`}>
                                        <ChildIcon name="chest" />
                                    </span>
                                </div>
                            ))}

                            <button className="large-cta-button" onClick={() => onNavigate('childDashboard')}>
                                Terug naar oefeningen
                            </button>
                        </section>
                    </div>
                </section>
            </section>
        </main>
    )
}
