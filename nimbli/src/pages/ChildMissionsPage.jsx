import '../styles/ChildFlow.css'

import logo from '../assets/logos/nimbli-logo.png'
import trophyIcon from '../assets/logos/trophy.png'
import starIcon from '../assets/logos/star.png'
import streakIcon from '../assets/logos/streak.png'
import checkIcon from '../assets/logos/check.png'
import lockIcon from '../assets/logos/lock.png'
import exitIcon from '../assets/logos/exit.png'

export default function ChildMissionsPage({ onNavigate }) {
    const missions = [
        { title: 'Complete 1 oefening', progress: '80%', icon: checkIcon },
        { title: 'Verdien 10 XP', progress: '60%', icon: starIcon },
        { title: 'Completeer je dagmissies', progress: '35%', icon: trophyIcon },
    ]

    return (
        <main className="child-road-page">
            <section className="child-dashboard-shell">
                <aside className="child-sidebar">
                    <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                    <button className="sidebar-link" onClick={() => onNavigate('childDashboard')}>
                        Dashboard
                    </button>

                    <button className="sidebar-link active" onClick={() => onNavigate('childMissions')}>
                        Dagelijkse missies
                    </button>

                    <button className="sidebar-link" onClick={() => onNavigate('childProfile')}>
                        Profiel
                    </button>
                    <button className="sidebar-link" onClick={() => onNavigate('login')}>
                        <img src={exitIcon} alt="Uitloggen" />
                    </button>
                </aside>

                <section className="child-main-area">
                    <header className="child-road-header">
                        <h1>Dagelijkse missies</h1>

                        <div className="child-road-stats">
                            <span><img src={trophyIcon} alt="" /> 3</span>
                            <span><img src={starIcon} alt="" /> 12 XP</span>
                            <span><img src={streakIcon} alt="" /> 20 days</span>
                        </div>
                    </header>

                    <div className="missions-content">
                        {missions.map((mission, index) => (
                            <div className="mission-card" key={index}>
                                <div className="mission-icon">
                                    <img src={mission.icon} alt="" />
                                </div>

                                <div className="mission-info">
                                    <strong>{mission.title}</strong>
                                    <div className="mission-progress">
                                        <div style={{ width: mission.progress }} />
                                    </div>
                                </div>

                                <div className="mission-reward">
                                    <img src={lockIcon} alt="" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </section>
        </main>
    )
}