import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import checkIcon from '../assets/logos/check.png'
import profileIcon from '../assets/logos/profile.png'
import ConfirmDialog from '../components/ConfirmDialog'
import ExerciseScheduleFields from '../components/ExerciseScheduleFields'
import KinesistSidebar from '../components/KinesistSidebar'
import { getExerciseCover } from '../lib/exerciseMedia'
import {
    formatExerciseScheduleRange,
    getAssignmentSchedule,
    isValidExerciseSchedule,
} from '../lib/exerciseSchedule'
import '../styles/KinesistFlow.css'

const getAccuracy = (item) => {
    if (item.accuracy_percentage === null || item.accuracy_percentage === undefined) {
        return null
    }

    const accuracy = Number(item.accuracy_percentage)
    return Number.isFinite(accuracy) ? accuracy : null
}

function ProgressChart({ sessions }) {
    const width = 640
    const height = 230
    const padding = { top: 18, right: 18, bottom: 42, left: 46 }
    const usableWidth = width - padding.left - padding.right
    const usableHeight = height - padding.top - padding.bottom
    const dailyResults = Object.values(
        sessions.reduce((days, item) => {
            const accuracy = getAccuracy(item)

            if (accuracy === null || !item.completed_at) return days

            const completedDate = new Date(item.completed_at)
            if (Number.isNaN(completedDate.getTime())) return days

            const dateKey = completedDate.toLocaleDateString('nl-BE')
            const current = days[dateKey] || {
                dateKey,
                dateLabel: completedDate.toLocaleDateString('nl-BE', {
                    day: 'numeric',
                    month: 'short',
                }),
                timestamp: completedDate.getTime(),
                totalAccuracy: 0,
                sessionCount: 0,
            }

            current.totalAccuracy += accuracy
            current.sessionCount += 1
            current.timestamp = Math.min(current.timestamp, completedDate.getTime())
            days[dateKey] = current
            return days
        }, {})
    )
        .sort((first, second) => first.timestamp - second.timestamp)
        .map((day) => ({
            ...day,
            accuracy: Math.round(day.totalAccuracy / day.sessionCount),
        }))
    const points = dailyResults.map((day, index) => ({
        ...day,
        x: dailyResults.length === 1
            ? padding.left + usableWidth / 2
            : padding.left + (index / (dailyResults.length - 1)) * usableWidth,
        y: padding.top + (1 - day.accuracy / 100) * usableHeight,
    }))

    return (
        <div className="progress-chart" aria-label="Gemiddelde juistheid per dag">
            <svg viewBox={`0 0 ${width} ${height}`} role="img">
                {[0, 25, 50, 75, 100].map((value) => {
                    const y = padding.top + (1 - value / 100) * usableHeight
                    return (
                        <g key={value} className="progress-grid-line">
                            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
                            <text x={padding.left - 9} y={y + 4} textAnchor="end">{value}%</text>
                        </g>
                    )
                })}

                <g className="progress-series daily-accuracy-series">
                    {points.length > 1 && (
                        <polyline
                            points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
                        />
                    )}
                    {points.map((point) => (
                        <g key={point.dateKey}>
                            <circle cx={point.x} cy={point.y} r="5">
                                <title>
                                    {point.dateKey}: {point.accuracy}% gemiddeld uit{' '}
                                    {point.sessionCount} oefening{point.sessionCount === 1 ? '' : 'en'}
                                </title>
                            </circle>
                            <text
                                className="progress-value-label"
                                x={point.x}
                                y={point.y - 11}
                                textAnchor="middle"
                            >
                                {point.accuracy}%
                            </text>
                            <text
                                className="progress-session-label"
                                x={point.x}
                                y={height - 12}
                                textAnchor="middle"
                            >
                                {point.dateLabel}
                            </text>
                        </g>
                    ))}
                </g>
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
    const [assignedExercisesError, setAssignedExercisesError] = useState('')
    const [logEntries, setLogEntries] = useState([])
    const [activeTab, setActiveTab] = useState('overview')
    const [showLogForm, setShowLogForm] = useState(false)
    const [newLogTitle, setNewLogTitle] = useState('')
    const [newLogText, setNewLogText] = useState('')
    const [deletingLogId, setDeletingLogId] = useState(null)
    const [logEntryToDelete, setLogEntryToDelete] = useState(null)
    const [logbookError, setLogbookError] = useState('')
    const [openExerciseMenuId, setOpenExerciseMenuId] = useState(null)
    const [editingAssignment, setEditingAssignment] = useState(null)
    const [assignmentToDelete, setAssignmentToDelete] = useState(null)
    const [scheduleDraft, setScheduleDraft] = useState(null)
    const [isSavingAssignment, setIsSavingAssignment] = useState(false)
    const [deletingAssignmentId, setDeletingAssignmentId] = useState(null)
    const [assignmentActionError, setAssignmentActionError] = useState('')
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

            setAssignedExercisesError('')

            const [assignedResult, logResult] = await Promise.all([
                supabase
                    .from('patient_exercises')
                    .select(`
                        id,
                        patient_id,
                        exercise_id,
                        completion_percentage,
                        completed,
                        accuracy_percentage,
                        xp_earned,
                        completed_at,
                        assigned_at,
                        start_date,
                        end_date
                    `)
                    .eq('patient_id', patient.id),
                supabase
                    .from('logbook_entries')
                    .select('*')
                    .eq('patient_id', patient.id)
                    .order('created_at', { ascending: false }),
            ])

            if (assignedResult.error) {
                console.error(assignedResult.error)
                if (!ignore) {
                    setAssignedExercises([])
                    setAssignedExercisesError('De toegewezen oefeningen konden niet geladen worden.')
                }
            } else {
                const assignments = assignedResult.data || []
                const exerciseIds = [...new Set(assignments.map((item) => item.exercise_id))]
                let exercisesById = new Map()

                if (exerciseIds.length > 0) {
                    const { data: exercisesData, error: exercisesError } = await supabase
                        .from('exercises')
                        .select('*')
                        .in('id', exerciseIds)

                    if (exercisesError) {
                        console.error(exercisesError)
                        if (!ignore) {
                            setAssignedExercisesError('De gegevens van de oefeningen konden niet geladen worden.')
                        }
                    } else {
                        exercisesById = new Map(
                            (exercisesData || []).map((exercise) => [exercise.id, exercise])
                        )
                    }
                }

                if (!ignore) {
                    setAssignedExercises(
                        assignments.map((assignment) => ({
                            ...assignment,
                            exercises: exercisesById.get(assignment.exercise_id) || null,
                        }))
                    )
                }
            }

            if (ignore) return

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

    useEffect(() => {
        if (!editingAssignment) return undefined

        const closeEditorOnEscape = (event) => {
            if (event.key === 'Escape' && !isSavingAssignment) {
                setEditingAssignment(null)
                setScheduleDraft(null)
                setAssignmentActionError('')
            }
        }

        window.addEventListener('keydown', closeEditorOnEscape)
        return () => window.removeEventListener('keydown', closeEditorOnEscape)
    }, [editingAssignment, isSavingAssignment])

    const saveLogEntry = async () => {
        if (!newLogText.trim()) return

        setLogbookError('')

        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            setLogbookError('Je sessie is verlopen. Log opnieuw in.')
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
            setLogbookError('De notitie kon niet worden opgeslagen. Probeer opnieuw.')
            return
        }

        setNewLogTitle('')
        setNewLogText('')
        setShowLogForm(false)
        loadLogEntries(patient.id)
    }

    const deleteLogEntry = async (entryId) => {
        if (!patient?.id) return

        setDeletingLogId(entryId)
        setLogbookError('')

        const { error } = await supabase
            .from('logbook_entries')
            .delete()
            .eq('id', entryId)
            .eq('patient_id', patient.id)

        setDeletingLogId(null)

        if (error) {
            console.error(error)
            setLogbookError('De notitie kon niet worden verwijderd. Probeer opnieuw.')
            setLogEntryToDelete(null)
            return
        }

        setLogEntries((currentEntries) =>
            currentEntries.filter((entry) => entry.id !== entryId)
        )
        setLogEntryToDelete(null)
    }

    const openScheduleEditor = (assignment) => {
        setEditingAssignment(assignment)
        setScheduleDraft(getAssignmentSchedule(assignment))
        setOpenExerciseMenuId(null)
        setAssignmentActionError('')
    }

    const saveAssignmentSchedule = async () => {
        if (!editingAssignment || !isValidExerciseSchedule(scheduleDraft)) {
            setAssignmentActionError('Kies een geldige einddatum die op of na de startdatum ligt.')
            return
        }

        setIsSavingAssignment(true)
        setAssignmentActionError('')

        const { error } = await supabase.rpc('update_exercise_schedule', {
            p_assignment_id: editingAssignment.id,
            p_start_date: scheduleDraft.startDate,
            p_end_date: scheduleDraft.endDate,
        })

        setIsSavingAssignment(false)

        if (error) {
            console.error(error)
            setAssignmentActionError('De planning kon niet worden opgeslagen. Voer migratie 003 opnieuw uit en probeer opnieuw.')
            return
        }

        setAssignedExercises((currentExercises) =>
            currentExercises.map((item) => item.id === editingAssignment.id
                ? {
                    ...item,
                    start_date: scheduleDraft.startDate,
                    end_date: scheduleDraft.endDate,
                }
                : item)
        )
        setEditingAssignment(null)
        setScheduleDraft(null)
    }

    const deleteAssignedExercise = async (assignmentId) => {
        if (!patient?.id) return

        setDeletingAssignmentId(assignmentId)
        setAssignmentActionError('')

        const { error } = await supabase
            .from('patient_exercises')
            .delete()
            .eq('id', assignmentId)
            .eq('patient_id', patient.id)

        setDeletingAssignmentId(null)

        if (error) {
            console.error(error)
            setAssignmentActionError('De oefening kon niet uit het programma verwijderd worden.')
            setAssignmentToDelete(null)
            return
        }

        setAssignedExercises((currentExercises) =>
            currentExercises.filter((item) => item.id !== assignmentId)
        )
        setAssignmentToDelete(null)
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
        (item) => getAccuracy(item) !== null
    )
    const averageAccuracy = measuredExercises.length
        ? Math.round(
            measuredExercises.reduce(
                (total, item) => total + getAccuracy(item),
                0
            ) / measuredExercises.length
        )
        : 0
    const categoryProgress = Object.values(
        measuredExercises.reduce((categories, item) => {
            const category = item.exercises?.category || 'Overig'
            const current = categories[category] || { category, total: 0, count: 0 }

            current.total += getAccuracy(item)
            current.count += 1
            categories[category] = current

            return categories
        }, {})
    ).map((item) => ({
        category: item.category,
        progress: Math.round(item.total / item.count),
    }))
    const sessionResults = [...completedExercises]
        .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0))
    const recentResults = sessionResults.slice(0, 3)

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
                            <strong>
                                {measuredExercises.length ? `${averageAccuracy}%` : '—'}
                            </strong>
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
                                <h3>Juistheid per dag</h3>

                                {categoryProgress.length === 0 ? (
                                    <p className="empty-text">Nog geen voortgang beschikbaar.</p>
                                ) : (
                                    <>
                                        <ProgressChart sessions={sessionResults} />
                                        <h4 className="category-progress-title">
                                            Gemiddelde juistheid per categorie
                                        </h4>
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
                                            <strong>
                                                {getAccuracy(item) === null
                                                    ? 'Geen meting'
                                                    : `${getAccuracy(item)}%`}
                                            </strong>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'sessions' && (
                        <section className="patient-detail-card">
                            <h3>Sessie geschiedenis</h3>

                            {sessionResults.length === 0 ? (
                                <p className="empty-text">Nog geen voltooide sessies.</p>
                            ) : (
                                <div className="session-history-list">
                                    {sessionResults.map((item) => (
                                        <article className="session-history-card" key={item.id}>
                                            <div className="session-check">✓</div>

                                            <div className="session-history-content">
                                                <div className="session-history-top">
                                                    <strong>
                                                        {item.completed_at
                                                            ? new Date(item.completed_at).toLocaleDateString('nl-BE')
                                                            : 'Datum onbekend'}
                                                    </strong>
                                                    <span>
                                                        {getAccuracy(item) === null
                                                            ? 'Geen juistheidsmeting'
                                                            : `${getAccuracy(item)}% juist`}
                                                    </span>
                                                </div>

                                                <div className="session-tags">
                                                    <span>{item.exercises?.title || 'Oefening'}</span>
                                                    <span>+{item.xp_earned || 0} XP</span>
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

                            {assignmentActionError && (
                                <p className="form-error-message" role="alert">
                                    {assignmentActionError}
                                </p>
                            )}

                            {assignedExercisesError ? (
                                <p className="form-error-message" role="alert">
                                    {assignedExercisesError}
                                </p>
                            ) : assignedExercises.length === 0 ? (
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
                                                            <div className="exercise-actions">
                                                                <button
                                                                    type="button"
                                                                    className="exercise-menu"
                                                                    aria-label={`Acties voor ${exercise?.title || 'oefening'}`}
                                                                    aria-expanded={openExerciseMenuId === item.id}
                                                                    onClick={() => setOpenExerciseMenuId((currentId) =>
                                                                        currentId === item.id ? null : item.id
                                                                    )}
                                                                >
                                                                    ⋮
                                                                </button>

                                                                {openExerciseMenuId === item.id && (
                                                                    <div className="exercise-action-menu">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openScheduleEditor(item)}
                                                                        >
                                                                            Planning aanpassen
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="danger"
                                                                            onClick={() => {
                                                                                setAssignmentToDelete(item)
                                                                                setOpenExerciseMenuId(null)
                                                                            }}
                                                                        >
                                                                            Uit programma verwijderen
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
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

                                                            <div>
                                                                <small>Planning</small>
                                                                <p>{formatExerciseScheduleRange(item)}</p>
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
                                {logbookError && (
                                    <p className="form-error-message" role="alert">
                                        {logbookError}
                                    </p>
                                )}

                                {logEntries.length === 0 ? (
                                    <p className="empty-text">Nog geen logboeknotities.</p>
                                ) : (
                                    logEntries.map((entry) => (
                                        <div className="logbook-entry" key={entry.id}>
                                            <div className="logbook-meta">
                                                <span>
                                                    {new Date(entry.created_at).toLocaleDateString('nl-BE')}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="logbook-delete-btn"
                                                    onClick={() => setLogEntryToDelete(entry)}
                                                    disabled={deletingLogId === entry.id}
                                                >
                                                    {deletingLogId === entry.id ? 'Verwijderen...' : 'Verwijderen'}
                                                </button>
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

            {editingAssignment && scheduleDraft && (
                <div
                    className="nimbli-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isSavingAssignment) {
                            setEditingAssignment(null)
                            setScheduleDraft(null)
                        }
                    }}
                >
                    <section
                        className="nimbli-modal-card schedule-edit-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="schedule-edit-title"
                    >
                        <h2 id="schedule-edit-title">Planning aanpassen</h2>
                        <p>
                            Kies de periode voor {editingAssignment.exercises?.title || 'deze oefening'}.
                        </p>

                        <ExerciseScheduleFields
                            schedule={scheduleDraft}
                            onChange={(nextSchedule) => {
                                setScheduleDraft(nextSchedule)
                                setAssignmentActionError('')
                            }}
                            helpText="De wijziging wordt ook zichtbaar voor de ouder en het kind."
                        />

                        {assignmentActionError && (
                            <p className="form-error-message" role="alert">
                                {assignmentActionError}
                            </p>
                        )}

                        <div className="nimbli-modal-actions">
                            <button
                                type="button"
                                className="secondary-btn"
                                disabled={isSavingAssignment}
                                onClick={() => {
                                    setEditingAssignment(null)
                                    setScheduleDraft(null)
                                    setAssignmentActionError('')
                                }}
                            >
                                Annuleren
                            </button>
                            <button
                                type="button"
                                className="primary-btn"
                                disabled={isSavingAssignment}
                                onClick={saveAssignmentSchedule}
                            >
                                {isSavingAssignment ? 'Opslaan...' : 'Planning opslaan'}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            <ConfirmDialog
                isOpen={Boolean(logEntryToDelete)}
                title="Notitie verwijderen?"
                message={`De notitie “${logEntryToDelete?.title || 'Zonder titel'}” wordt definitief verwijderd.`}
                isConfirming={Boolean(deletingLogId)}
                onCancel={() => setLogEntryToDelete(null)}
                onConfirm={() => deleteLogEntry(logEntryToDelete.id)}
            />

            <ConfirmDialog
                isOpen={Boolean(assignmentToDelete)}
                title="Oefening verwijderen?"
                message={`${assignmentToDelete?.exercises?.title || 'Deze oefening'} verdwijnt uit het programma van deze patiënt en is daarna ook niet meer zichtbaar voor ouder en kind.`}
                confirmLabel="Uit programma verwijderen"
                isConfirming={Boolean(deletingAssignmentId)}
                onCancel={() => setAssignmentToDelete(null)}
                onConfirm={() => deleteAssignedExercise(assignmentToDelete.id)}
            />
        </main>
    )
}
