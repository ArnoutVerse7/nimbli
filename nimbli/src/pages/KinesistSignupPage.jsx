import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'
import CheckboxField from '../components/CheckboxField'
import TextInput from '../components/TextInput'
import PageShell from '../components/PageShell'

export default function KinesistSignupPage({ onNavigate }) {
    const [accepted, setAccepted] = useState(false)

    const [form, setForm] = useState({
        name: '',
        practiceName: '',
        email: '',
        password: '',
        location: '',
    })

    const handleSubmit = async (event) => {
        event.preventDefault()

        const { error } = await supabase
            .from('kinesists')
            .insert([
                {
                    name: form.name,
                    email: form.email,
                    role: 'kinesist',
                },
            ])

        if (error) {
            console.error(error)
            alert('Fout bij account aanmaken')
            return
        }

        onNavigate('kinesistDashboard')
    }

    return (
        <PageShell>
            <div className="status-bar" />

            <div className="page-row">
                <Button variant="icon" type="button" onClick={() => onNavigate('kinesistLogin')}>
                    ←
                </Button>
                <span className="page-label">Terug naar login</span>
            </div>

            <div className="hero-copy">
                <h1>Maak een kinesistaccount aan.</h1>
                <p>Registreer je praktijk en start met Nimbli.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                <TextInput
                    label="Naam"
                    placeholder="Bijv. Anne Peeters"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                />

                <TextInput
                    label="Praktijknaam"
                    placeholder="Bijv. Kinderkine Mechelen"
                    value={form.practiceName}
                    onChange={(event) => setForm({ ...form, practiceName: event.target.value })}
                />

                <TextInput
                    label="Locatie"
                    placeholder="Bijv. Stationsstraat 12, Mechelen"
                    value={form.location}
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                />

                <TextInput
                    label="E-mail"
                    type="email"
                    placeholder="E-mail"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                />

                <TextInput
                    label="Wachtwoord"
                    type="password"
                    placeholder="Wachtwoord"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                />

                <CheckboxField
                    label="Ik ga akkoord met de gebruiksvoorwaarden en privacy overeenkomsten."
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                />

                <Button type="submit" disabled={!accepted}>
                    Account aanmaken
                </Button>
            </form>
        </PageShell>
    )
}