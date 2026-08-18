import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import checkIcon from '../assets/logos/check.png'
import profileIcon from '../assets/logos/profile.png'
import '../styles/KinesistFlow.css'

export default function AssignExercisePage({ exerciseId, onNavigate }) {
    const [exercise, setExercise] = useState(null)
    const [patients, setPatients] = useState([])
    const [selectedPatientId, setSelectedPatientId] = useState(null)
    const [assigned, setAssigned] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

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
                setPatients(patientsData || [])

                if (patientsData?.length > 0) {
                    setSelectedPatientId(patientsData[0].id)
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

        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
            alert('Je sessie is verlopen. Log opnieuw in.')
            setIsSaving(false)
            return
        }

        const { data: existingAssignment, error: existingError } = await supabase
            .from('patient_exercises')
            .select('*')
            .eq('patient_id', selectedPatientId)
            .eq('exercise_id', exercise.id)

        if (existingError) {
            console.error(existingError)
            alert('Fout bij controleren van bestaande toewijzing')
            setIsSaving(false)
            return
        }

        if (existingAssignment.length > 0) {
            setAssigned(true)
            setIsSaving(false)
            return
        }

        const { error } = await supabase
            .from('patient_exercises')
            .insert([
                {
                    patient_id: selectedPatientId,
                    exercise_id: exercise.id,
                    assigned_by: userData.user.id,
                    completed: false,
                    completion_percentage: 0,
                },
            ])

        if (error) {
            console.error(error)
            alert('Fout bij toewijzen van oefening')
            setIsSaving(false)
            return
        }

        setAssigned(true)
        setIsSaving(false)
    }

    const selectedPatient = patients.find((patient) => patient.id === selectedPatientId)

    if (loading) {
        return <p>Gegevens laden...</p>
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

                <button className="sidebar-link" onClick={() => onNavigate('login')}>
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

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
                                    <div className="exercise-thumb" />

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
                                                key={patient.id}
                                                className={`assign-patient-card ${selectedPatientId === patient.id ? 'selected' : ''
                                                    }`}
                                                onClick={() => setSelectedPatientId(patient.id)}
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

                                <button
                                    className="primary-btn assign-btn"
                                    disabled={!selectedPatientId || isSaving}
                                    onClick={assignExercise}
                                >
                                    {isSaving ? 'Toewijzen...' : 'Oefening toewijzen'}
                                </button>
                            </div>
                        </section>
                    ) : (
                        <section className="assign-success-card">
                            <img src={checkIcon} alt="" />
                            <h2>Oefening toegewezen!</h2>

                            <p>
                                {exercise.title} werd toegevoegd aan het oefenprogramma
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
