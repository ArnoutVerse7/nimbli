import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import checkIcon from '../assets/logos/check.png'
import KinesistSidebar from '../components/KinesistSidebar'
import IconBadge from '../components/IconBadge'
import '../styles/KinesistFlow.css'

export default function PremiumCheckoutPage({ onNavigate }) {
    const [member, setMember] = useState(null)
    const [mainKinesist, setMainKinesist] = useState(null)
    const [success, setSuccess] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        async function loadData() {
            const { data: userData } = await supabase.auth.getUser()

            if (!userData.user) return

            const { data: mainData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userData.user.id)
                .single()

            setMainKinesist(mainData)

            const pendingMember = sessionStorage.getItem('pendingTeamMember')

            if (pendingMember) {
                setMember(JSON.parse(pendingMember))
            }
        }

        loadData()
    }, [])

    const confirmUpgrade = async () => {
        if (!mainKinesist?.id) return

        setIsSaving(true)

        const { error } = await supabase
            .from('subscriptions')
            .upsert(
                {
                    kinesist_id: mainKinesist.id,
                    plan: 'premium',
                    status: 'active',
                },
                { onConflict: 'kinesist_id' }
            )

        setIsSaving(false)

        if (error) {
            console.error(error)
            alert('Fout bij activeren van premium')
            return
        }

        setSuccess(true)
        sessionStorage.removeItem('pendingTeamMember')
    }

    return (
        <main className="kine-page">
            <KinesistSidebar active="settings" onNavigate={onNavigate} />

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
                                        <p>{member?.role || 'kinesist'}</p>
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
                                        <strong>€250</strong>
                                    </div>

                                    <div className="checkout-actions">
                                        <button
                                            className="primary-btn"
                                            onClick={confirmUpgrade}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Activeren...' : 'Bevestigen'}
                                        </button>
                                    </div>
                                </aside>
                            </div>
                        </section>
                    ) : (
                        <section className="assign-success-card">
                            <IconBadge src={checkIcon} className="assign-success-icon" />
                            <h2>Praktijkaccount geactiveerd!</h2>
                            <p>Je abonnement werd bijgewerkt naar Premium.</p>

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
