import { useState } from 'react'
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
        videoUrl: '',
    })

    const [videoPreview, setVideoPreview] = useState(null)

    const saveExercise = () => {
        const savedExercises =
            JSON.parse(localStorage.getItem('customExercises')) || []

        const newExercise = {
            id: Date.now(),
            title: form.title || 'Nieuwe oefening',
            category: form.category || 'Mobiliteit',
            level: form.level || 'Makkelijk',
            duration: form.duration || '2 min',
            reps: form.reps || '10 herhalingen',
            videoUrl: form.videoUrl || null,
            custom: true,
        }

        localStorage.setItem(
            'customExercises',
            JSON.stringify([...savedExercises, newExercise])
        )

        onNavigate('kinesistExercises')
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
                <button className="sidebar-link" onClick={() => onNavigate('login')}>
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

            <section className="kine-main">
                <header className="child-road-header">
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
                                    placeholder="Bijv. Knie heffen"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </label>

                            <label>
                                Categorie
                                <input
                                    placeholder="Bijv. Balans"
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
                                    placeholder="Bijv. 3 min"
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
                                Instructievideo

                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (!file) return

                                        const videoUrl = URL.createObjectURL(file)

                                        setVideoPreview(videoUrl)
                                        setForm({
                                            ...form,
                                            videoUrl
                                        })
                                    }}
                                />
                            </label>
                        </div>

                        {videoPreview && (
                            <div className="video-preview-wrapper">
                                <video controls>
                                    <source src={videoPreview} />
                                </video>

                                <button
                                    type="button"
                                    className="delete-video-btn"
                                    onClick={() => {
                                        setVideoPreview(null)
                                        setForm({ ...form, videoUrl: '' })
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <button className="primary-btn exercise-save-btn" onClick={saveExercise}>
                            Oefening opslaan
                        </button>
                    </section>
                </div>
            </section>
        </main>
    )
}