import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import KinesistSidebar from '../components/KinesistSidebar'
import {
    getExerciseCover,
    getExerciseCoverReference,
    noExerciseCoverReference,
    removeExerciseMediaByUrl,
    uploadExerciseMedia,
} from '../lib/exerciseMedia'
import {
    exerciseTrackingOptions,
    getExerciseTrackingType,
} from '../lib/poseExerciseEvaluator'
import '../styles/KinesistFlow.css'

const emptyForm = {
    title: '',
    description: '',
    category: '',
    level: '',
    duration: '',
    reps: '',
    trackingType: 'generic',
}

export default function NewExercisePage({ exerciseId, onNavigate }) {
    const isEditing = Boolean(exerciseId)
    const [form, setForm] = useState({
        ...emptyForm,
    })

    const [coverFile, setCoverFile] = useState(null)
    const [coverPreview, setCoverPreview] = useState(null)
    const [storedCoverUrl, setStoredCoverUrl] = useState(null)
    const [originalCoverUrl, setOriginalCoverUrl] = useState(null)
    const [videoPreview, setVideoPreview] = useState(null)
    const [videoFile, setVideoFile] = useState(null)
    const [storedVideoUrl, setStoredVideoUrl] = useState(null)
    const [originalVideoUrl, setOriginalVideoUrl] = useState(null)

    const [isLoading, setIsLoading] = useState(isEditing)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (!isEditing) return

        async function loadExercise() {
            const { data, error } = await supabase
                .from('exercises')
                .select('*')
                .eq('id', exerciseId)
                .single()

            if (error) {
                console.error(error)
                setErrorMessage('De oefening kon niet geladen worden.')
            } else {
                setForm({
                    title: data.title || '',
                    description: data.description || '',
                    category: data.category || '',
                    level: data.level || '',
                    duration: data.duration || '',
                    reps: data.reps || '',
                    trackingType: getExerciseTrackingType(data),
                })
                setStoredCoverUrl(getExerciseCoverReference(data))
                setOriginalCoverUrl(data.cover_image || null)
                setCoverPreview(getExerciseCover(data))
                setStoredVideoUrl(data.video_url || null)
                setOriginalVideoUrl(data.video_url || null)
                setVideoPreview(data.video_url || null)
            }

            setIsLoading(false)
        }

        loadExercise()
    }, [exerciseId, isEditing])

    useEffect(() => () => {
        if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
        if (videoPreview?.startsWith('blob:')) URL.revokeObjectURL(videoPreview)
    }, [coverPreview, videoPreview])

    const setField = (field, value) => {
        setForm((currentForm) => ({ ...currentForm, [field]: value }))
    }

    const setFilePreview = (file, setFile, setPreview) => {
        if (!file) return

        setFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const removeCover = () => {
        setCoverFile(null)
        setStoredCoverUrl(isEditing ? noExerciseCoverReference : null)
        setCoverPreview(null)
    }

    const removeVideo = () => {
        setVideoFile(null)
        setStoredVideoUrl(null)
        setVideoPreview(null)
    }

    const saveExercise = async () => {
        setIsSaving(true)
        setErrorMessage('')

        if (!form.title.trim()) {
            setErrorMessage('Geef de oefening eerst een naam.')
            setIsSaving(false)
            return
        }

        try {
            const { data: userData, error: userError } = await supabase.auth.getUser()

            if (userError || !userData.user) {
                throw new Error('Je moet ingelogd zijn als kinesist.')
            }

            let duplicateQuery = supabase
                .from('exercises')
                .select('id')
                .ilike('title', form.title.trim())

            if (isEditing) {
                duplicateQuery = duplicateQuery.neq('id', exerciseId)
            }

            const { data: existingExercise, error: existingError } = await duplicateQuery
                .limit(1)
                .maybeSingle()

            if (existingError) throw existingError

            if (existingExercise) {
                setErrorMessage('Deze oefening bestaat al.')
                setIsSaving(false)
                return
            }

            const uploadedCoverUrl = await uploadExerciseMedia(
                coverFile,
                'exercise-covers'
            )

            const uploadedVideoUrl = await uploadExerciseMedia(
                videoFile,
                'exercise-videos'
            )

            const nextCoverUrl = uploadedCoverUrl || storedCoverUrl
            const nextVideoUrl = uploadedVideoUrl || storedVideoUrl

            if (isEditing) {
                const { error } = await supabase.rpc('update_library_exercise', {
                    p_exercise_id: exerciseId,
                    p_title: form.title.trim(),
                    p_description: form.description.trim(),
                    p_category: form.category,
                    p_level: form.level,
                    p_duration: form.duration,
                    p_reps: form.reps,
                    p_tracking_type: form.trackingType,
                    p_cover_image: nextCoverUrl,
                    p_video_url: nextVideoUrl,
                })

                if (error) throw error

                const mediaToRemove = [
                    originalCoverUrl && originalCoverUrl !== nextCoverUrl
                        ? originalCoverUrl
                        : null,
                    originalVideoUrl && originalVideoUrl !== nextVideoUrl
                        ? originalVideoUrl
                        : null,
                ].filter(Boolean)

                await Promise.allSettled(mediaToRemove.map(removeExerciseMediaByUrl))
                onNavigate(`kinesistExerciseDetail-${exerciseId}`)
            } else {
                const { error } = await supabase
                    .from('exercises')
                    .insert([
                        {
                            title: form.title.trim(),
                            description: form.description.trim(),
                            category: form.category || 'Mobiliteit',
                            level: form.level || 'Makkelijk',
                            duration: form.duration || '2 min',
                            reps: form.reps || '10 herhalingen',
                            tracking_type: form.trackingType,
                            cover_image: nextCoverUrl,
                            video_url: nextVideoUrl,
                            created_by: userData.user.id,
                        },
                    ])

                if (error) throw error

                onNavigate('kinesistExercises')
            }
        } catch (error) {
            console.error('SAVE ERROR:', error)
            setErrorMessage(
                error.code === '23505'
                    ? 'Deze oefening bestaat al.'
                    : error.message || 'Er ging iets mis bij het opslaan.'
            )
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <p>Oefening laden...</p>
    }

    return (
        <main className="kine-page">
            <KinesistSidebar active="exercises" onNavigate={onNavigate} />

            <section className="kine-main">
                <header className="child-road-header">
                    <h1>{isEditing ? 'Oefening bewerken' : 'Nieuwe oefening'}</h1>
                </header>

                <div className="kine-content">
                    <button
                        className="patient-back-btn"
                        onClick={() => onNavigate(
                            isEditing
                                ? `kinesistExerciseDetail-${exerciseId}`
                                : 'kinesistExercises'
                        )}
                    >
                        ← {isEditing ? 'Terug naar oefening' : 'Terug naar oefeningen'}
                    </button>

                    <section className="new-patient-card">
                        <h2>{isEditing ? 'Oefening aanpassen' : 'Oefening toevoegen'}</h2>

                        <div className="form-grid exercise-form-grid">
                            <label>
                                Naam oefening
                                <input
                                    placeholder="Bijv. Heel Drop"
                                    value={form.title}
                                    onChange={(e) => setField('title', e.target.value)}
                                />
                            </label>

                            <label className="exercise-form-full">
                                Beschrijving
                                <textarea
                                    rows="4"
                                    placeholder="Leg kort uit wat het kind moet doen."
                                    value={form.description}
                                    onChange={(e) => setField('description', e.target.value)}
                                />
                            </label>

                            <label>
                                Categorie
                                <input
                                    placeholder="Bijv. Kracht"
                                    value={form.category}
                                    onChange={(e) => setField('category', e.target.value)}
                                />
                            </label>

                            <label>
                                Niveau
                                <input
                                    placeholder="Bijv. Makkelijk"
                                    value={form.level}
                                    onChange={(e) => setField('level', e.target.value)}
                                />
                            </label>

                            <label>
                                Duur
                                <input
                                    placeholder="Bijv. 2 min"
                                    value={form.duration}
                                    onChange={(e) => setField('duration', e.target.value)}
                                />
                            </label>

                            <label>
                                Herhalingen
                                <input
                                    placeholder="Bijv. 10 herhalingen"
                                    value={form.reps}
                                    onChange={(e) => setField('reps', e.target.value)}
                                />
                            </label>

                            <label className="exercise-form-full">
                                Bewegingscontrole
                                <select
                                    value={form.trackingType}
                                    onChange={(e) => setField('trackingType', e.target.value)}
                                >
                                    {exerciseTrackingOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <small>
                                    Kies welke houding en beweging de camera moet controleren.
                                </small>
                            </label>

                            <label>
                                Cover image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        setFilePreview(file, setCoverFile, setCoverPreview)
                                    }}
                                />
                            </label>

                            <label>
                                Instructievideo
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        setFilePreview(file, setVideoFile, setVideoPreview)
                                    }}
                                />
                            </label>
                        </div>

                        <div className="exercise-preview-row">
                            {coverPreview && (
                                <div className="cover-preview-wrapper exercise-media-preview">
                                    <img src={coverPreview} alt="Voorbeeld van de cover" />
                                    {(coverFile || storedCoverUrl) && (
                                        <button
                                            type="button"
                                            className="delete-video-btn"
                                            aria-label="Cover verwijderen"
                                            onClick={removeCover}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            )}

                            {videoPreview && (
                                <div className="video-preview-wrapper">
                                    <video controls>
                                        <source src={videoPreview} />
                                    </video>

                                    <button
                                        type="button"
                                        className="delete-video-btn"
                                        aria-label="Video verwijderen"
                                        onClick={removeVideo}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        {errorMessage && (
                            <p className="form-error-message">{errorMessage}</p>
                        )}

                        <button
                            className="primary-btn exercise-save-btn"
                            onClick={saveExercise}
                            disabled={isSaving}
                        >
                            {isSaving
                                ? 'Opslaan...'
                                : isEditing
                                    ? 'Wijzigingen opslaan'
                                    : 'Oefening opslaan'}
                        </button>
                    </section>
                </div>
            </section>
        </main>
    )
}
