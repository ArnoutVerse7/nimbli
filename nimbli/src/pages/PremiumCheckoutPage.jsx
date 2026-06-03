import { useEffect, useState } from 'react'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import checkIcon from '../assets/logos/check.png'
import '../styles/KinesistFlow.css'

export default function PremiumCheckoutPage({ onNavigate }) {
    const [member, setMember] = useState(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const savedMember = JSON.parse(localStorage.getItem('premiumTeamMember'))
        setMember(savedMember)
    }, [])

    const confirmUpgrade = () => {
        localStorage.setItem('nimbliPlan', 'premium')
        setSuccess(true)
    }

    return (
        <main className="kine-page">
            <aside className="child-sidebar">
                <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                <button className="sidebar-link" onClick={() => onNavigate('kinesistDashboard')}>
                    Dashboard
                </button>

                <button className="sidebar-link" onClick={() => onNavigate('kinesistExercises')}>
                    Oefeningen
                </button>

                <button className="sidebar-link active" onClick={() => onNavigate('kinesistSettings')}>
                    Instellingen
                </button>

                <button className="sidebar-link" onClick={() => onNavigate('login')}>
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

            <section className="kine-main">
                <header className="child-road-header">
                    <h1>Upgrade naar praktijkaccount</h1>
                </header>

                <div className="kine-content">
                    {!success ? (
                        <section className="new-patient-card checkout-card">
                            <p className="step-label">Stap 2 van 2</p>

                            <div className="step-progress">
                                <div className="active"></div>
                                <div className="active"></div>
                            </div>

                            <h2>Bevestig je upgrade</h2>

                            <div className="checkout-layout">
                                <div>
                                    <h3>Teamlid</h3>

                                    <div className="checkout-user-card">
                                        <strong>{member?.name || 'Nieuwe kinesist'}</strong>
                                        <span>{member?.email || 'kinesist@email.com'}</span>
                                        <p>{member?.role || 'Kinesist'}</p>
                                    </div>

                                    <h3>Betaalmethode</h3>

                                    <div className="payment-placeholder">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </div>

                                <aside className="checkout-summary">
                                    <h3>Samenvatting</h3>

                                    <div>
                                        <span>Praktijkaccount</span>
                                        <strong> €250</strong>
                                    </div>
                                    <div className="checkout-actions">
                                        <button
                                            className="primary-btn"
                                            onClick={confirmUpgrade}
                                        >
                                            Bevestigen
                                        </button>
                                    </div>
                                </aside>
                            </div>
                        </section>
                    ) : (
                        <section className="assign-success-card">
                            <img src={checkIcon} alt="" />
                            <h2>Praktijkaccount geactiveerd!</h2>
                            <p>Je extra kinesist werd toegevoegd aan je praktijk.</p>

                            <button className="primary-btn" onClick={() => onNavigate('kinesistSettings')}>
                                Terug naar instellingen
                            </button>
                        </section>
                    )}
                </div>
            </section>
        </main>
    )
}