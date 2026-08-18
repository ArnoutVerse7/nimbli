import logo from '../assets/logos/nimbli-logo.png'
import userIcon from '../assets/logos/user.png'
import profileIcon from '../assets/logos/profile.png'
import mascot from '../assets/logos/mascotte.png'
import '../styles/Start.css'

export default function StartPage({ onNavigate }) {
    return (
        <main className="start-page">
            <div className="start-layout">
                <section className="start-hero">
                    <img src={logo} alt="Nimbli" className="start-logo" />

                    <div className="start-hero-copy">
                        <span className="start-kicker">Digitale kinderrevalidatie</span>
                        <h1>Elke oefening wordt een stap vooruit.</h1>
                        <p>
                            Nimbli helpt kinderen thuis oefenen en geeft kinesisten en
                            ouders zicht op hun vooruitgang.
                        </p>
                    </div>

                    <img src={mascot} alt="" className="start-mascot" aria-hidden="true" />
                    <div className="start-decoration start-decoration--one" aria-hidden="true" />
                    <div className="start-decoration start-decoration--two" aria-hidden="true" />
                </section>

                <section className="start-choice-panel">
                    <div className="start-choice-copy">
                        <span className="start-choice-eyebrow">Welkom bij Nimbli</span>
                        <h2>Hoe wil je verdergaan?</h2>
                        <p>Kies jouw omgeving om veilig aan te melden.</p>
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

                    <p className="start-choice-note">
                        Je gegevens worden veilig bewaard en zijn alleen zichtbaar voor
                        gekoppelde accounts.
                    </p>
                </section>
            </div>
        </main>
    )
}
