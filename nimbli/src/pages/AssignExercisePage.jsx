import { useEffect, useState } from 'react'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import checkIcon from '../assets/logos/check.png'
import '../styles/KinesistFlow.css'

export default function AssignExercisePage({ onNavigate }) {
    const [exercise, setExercise] = useState(null)
    const [patients, setPatients] = useState([])
    const [selectedPatientId, setSelectedPatientId] = useState(null)
    const [assigned, setAssigned] = useState(false)

    useEffect(() => {
        const savedExercise = JSON.parse(localStorage.getItem('selectedExercise'))
        const savedPatients = JSON.parse(localStorage.getItem('nimbliPatients')) || []

        setExercise(savedExercise)
        setPatients(savedPatients)

        if (savedPatients.length > 0) {
            setSelectedPatientId(savedPatients[0].id)
        }
    }, [])

    const currentExercise = exercise || {
        title: 'Stretch naar de sterren',
        category: 'Mobiliteit',
        level: 'Makkelijk',
        duration: '2 min',
        reps: '10 herhalingen',
    }

    const assignExercise = () => {
        const exerciseToAssign = {
            id: currentExercise.id || Date.now(),
            title: currentExercise.title,
            category: currentExercise.category,
            level: currentExercise.level,
            duration: currentExercise.duration,
            reps: currentExercise.reps,
        }

        const updatedPatients = patients.map((patient) => {
            if (patient.id !== selectedPatientId) return patient

            const currentExercises = patient.exercises || []
            const alreadyExists = currentExercises.some(
                (exercise) => exercise.title === exerciseToAssign.title
            )

            return {
                ...patient,
                exercises: alreadyExists
                    ? currentExercises
                    : [...currentExercises, exerciseToAssign],
            }
        })

        localStorage.setItem('nimbliPatients', JSON.stringify(updatedPatients))

        const selectedPatient = updatedPatients.find(
            (patient) => patient.id === selectedPatientId
        )

        localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient))
        setPatients(updatedPatients)
        setAssigned(true)
    }

    return (
        <main className="kine-page">
            <aside className="child-sidebar">
                <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                <button className="sidebar-link" onClick={() => onNavigate('kinesistDashboard')}>Dashboard</button>
                <button className="sidebar-link active" onClick={() => onNavigate('kinesistExercises')}>Oefeningen</button>
                <button className="sidebar-link">Instellingen</button>
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
                                        <strong>{currentExercise.title}</strong>
                                        <p>{currentExercise.category} · {currentExercise.duration} · {currentExercise.reps}</p>
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
                                                className={`assign-patient-card ${selectedPatientId === patient.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedPatientId(patient.id)}
                                            >
                                                <div className="patient-list-avatar">
                                                    {patient.firstName?.charAt(0)}
                                                    {patient.lastName?.charAt(0)}
                                                </div>

                                                <div>
                                                    <strong>{patient.firstName} {patient.lastName}</strong>
                                                    <span>{patient.age} jaar · {patient.goal}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <button
                                    className="primary-btn assign-btn"
                                    disabled={!selectedPatientId}
                                    onClick={assignExercise}
                                >
                                    Oefening toewijzen
                                </button>
                            </div>
                        </section>
                    ) : (
                        <section className="assign-success-card">
                            <img src={checkIcon} alt="" />
                            <h2>Oefening toegewezen!</h2>
                            <p>{currentExercise.title} werd toegevoegd aan het oefenprogramma.</p>

                            <button
                                className="primary-btn"
                                onClick={() => onNavigate('kinesistPatientDetail')}
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