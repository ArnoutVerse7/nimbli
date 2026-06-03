import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import checkIcon from '../assets/logos/check.png'
import profile from '../assets/logos/profile.png'
import '../styles/KinesistFlow.css'

export default function NewPatientFlowPage({ onNavigate }) {
    const [step, setStep] = useState(1)
    const [exercises, setExercises] = useState([])
    const [selectedExercises, setSelectedExercises] = useState([])
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [activationCode] = useState(
        Math.random().toString(36).substring(2, 8).toUpperCase()
    )

    const [patientForm, setPatientForm] = useState({
        firstName: '',
        lastName: '',
        age: '',
        goal: '',
    })

    useEffect(() => {
        async function loadExercises() {
            const { data, error } = await supabase
                .from('exercises')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) {
                console.error(error)
                return
            }

            setExercises(data || [])
        }

        loadExercises()
    }, [])

    const toggleExercise = (exercise) => {
        setSelectedExercises((prev) => {
            const exists = prev.find((item) => item.id === exercise.id)

            if (exists) {
                return prev.filter((item) => item.id !== exercise.id)
            }

            return [...prev, exercise]
        })
    }

    const checkPatientAndGoNext = async () => {
        setErrorMessage('')

        if (!patientForm.firstName.trim() || !patientForm.lastName.trim()) {
            setErrorMessage('Vul minstens voornaam en achternaam in.')
            return
        }

        const { data: existingPatient, error } = await supabase
            .from('patients')
            .select('*')
            .ilike('first_name', patientForm.firstName.trim())
            .ilike('last_name', patientForm.lastName.trim())
            .maybeSingle()

        if (error) {
            console.error(error)
            setErrorMessage('Er ging iets mis bij het controleren van de patiënt.')
            return
        }

        if (existingPatient) {
            setErrorMessage('Deze patiënt bestaat al.')
            return
        }

        setStep(2)
    }

    const savePatient = async () => {
        setIsSaving(true)
        setErrorMessage('')

        try {
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .insert([
                    {
                        first_name: patientForm.firstName.trim(),
                        last_name: patientForm.lastName.trim(),
                        age: parseInt(patientForm.age || '7'),
                        goal: patientForm.goal || 'Motorische ontwikkeling ondersteunen',
                        activation_code: activationCode,
                    },
                ])
                .select()
                .single()

            if (patientError) throw patientError

            if (selectedExercises.length > 0) {
                const exerciseRows = selectedExercises.map((exercise) => ({
                    patient_id: patientData.id,
                    exercise_id: exercise.id,
                    completed: false,
                    completion_percentage: 0,
                }))

                const { error: assignError } = await supabase
                    .from('patient_exercises')
                    .insert(exerciseRows)

                if (assignError) throw assignError
            }

            onNavigate('kinesistDashboard')
        } catch (error) {
            console.error('SAVE PATIENT ERROR:', error)
            setErrorMessage(error.message || 'Er ging iets mis bij het opslaan.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <main className="kine-page">
            <aside className="child-sidebar">
                <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                <button className="sidebar-link active" onClick={() => onNavigate('kinesistDashboard')}>
                    Dashboard
                </button>

                <button className="sidebar-link" onClick={() => onNavigate('kinesistExercises')}>
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
                    <h1>Nieuwe patiënt toevoegen</h1>
                </header>

                <div className="new-patient-content">
                    <div className="new-patient-card">
                        <p className="step-label">Stap {step} van 4</p>

                        <div className="step-progress">
                            {[1, 2, 3, 4].map((number) => (
                                <div key={number} className={number <= step ? 'active' : ''} />
                            ))}
                        </div>

                        {step === 1 && (
                            <section className="patient-step">
                                <h2>Basisgegevens</h2>

                                <div className="form-grid">
                                    <label>
                                        Voornaam van het kind
                                        <input
                                            placeholder="Bijv. Finn"
                                            value={patientForm.firstName}
                                            onChange={(e) =>
                                                setPatientForm({ ...patientForm, firstName: e.target.value })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Achternaam van het kind
                                        <input
                                            placeholder="Bijv. Janssens"
                                            value={patientForm.lastName}
                                            onChange={(e) =>
                                                setPatientForm({ ...patientForm, lastName: e.target.value })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Leeftijd
                                        <input
                                            placeholder="Bijv. 9"
                                            value={patientForm.age}
                                            onChange={(e) =>
                                                setPatientForm({ ...patientForm, age: e.target.value })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Behandeldoel
                                        <input
                                            placeholder="Bijv. achillespees revalidatie"
                                            value={patientForm.goal}
                                            onChange={(e) =>
                                                setPatientForm({ ...patientForm, goal: e.target.value })
                                            }
                                        />
                                    </label>
                                </div>

                                <div className="tag-list">
                                    <span>Knie revalidatie</span>
                                    <span>Problemen met evenwicht</span>
                                    <span>Motorische ontwikkeling ondersteunen</span>
                                    <span>Achillespees revalidatie</span>
                                </div>
                                {errorMessage && (
                                    <p className="form-error-message">{errorMessage}</p>
                                )}

                                <button className="primary-btn" onClick={checkPatientAndGoNext}>
                                    Volgende
                                </button>
                            </section>
                        )}

                        {step === 2 && (
                            <section className="patient-step">
                                <h2>Startprogramma</h2>
                                <p>Voeg al starteroefeningen toe of sla dit voorlopig over.</p>

                                <div className="kine-search full">Zoek oefeningen...</div>

                                <div className="exercise-select-grid">
                                    {exercises.map((exercise) => {
                                        const isSelected = selectedExercises.some(
                                            (item) => item.id === exercise.id
                                        )

                                        return (
                                            <div
                                                key={exercise.id}
                                                className={`exercise-select-card ${isSelected ? 'selected' : ''}`}
                                                onClick={() => toggleExercise(exercise)}
                                            >
                                                <div className="exercise-thumb">
                                                    {exercise.cover_image ? (
                                                        <img
                                                            src={exercise.cover_image}
                                                            alt={exercise.title}
                                                            className="exercise-thumb-image"
                                                        />
                                                    ) : (
                                                        <div className="exercise-thumb-placeholder"></div>
                                                    )}
                                                </div>

                                                <div>
                                                    <strong>{exercise.title}</strong>
                                                    <span>{exercise.category}</span>
                                                    <p>
                                                        {exercise.duration} · {exercise.reps}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="button-row">
                                    <button className="secondary-btn" onClick={() => setStep(1)}>
                                        Terug
                                    </button>

                                    <button className="primary-btn" onClick={() => setStep(3)}>
                                        Volgende
                                        {selectedExercises.length > 0 && ` (${selectedExercises.length})`}
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
                                        <h3>
                                            {patientForm.firstName || 'Finn'} {patientForm.lastName || 'Janssens'}
                                        </h3>
                                        <span>{patientForm.age || '9'} jaar</span>
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
                                    <p>{patientForm.goal || 'Achillespees revalidatie'}</p>

                                    <h3>Startprogramma</h3>

                                    <div className="selected-exercises">
                                        {selectedExercises.length > 0 ? (
                                            selectedExercises.map((exercise) => (
                                                <div className="selected-exercise" key={exercise.id}>
                                                    <div className="exercise-thumb">
                                                        {exercise.cover_image ? (
                                                            <img
                                                                src={exercise.cover_image}
                                                                alt={exercise.title}
                                                                className="exercise-thumb-image"
                                                            />
                                                        ) : (
                                                            <div className="exercise-thumb-placeholder"></div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <strong>{exercise.title}</strong>
                                                        <p>
                                                            {exercise.duration} · {exercise.reps}
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

                                <div className="activation-code">{activationCode}</div>

                                <div className="next-steps-box">
                                    <strong>Wat moeten ouders doen?</strong>
                                    <ul>
                                        <li>Ga naar de website.</li>
                                        <li>Open de website en kies “Aanmelden met code”.</li>
                                        <li>Voer de activatiecode in.</li>
                                    </ul>
                                </div>



                                <button
                                    className="primary-btn"
                                    disabled={isSaving}
                                    onClick={savePatient}
                                >
                                    {isSaving ? 'Opslaan...' : 'Terugkeren naar het dashboard'}
                                </button>
                            </section>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}