import { useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logos/nimbli-logo.png'
import exitIcon from '../assets/logos/exit.png'
import '../styles/KinesistFlow.css'

export default function PremiumTeamSignupPage({ onNavigate }) {
    const [teamMember, setTeamMember] = useState({
        name: '',
        email: '',
        role: '',
    })

    const [isSaving, setIsSaving] = useState(false)

    const saveTeamMember = async () => {
        setIsSaving(true)

        const { data, error } = await supabase
            .from('kinesists')
            .upsert(
                {
                    name: teamMember.name || 'Nieuwe kinesist',
                    email: teamMember.email || 'kinesist@email.com',
                    role: teamMember.role || 'kinesist',
                },
                { onConflict: 'email' }
            )
            .select()
            .single()

        if (error) {
            console.error(error)
            alert('Fout bij opslaan van teamlid')
            setIsSaving(false)
            return
        }

        setIsSaving(false)
        onNavigate(`premiumCheckout-${data.id}`)
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

                <button className="sidebar-link" onClick={() => onNavigate('kinesistLogin')}>
                    <img src={exitIcon} alt="" />
                </button>
            </aside>

            <section className="kine-main">
                <header className="child-road-header">
                    <h1>Nieuwe gebruiker toevoegen</h1>
                </header>

                <div className="kine-content">
                    <button className="patient-back-btn" onClick={() => onNavigate('kinesistSettings')}>
                        ← Terug naar instellingen
                    </button>

                    <section className="new-patient-card">
                        <p className="step-label">Stap 1 van 2</p>

                        <div className="step-progress">
                            <div className="active"></div>
                            <div></div>
                        </div>

                        <h2>Teamlid toevoegen</h2>
                        <p>Voeg een extra kinesist toe aan je praktijkaccount.</p>

                        <div className="form-grid">
                            <label>
                                Naam
                                <input
                                    placeholder="Bijv. Tom Janssens"
                                    value={teamMember.name}
                                    onChange={(e) => setTeamMember({ ...teamMember, name: e.target.value })}
                                />
                            </label>

                            <label>
                                E-mail
                                <input
                                    placeholder="Bijv. tom@email.com"
                                    value={teamMember.email}
                                    onChange={(e) => setTeamMember({ ...teamMember, email: e.target.value })}
                                />
                            </label>

                            <label>
                                Rol
                                <input
                                    placeholder="Bijv. kinesist"
                                    value={teamMember.role}
                                    onChange={(e) => setTeamMember({ ...teamMember, role: e.target.value })}
                                />
                            </label>
                        </div>

                        <div className="upgrade-actions">
                            <button
                                className="primary-btn"
                                onClick={saveTeamMember}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Opslaan...' : 'Volgende'}
                            </button>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    )
}