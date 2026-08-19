import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import checkIcon from '../assets/logos/check.png'
import profileIcon from '../assets/logos/profile.png'
import KinesistSidebar from '../components/KinesistSidebar'
import { getExerciseCover } from '../lib/exerciseMedia'
import '../styles/KinesistFlow.css'

function ProgressChart({ items }) {
    const width = 560
    const height = 190
    const paddingX = 34
    const paddingY = 24
    const usableWidth = width - paddingX * 2
    const usableHeight = height - paddingY * 2
    const points = items.map((item, index) => {
        const x = items.length === 1
            ? width / 2
            : paddingX + (index / (items.length - 1)) * usableWidth
        const y = paddingY + (1 - item.progress / 100) * usableHeight

        return { ...item, x, y }
    })

    return (
        <div className="progress-chart" aria-label="Voortgangsgrafiek">
            <svg viewBox={`0 0 ${width} ${height}`} role="img">
                {[0, 25, 50, 75, 100].map((value) => {
                    const y = paddingY + (1 - value / 100) * usableHeight
                    return <line key={value} x1={paddingX} x2={width - paddingX} y1={y} y2={y} />
                })}
                <polyline points={points.map(({ x, y }) => `${x},${y}`).join(' ')} />
                {points.map(({ category, progress, x, y }) => (
                    <g key={category}>
                        <circle cx={x} cy={y} r="5" />
                        <text x={x} y={height - 4} textAnchor="middle">
                            {category.slice(0, 10)}
                        </text>
                        <title>{category}: {progress}%</title>
                    </g>
                ))}
            </svg>
        </div>
    )
}

