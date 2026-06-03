import { useEffect, useState } from 'react'
import logo from '../assets/logos/nimbli-logo.png'
import profileIcon from '../assets/logos/profile.png'
import exitIcon from '../assets/logos/exit.png'
import mascotte2 from '../assets/logos/mascotte2.png'
import user from '../assets/logos/user.png'

import '../styles/KinesistFlow.css'

export default function KinesistDashboardPage({ onNavigate }) {
    const [patients, setPatients] = useState([])

    useEffect(() => {
        const savedPatients = JSON.parse(localStorage.getItem('nimbliPatients')) || []
        setPatients(savedPatients)
    }, [])

    return (
        <main className="kine-page">
            <aside className="child-sidebar">
                <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                <button className="sidebar-link active">Dashboard</button>
                <button className="sidebar-link" onClick={() => onNavigate('kinesistExercises')}>Oefeningen</button>
                <button className="sidebar-link" onClick={() => onNavigate('kinesistSettings')}>Instellingen</button>
                <button className="sidebar-link" onClick={() => onNavigate('login')}>
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

            <section className="kine-main">
                <header className="child-road-header">
                </header>

                <div className="kine-content">
                    <section className="kine-welcome">
                        <h2>Goedemiddag Anne!</h2>

                        <div className="kine-practice-card">
                            <div className="practice-avatar">
                                <img src={user} alt="" />
                            </div>

                            <div className="practice-info">
                                <h3>Anne Peeters</h3>
                                <p>Kinderkinesitherapeut</p>
                                <span>Stationsstraat 12, Mechelen</span>
                            </div>
                        </div>

                        <div className="kine-stats-grid">
                            <div className="kine-stat-card">
                                <strong>{patients.length}</strong>
                                <span>Patiënten</span>
                            </div>

                            <div className="kine-stat-card">
                                <strong>{patients.length > 0 ? '25%' : '0%'}</strong>
                                <span>Gemiddelde therapietrouw</span>
                            </div>

                            <div className="kine-stat-card">
                                <strong>{patients.length > 0 ? '20' : '0'}</strong>
                                <span>Actieve programma's</span>
                            </div>
                        </div>
                    </section>

                    <section className="kine-patients-section">
                        <div className="section-header">
                            <h3>Mijn patiënten</h3>
                        </div>

                        <button
                            className="primary-btn add-patient-btn"
                            onClick={() => onNavigate('newPatientFlow')}
                        >
                            Patiënt toevoegen
                        </button>

                        <div className="kine-search">Zoek patiënt...</div>

                        {patients.length === 0 ? (
                            <div className="empty-patients">
                                <img src={mascotte2} alt="Nimbli mascotte2" />
                                <h3>Je hebt nog geen patiënten</h3>
                            </div>) : (
                            <div className="patient-list">
                                {patients.map((patient) => (
                                    <button
                                        key={patient.id}
                                        className="patient-list-card"
                                        onClick={() => {
                                            localStorage.setItem('selectedPatient', JSON.stringify(patient))
                                            onNavigate('kinesistPatientDetail')
                                        }}>
                                        <div className="patient-list-top">
                                            <div className="patient-list-avatar">
                                                {`${patient.firstName?.[0] || 'L'}${patient.lastName?.[0] || 'H'}`}
                                            </div>

                                            <div>
                                                <strong>
                                                    {patient.firstName} {patient.lastName}
                                                </strong>
                                                <span>{patient.age} jaar</span>
                                            </div>

                                            <p className="patient-improvement">↗ +23%</p>
                                        </div>

                                        <p className="patient-goal">{patient.goal}</p>

                                        <div className="patient-session">
                                            <span className="session-dot"></span>
                                            <span>Laatste sessie: Vandaag</span>
                                        </div>

                                        <div className="patient-progress-row">
                                            <div className="patient-progress-bar">
                                                <div></div>
                                            </div>
                                            <span>60%</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </section >
        </main >
    )
}