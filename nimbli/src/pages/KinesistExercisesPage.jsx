import { useEffect, useState } from 'react'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import '../styles/KinesistFlow.css'

const exercises = [
    { id: 1, title: 'Stretch naar de sterren', category: 'Mobiliteit', level: 'Makkelijk', duration: '2 min', reps: '10 herhalingen' },
    { id: 2, title: 'Superheld Pose', category: 'Balans', level: 'Gemiddeld', duration: '2 min', reps: '30 seconden' },
    { id: 3, title: 'Jumping Jacks', category: 'Kracht', level: 'Makkelijk', duration: '2 min', reps: '10 herhalingen' },
    { id: 4, title: 'Balans oefening', category: 'Balans', level: 'Gemiddeld', duration: '3 min', reps: '5 herhalingen' },
]

export default function KinesistExercisesPage({ onNavigate }) {
    const [customExercises, setCustomExercises] = useState([])

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('customExercises')) || []
        setCustomExercises(saved)
    }, [])

    const allExercises = [...exercises, ...customExercises]

    return (
        <main className="kine-page">
            <aside className="child-sidebar">
                <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                <button className="sidebar-link" onClick={() => onNavigate('kinesistDashboard')}>
                    Dashboard
                </button>

                <button className="sidebar-link active">
                    Oefeningen
                </button>

                <button className="sidebar-link" onClick={() => onNavigate('kinesistSettings')}>
                    Instellingen
                </button>

                <button className="sidebar-link" onClick={() => onNavigate('login')}>
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

            <section className="kine-main">
                <header className="child-road-header">
                </header>

                <div className="kine-content">
                    <section className="exercise-library-header">
                        <div>
                            <h2>Oefeningenbibliotheek</h2>
                            <p>Beheer en bekijk alle beschikbare oefeningen.</p>
                        </div>

                        <button className="primary-btn" onClick={() => onNavigate('newExercise')}>
                            + Nieuwe oefening
                        </button>
                    </section>

                    <div className="kine-search full">Zoek oefeningen...</div>

                    <div className="exercise-library-tabs">
                        <button className="active">Alle oefeningen</button>
                        <button>Mobiliteit</button>
                        <button>Balans</button>
                        <button>Kracht</button>
                        <button>Eigen video’s</button>
                    </div>

                    <section className="exercise-library-grid">
                        {allExercises.map((exercise) => (
                            <button
                                key={exercise.id}
                                className="exercise-library-card"
                                onClick={() => {
                                    localStorage.setItem('selectedExercise', JSON.stringify(exercise))
                                    onNavigate('kinesistExerciseDetail')
                                }}
                            >
                                <div className="exercise-thumb video-thumb">
                                    <span>▶</span>
                                </div>

                                <div>
                                    <strong>{exercise.title}</strong>

                                    <div className="exercise-card-badges">
                                        <span>{exercise.level}</span>
                                        <span>{exercise.category}</span>
                                    </div>

                                    <p>{exercise.duration} · {exercise.reps}</p>
                                </div>
                            </button>
                        ))}
                    </section>
                </div>
            </section>
        </main>
    )
}