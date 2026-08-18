import logo from '../assets/logos/nimbli-logo.png'
import userIcon from '../assets/logos/user.png'
import profileIcon from '../assets/logos/profile.png'
import '../styles/Start.css'

export default function StartPage({ onNavigate }) {
    return (
        <main className="start-page">
            <div className="start-layout">
                <section className="start-hero">
                    <img src={logo} alt="Nimbli" className="start-logo" />

                    <div className="start-hero-copy">
                        <h1>Welkom bij Nimbli</h1>
                        <p>
                            Een centrale omgeving voor kinesisten, ouders en kinderen.
                        </p>
                    </div>

                    <div className="start-footer">
                        <a href="#">Privacy</a>
                        <span>·</span>
                        <a href="#">Gebruiksvoorwaarden</a>
                    </div>
                </section>

                <section className="start-choice-panel">
                    <div className="start-choice-copy">
                        <h2>Hoe wil je inloggen?</h2>
                        <p>Kies de omgeving die bij jou past.</p>
                    </div>

                    <div className="start-page-selection">
                        <button
                            className="user-type-card"
                            onClick={() => onNavigate('kinesistLogin')}
                        >
                            <div className="user-type-icon">
                                <img src={userIcon} alt="" />
                            </div>

                            <div className="user-type-content">
                                <strong>Kinesist</strong>
                                <p>Beheer patiënten, oefeningen en voortgang.</p>
                            </div>

                            <span className="user-type-arrow" aria-hidden="true">→</span>
                        </button>

                        <button
                            className="user-type-card"
                            onClick={() => onNavigate('login')}
                        >
                            <div className="user-type-icon">
                                <img src={profileIcon} alt="" />
                            </div>

                            <div className="user-type-content">
                                <strong>Ouder of kind</strong>
                                <p>Bekijk oefeningen of meld je aan met je code.</p>
                            </div>

                            <span className="user-type-arrow" aria-hidden="true">→</span>
                        </button>
                    </div>
                </section>
            </div>
        </main>
    )
}
