import logo from '../assets/logos/nimbli-logo.png'
import userIcon from '../assets/logos/user.png'
import profileIcon from '../assets/logos/profile.png'
import '../styles/Start.css'

export default function StartPage({ onNavigate }) {
    return (
        <main className="start-page">
            <section className="start-page-card">
                <img
                    src={logo}
                    alt="Nimbli logo"
                    className="login-logo"
                />

                <h1>Welkom bij Nimbli</h1>

                <p className="start-page-subtitle">
                    Kies hoe je Nimbli wil gebruiken.
                </p>

                <div className="start-page-selection">
                    <button
                        className="user-type-card"
                        onClick={() => onNavigate('kinesistLogin')}                    >
                        <div className="user-type-icon"><img src={userIcon} alt="Kinesist logo" /></div>

                        <div>
                            <strong>Ik ben kinesist</strong>
                            <p>
                                Beheer patiënten, oefeningen en voortgang.
                            </p>
                        </div>
                    </button>

                    <button
                        className="user-type-card"
                        onClick={() => onNavigate('login')}
                    >
                        <div className="user-type-icon"><img src={profileIcon} alt="Ouder of kind logo" /></div>

                        <div>
                            <strong>Ik ben ouder of kind</strong>
                            <p>
                                Meld je aan met een activatiecode van je kinesist.
                            </p>
                        </div>
                    </button>
                </div>
            </section>
        </main>
    )
}