import { useState } from 'react'
import logo from '../assets/logos/nimbli-logo.png'
import profileIcon from '../assets/logos/profile.png'
import exitIcon from '../assets/logos/exit.png'
import checkIcon from '../assets/logos/check.png'
import starIcon from '../assets/logos/star.png'
import profile from '../assets/logos/profile.png'
import '../styles/KinesistFlow.css'

export default function NewPatientFlowPage({ onNavigate }) {
    const [step, setStep] = useState(1)
    const [selectedExercises, setSelectedExercises] = useState([])

    const [patientForm, setPatientForm] = useState({
        firstName: '',
        lastName: '',
        age: '',
        goal: '',
    })

    const exercises = [
        { title: 'Stretch naar de sterren', category: 'Mobiliteit', time: '2 min', reps: '10 herhalingen' },
        { title: 'Superheld Pose', category: 'Balans', time: '2 min', reps: '30 seconden' },
        { title: 'Jumping Jacks', category: 'Kracht', time: '2 min', reps: '10 herhalingen' },
        { title: 'Balans oefening', category: 'Balans', time: '3 min', reps: '5 herhalingen' },
    ]

    const toggleExercise = (exercise) => {
        setSelectedExercises((prev) => {
            const exists = prev.find((item) => item.title === exercise.title)

            if (exists) {
                return prev.filter((item) => item.title !== exercise.title)
            }

            return [...prev, exercise]
        })
    }

    return (
        <main className="kine-page">
            <aside className="child-sidebar">
                <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                <button className="sidebar-link" onClick={() => onNavigate('kinesistDashboard')}> Dashboard</button>
                <button className="sidebar-link" onClick={() => onNavigate('kinesistExercises')}>Oefeningen</button>
                <button className="sidebar-link">Instellingen</button>
                <button className="sidebar-link" onClick={() => onNavigate('login')}>
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

            <section className="kine-main">
                <header className="child-road-header">
                    <h1>Nieuwe patiënt toevoegen</h1>
                </header>

                <div className="new-patient-content">
                    <div className="new-patient-card">
                        <p className="step-label">Stap {step} van 4</p>

                        <div className="step-progress">
                            {[1, 2, 3, 4].map((number) => (
                                <div
                                    key={number}
                                    className={number <= step ? 'active' : ''}
                                />
                            ))}
                        </div>

                        {step === 1 && (
                            <section className="patient-step">
                                <h2>Basisgegevens</h2>

                                <div className="form-grid">
                                    <label>
                                        Voornaam van het kind
                                        <input
                                            placeholder="Bijv. Liam"
                                            value={patientForm.firstName}
                                            onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                                        />
                                    </label>

                                    <label>
                                        Achternaam van het kind
                                        <input
                                            placeholder="Bijv. Huismans"
                                            value={patientForm.lastName}
                                            onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                                        />
                                    </label>

                                    <label>
                                        Leeftijd
                                        <input
                                            placeholder="Bijv. 7"
                                            value={patientForm.age}
                                            onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                                        />
                                    </label>

                                    <label>
                                        Behandeldoel
                                        <input
                                            placeholder="Bijv. knie revalidatie"
                                            value={patientForm.goal}
                                            onChange={(e) => setPatientForm({ ...patientForm, goal: e.target.value })}
                                        />
                                    </label>
                                </div>

                                <div className="tag-list">
                                    <span>Knie revalidatie</span>
                                    <span>Problemen met evenwicht</span>
                                    <span>Motorische ontwikkeling ondersteunen</span>
                                    <span>Revalidatie na ziekte</span>
                                </div>

                                <button className="primary-btn" onClick={() => setStep(2)}>
                                    Volgende
                                </button>
                            </section>
                        )}

                        {step === 2 && (
                            <section className="patient-step">
                                <h2>Startprogramma</h2>
                                <p>Voeg al starteroefeningen toe of sla dit voorlopig over.</p>

                                <div className="kine-search full">
                                    Zoek oefeningen...
                                </div>

                                <div className="exercise-select-grid">
                                    {exercises.map((exercise, index) => {
                                        const isSelected = selectedExercises.some(
                                            (item) => item.title === exercise.title
                                        )

                                        return (
                                            <div
                                                key={index}
                                                className={`exercise-select-card ${isSelected ? 'selected' : ''
                                                    }`}
                                                onClick={() => toggleExercise(exercise)}
                                            >
                                                <div className="exercise-thumb" />

                                                <div>
                                                    <strong>{exercise.title}</strong>
                                                    <span>{exercise.category}</span>
                                                    <p>
                                                        {exercise.time} · {exercise.reps}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="button-row">
                                    <button
                                        className="secondary-btn"
                                        onClick={() => setStep(1)}
                                    >
                                        Terug
                                    </button>

                                    <button
                                        className="primary-btn"
                                        onClick={() => setStep(3)}
                                    >
                                        Volgende
                                        {selectedExercises.length > 0 &&
                                            ` (${selectedExercises.length})`}
                                    </button>
                                </div>
                            </section>
                        )}

                        {step === 3 && (
                            <section className="patient-step review-layout">
                                <div>
                                    <h2>Bijna klaar!</h2>
                                    <p>Controleer of alle gegevens juist zijn.</p>

                                    <div className="patient-preview-card">
                                        <img src={profile} alt="Nimbli profiel" />
                                        <h3>{patientForm.firstName || 'Liam'} {patientForm.lastName || 'Huismans'}</h3>
                                        <span>{patientForm.age || '7'} jaar</span>
                                    </div>

                                    <div className="info-box">
                                        <strong>Wat gebeurt er nu?</strong>
                                        <p>
                                            Na het bevestigen wordt een activatiecode gegenereerd.
                                            Met deze code kunnen ouders het kinderprofiel veilig activeren.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3>Behandeldoel</h3>
                                    <p>{patientForm.goal || 'Motorische ontwikkeling ondersteunen'}</p>
                                    <h3>Startprogramma</h3>

                                    <div className="selected-exercises">
                                        {selectedExercises.length > 0 ? (
                                            selectedExercises.map((exercise, index) => (
                                                <div className="selected-exercise" key={index}>
                                                    <div className="exercise-thumb" />

                                                    <div>
                                                        <strong>{exercise.title}</strong>
                                                        <p>
                                                            {exercise.time} · {exercise.reps}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>Geen starteroefeningen geselecteerd.</p>
                                        )}
                                    </div>

                                    <div className="button-row">
                                        <button className="secondary-btn" onClick={() => setStep(2)}>
                                            Terug
                                        </button>

                                        <button className="primary-btn" onClick={() => setStep(4)}>
                                            Volgende
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {step === 4 && (
                            <section className="patient-step final-step">
                                <img src={checkIcon} alt="" className="success-icon" />

                                <h2>Patiënt toegevoegd!</h2>
                                <p>Deel deze activatiecode met de ouders:</p>

                                <div className="activation-code">
                                    5AZ-63B
                                </div>

                                <div className="share-options">
                                    <button>Email</button>
                                    <button>SMS</button>
                                </div>

                                <div className="next-steps-box">
                                    <strong>Niet moeten ouders doen?</strong>
                                    <ul>
                                        <li>Ga naar de website.</li>
                                        <li>Open de website en kies “Aanmelden met code”.</li>
                                        <li>Voer de activatiecode in.</li>
                                    </ul>
                                </div>

                                <button
                                    className="primary-btn"
                                    onClick={() => {
                                        const currentPatients = JSON.parse(localStorage.getItem('nimbliPatients')) || []

                                        const newPatient = {
                                            id: Date.now(),
                                            firstName: patientForm.firstName || 'Liam',
                                            lastName: patientForm.lastName || 'Huismans',
                                            age: patientForm.age || '7',
                                            goal: patientForm.goal || 'Motorische ontwikkeling ondersteunen',
                                            exercises: selectedExercises,
                                        }

                                        localStorage.setItem('nimbliPatients', JSON.stringify([...currentPatients, newPatient]))
                                        onNavigate('kinesistDashboard')
                                    }}
                                >
                                    Terugkeren naar het dashboard
                                </button>
                            </section>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}