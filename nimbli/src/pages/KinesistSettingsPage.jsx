import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import '../styles/KinesistFlow.css'

export default function KinesistSettingsPage({ onNavigate }) {
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

                <button className="sidebar-link active">
                    Instellingen
                </button>

                <button className="sidebar-link" onClick={() => onNavigate('login')}>
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

            <section className="kine-main">
                <header className="child-road-header">
                </header>

                <div className="kine-content settings-layout">
                    <section className="patient-detail-card">
                        <h3>Mijn profiel</h3>

                        <div className="form-grid settings-form">
                            <label>
                                Naam
                                <input defaultValue="Anne Peeters" />
                            </label>

                            <label>
                                Praktijknaam
                                <input defaultValue="Kinderkine Mechelen" />
                            </label>

                            <label>
                                E-mail
                                <input defaultValue="anne.peeters@email.com" />
                            </label>

                            <label>
                                Locatie
                                <input defaultValue="Stationsstraat 12, Mechelen" />
                            </label>
                        </div>

                        <button className="primary-btn settings-save-btn">
                            Opslaan
                        </button>
                    </section>

                    <section className="patient-detail-card">
                        <h3>Abonnement</h3>

                        <div className="plan-card current">
                            <span>Huidig plan</span>
                            <strong>Freemium</strong>
                            <p>Beperkt aantal patiënten en oefeningen.</p>
                        </div>

                        <div className="plan-card premium">
                            <span>Upgrade naar</span>
                            <strong>Premium</strong>
                            <p>Onbeperkte patiënten, eigen video’s en uitgebreide rapportage.</p>

                            <ul>
                                <li>Onbeperkt patiënten toevoegen</li>
                                <li>Eigen oefeningen en video’s uploaden</li>
                                <li>Extra voortgangsrapporten</li>
                            </ul>

                            <button className="primary-btn" onClick={() => onNavigate('premiumTeamSignup')}>
                                Upgraden naar Premium
                            </button>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    )
}