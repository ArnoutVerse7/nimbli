import { useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import '../styles/KinesistFlow.css'

export default function NewExercisePage({ onNavigate }) {
    const [form, setForm] = useState({
        title: '',
        category: '',
        level: '',
        duration: '',
        reps: '',
    })

    const [coverFile, setCoverFile] = useState(null)
    const [videoPreview, setVideoPreview] = useState(null)
    const [videoFile, setVideoFile] = useState(null)

    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const uploadFile = async (bucketName, folderName, file) => {
        if (!file) return null

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${folderName}/${fileName}`

        const { error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file)

        if (error) throw error

        const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath)

        return data.publicUrl
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
            const { data: existingExercise, error: existingError } = await supabase
                .from('exercises')
                .select('*')
                .ilike('title', form.title.trim())
                .maybeSingle()

            if (existingError) throw existingError

            if (existingExercise) {
                setErrorMessage('Deze oefening bestaat al.')
                setIsSaving(false)
                return
            }

            const uploadedCoverUrl = await uploadFile(
                'exercise-videos',
                'exercise-covers',
                coverFile
            )

            const uploadedVideoUrl = await uploadFile(
                'exercise-videos',
                'exercise-videos',
                videoFile
            )

            const { error } = await supabase
                .from('exercises')
                .insert([
                    {
                        title: form.title.trim(),
                        category: form.category || 'Mobiliteit',
                        level: form.level || 'Makkelijk',
                        duration: form.duration || '2 min',
                        reps: form.reps || '10 herhalingen',
                        cover_image: uploadedCoverUrl,
                        video_url: uploadedVideoUrl,
                    },
                ])

            if (error) throw error

            onNavigate('kinesistExercises')
        } catch (error) {
            console.error('SAVE ERROR:', error)
            setErrorMessage(error.message || 'Er ging iets mis bij het opslaan.')
        } finally {
            setIsSaving(false)
        }
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
                    <h1>Nieuwe oefening</h1>
                </header>

                <div className="kine-content">
                    <button className="patient-back-btn" onClick={() => onNavigate('kinesistExercises')}>
                        ← Terug naar oefeningen
                    </button>

                    <section className="new-patient-card">
                        <h2>Oefening toevoegen</h2>

                        <div className="form-grid">
                            <label>
                                Naam oefening
                                <input
                                    placeholder="Bijv. Heel Drop"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </label>

                            <label>
                                Categorie
                                <input
                                    placeholder="Bijv. Kracht"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                />
                            </label>

                            <label>
                                Niveau
                                <input
                                    placeholder="Bijv. Makkelijk"
                                    value={form.level}
                                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                                />
                            </label>

                            <label>
                                Duur
                                <input
                                    placeholder="Bijv. 2 min"
                                    value={form.duration}
                                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                />
                            </label>

                            <label>
                                Herhalingen
                                <input
                                    placeholder="Bijv. 10 herhalingen"
                                    value={form.reps}
                                    onChange={(e) => setForm({ ...form, reps: e.target.value })}
                                />
                            </label>

                            <label>
                                Cover image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (!file) return
                                        setCoverFile(file)
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
                                        if (!file) return

                                        setVideoFile(file)
                                        setVideoPreview(URL.createObjectURL(file))
                                    }}
                                />
                            </label>
                        </div>

                        <div className="exercise-preview-row">
                            {videoPreview && (
                                <div className="video-preview-wrapper">
                                    <video controls>
                                        <source src={videoPreview} />
                                    </video>

                                    <button
                                        type="button"
                                        className="delete-video-btn"
                                        onClick={() => {
                                            setVideoFile(null)
                                            setVideoPreview(null)
                                        }}
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
                            {isSaving ? 'Opslaan...' : 'Oefening opslaan'}
                        </button>
                    </section>
                </div>
            </section>
        </main>
    )
}