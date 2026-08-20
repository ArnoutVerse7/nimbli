import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import KinesistSidebar from '../components/KinesistSidebar'
import ConfirmDialog from '../components/ConfirmDialog'
import { getExerciseCover, removeExerciseMediaByUrl } from '../lib/exerciseMedia'
import '../styles/KinesistFlow.css'

export default function KinesistExerciseDetailPage({ exerciseId, onNavigate }) {
    const [exercise, setExercise] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [actionError, setActionError] = useState('')

    useEffect(() => {
        async function loadExercise() {
            const { data: userData } = await supabase.auth.getUser()
            const { data, error } = await supabase
                .from('exercises')
                .select('*')
                .eq('id', exerciseId)
                .single()

            setCurrentUserId(userData?.user?.id || null)

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

    const coverImage = getExerciseCover(exercise)
    const canManageExercise =
        !exercise.created_by || exercise.created_by === currentUserId

    const deleteExercise = async () => {
        setIsDeleting(true)
        setActionError('')

        const { error } = await supabase.rpc('delete_library_exercise', {
            p_exercise_id: exercise.id,
        })

        if (error) {
            console.error(error)
            setActionError(error.message || 'De oefening kon niet verwijderd worden.')
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
            return
        }

        await Promise.allSettled(
            [exercise.cover_image, exercise.video_url]
                .filter(Boolean)
                .map(removeExerciseMediaByUrl)
        )

        onNavigate('kinesistExercises')
    }

    return (
        <main className="kine-page">
            <KinesistSidebar active="exercises" onNavigate={onNavigate} />

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
                                    {coverImage && (
                                        <img
                                            src={coverImage}
                                            alt={exercise.title}
                                            className="exercise-video-cover"
                                        />
                                    )}
                                    <div className="video-placeholder-copy">
                                        <span className="video-play-icon">▶</span>
                                        <p>Nog geen video toegevoegd</p>
                                    </div>
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

                            {canManageExercise && (
                                <div className="exercise-detail-actions">
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() => onNavigate(`editExercise-${exercise.id}`)}
                                    >
                                        Oefening bewerken
                                    </button>
                                    <button
                                        type="button"
                                        className="danger-btn"
                                        onClick={() => {
                                            setActionError('')
                                            setIsDeleteDialogOpen(true)
                                        }}
                                    >
                                        Oefening verwijderen
                                    </button>
                                </div>
                            )}

                            {actionError && (
                                <p className="form-error-message">{actionError}</p>
                            )}
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

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                title="Oefening volledig verwijderen?"
                message={`“${exercise.title}” verdwijnt uit de bibliotheek én uit alle patiëntprogramma’s waarin deze oefening is toegewezen. Dit kun je niet ongedaan maken.`}
                confirmLabel="Volledig verwijderen"
                isConfirming={isDeleting}
                onConfirm={deleteExercise}
                onCancel={() => setIsDeleteDialogOpen(false)}
            />
        </main>
    )
}
