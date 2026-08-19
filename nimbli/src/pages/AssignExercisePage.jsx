import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import checkIcon from '../assets/logos/check.png'
import profileIcon from '../assets/logos/profile.png'
import KinesistSidebar from '../components/KinesistSidebar'
import { getExerciseCover } from '../lib/exerciseMedia'
import '../styles/KinesistFlow.css'

const formatDateValue = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const getScheduleDates = (durationWeeks) => {
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + (Number(durationWeeks) * 7) - 1)

    return {
        startDate: formatDateValue(startDate),
        endDate: formatDateValue(endDate),
    }
}

export default function AssignExercisePage({ exerciseId, onNavigate }) {
    const [exercise, setExercise] = useState(null)
    const [patients, setPatients] = useState([])
    const [selectedPatientId, setSelectedPatientId] = useState(null)
    const [assigned, setAssigned] = useState(false)
    const [alreadyAssigned, setAlreadyAssigned] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState('')
    const [durationWeeks, setDurationWeeks] = useState('2')

    useEffect(() => {
        async function loadData() {
            const { data: exerciseData, error: exerciseError } = await supabase
                .from('exercises')
                .select('*')
                .eq('id', exerciseId)
                .single()

            if (exerciseError) {
                console.error(exerciseError)
            } else {
                setExercise(exerciseData)
            }

            const { data: patientsData, error: patientsError } = await supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false })

            if (patientsError) {
                console.error(patientsError)
            } else {
                const availablePatients = patientsData || []
                setPatients(availablePatients)

                if (availablePatients.length > 0) {
                    let preferredPatientId = null

                    try {
                        const storedPatient = JSON.parse(
                            localStorage.getItem('selectedPatient') || 'null'
                        )

                        if (availablePatients.some((patient) => patient.id === storedPatient?.id)) {
                            preferredPatientId = storedPatient.id
                        }
                    } catch {
                        localStorage.removeItem('selectedPatient')
                    }

                    setSelectedPatientId(preferredPatientId || availablePatients[0].id)
                }
            }

            setLoading(false)
        }

        if (exerciseId) {
            loadData()
        }
    }, [exerciseId])

    const assignExercise = async () => {
        if (!selectedPatientId || !exercise?.id) return

        setIsSaving(true)
        setSaveError('')
        setAlreadyAssigned(false)

        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            alert('Je sessie is verlopen. Log opnieuw in.')
            setIsSaving(false)
            return
        }

        const { data: existingAssignment, error: existingError } = await supabase
            .from('patient_exercises')
            .select('id')
            .eq('patient_id', selectedPatientId)
            .eq('exercise_id', exercise.id)
            .maybeSingle()

        if (existingError) {
            console.error(existingError)
            setSaveError('De bestaande oefeningen konden niet gecontroleerd worden. Probeer opnieuw.')
            setIsSaving(false)
            return
        }

        if (existingAssignment) {
            setAlreadyAssigned(true)
            setAssigned(true)
            setIsSaving(false)
            return
        }

        const selectedPatient = patients.find((patient) => patient.id === selectedPatientId)
        const { startDate, endDate } = getScheduleDates(durationWeeks)

        if (selectedPatient) {
            localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient))
        }

        const { data: savedAssignment, error } = await supabase
            .from('patient_exercises')
            .insert([
                {
                    patient_id: selectedPatientId,
                    exercise_id: exercise.id,
                    assigned_by: userData.user.id,
                    completed: false,
                    completion_percentage: 0,
                    start_date: startDate,
                    end_date: endDate,
                },
            ])
            .select('id, patient_id, exercise_id')
            .single()

        if (error || !savedAssignment) {
            console.error(error)
            const scheduleMigrationMissing = error?.message?.includes('start_date')
                || error?.message?.includes('end_date')

            setSaveError(scheduleMigrationMissing
                ? 'De planningsvelden ontbreken nog in Supabase. Voer migratie 002_assignment_schedule.sql uit.'
                : 'De oefening kon niet worden opgeslagen. Probeer opnieuw.')
            setIsSaving(false)
            return
        }

        setAssigned(true)
        setIsSaving(false)
    }

    const selectedPatient = patients.find((patient) => patient.id === selectedPatientId)
    const coverImage = getExerciseCover(exercise)

    if (loading) {
        return <p>Gegevens laden...</p>
    }

    if (!exercise) {
        return <p>Oefening niet gevonden.</p>
    }

    return (
        <main className="kine-page">
            <KinesistSidebar active="exercises" onNavigate={onNavigate} />

            <section className="kine-main">
                <header className="child-road-header">
                    <h1>Oefening toewijzen</h1>
                </header>

                <div className="kine-content">
                    {!assigned ? (
                        <section className="assign-layout">
                            <div className="patient-detail-card">
                                <h3>Oefening</h3>

                                <div className="selected-exercise">
                                    <div className="exercise-thumb">
                                        {coverImage && (
                                            <img
                                                src={coverImage}
                                                alt={exercise.title}
                                                className="exercise-thumb-image"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <strong>{exercise.title}</strong>
                                        <p>
                                            {exercise.category || 'Algemeen'} · {exercise.duration || '2 min'} ·{' '}
                                            {exercise.reps || '10 herhalingen'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="patient-detail-card">
                                <h3>Kies patiënt</h3>

                                {patients.length === 0 ? (
                                    <p className="empty-text">
                                        Er zijn nog geen patiënten. Voeg eerst een patiënt toe.
                                    </p>
                                ) : (
                                    <div className="assign-patient-list">
                                        {patients.map((patient) => (
                                            <button
                                                type="button"
                                                key={patient.id}
                                                className={`assign-patient-card ${selectedPatientId === patient.id ? 'selected' : ''
                                                    }`}
                                                onClick={() => {
                                                    setSelectedPatientId(patient.id)
                                                    setSaveError('')
                                                    localStorage.setItem('selectedPatient', JSON.stringify(patient))
                                                }}
                                            >
                                                <div className="patient-list-avatar">
                                                    <img
                                                        src={profileIcon}
                                                        alt=""
                                                        className="patient-list-profile-img"
                                                    />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {patient.first_name} {patient.last_name}
                                                    </strong>
                                                    <span>
                                                        {patient.age} jaar · {patient.goal}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <label className="assign-duration-field">
                                    <span>Hoe lang moet het kind deze oefening doen?</span>
                                    <select
                                        value={durationWeeks}
                                        onChange={(event) => setDurationWeeks(event.target.value)}
                                    >
                                        <option value="1">1 week</option>
                                        <option value="2">2 weken</option>
                                        <option value="4">4 weken</option>
                                        <option value="6">6 weken</option>
                                    </select>
                                    <small>
                                        De oefening verschijnt iedere dag in de ouderplanning tijdens deze periode.
                                    </small>
                                </label>

                                <button
                                    type="button"
                                    className="primary-btn assign-btn"
                                    disabled={!selectedPatientId || isSaving}
                                    onClick={assignExercise}
                                >
                                    {isSaving ? 'Toewijzen...' : 'Oefening toewijzen'}
                                </button>

                                {saveError && (
                                    <p className="form-error-message" role="alert">{saveError}</p>
                                )}
                            </div>
                        </section>
                    ) : (
                        <section className="assign-success-card">
                            <img src={checkIcon} alt="" />
                            <h2>Oefening toegewezen!</h2>

                            <p>
                                {exercise.title}{' '}
                                {alreadyAssigned ? 'stond al in het oefenprogramma' : 'werd toegevoegd aan het oefenprogramma'}
                                {selectedPatient
                                    ? ` van ${selectedPatient.first_name} ${selectedPatient.last_name}`
                                    : ''}
                                .
                            </p>

                            <button
                                className="primary-btn"
                                onClick={() => {
                                    if (selectedPatient) {
                                        localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient))
                                    }

                                    onNavigate('kinesistPatientDetail')
                                }}
                            >
                                Naar patiëntdetails
                            </button>
                        </section>
                    )}
                </div>
            </section>
        </main>
    )
}
