import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logos/nimbli-logo.png'
import profileIcon from '../assets/logos/profile.png'
import exitIcon from '../assets/logos/exit.png'
import checkIcon from '../assets/logos/check.png'
import starIcon from '../assets/logos/star.png'
import trophyIcon from '../assets/logos/trophy.png'
import streakIcon from '../assets/logos/streak.png'
import '../styles/ParentDashboard.css'

export default function ParentDashboardPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [patient, setPatient] = useState(null)
  const [assignedExercises, setAssignedExercises] = useState([])

  useEffect(() => {
    async function loadParentData() {
      const patientId = localStorage.getItem('patientId')

      if (!patientId) return

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (!patientError) {
        setPatient(patientData)
      }

      const { data: exerciseData, error: exerciseError } = await supabase
        .from('patient_exercises')
        .select(`
          *,
          exercises (*)
        `)
        .eq('patient_id', patientId)

      if (!exerciseError) {
        setAssignedExercises(exerciseData || [])
      }
    }

    loadParentData()
  }, [])

  const weekData = [
    { day: 'ZA', date: '01', exercises: 2, status: 'done' },
    { day: 'ZO', date: '02', exercises: 1, status: 'done' },
    { day: 'MA', date: '03', exercises: assignedExercises.length, status: 'current' },
    { day: 'DI', date: '04', exercises: 2, status: 'pending' },
    { day: 'WO', date: '05', exercises: 0, status: 'pending' },
    { day: 'DO', date: '06', exercises: 2, status: 'pending' },
    { day: 'VR', date: '07', exercises: 1, status: 'pending' },
  ]

  const activities = assignedExercises.map((item) => ({
    title: item.exercises?.title || 'Oefening',
    date: 'Vandaag',
    xp: '+10XP',
  }))

  const metrics = [
    { label: 'Mobiliteit', value: '+5%', progress: 60 },
    { label: 'Kracht', value: '+8%', progress: 75 },
    { label: 'Balans', value: '+3%', progress: 45 },
  ]

  return (
    <main className="parent-page">
      <aside className="parent-sidebar">
        <img src={logo} alt="Nimbli logo" className="parent-logo" />

        <button className="sidebar-link active" onClick={() => onNavigate('parentDashboard')}>
          Dashboard
        </button>

        <button className="sidebar-link" onClick={() => onNavigate('login')}>
          <img src={exitIcon} alt="Uitloggen" />
        </button>
      </aside>

      <section className="parent-main">
        <header className="parent-topbar">
          <h1>Ouder Dashboard</h1>
        </header>

        {activeTab === 'overview' && (
          <div className="parent-content">
            <section className="parent-child-card">
              <div className="parent-child-avatar">
                <img src={profileIcon} alt="Profiel" className="parent-profile-icon" />
              </div>

              <div>
                <h2>
                  {patient
                    ? `${patient.first_name} ${patient.last_name}`
                    : 'Kindprofiel laden...'}
                </h2>

                <div className="parent-child-meta">
                  <div>
                    <strong>{patient?.age || '-'}</strong>
                    <span>Leeftijd</span>
                  </div>

                  <div>
                    <strong>{patient?.goal || '-'}</strong>
                    <span>Doel</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="parent-grid">
              <div className="parent-card parent-progress-card">
                <div>
                  <p>Voortgang t.o.v. vorige week</p>
                  <span>Verbeterd tegenover vorige week</span>
                </div>

                <strong>+23%</strong>
              </div>

              <div className="parent-card">
                <h3>Voortgang per categorie</h3>

                <div className="parent-metrics">
                  {metrics.map((metric) => (
                    <div className="parent-metric" key={metric.label}>
                      <div>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </div>

                      <div className="parent-bar">
                        <div style={{ width: `${metric.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="parent-card parent-week-card">
              <h3>Weekoverzicht</h3>

              <div className="parent-week-grid">
                {weekData.map((day) => (
                  <div className={`parent-day-card ${day.status}`} key={day.day}>
                    <span>{day.day}</span>
                    <strong>{day.date}</strong>
                    <p>{day.exercises} oef.</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="parent-bottom-grid">
              <div className="parent-card">
                <h3>Toegewezen oefeningen</h3>

                <div className="parent-activity-list">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div className="parent-activity" key={index}>
                        <img src={checkIcon} alt="" />

                        <div>
                          <strong>{activity.title}</strong>
                          <span>{activity.date}</span>
                        </div>

                        <p>{activity.xp}</p>
                      </div>
                    ))
                  ) : (
                    <p>Nog geen oefeningen toegewezen.</p>
                  )}
                </div>
              </div>

              <div className="parent-card">
                <h3>Status</h3>

                <div className="parent-status-grid">
                  <div>
                    <img src={trophyIcon} alt="" />
                    <strong>3</strong>
                    <span>Badges</span>
                  </div>

                  <div>
                    <img src={starIcon} alt="" />
                    <strong>12 XP</strong>
                    <span>Verzameld</span>
                  </div>

                  <div>
                    <img src={streakIcon} alt="" />
                    <strong>20</strong>
                    <span>Dagen streak</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="parent-content">
            <section className="parent-card parent-empty-card">
              <h2>Oefenplanning</h2>
              <p>Hier komt later de planning van toegewezen oefeningen.</p>
            </section>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="parent-content">
            <section className="parent-card parent-empty-card">
              <h2>Instellingen</h2>
              <p>Hier komen later ouderinstellingen en meldingen.</p>
            </section>
          </div>
        )}
      </section>
    </main>
  )
}