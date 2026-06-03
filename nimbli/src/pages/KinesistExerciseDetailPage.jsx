import { useEffect, useState } from 'react'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import '../styles/KinesistFlow.css'

export default function KinesistExerciseDetailPage({ onNavigate }) {
    const [exercise, setExercise] = useState(null)

    useEffect(() => {
        const savedExercise = JSON.parse(localStorage.getItem('selectedExercise'))
        setExercise(savedExercise)
    }, [])

    const currentExercise = exercise || {
        title: 'Stretch naar de sterren',
        category: 'Mobiliteit',
        level: 'Makkelijk',
        duration: '2 min',
        reps: '10 herhalingen',
    }

    return (
        <main className="kine-page">
            <aside className="child-sidebar">
                <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                <button className="sidebar-link" onClick={() => onNavigate('kinesistDashboard')}>Dashboard</button>
                <button className="sidebar-link active" onClick={() => onNavigate('kinesistExercises')}>Oefeningen</button>
                <button className="sidebar-link" onClick={() => onNavigate('kinesistSettings')}>Instellingen</button>
                <button className="sidebar-link" onClick={() => onNavigate('login')}>
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

            <section className="kine-main">
                <header className="child-road-header">
                    <h1>Oefening details</h1>
                </header>

                <div className="kine-content">
                    <button
                        className="patient-back-btn"
                        onClick={() => onNavigate('kinesistExercises')}
                    >
                        ← Terug naar bibliotheek
                    </button>

                    <section className="exercise-detail-layout">
                        <div className="exercise-detail-video">
                            <div className="video-placeholder">
                                <button>▶</button>
                                <p>Instructievideo komt hier</p>
                            </div>
                        </div>

                        <aside className="exercise-detail-info">
                            <h2>{currentExercise.title}</h2>

                            <div className="exercise-card-badges">
                                <span>{currentExercise.level}</span>
                                <span>{currentExercise.category}</span>
                            </div>

                            <div className="exercise-info-list">
                                <div>
                                    <small>Duur</small>
                                    <strong>{currentExercise.duration}</strong>
                                </div>

                                <div>
                                    <small>Herhalingen</small>
                                    <strong>{currentExercise.reps}</strong>
                                </div>

                                <div>
                                    <small>Benodigdheden</small>
                                    <strong>Geen</strong>
                                </div>
                            </div>

                            <button
                                className="primary-btn"
                                onClick={() => onNavigate('assignExercise')}
                            >
                                Toewijzen aan patiënt
                            </button>
                        </aside>
                    </section>

                    <section className="patient-detail-card exercise-description-card">
                        <h3>Beschrijving</h3>
                        <p>
                            Deze oefening helpt kinderen om controle, balans en lichaamsbewustzijn op te bouwen.
                            De kinesist kan deze oefening toevoegen aan het persoonlijke oefenprogramma van een patiënt.
                        </p>

                        <h3>Stappen</h3>
                        <ol>
                            <li>Ga rechtop staan met voldoende ruimte rondom.</li>
                            <li>Voer de beweging rustig en gecontroleerd uit.</li>
                            <li>Herhaal de oefening volgens het ingestelde schema.</li>
                        </ol>
                    </section>
                </div>
            </section>
        </main>
    )
}