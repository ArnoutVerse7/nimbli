import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import PageShell from '../components/PageShell'
import { signOutAndClearLocalData } from '../lib/auth'

function KinesistLoginPage({ onNavigate }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [noticeMessage, setNoticeMessage] = useState(() => {
        const message = localStorage.getItem('authNotice') || ''
        localStorage.removeItem('authNotice')
        return message
    })

    const handleSubmit = async (event) => {
        event.preventDefault()
        setErrorMessage('')
        setNoticeMessage('')
        setIsLoading(true)

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            })

            if (authError || !authData.user) {
                setErrorMessage('Ongeldig e-mailadres of wachtwoord.')
                return
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single()

            if (profileError || profile?.role !== 'kinesist') {
                await signOutAndClearLocalData()
                setErrorMessage('Dit is geen kinesistaccount. Gebruik de ouderlogin.')
                return
            }

            onNavigate('kinesistDashboard')
        } catch (error) {
            console.error(error)
            setErrorMessage('Er ging iets mis bij het inloggen.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <PageShell activeRole="kinesist" onNavigate={onNavigate}>
            <div className="hero-copy">
                <h1>Inloggen</h1>
                <p>Log in om naar het overzicht van je praktijk te gaan.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                <TextInput
                    label="E-mail"
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                />

                <TextInput
                    label="Wachtwoord"
                    type="password"
                    placeholder="Wachtwoord"
                    value={password}
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                />

                {errorMessage && (
                    <p className="form-error-message">{errorMessage}</p>
                )}

                {noticeMessage && (
                    <p className="form-success-message">{noticeMessage}</p>
                )}

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Inloggen...' : 'Inloggen'}
                </Button>

                <Button
                    variant="secondary"
                    type="button"
                    onClick={() => onNavigate('kinesistSignup')}
                >
                    Nieuwe praktijk? Maak een account
                </Button>
            </form>

        </PageShell>
    )
}

export default KinesistLoginPage
