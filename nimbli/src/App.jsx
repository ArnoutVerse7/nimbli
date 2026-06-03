import { useState } from 'react'
import './App.css'
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
import StartPage from './pages/StartPage'
import KinesistLoginPage from './pages/KinesistLoginPage'
import KinesistSignupPage from './pages/KinesistSignupPage'

const pageComponents = {
  login: LoginPage,
  activation: ActivationCodePage,
  signup: SignupPage,
  kinesistLogin: KinesistLoginPage,
  kinesistSignup: KinesistSignupPage,
  start: StartPage,
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
  const [page, setPage] = useState('start')

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

    if (pageRoute.startsWith('premiumCheckout-')) {
      const memberId = pageRoute.replace('premiumCheckout-', '')
      return { component: PremiumCheckoutPage, props: { memberId } }
    }

    if (pageRoute.startsWith('premiumCheckout-')) {
      const memberId = pageRoute.replace('premiumCheckout-', '')
      return { component: PremiumCheckoutPage, props: { memberId } }
    }

    const Component = pageComponents[pageRoute] || LoginPage
    return { component: Component, props: {} }
  }

  const { component: CurrentPage, props: currentProps } = parsePageRoute(page)

  return <CurrentPage onNavigate={setPage} {...currentProps} />
}

export default App