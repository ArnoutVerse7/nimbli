console.log('DETAIL PAGE LOADED')
import { useEffect, useState } from 'react'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import checkIcon from '../assets/logos/check.png'
import starIcon from '../assets/logos/star.png'
import profileIcon from '../assets/logos/profile.png'
import EnvelopeIcon from '../assets/logos/envelope.png'
import phoneIcon from '../assets/logos/telephone.png'
import '../styles/KinesistFlow.css'

export default function KinesistPatientDetailPage({ onNavigate }) {
    const [patient, setPatient] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        const savedPatient = JSON.parse(localStorage.getItem('selectedPatient'))
        setPatient(savedPatient)
    }, [])

    const fallbackPatient = {
        firstName: 'Liam',
        lastName: 'Huismans',
        age: '7',
        goal: 'Motorische ontwikkeling ondersteunen',
        exercises: [
            { title: 'Stretch naar de sterren', category: 'Mobiliteit', time: '2 min', reps: '10 herhalingen' },
            { title: 'Superheld Pose', category: 'Balans', time: '2 min', reps: '30 seconden' },
        ],
    }

    const [showLogForm, setShowLogForm] = useState(false)
    const [newLogText, setNewLogText] = useState('')
    const [logEntries, setLogEntries] = useState([
        {
            title: 'Sessie evaluatie',
            date: '17 dec',
            time: '09:30',
            text: 'Liam toont significante verbetering in balans oefeningen. Ouders melden dat hij thuis ook meer zelfvertrouwen toont bij bewegen. Volgende sessie focus op fijnmotoriek.',
        },
        {
            title: 'Voortgangsnotitie',
            date: '15 dec',
            time: '14:30',
            text: 'Goede sessie met focus op looptraining. Liam laat vooruitgang zien in zijn looppatroon. Blijven werken aan coördinatie.',
        },
    ])

    const currentPatient = patient || fallbackPatient
    const assignedExercises =
        currentPatient.exercises?.length > 0
            ? currentPatient.exercises
            : []

    return (
        <main className="kine-page">
            <aside className="child-sidebar">
                <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                <button className="sidebar-link" onClick={() => onNavigate('kinesistDashboard')}>Dashboard</button>
                <button className="sidebar-link" onClick={() => onNavigate('kinesistExercises')}>Oefeningen</button>
                <button className="sidebar-link" onClick={() => onNavigate('kinesistSettings')}>Instellingen</button>
                <button className="sidebar-link" onClick={() => onNavigate('login')}>
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

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
                            {currentPatient.firstName?.charAt(0)}
                            {currentPatient.lastName?.charAt(0)}
                        </div>

                        <div className="patient-main-info">
                            <div className="patient-title-row">
                                <h2>
                                    {currentPatient.firstName} {currentPatient.lastName}
                                </h2>
                                <span>{currentPatient.age} jaar</span>
                            </div>

                            <p>Startdatum: 2026-02-15</p>
                            <strong>{currentPatient.goal}</strong>
                        </div>

                        <button className="primary-btn">+ Oefening toewijzen</button>

                        <div className="patient-contact-info">
                            <div>
                                <strong>Sarah Jansen</strong>
                                <span>Ouder/verzorger</span>
                            </div>

                            <div>
                                <p>
                                    <img src={EnvelopeIcon} alt="Mail" />
                                    sarah.jansen@email.com
                                </p>
                                <p>
                                    <img src={phoneIcon} alt="Phone" />
                                    +31 6 1234 5678
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="patient-detail-stats">
                        <div className="kine-stat-card">
                            <strong>89%</strong>
                            <span>Gemiddelde juistheid</span>
                        </div>

                        <div className="kine-stat-card">
                            <strong>12</strong>
                            <span>Sessies voltooid</span>
                        </div>

                        <div className="kine-stat-card">
                            <strong>20</strong>
                            <span>Dagen streak</span>
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

                                <div className="category-progress-list">
                                    <div className="category-progress-item">
                                        <div>
                                            <strong>Balans</strong>
                                            <span>78%</span>
                                        </div>
                                        <div className="category-progress-bar">
                                            <div style={{ width: '78%' }}></div>
                                        </div>
                                    </div>

                                    <div className="category-progress-item">
                                        <div>
                                            <strong>Mobiliteit</strong>
                                            <span>92%</span>
                                        </div>
                                        <div className="category-progress-bar">
                                            <div style={{ width: '92%' }}></div>
                                        </div>
                                    </div>

                                    <div className="category-progress-item">
                                        <div>
                                            <strong>Kracht</strong>
                                            <span>65%</span>
                                        </div>
                                        <div className="category-progress-bar">
                                            <div style={{ width: '65%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="patient-detail-card">
                                <h3>Laatste resultaten</h3>

                                <div className="detail-result-row">
                                    <img src={checkIcon} alt="" />
                                    <span>Jumping Jacks voltooid</span>
                                    <strong>89%</strong>
                                </div>

                                <div className="detail-result-row">
                                    <img src={starIcon} alt="" />
                                    <span>Nieuwe badge behaald</span>
                                    <strong>+50 XP</strong>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'sessions' && (
                        <section className="patient-detail-card">
                            <h3>Sessie geschiedenis</h3>

                            <div className="session-history-list">
                                <article className="session-history-card">
                                    <div className="session-check">✓</div>

                                    <div className="session-history-content">
                                        <div className="session-history-top">
                                            <strong>Woensdag 17 december</strong>
                                            <span>+8%</span>
                                        </div>

                                        <div className="session-meta">
                                            <p>09:00</p>
                                            <p>45 min</p>
                                        </div>

                                        <p className="session-label">Oefeningen:</p>

                                        <div className="session-tags">
                                            <span>Balans oefening</span>
                                            <span>Looptraining</span>
                                            <span>Coördinatie spel</span>
                                        </div>
                                    </div>
                                </article>

                                <article className="session-history-card">
                                    <div className="session-check">✓</div>

                                    <div className="session-history-content">
                                        <div className="session-history-top">
                                            <strong>Maandag 15 december</strong>
                                            <span>+5%</span>
                                        </div>

                                        <div className="session-meta">
                                            <p>14:30</p>
                                            <p>30 min</p>
                                        </div>

                                        <p className="session-label">Oefeningen:</p>

                                        <div className="session-tags">
                                            <span>Stretch oefeningen</span>
                                            <span>Kracht training</span>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </section>
                    )}

                    {activeTab === 'exercises' && (
                        <section className="patient-detail-card">
                            <h3>Toegewezen oefeningen</h3>

                            {assignedExercises.length === 0 ? (
                                <p className="empty-text">Nog geen oefeningen toegewezen.</p>
                            ) : (
                                <div className="exercise-program-list">
                                    {assignedExercises.map((exercise, index) => (
                                        <article className="exercise-program-card" key={index}>
                                            <div className="exercise-program-top">
                                                <div className="exercise-thumb"></div>

                                                <div className="exercise-program-content">
                                                    <div className="exercise-header">
                                                        <strong>{exercise.title}</strong>
                                                        <button className="exercise-menu">⋮</button>
                                                    </div>

                                                    <div className="exercise-badges">
                                                        <span className="badge-difficulty">
                                                            {exercise.level || 'Makkelijk'}
                                                        </span>
                                                        <span className="badge-category">
                                                            {exercise.category}
                                                        </span>
                                                    </div>

                                                    <div className="exercise-details">
                                                        <div>
                                                            <small>Duur</small>
                                                            <p>{exercise.duration || exercise.time || '2 min'}</p>
                                                        </div>

                                                        <div>
                                                            <small>Herhalingen</small>
                                                            <p>{exercise.reps || '10 herhalingen'}</p>
                                                        </div>

                                                        <div>
                                                            <small>Frequentie</small>
                                                            <p>Dagelijks</p>
                                                        </div>
                                                    </div>

                                                    <div className="exercise-progress">
                                                        <div className="exercise-progress-bar">
                                                            <div style={{ width: '0%' }}></div>
                                                        </div>

                                                        <span>0%</span>
                                                    </div>

                                                    <small className="last-completed">
                                                        Nog niet voltooid
                                                    </small>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
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
                                    <input placeholder="Titel van notitie" id="log-title" />

                                    <textarea
                                        placeholder="Schrijf hier je observatie..."
                                        value={newLogText}
                                        onChange={(e) => setNewLogText(e.target.value)}
                                    />

                                    <button
                                        className="primary-btn"
                                        onClick={() => {
                                            if (!newLogText.trim()) return

                                            setLogEntries([
                                                {
                                                    title: 'Nieuwe notitie',
                                                    date: 'Vandaag',
                                                    time: 'Nu',
                                                    text: newLogText,
                                                },
                                                ...logEntries,
                                            ])

                                            setNewLogText('')
                                            setShowLogForm(false)
                                        }}
                                    >
                                        Notitie opslaan
                                    </button>
                                </div>
                            )}

                            <div className="logbook-list">
                                {logEntries.map((entry, index) => (
                                    <div className="logbook-entry" key={index}>
                                        <div className="logbook-meta">
                                            <span>{entry.date}</span>
                                            <span>•</span>
                                            <span>{entry.time}</span>
                                        </div>

                                        <strong>{entry.title}</strong>

                                        <p>{entry.text}</p>

                                        <div className="logbook-author">
                                            Door Dr. Jansen
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </section>
        </main>
    )
}