export default function KinesistPatientDetailPage({ onNavigate }) {
    const [patient] = useState(() => {
        const storedPatient = localStorage.getItem('selectedPatient')

        if (!storedPatient) return null

        try {
            return JSON.parse(storedPatient)
        } catch {
            return null
        }
    })
    const [assignedExercises, setAssignedExercises] = useState([])
    const [logEntries, setLogEntries] = useState([])
    const [activeTab, setActiveTab] = useState('overview')
    const [showLogForm, setShowLogForm] = useState(false)
    const [newLogTitle, setNewLogTitle] = useState('')
    const [newLogText, setNewLogText] = useState('')
    const [activationCode, setActivationCode] = useState('')
    const [activationError, setActivationError] = useState('')
    const [isGeneratingCode, setIsGeneratingCode] = useState(false)
    const [copyMessage, setCopyMessage] = useState('')

    const loadLogEntries = useCallback(async (patientId) => {
        const { data, error } = await supabase
            .from('logbook_entries')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error(error)
            return
        }

        setLogEntries(data || [])
    }, [])

    useEffect(() => {
        let ignore = false

        async function loadPatientData() {
            if (!patient?.id) return

            const [assignedResult, logResult] = await Promise.all([
                supabase
                    .from('patient_exercises')
                    .select(`
            id,
            completion_percentage,
            completed,
            accuracy_percentage,
            xp_earned,
            assigned_at,
            completed_at,
            exercises (
              id,
              title,
              category,
              level,
              duration,
              reps,
              cover_image,
              video_url
            )
          `)
                    .eq('patient_id', patient.id),
                supabase
                    .from('logbook_entries')
                    .select('*')
                    .eq('patient_id', patient.id)
                    .order('created_at', { ascending: false }),
            ])

            if (ignore) return

            if (assignedResult.error) {
                console.error(assignedResult.error)
            } else {
                setAssignedExercises(assignedResult.data || [])
            }

            if (logResult.error) {
                console.error(logResult.error)
            } else {
                setLogEntries(logResult.data || [])
            }
        }

        loadPatientData()

        return () => {
            ignore = true
        }
    }, [patient])

    const saveLogEntry = async () => {
        if (!newLogText.trim()) return

        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            alert('Je sessie is verlopen. Log opnieuw in.')
            return
        }

        const { error } = await supabase
            .from('logbook_entries')
            .insert([
                {
                    patient_id: patient.id,
                    author_id: userData.user.id,
                    title: newLogTitle || 'Nieuwe notitie',
                    content: newLogText,
                },
            ])

        if (error) {
            console.error(error)
            alert('Fout bij opslaan van notitie')
            return
        }

        setNewLogTitle('')
        setNewLogText('')
        setShowLogForm(false)
        loadLogEntries(patient.id)
    }

    const generateActivationCode = async () => {
        if (!patient?.id || patient.parent_id) return

        setIsGeneratingCode(true)
        setActivationError('')
        setCopyMessage('')

        const { data, error } = await supabase.rpc('regenerate_activation_code', {
            p_patient_id: patient.id,
        })

        setIsGeneratingCode(false)

        if (error) {
            console.error(error)
            setActivationError('De activatiecode kon niet worden aangemaakt. Probeer opnieuw.')
            return
        }

        if (!data) {
            setActivationError('Er werd geen activatiecode ontvangen.')
            return
        }

        setActivationCode(String(data).toUpperCase())
    }

    const copyActivationCode = async () => {
        try {
            await navigator.clipboard.writeText(activationCode)
            setCopyMessage('Code gekopieerd')
        } catch (error) {
            console.error(error)
            setCopyMessage('Kopiëren lukte niet. Selecteer de code handmatig.')
        }
    }

    const completedExercises = assignedExercises.filter((item) => item.completed)
    const measuredExercises = completedExercises.filter(
        (item) => Number.isFinite(item.accuracy_percentage)
    )
    const averageAccuracy = measuredExercises.length
        ? Math.round(
            measuredExercises.reduce(
                (total, item) => total + item.accuracy_percentage,
                0
            ) / measuredExercises.length
        )
        : 0
    const categoryProgress = Object.values(
        assignedExercises.reduce((categories, item) => {
            const category = item.exercises?.category || 'Overig'
            const current = categories[category] || { category, total: 0, count: 0 }

            current.total += item.completion_percentage || 0
            current.count += 1
            categories[category] = current

            return categories
        }, {})
    ).map((item) => ({
        category: item.category,
        progress: Math.round(item.total / item.count),
    }))
    const recentResults = [...completedExercises]
        .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0))
        .slice(0, 3)

    if (!patient) {
        return (
            <main className="kine-page">
                <section className="kine-main">
                    <div className="patient-detail-content">
                        <p className="empty-text">Geen patiënt geselecteerd.</p>
                        <button
                            className="primary-btn"
                            onClick={() => onNavigate('kinesistDashboard')}
                        >
                            Terug naar het dashboard
                        </button>
                    </div>
                </section>
            </main>
        )
    }

    return (
        <main className="kine-page">
            <KinesistSidebar active="dashboard" onNavigate={onNavigate} />

            <section className="kine-main">
                <header className="child-road-header">
                    <h1>Patiënt details</h1>
                </header>

                <div className="patient-detail-content">
                    <button
                        className="patient-back-btn"
                        onClick={() => onNavigate('kinesistDashboard')}
                    >
                        ← Terug naar overzicht
                    </button>

                    <section className="patient-detail-hero extended">
                        <div className="patient-photo-placeholder">
                            <img src={profileIcon} alt="" />
                        </div>

                        <div className="patient-main-info">
                            <div className="patient-title-row">
                                <h2>
                                    {patient.first_name} {patient.last_name}
                                </h2>
                                <span>{patient.age} jaar</span>
                            </div>

                            <p>
                                Startdatum:{' '}
                                {new Date(patient.created_at).toLocaleDateString('nl-BE')}
                            </p>
                            <strong>{patient.goal}</strong>
                        </div>

                        <button
                            className="primary-btn"
                            onClick={() => {
                                localStorage.setItem('selectedPatient', JSON.stringify(patient))
                                onNavigate('kinesistExercises')
                            }}
                        >
                            + Oefening toewijzen
                        </button>

                        <div className="patient-contact-info">
                            <div>
                                <strong>
                                    {patient.parent_id ? 'Ouder gekoppeld' : 'Nog geen ouder gekoppeld'}
                                </strong>
                                <span>Ouder/verzorger</span>
                            </div>

                            {!patient.parent_id && (
                                <div className="patient-activation-panel">
                                    <div>
                                        <strong>Activatiecode voor ouder</strong>
                                        <span>
                                            Maak een nieuwe code wanneer de oorspronkelijke code niet meer beschikbaar is.
                                        </span>
                                    </div>

                                    {activationCode && (
                                        <div className="patient-activation-code-row">
                                            <code>{activationCode}</code>
                                            <button
                                                type="button"
                                                className="secondary-btn"
                                                onClick={copyActivationCode}
                                            >
                                                Kopiëren
                                            </button>
                                        </div>
                                    )}

                                    {copyMessage && (
                                        <p className="activation-feedback" aria-live="polite">
                                            {copyMessage}
                                        </p>
                                    )}

                                    {activationError && (
                                        <p className="activation-feedback error" role="alert">
                                            {activationError}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        className="primary-btn activation-generate-btn"
                                        onClick={generateActivationCode}
                                        disabled={isGeneratingCode}
                                    >
                                        {isGeneratingCode
                                            ? 'Code maken...'
                                            : activationCode
                                                ? 'Andere code maken'
                                                : 'Nieuwe activatiecode maken'}
                                    </button>

                                    <small>
                                        De code blijft 7 dagen geldig. Een nieuwe code maakt de vorige ongeldig.
                                    </small>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="patient-detail-stats">
                        <div className="kine-stat-card">
                            <strong>{averageAccuracy}%</strong>
                            <span>Gemiddelde juistheid</span>
                        </div>

                        <div className="kine-stat-card">
                            <strong>{completedExercises.length}</strong>
                            <span>Sessies voltooid</span>
                        </div>

                        <div className="kine-stat-card">
                            <strong>{assignedExercises.length}</strong>
                            <span>Oefeningen toegewezen</span>
                        </div>
                    </section>

                    <nav className="patient-tabs">
                        <button
                            className={activeTab === 'overview' ? 'active' : ''}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overzicht
                        </button>

                        <button
                            className={activeTab === 'sessions' ? 'active' : ''}
                            onClick={() => setActiveTab('sessions')}
                        >
                            Sessies
                        </button>

                        <button
                            className={activeTab === 'exercises' ? 'active' : ''}
                            onClick={() => setActiveTab('exercises')}
                        >
                            Oefeningen
                        </button>

                        <button
                            className={activeTab === 'logbook' ? 'active' : ''}
                            onClick={() => setActiveTab('logbook')}
                        >
                            Logboek
                        </button>
                    </nav>

                    {activeTab === 'overview' && (
                        <section className="patient-detail-grid">
                            <div className="patient-detail-card">
                                <h3>Voortgang per categorie</h3>

                                {categoryProgress.length === 0 ? (
                                    <p className="empty-text">Nog geen voortgang beschikbaar.</p>
                                ) : (
                                    <>
                                        <ProgressChart items={categoryProgress} />
                                        <div className="category-progress-list">
                                            {categoryProgress.map((item) => (
                                                <div className="category-progress-item" key={item.category}>
                                                    <div>
                                                        <strong>{item.category}</strong>
                                                        <span>{item.progress}%</span>
                                                    </div>
                                                    <div className="category-progress-bar">
                                                        <div style={{ width: `${item.progress}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="patient-detail-card">
                                <h3>Laatste resultaten</h3>

                                {recentResults.length === 0 ? (
                                    <p className="empty-text">Nog geen resultaten beschikbaar.</p>
                                ) : (
                                    recentResults.map((item) => (
                                        <div className="detail-result-row" key={item.id}>
                                            <img src={checkIcon} alt="" />
                                            <span>{item.exercises?.title || 'Oefening'} voltooid</span>
                                            <strong>{item.accuracy_percentage || 0}%</strong>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'sessions' && (
                        <section className="patient-detail-card">
                            <h3>Sessie geschiedenis</h3>

                            {recentResults.length === 0 ? (
                                <p className="empty-text">Nog geen voltooide sessies.</p>
                            ) : (
                                <div className="session-history-list">
                                    {recentResults.map((item) => (
                                        <article className="session-history-card" key={item.id}>
                                            <div className="session-check">✓</div>

                                            <div className="session-history-content">
                                                <div className="session-history-top">
                                                    <strong>
                                                        {item.completed_at
                                                            ? new Date(item.completed_at).toLocaleDateString('nl-BE')
                                                            : 'Datum onbekend'}
                                                    </strong>
                                                    <span>{item.accuracy_percentage || 0}% juist</span>
                                                </div>

                                                <div className="session-tags">
                                                    <span>{item.exercises?.title || 'Oefening'}</span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'exercises' && (
                        <section className="patient-detail-card">
                            <h3>Toegewezen oefeningen</h3>

                            {assignedExercises.length === 0 ? (
                                <p className="empty-text">Nog geen oefeningen toegewezen.</p>
                            ) : (
                                <div className="exercise-program-list">
                                    {assignedExercises.map((item) => {
                                        const exercise = item.exercises
                                        const coverImage = getExerciseCover(exercise)

                                        return (
                                            <article className="exercise-program-card" key={item.id}>
                                                <div className="exercise-program-top">
                                                    <div className="exercise-thumb">
                                                        {coverImage && (
                                                            <img
                                                                src={coverImage}
                                                                alt={exercise?.title || 'Oefening'}
                                                                className="exercise-thumb-image"
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="exercise-program-content">
                                                        <div className="exercise-header">
                                                            <strong>{exercise?.title}</strong>
                                                            <button className="exercise-menu">⋮</button>
                                                        </div>

                                                        <div className="exercise-badges">
                                                            <span className="badge-difficulty">
                                                                {exercise?.level || 'Makkelijk'}
                                                            </span>
                                                            <span className="badge-category">
                                                                {exercise?.category}
                                                            </span>
                                                        </div>

                                                        <div className="exercise-details">
                                                            <div>
                                                                <small>Duur</small>
                                                                <p>{exercise?.duration || '2 min'}</p>
                                                            </div>

                                                            <div>
                                                                <small>Herhalingen</small>
                                                                <p>{exercise?.reps || '10 herhalingen'}</p>
                                                            </div>

                                                            <div>
                                                                <small>Frequentie</small>
                                                                <p>Dagelijks</p>
                                                            </div>
                                                        </div>

                                                        <div className="exercise-progress">
                                                            <div className="exercise-progress-bar">
                                                                <div style={{ width: `${item.completion_percentage || 0}%` }}></div>
                                                            </div>

                                                            <span>{item.completion_percentage || 0}%</span>
                                                        </div>

                                                        <small className="last-completed">
                                                            {item.completed ? 'Voltooid' : 'Nog niet voltooid'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'logbook' && (
                        <section className="patient-detail-card">
                            <div className="logbook-title-row">
                                <h3>Notities & observaties</h3>

                                <button
                                    className="secondary-btn"
                                    onClick={() => setShowLogForm(!showLogForm)}
                                >
                                    + Nieuwe notitie
                                </button>
                            </div>

                            {showLogForm && (
                                <div className="logbook-form">
                                    <input
                                        placeholder="Titel van notitie"
                                        value={newLogTitle}
                                        onChange={(e) => setNewLogTitle(e.target.value)}
                                    />

                                    <textarea
                                        placeholder="Schrijf hier je observatie..."
                                        value={newLogText}
                                        onChange={(e) => setNewLogText(e.target.value)}
                                    />

                                    <button className="primary-btn" onClick={saveLogEntry}>
                                        Notitie opslaan
                                    </button>
                                </div>
                            )}

                            <div className="logbook-list">
                                {logEntries.length === 0 ? (
                                    <p className="empty-text">Nog geen logboeknotities.</p>
                                ) : (
                                    logEntries.map((entry) => (
                                        <div className="logbook-entry" key={entry.id}>
                                            <div className="logbook-meta">
                                                <span>
                                                    {new Date(entry.created_at).toLocaleDateString('nl-BE')}
                                                </span>
                                            </div>

                                            <strong>{entry.title}</strong>
                                            <p>{entry.content}</p>

                                            <div className="logbook-author">
                                                Door kinesist
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </section>
        </main>
    )
}
