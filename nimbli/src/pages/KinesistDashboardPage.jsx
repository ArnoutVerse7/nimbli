import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import profileIcon from '../assets/logos/profile.png'
import mascotte2 from '../assets/logos/mascotte2.png'
import user from '../assets/logos/user.png'
import { getCurrentUserAndProfile } from '../lib/auth'
import KinesistSidebar from '../components/KinesistSidebar'

import '../styles/KinesistFlow.css'

export default function KinesistDashboardPage({ onNavigate }) {
    const [patients, setPatients] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [kinesist, setKinesist] = useState(null)
    const [assignments, setAssignments] = useState([])

    const filteredPatients = patients.filter((patient) =>
        `${patient.first_name} ${patient.last_name} ${patient.goal}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    )
    useEffect(() => {
        async function loadData() {
            const { profile, error: profileError } = await getCurrentUserAndProfile('kinesist')

            if (profileError || !profile) {
                console.error(profileError)
                onNavigate('kinesistLogin')
                return
            }

            setKinesist(profile)

            const [patientsResult, assignmentsResult] = await Promise.all([
                supabase
                    .from('patients')
                    .select('*')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('patient_exercises')
                    .select('patient_id, completion_percentage, completed, completed_at'),
            ])

            if (patientsResult.error) {
                console.error(patientsResult.error)
            } else {
                setPatients(patientsResult.data || [])
            }

            if (assignmentsResult.error) {
                console.error(assignmentsResult.error)
            } else {
                setAssignments(assignmentsResult.data || [])
            }
        }

        loadData()
    }, [onNavigate])

    const assignmentsByPatient = assignments.reduce((groups, assignment) => {
        const current = groups[assignment.patient_id] || []
        current.push(assignment)
        groups[assignment.patient_id] = current
        return groups
    }, {})
    const averageProgress = assignments.length
        ? Math.round(
            assignments.reduce(
                (total, assignment) => total + (assignment.completion_percentage || 0),
                0
            ) / assignments.length
        )
        : 0
    const activePrograms = Object.values(assignmentsByPatient).filter((items) =>
        items.some(
            (item) => !item.completed && (item.completion_percentage || 0) < 100
        )
    ).length

    const formatLastSession = (items) => {
        const completedDates = items
            .map((item) => item.completed_at)
            .filter(Boolean)
            .map((date) => new Date(date))
            .sort((a, b) => b - a)

        if (completedDates.length === 0) return 'Nog geen sessie'

        const latestDate = completedDates[0]
        const today = new Date()
        const todayKey = today.toDateString()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)

        if (latestDate.toDateString() === todayKey) return 'Vandaag'
        if (latestDate.toDateString() === yesterday.toDateString()) return 'Gisteren'

        return latestDate.toLocaleDateString('nl-BE')
    }

    return (
        <main className="kine-page">
            <KinesistSidebar active="dashboard" onNavigate={onNavigate} />

            <section className="kine-main">
                <header className="child-road-header">
                </header>

                <div className="kine-content">
                    <section className="kine-welcome">
                        <p className="kine-eyebrow">Dashboard</p>
                        <h2>Welkom, {kinesist?.full_name || 'Kinesist'}!</h2>
                        <p className="kine-page-intro">Een snel overzicht van je praktijk en patiënten.</p>
                        <div className="kine-practice-card">
                            <div className="practice-avatar">
                                <img src={user} alt="" />
                            </div>

                            <div className="practice-info">
                                <h3>{kinesist?.full_name || 'Kinesist'}</h3>
                                <p>{kinesist?.practice_name || 'Kinderkinesitherapeut'}</p>
                                <span>{kinesist?.location || 'Locatie nog niet ingesteld'}</span>
                            </div>
                        </div>

                        <div className="kine-stats-grid">
                            <div className="kine-stat-card">
                                <strong>{patients.length}</strong>
                                <span>Patiënten</span>
                            </div>

                            <div className="kine-stat-card">
                                <strong>{averageProgress}%</strong>
                                <span>Gemiddelde voortgang</span>
                            </div>

                            <div className="kine-stat-card">
                                <strong>{activePrograms}</strong>
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

                        <input
                            className="kine-search"
                            type="text"
                            placeholder="Zoek patiënt..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {patients.length === 0 ? (
                            <div className="empty-patients">
                                <img src={mascotte2} alt="Nimbli mascotte2" />
                                <h3>Je hebt nog geen patiënten</h3>
                            </div>) : (
                            <div className="patient-list">
                                {filteredPatients.map((patient) => {
                                    const patientAssignments = assignmentsByPatient[patient.id] || []
                                    const completedCount = patientAssignments.filter(
                                        (item) => item.completed
                                    ).length
                                    const patientProgress = patientAssignments.length
                                        ? Math.round(
                                            patientAssignments.reduce(
                                                (total, item) => total + (item.completion_percentage || 0),
                                                0
                                            ) / patientAssignments.length
                                        )
                                        : 0
                                    const lastSession = formatLastSession(patientAssignments)

                                    return (
                                    <button
                                        key={patient.id}
                                        className="patient-list-card"
                                        onClick={() => {
                                            localStorage.setItem('selectedPatient', JSON.stringify(patient))
                                            onNavigate('kinesistPatientDetail')
                                        }}>
                                        <div className="patient-list-top">
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
                                                <span>{patient.age} jaar</span>
                                            </div>

                                            <p className="patient-improvement">
                                                {completedCount}/{patientAssignments.length} voltooid
                                            </p>
                                        </div>

                                        <p className="patient-goal">{patient.goal}</p>

                                        <div className="patient-session">
                                            <span className={`session-dot ${lastSession === 'Nog geen sessie' ? 'empty' : ''}`}></span>
                                            <span>Laatste sessie: {lastSession}</span>
                                        </div>

                                        <div className="patient-progress-row">
                                            <div className="patient-progress-bar">
                                                <div style={{ width: `${patientProgress}%` }}></div>
                                            </div>
                                            <span>{patientProgress}%</span>
                                        </div>
                                    </button>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </section >
        </main >
    )
}
