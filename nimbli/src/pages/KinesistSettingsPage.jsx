import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import '../styles/KinesistFlow.css'
import { getCurrentUserAndProfile } from '../lib/auth'

export default function KinesistSettingsPage({ onNavigate }) {
    const [kinesist, setKinesist] = useState(null)
    const [subscription, setSubscription] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const [form, setForm] = useState({
        name: '',
        email: '',
        practiceName: '',
        location: '',
    })

    useEffect(() => {
        async function loadSettings() {
            const { profile: kinesistData, error: kinesistError } =
                await getCurrentUserAndProfile('kinesist')

            if (kinesistError) {
                console.error(kinesistError)
                return
            }

            setKinesist(kinesistData)

            setForm({
                name: kinesistData.full_name || '',
                email: kinesistData.email || '',
                practiceName: kinesistData.practice_name || '',
                location: kinesistData.location || '',
            })

            const { data: subscriptionData, error: subscriptionError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('kinesist_id', kinesistData.id)
                .maybeSingle()

            if (!subscriptionError) {
                setSubscription(subscriptionData)
            }
        }

        loadSettings()
    }, [])

    const saveProfile = async () => {
        if (!kinesist?.id) return

        setIsSaving(true)
        setErrorMessage('')
        setSuccessMessage('')

        const { data, error } = await supabase
            .from('profiles')
            .update({
                full_name: form.name.trim(),
                practice_name: form.practiceName.trim(),
                location: form.location.trim(),
            })
            .eq('id', kinesist.id)
            .select()
            .single()

        setIsSaving(false)

        if (error) {
            console.error(error)
            setErrorMessage('Fout bij opslaan')
            return
        }

        if (form.email.trim().toLowerCase() !== kinesist.email?.toLowerCase()) {
            const { error: emailError } = await supabase.auth.updateUser({
                email: form.email.trim().toLowerCase(),
            })

            if (emailError) {
                setErrorMessage('Profiel opgeslagen, maar het e-mailadres kon niet worden aangepast.')
                setKinesist(data)
                return
            }
        }

        setKinesist(data)
        setSuccessMessage('Profiel opgeslagen.')
    }

    const currentPlan = subscription?.plan || 'free'

    return (
        <main className="kine-page">
            <aside className="child-sidebar">
                <img src={logo} alt="Nimbli logo" className="child-sidebar-logo" />

                <button
                    className="sidebar-link"
                    onClick={() => onNavigate('kinesistDashboard')}
                >
                    Dashboard
                </button>

                <button
                    className="sidebar-link"
                    onClick={() => onNavigate('kinesistExercises')}
                >
                    Oefeningen
                </button>

                <button className="sidebar-link active">
                    Instellingen
                </button>

                <button
                    className="sidebar-link"
                    onClick={() => onNavigate('kinesistLogin')}
                >
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

            <section className="kine-main">
                <header className="child-road-header">
                    <h1>Instellingen</h1>
                </header>

                <div className="kine-content settings-layout">
                    <section className="patient-detail-card">
                        <h3>Mijn profiel</h3>

                        <div className="form-grid settings-form">
                            <label>
                                Naam
                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                Praktijknaam
                                <input
                                    value={form.practiceName}
                                    onChange={(e) =>
                                        setForm({ ...form, practiceName: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                E-mail
                                <input
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                Locatie
                                <input
                                    value={form.location}
                                    onChange={(e) =>
                                        setForm({ ...form, location: e.target.value })
                                    }
                                />
                            </label>
                        </div>
                        {errorMessage && (
                            <p
                                style={{
                                    color: '#dc2626',
                                    fontSize: '14px',
                                    marginTop: '12px',
                                }}
                            >
                                {errorMessage}
                            </p>
                        )}
                        {successMessage && (
                            <p
                                style={{
                                    color: '#16a34a',
                                    fontSize: '14px',
                                    marginTop: '12px',
                                }}
                            >
                                {successMessage}
                            </p>
                        )}
                        <button
                            className="primary-btn settings-save-btn"
                            onClick={saveProfile}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Opslaan...' : 'Opslaan'}
                        </button>
                    </section>

                    <section className="patient-detail-card">
                        <h3>Abonnement</h3>

                        <div className="plan-card current">
                            <span>Huidig plan</span>
                            <strong>
                                {currentPlan === 'premium' ? 'Premium' : 'Freemium'}
                            </strong>

                            <p>
                                {currentPlan === 'premium'
                                    ? 'Je praktijkaccount is actief.'
                                    : 'Beperkt aantal patiënten en oefeningen.'}
                            </p>
                        </div>

                        {currentPlan !== 'premium' && (
                            <div className="plan-card premium">
                                <span>Upgrade naar</span>
                                <strong>Premium</strong>
                                <p>
                                    Meerdere kinesisten, eigen video’s en uitgebreide
                                    rapportage.
                                </p>

                                <ul>
                                    <li>Extra kinesisten toevoegen</li>
                                    <li>Eigen oefeningen en video’s uploaden</li>
                                    <li>Extra voortgangsrapporten</li>
                                </ul>

                                <button
                                    className="primary-btn"
                                    onClick={() => onNavigate('premiumTeamSignup')}
                                >
                                    Upgraden naar Premium
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </main>
    )
}
