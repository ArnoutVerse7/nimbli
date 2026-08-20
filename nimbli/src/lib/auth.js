import { supabase } from './supabase'

export async function getCurrentUserAndProfile(expectedRole) {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
        return { user: null, profile: null, error: userError || new Error('Niet ingelogd.') }
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()

    if (profileError || !profile) {
        return { user: userData.user, profile: null, error: profileError || new Error('Profiel niet gevonden.') }
    }

    if (expectedRole && profile.role !== expectedRole) {
        return {
            user: userData.user,
            profile,
            error: new Error(`Dit account is geen ${expectedRole}account.`),
        }
    }

    return { user: userData.user, profile, error: null }
}

export async function selectFirstPatientForParent(parentId) {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true })
        .limit(1)

    if (error) {
        return { patient: null, error }
    }

    const patient = data?.[0] || null

    if (patient) {
        localStorage.setItem('patientId', patient.id)
    } else {
        localStorage.removeItem('patientId')
    }

    return { patient, error: null }
}

export async function signOutAndClearLocalData() {
    await supabase.auth.signOut()
    localStorage.removeItem('patientId')
    localStorage.removeItem('selectedPatient')
    localStorage.removeItem('pendingActivationCode')
    sessionStorage.removeItem('pendingTeamMember')
}
