import { useState } from 'react'
import '../styles/ChildFlow.css'

import checkIcon from '../assets/logos/check.png'
import lockIcon from '../assets/logos/lock.png'
import moonIcon from '../assets/logos/moon.png'
import starIcon from '../assets/logos/star.png'
import streakIcon from '../assets/logos/streak.png'
import trophyIcon from '../assets/logos/trophy.png'
import profileIcon from '../assets/logos/profile.png'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'

const exercises = [
    { id: 1, label: 'MA', icon: checkIcon, status: 'done', title: 'Jumping Jacks' },
    { id: 2, label: 'DI', icon: checkIcon, status: 'done', title: 'Superheld Pose' },
    { id: 3, label: 'VANDAAG', icon: starIcon, status: 'active', title: 'Jumping Jacks' },
    { id: 4, label: 'DO', icon: moonIcon, status: 'open', title: 'Superheld Pose' },
    { id: 5, label: 'VR', icon: lockIcon, status: 'locked', title: 'Nieuwe oefening' },
    { id: 6, label: 'ZA', icon: lockIcon, status: 'locked', title: 'Bonus oefening' },
]

const missions = [
    { title: 'Complete 1 oefening', progress: '80%', icon: checkIcon },
    { title: 'Verdien 10 XP', progress: '60%', icon: starIcon },
    { title: 'Maak je dag compleet', progress: '35%', icon: trophyIcon },
]

export default function ChildDashboardPage({ onNavigate }) {
    const [selectedExercise, setSelectedExercise] = useState(null)

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
                        <h1>Dashboard</h1>

                        <div className="child-road-stats">
                            <span><img src={trophyIcon} alt="" /> 3</span>
                            <span><img src={starIcon} alt="" /> 12 XP</span>
                            <span><img src={streakIcon} alt="" /> 20 days</span>
                        </div>
                    </header>

                    <div className="child-dashboard-content">
                        <section className="child-route-panel">
                            <div className="week-strip">
                                {['ZO', 'MA', 'DI', 'WO', 'DO', 'VR', 'ZA'].map((day, index) => (
                                    <div className="week-day" key={day}>
                                        <span>{day}</span>
                                        <div className={`week-dot ${index === 0 ? 'missed' : index < 3 ? 'done' : ''}`}>
                                            {index === 0 ? '×' : index < 3 ? '✓' : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="child-road-map compact-map">
                                <div className="progress-line"></div>

                                {exercises.map((exercise, index) => (
                                    <button
                                        key={exercise.id}
                                        type="button"
                                        className={`road-node road-node-${index + 1} ${exercise.status} ${selectedExercise?.id === exercise.id ? 'selected' : ''
                                            }`}
                                        onClick={() => {
                                            if (exercise.status !== 'locked') {
                                                setSelectedExercise(exercise)
                                            }
                                        }}
                                    >
                                        <span className="road-node-circle">
                                            <img src={exercise.icon} alt="" />
                                        </span>
                                        <span className="road-node-label">{exercise.label}</span>
                                    </button>
                                ))}

                                {selectedExercise && (
                                    <div className="road-popup">
                                        <div className="road-popup-item">
                                            <div>
                                                <strong>{selectedExercise.title}</strong>
                                                <p>+10 XP · 5 min</p>
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