import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/ChildFlow.css'
import ChildSidebar from '../components/ChildSidebar'

import mascotte from '../assets/logos/mascotte.png'
import trophyIcon from '../assets/logos/trophy.png'
import starIcon from '../assets/logos/star.png'
import streakIcon from '../assets/logos/streak.png'
import checkIcon from '../assets/logos/check.png'
import lockIcon from '../assets/logos/lock.png'

export default function ChildProfilePage({ onNavigate }) {
    const [patient, setPatient] = useState(null)

    useEffect(() => {
        async function loadPatient() {
            const patientId = localStorage.getItem('patientId')

            if (!patientId) return

            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('id', patientId)
                .single()

            if (error) {
                console.error(error)
                return
            }

            setPatient(data)
        }

        loadPatient()
    }, [])
    return (
        <main className="child-road-page">
            <section className="child-dashboard-shell">
                <ChildSidebar active="profile" onNavigate={onNavigate} />

                <section className="child-main-area">
                    <header className="child-road-header">
                        <h1>Profiel</h1>

                        <div className="child-road-stats">
                            <span><img src={trophyIcon} alt="" /> 3</span>
                            <span><img src={starIcon} alt="" /> 12 XP</span>
                            <span><img src={streakIcon} alt="" /> 20 days</span>
                        </div>
                    </header>

                    <div className="profile-content">
                        <section className="profile-main-card">
                            <img src={mascotte} alt="Mascotte" className="profile-mascot" />
                            <h2>
                                {patient
                                    ? `${patient.first_name} ${patient.last_name}`
                                    : 'Profiel laden...'}
                            </h2>
                            
                            <div className="profile-stats-grid">
                                <div><strong>20</strong><span>dagen streak</span></div>
                                <div><strong>12</strong><span>XP verzameld</span></div>
                                <div><strong>7</strong><span>badges gehaald</span></div>
                            </div>
                        </section>

                        <section className="profile-side-card">
                            <h3>Dagmissies</h3>

                            <div className="mini-mission">
                                <img src={checkIcon} alt="" /> Complete 1 oefening
                            </div>
                            <div className="mini-mission">
                                <img src={starIcon} alt="" /> Verdien 10 XP
                            </div>
                            <div className="mini-mission">
                                <img src={lockIcon} alt="" /> Nieuwe badge ontgrendelen
                            </div>

                            <button className="large-cta-button" onClick={() => onNavigate('childDashboard')}>
                                Terug naar oefeningen
                            </button>
                        </section>
                    </div>
                </section>
            </section>
        </main>
    )
}
