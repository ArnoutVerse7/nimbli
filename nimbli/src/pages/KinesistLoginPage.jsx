import { useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logos/nimbli-logo.png'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import PageShell from '../components/PageShell'

function KinesistLoginPage({ onNavigate }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setIsLoading(true)

        const { data, error } = await supabase
            .from('kinesists')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single()

        setIsLoading(false)

        if (error || !data) {
            alert('Ongeldig e-mailadres of wachtwoord')
            return
        }

        onNavigate('kinesistDashboard')
    }

    return (
        <PageShell>
            <div className="status-bar" />

            <img src={logo} className="brand-logo" alt="nimbli logo" />

            <div className="hero-graphic" aria-hidden="true">
                <div className="circle large" />
                <div className="circle small" />
                <div className="bar bar-1" />
                <div className="bar bar-2" />
                <div className="bar bar-3" />
            </div>

            <div className="hero-copy">
                <h1>Kinesist login</h1>
                <p>Log in op je praktijkaccount of maak een nieuw account aan.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                <TextInput
                    label="E-mail"
                    placeholder="E-mail"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />

                <TextInput
                    label="Wachtwoord"
                    type="password"
                    placeholder="Wachtwoord"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Inloggen...' : 'Inloggen'}
                </Button>

                <Button
                    variant="secondary"
                    type="button"
                    onClick={() => onNavigate('kinesistSignup')}
                >
                    Account maken
                </Button>
            </form>

            <div className="footer-links">
                <a href="#">Privacy</a>
                <span className="separator">•</span>
                <a href="#">Gebruiksvoorwaarden</a>
            </div>
        </PageShell>
    )
}

export default KinesistLoginPage