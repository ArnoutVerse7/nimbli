import { useState } from 'react'
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

  const weekData = [
    { day: 'ZA', date: '01', exercises: 2, status: 'done' },
    { day: 'ZO', date: '02', exercises: 1, status: 'done' },
    { day: 'MA', date: '03', exercises: 3, status: 'current' },
    { day: 'DI', date: '04', exercises: 2, status: 'pending' },
    { day: 'WO', date: '05', exercises: 0, status: 'pending' },
    { day: 'DO', date: '06', exercises: 2, status: 'pending' },
    { day: 'VR', date: '07', exercises: 1, status: 'pending' },
  ]

  const activities = [
    { title: 'Jumping Jacks', date: '11 dec 2025 14:30', xp: '+10XP' },
    { title: 'Superheld Pose', date: '11 dec 2025 13:10', xp: '+10XP' },
    { title: 'Stretch naar de sterren', date: '10 dec 2025 18:20', xp: '+10XP' },
  ]

  const metrics = [
    { label: 'Balans', value: '+8%', progress: 75 },
    { label: 'Mobiliteit', value: '+5%', progress: 60 },
    { label: 'Kracht', value: '+3%', progress: 45 },
  ]

  return (
    <main className="parent-page">
      <aside className="parent-sidebar">
        <img src={logo} alt="Nimbli logo" className="parent-logo" />

        <button className="sidebar-link active" onClick={() => onNavigate('ParentDashboard')}>
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
              <div className="parent-child-avatar"><img src={profileIcon} alt="Profiel" className="parent-profile-icon" /></div>

                <div>
                  <h2>Liam De Broeck</h2>

                  <div className="parent-child-meta">
                    <div>
                      <strong>14</strong>
                      <span>Leeftijd</span>
                    </div>

                    <div>
                      <strong>knie revalidatie</strong>
                      <span>Doel</span>
                    </div>
                  </div>
                </div>

                <button className="parent-edit-btn">✎</button>
            </section>

            <section className="parent-grid">
              <div className="parent-card parent-progress-card">
                <div>
                  <p>Voortgang t.o.v. vorige week</p>
                  <span>Improved compared to last week</span>
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
                <h3>Recente activiteiten</h3>

                <div className="parent-activity-list">
                  {activities.map((activity, index) => (
                    <div className="parent-activity" key={index}>
                      <img src={checkIcon} alt="" />

                      <div>
                        <strong>{activity.title}</strong>
                        <span>{activity.date}</span>
                      </div>

                      <p>{activity.xp}</p>
                    </div>
                  ))}
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