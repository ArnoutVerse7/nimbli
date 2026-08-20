import { useEffect, useState } from 'react'
import '../styles/ChildFlow.css'
import ChildSidebar from '../components/ChildSidebar'
import { supabase } from '../lib/supabase'
import { getChildProgress } from '../lib/childProgress'

import trophyIcon from '../assets/logos/trophy.png'
import starIcon from '../assets/logos/star.png'
import streakIcon from '../assets/logos/streak.png'
import checkIcon from '../assets/logos/check.png'
import lockIcon from '../assets/logos/lock.png'

export default function ChildMissionsPage({ onNavigate }) {
    const [assignedExercises, setAssignedExercises] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')

    useEffect(() => {
        async function loadMissions() {
            const patientId = localStorage.getItem('patientId')

            if (!patientId) {
                setLoadError('De gekoppelde patiënt kon niet gevonden worden.')
                setIsLoading(false)
                return
            }

            const { data, error } = await supabase
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
                .order('assigned_at', { ascending: true })

            if (error) {
                console.error(error)
                setLoadError('De missies konden niet geladen worden.')
            } else {
                setAssignedExercises(data || [])
            }

            setIsLoading(false)
        }

        loadMissions()
    }, [])

    const {
        completedExercises,
        totalXp,
        completionStreak,
        missions: missionProgress,
    } = getChildProgress(assignedExercises)
    const missionIcons = {
        exercise: checkIcon,
        xp: starIcon,
        day: trophyIcon,
    }
    const missions = missionProgress.map((mission) => ({
        ...mission,
        icon: missionIcons[mission.id],
    }))

    return (
        <main className="child-road-page">
            <section className="child-dashboard-shell">
                <ChildSidebar active="missions" onNavigate={onNavigate} />

                <section className="child-main-area">
                    <header className="child-road-header">
                        <h1>Dagelijkse missies</h1>

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

                    <div className="missions-content">
                        {isLoading && <p>Missies laden...</p>}
                        {loadError && <p className="form-error">{loadError}</p>}

                        {!isLoading && !loadError && missions.map((mission) => (
                            <div
                                className={`mission-card ${mission.completed ? 'completed' : ''}`}
                                key={mission.id}
                            >
                                <div className="mission-icon">
                                    <img src={mission.icon} alt="" />
                                </div>

                                <div className="mission-info">
                                    <strong>{mission.title}</strong>
                                    <small>{mission.detail}</small>
                                    <div className="mission-progress">
                                        <div style={{ width: `${mission.progress}%` }} />
                                    </div>
                                </div>

                                <div className={`mission-reward ${mission.completed ? 'completed' : ''}`}>
                                    <img
                                        src={mission.completed ? checkIcon : lockIcon}
                                        alt={mission.completed ? 'Voltooid' : 'Nog niet voltooid'}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </section>
        </main>
    )
}
