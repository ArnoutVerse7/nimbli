import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import KinesistSidebar from '../components/KinesistSidebar'
import '../styles/KinesistFlow.css'

export default function KinesistExercisesPage({ onNavigate }) {
    const [exercises, setExercises] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const filteredExercises = exercises.filter((exercise) =>
        `${exercise.title} ${exercise.category} ${exercise.level}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        async function loadExercises() {
            const { data, error } = await supabase
                .from('exercises')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error(error)
                return
            }

            setExercises(data || [])
        }

        loadExercises()
    }, [])

    return (
        <main className="kine-page">
            <KinesistSidebar active="exercises" onNavigate={onNavigate} />

            <section className="kine-main">
                <header className="child-road-header"></header>

                <div className="kine-content">
                    <section className="exercise-library-header">
                        <div>
                            <h2>Oefeningenbibliotheek</h2>
                            <p>Beheer en bekijk alle beschikbare oefeningen.</p>
                        </div>

                        <button
                            className="primary-btn"
                            onClick={() => onNavigate('newExercise')}
                        >
                            + Nieuwe oefening
                        </button>
                    </section>

                    <input
                        className="kine-search full"
                        type="text"
                        placeholder="Zoek oefeningen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="exercise-library-tabs">
                        <button className="active">Alle oefeningen</button>
                        <button>Mobiliteit</button>
                        <button>Balans</button>
                        <button>Kracht</button>
                        <button>Eigen video’s</button>
                    </div>

                    <section className="exercise-library-grid">
                        {filteredExercises.length === 0 ? (
                            <p className="empty-text">Nog geen oefeningen gevonden.</p>
                        ) : (
                            filteredExercises.map((exercise) => (
                                <button
                                    key={exercise.id}
                                    className="exercise-library-card"
                                    onClick={() => {
                                        onNavigate(`kinesistExerciseDetail-${exercise.id}`)
                                    }}
                                >
                                    <div className="exercise-thumb exercise-cover-thumb">
                                        {exercise.cover_image ? (
                                            <img src={exercise.cover_image} alt={exercise.title} />
                                        ) : (
                                            <span></span>
                                        )}
                                    </div>

                                    <div>
                                        <strong>{exercise.title}</strong>

                                        <div className="exercise-card-badges">
                                            <span>{exercise.level || 'Makkelijk'}</span>
                                            <span>{exercise.category || 'Algemeen'}</span>
                                        </div>

                                        <p>
                                            {exercise.duration || '2 min'} ·{' '}
                                            {exercise.reps || '10 herhalingen'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </section>
                </div>
            </section>
        </main>
    )
}
