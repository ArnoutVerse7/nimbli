import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import '../styles/KinesistFlow.css'

export default function KinesistExerciseDetailPage({ exerciseId, onNavigate }) {
    const [exercise, setExercise] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadExercise() {
            const { data, error } = await supabase
                .from('exercises')
                .select('*')
                .eq('id', exerciseId)
                .single()

            if (error) {
                console.error(error)
                setExercise(null)
            } else {
                setExercise(data)
            }

            setLoading(false)
        }

        if (exerciseId) {
            loadExercise()
        }
    }, [exerciseId])

    if (loading) {
        return <p>Oefening laden...</p>
    }

    if (!exercise) {
        return <p>Oefening niet gevonden.</p>
    }

    return (
        <main className="kine-page">
            <aside className="child-sidebar">
                <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                <button className="sidebar-link" onClick={() => onNavigate('kinesistDashboard')}>
                    Dashboard
                </button>

                <button className="sidebar-link active" onClick={() => onNavigate('kinesistExercises')}>
                    Oefeningen
                </button>

                <button className="sidebar-link" onClick={() => onNavigate('kinesistSettings')}>
                    Instellingen
                </button>

                <button className="sidebar-link" onClick={() => onNavigate('kinesistLogin')}>
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
                            {exercise.video_url ? (
                                <video className="exercise-detail-video-player" controls>
                                    <source src={exercise.video_url} />
                                </video>
                            ) : (
                                <div className="video-placeholder">
                                    <button>▶</button>
                                    <p>Nog geen video toegevoegd</p>
                                </div>
                            )}
                        </div>

                        <aside className="exercise-detail-info">
                            <h2>{exercise.title}</h2>

                            <div className="exercise-card-badges">
                                <span>{exercise.level || 'Makkelijk'}</span>
                                <span>{exercise.category || 'Algemeen'}</span>
                            </div>

                            <div className="exercise-info-list">
                                <div>
                                    <small>Duur</small>
                                    <strong>{exercise.duration || '2 min'}</strong>
                                </div>

                                <div>
                                    <small>Herhalingen</small>
                                    <strong>{exercise.reps || '10 herhalingen'}</strong>
                                </div>

                                <div>
                                    <small>Benodigdheden</small>
                                    <strong>Geen</strong>
                                </div>
                            </div>

                            <button
                                className="primary-btn"
                                onClick={() => onNavigate(`assignExercise-${exercise.id}`)}
                            >
                                Toewijzen aan patiënt
                            </button>
                        </aside>
                    </section>

                    <section className="patient-detail-card exercise-description-card">
                        <h3>Beschrijving</h3>
                        <p>
                            {exercise.description ||
                                'Deze oefening helpt kinderen om controle, balans en lichaamsbewustzijn op te bouwen.'}
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