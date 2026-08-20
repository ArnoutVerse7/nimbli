import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import { selectFirstPatientForParent, signOutAndClearLocalData } from './lib/auth'
import LoginPage from './LoginPage'
import ActivationCodePage from './pages/ActivationCodePage'
import SignupPage from './pages/SignupPage'
import ProfileSelectionPage from './pages/ProfileSelectionPage'
import ParentDashboardPage from './pages/ParentDashboardPage'
import ChildDashboardPage from './pages/ChildDashboardPage'
import ExerciseDetailsPage from './pages/ExerciseDetailsPage'
import ExerciseExecutionPage from './pages/ExerciseExecutionPage'
import ExerciseCompletionPage from './pages/ExerciseCompletionPage'
import ProgressPage from './pages/ProgressPage'
import ChildMissionsPage from './pages/ChildMissionsPage'
import ChildProfilePage from './pages/ChildProfilePage'
import KinesistDashboardPage from './pages/KinesistDashboardPage'
import NewPatientFlowPage from './pages/NewPatientFlowPage'
import KinesistPatientDetailPage from './pages/KinesistPatientDetailPage'
import KinesistExercisesPage from './pages/KinesistExercisesPage'
import KinesistExerciseDetailPage from './pages/KinesistExerciseDetailPage'
import AssignExercisePage from './pages/AssignExercisePage'
import NewExercisePage from './pages/NewExercisePage'
import KinesistSettingsPage from './pages/KinesistSettingsPage'
import PremiumTeamSignupPage from './pages/PremiumTeamSignupPage'
import PremiumCheckoutPage from './pages/PremiumCheckoutPage'
import KinesistLoginPage from './pages/KinesistLoginPage'
import KinesistSignupPage from './pages/KinesistSignupPage'

const pageComponents = {
  login: LoginPage,
  activation: ActivationCodePage,
  signup: SignupPage,
  kinesistLogin: KinesistLoginPage,
  kinesistSignup: KinesistSignupPage,
  profileSelection: ProfileSelectionPage,
  parentDashboard: ParentDashboardPage,
  childDashboard: ChildDashboardPage,
  progress: ProgressPage,
  childMissions: ChildMissionsPage,
  childProfile: ChildProfilePage,
  kinesistDashboard: KinesistDashboardPage,
  newPatientFlow: NewPatientFlowPage,
  kinesistPatientDetail: KinesistPatientDetailPage,
  kinesistExercises: KinesistExercisesPage,
  newExercise: NewExercisePage,
  kinesistSettings: KinesistSettingsPage,
  premiumTeamSignup: PremiumTeamSignupPage,
  premiumCheckout: PremiumCheckoutPage,
}

function App() {
  const [page, setPage] = useState('kinesistLogin')
  const [isRestoringSession, setIsRestoringSession] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user

      if (!user) {
        if (isMounted) setIsRestoringSession(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (!isMounted) return

      if (profile?.role === 'kinesist') {
        setPage('kinesistDashboard')
      } else if (profile?.role === 'parent') {
        const { patient } = await selectFirstPatientForParent(user.id)
        setPage(patient ? 'profileSelection' : 'activation')
      }

      setIsRestoringSession(false)
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const handleNavigate = useCallback(async (nextPage) => {
    const protectedPages = [
      'profileSelection',
      'parentDashboard',
      'childDashboard',
      'progress',
      'childMissions',
      'childProfile',
      'kinesistDashboard',
      'newPatientFlow',
      'kinesistPatientDetail',
      'kinesistExercises',
      'newExercise',
      'kinesistSettings',
      'premiumTeamSignup',
      'premiumCheckout',
    ]

    const isProtectedRoute =
      protectedPages.includes(page) ||
      page.startsWith('exercise') ||
      page.startsWith('assignExercise-') ||
      page.startsWith('kinesistExerciseDetail-') ||
      page.startsWith('editExercise-') ||
      page.startsWith('premiumCheckout-')

    if ((nextPage === 'login' || nextPage === 'kinesistLogin') && isProtectedRoute) {
      await signOutAndClearLocalData()
    }

    setPage(nextPage)
  }, [page])

  const parsePageRoute = (pageRoute) => {
    if (pageRoute.startsWith('exerciseDetails-')) {
      const exerciseId = pageRoute.replace('exerciseDetails-', '')
      return { component: ExerciseDetailsPage, props: { exerciseId } }
    }

    if (pageRoute.startsWith('exerciseExecution-')) {
      const exerciseId = pageRoute.replace('exerciseExecution-', '')
      return { component: ExerciseExecutionPage, props: { exerciseId } }
    }

    if (pageRoute.startsWith('exerciseCompletion-')) {
      const exerciseId = pageRoute.replace('exerciseCompletion-', '')
      return { component: ExerciseCompletionPage, props: { exerciseId } }
    }

    if (pageRoute.startsWith('kinesistExerciseDetail-')) {
      const exerciseId = pageRoute.replace('kinesistExerciseDetail-', '')
      return { component: KinesistExerciseDetailPage, props: { exerciseId } }
    }

    if (pageRoute.startsWith('assignExercise-')) {
      const exerciseId = pageRoute.replace('assignExercise-', '')
      return { component: AssignExercisePage, props: { exerciseId } }
    }

    if (pageRoute.startsWith('editExercise-')) {
      const exerciseId = pageRoute.replace('editExercise-', '')
      return { component: NewExercisePage, props: { exerciseId } }
    }

    if (pageRoute.startsWith('premiumCheckout-')) {
      const memberId = pageRoute.replace('premiumCheckout-', '')
      return { component: PremiumCheckoutPage, props: { memberId } }
    }

    const Component = pageComponents[pageRoute] || LoginPage
    return { component: Component, props: {} }
  }

  if (isRestoringSession) {
    return <div className="app-loading">Nimbli laden...</div>
  }

  const { component: CurrentPage, props: currentProps } = parsePageRoute(page)

  return <CurrentPage onNavigate={handleNavigate} {...currentProps} />
}

export default App
