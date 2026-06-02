import { useState } from 'react'
import './App.css'
import LoginPage from './LoginPage'
import ActivationCodePage from './pages/ActivationCodePage'
import SignupPage from './pages/SignupPage'
import PinCreatePage from './pages/PinCreatePage'
import PinEntryPage from './pages/PinEntryPage'
import ProfileSelectionPage from './pages/ProfileSelectionPage'
import ProfileManagementPage from './pages/ProfileManagementPage'
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

const pageComponents = {
  login: LoginPage,
  activation: ActivationCodePage,
  signup: SignupPage,
  pinCreate: PinCreatePage,
  pinEntry: PinEntryPage,
  profileSelection: ProfileSelectionPage,
  manageProfiles: ProfileManagementPage,
  parentDashboard: ParentDashboardPage,
  childDashboard: ChildDashboardPage,
  progress: ProgressPage,
  childMissions: ChildMissionsPage,
  childProfile: ChildProfilePage,
  kinesistDashboard: KinesistDashboardPage,
  newPatientFlow: NewPatientFlowPage,
}

function App() {
  const [page, setPage] = useState('login')

  // Parse page string for parameterized routes (e.g., 'exerciseDetails-1')
  const parsePageRoute = (pageRoute) => {
    if (pageRoute.startsWith('exerciseDetails-')) {
      const exerciseId = pageRoute.split('-')[1]
      return { component: ExerciseDetailsPage, props: { exerciseId } }
    }
    if (pageRoute.startsWith('exerciseExecution-')) {
      const exerciseId = pageRoute.split('-')[1]
      return { component: ExerciseExecutionPage, props: { exerciseId } }
    }
    if (pageRoute.startsWith('exerciseCompletion-')) {
      const exerciseId = pageRoute.split('-')[1]
      return { component: ExerciseCompletionPage, props: { exerciseId } }
    }

    // Regular page
    const Component = pageComponents[pageRoute] || LoginPage
    return { component: Component, props: {} }
  }

  const { component: CurrentPage, props: currentProps } = parsePageRoute(page)

  return <CurrentPage onNavigate={setPage} {...currentProps} />
}

export default App