import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'
import CheckboxField from '../components/CheckboxField'
import TextInput from '../components/TextInput'
import PageShell from '../components/PageShell'

export default function KinesistSignupPage({ onNavigate }) {
    const [accepted, setAccepted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [form, setForm] = useState({
        name: '',
        practiceName: '',
        email: '',
        password: '',
        location: '',
    })

    const handleSubmit = async (event) => {
        event.preventDefault()
        setErrorMessage('')

        if (!form.name.trim() || !form.practiceName.trim() || !form.email.trim() || !form.password) {
            setErrorMessage('Vul alle verplichte velden in.')
            return
        }

        if (form.password.length < 8) {
            setErrorMessage('Je wachtwoord moet minstens 8 tekens bevatten.')
            return
        }

        setIsLoading(true)

        const { data, error } = await supabase.auth.signUp({
            email: form.email.trim().toLowerCase(),
            password: form.password,
            options: {
                data: {
                    full_name: form.name.trim(),
                    role: 'kinesist',
                    practice_name: form.practiceName.trim(),
                    location: form.location.trim(),
                },
            },
        })

        setIsLoading(false)

        if (error) {
            console.error(error)
            setErrorMessage(error.message || 'Fout bij account aanmaken.')
            return
        }

        if (!data.session) {
            localStorage.setItem(
                'authNotice',
                'Account aangemaakt. Bevestig indien nodig je e-mailadres en log daarna in.'
            )
            onNavigate('kinesistLogin')
            return
        }

        onNavigate('kinesistDashboard')
    }

    return (
        <PageShell activeRole="kinesist" onNavigate={onNavigate}>
            <div className="page-row">
                <Button variant="icon" type="button" onClick={() => onNavigate('kinesistLogin')}>
                    ←
                </Button>
                <span className="page-label">Terug naar login</span>
            </div>

            <div className="hero-copy">
                <h1>Maak een account aan.</h1>
                <p>Vul je gegevens in om je praktijk te registreren.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                <TextInput
                    label="Naam"
                    placeholder="Bijv. Anne Peeters"
                    value={form.name}
                    autoComplete="name"
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                />

                <TextInput
                    label="Praktijknaam"
                    placeholder="Bijv. Kinderkine Mechelen"
                    value={form.practiceName}
                    autoComplete="organization"
                    onChange={(event) => setForm({ ...form, practiceName: event.target.value })}
                />

                <TextInput
                    label="Locatie"
                    placeholder="Bijv. Stationsstraat 12, Mechelen"
                    value={form.location}
                    autoComplete="street-address"
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                />

                <TextInput
                    label="E-mail"
                    type="email"
                    placeholder="E-mail"
                    value={form.email}
                    autoComplete="email"
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                />

                <TextInput
                    label="Wachtwoord"
                    type="password"
                    placeholder="Wachtwoord"
                    value={form.password}
                    autoComplete="new-password"
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                />

                <CheckboxField
                    label="Ik ga akkoord met de gebruiksvoorwaarden en privacy overeenkomsten."
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                />

                {errorMessage && (
                    <p className="form-error-message">{errorMessage}</p>
                )}

                <Button type="submit" disabled={!accepted || isLoading}>
                    {isLoading ? 'Account aanmaken...' : 'Account aanmaken'}
                </Button>
            </form>
        </PageShell>
    )
}
