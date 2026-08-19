import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getCurrentUserAndProfile } from '../lib/auth'
import { getExerciseCover } from '../lib/exerciseMedia'
import ParentSidebar from '../components/ParentSidebar'
import profileIcon from '../assets/logos/profile.png'
import checkIcon from '../assets/logos/check.png'
import '../styles/ParentDashboard.css'

const sameDay = (firstDate, secondDate) => {
  if (!firstDate || !secondDate) return false

  const first = new Date(firstDate)
  const second = new Date(secondDate)

  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate()
}

const getCurrentWeek = () => {
  const today = new Date()
  const monday = new Date(today)
  const day = today.getDay() || 7
  monday.setDate(today.getDate() - day + 1)
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date
  })
}

const formatShortDate = (date) =>
  new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'short' }).format(date)

function ExerciseRow({ assignment, showProgress = false }) {
  const exercise = assignment.exercises
  const coverImage = getExerciseCover(exercise)
  const progress = assignment.completion_percentage || 0

  return (
    <article className="parent-exercise-row">
      <div className="parent-exercise-thumb">
        {coverImage ? (
          <img src={coverImage} alt={exercise?.title || 'Oefening'} />
        ) : (
          <span>{exercise?.title?.slice(0, 1) || 'O'}</span>
        )}
      </div>

      <div className="parent-exercise-copy">
        <strong>{exercise?.title || 'Oefening'}</strong>
        <span>
          {exercise?.duration || '2 min'} · {exercise?.reps || '10 herhalingen'}
        </span>
        {showProgress && (
          <div className="parent-inline-progress">
            <div style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <span className={`parent-status-pill ${assignment.completed ? 'done' : 'open'}`}>
        {assignment.completed ? 'Voltooid' : `${progress}%`}
      </span>
    </article>
  )
}

function RecentActivityList({ activities }) {
  if (!activities.length) {
    return <p className="parent-empty-text">Nog geen activiteiten geregistreerd.</p>
  }

  return activities.map((item) => (
    <div className="parent-recent-item" key={item.id}>
      <img src={checkIcon} alt="" />
      <div>
        <strong>{item.exercises?.title || 'Oefening'}</strong>
        <span>{new Date(item.completed_at).toLocaleDateString('nl-BE')}</span>
      </div>
      <b>+{item.xp_earned || 0} XP</b>
    </div>
  ))
}

export default function ParentDashboardPage({ onNavigate }) {
  const [activeView, setActiveView] = useState('dashboard')
  const [patient, setPatient] = useState(null)
  const [parentProfile, setParentProfile] = useState(null)
  const [assignedExercises, setAssignedExercises] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')
  const [profileForm, setProfileForm] = useState({ fullName: '' })
  const [notifications, setNotifications] = useState({
    exerciseReminder: true,
    progressUpdates: true,
    weeklySummary: true,
  })

  useEffect(() => {
    async function loadParentData() {
      const patientId = localStorage.getItem('patientId')
      const { profile, error: profileError } = await getCurrentUserAndProfile('parent')

      if (profileError || !profile) {
        console.error(profileError)
        onNavigate('login')
        return
      }

      setParentProfile(profile)
      setProfileForm({ fullName: profile.full_name || '' })

      const storedNotifications = localStorage.getItem(`parentNotifications-${profile.id}`)
      if (storedNotifications) {
        try {
          setNotifications(JSON.parse(storedNotifications))
        } catch {
          localStorage.removeItem(`parentNotifications-${profile.id}`)
        }
      }

      if (!patientId) return

      const [patientResult, exerciseResult] = await Promise.all([
        supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single(),
        supabase
          .from('patient_exercises')
          .select('*, exercises (*)')
          .eq('patient_id', patientId)
          .order('assigned_at', { ascending: false }),
      ])

      if (patientResult.error) {
        console.error(patientResult.error)
      } else {
        setPatient(patientResult.data)
      }

      if (exerciseResult.error) {
        console.error(exerciseResult.error)
      } else {
        setAssignedExercises(exerciseResult.data || [])
      }
    }

    loadParentData()
  }, [onNavigate])

  const weekDays = useMemo(() => getCurrentWeek(), [])
  const completedExercises = assignedExercises.filter((item) => item.completed)
  const overallProgress = assignedExercises.length
    ? Math.round(
      assignedExercises.reduce(
        (total, item) => total + (item.completion_percentage || 0),
        0
      ) / assignedExercises.length
    )
    : 0
  const totalXp = assignedExercises.reduce((total, item) => total + (item.xp_earned || 0), 0)
  const activityPerDay = weekDays.map((date) => ({
    date,
    count: completedExercises.filter((item) => sameDay(item.completed_at, date)).length,
  }))
  const maxDailyActivity = Math.max(...activityPerDay.map((item) => item.count), 1)
  const recentActivities = [...completedExercises]
    .sort((first, second) => new Date(second.completed_at || 0) - new Date(first.completed_at || 0))
    .slice(0, 4)
  const selectedDayExercises = sameDay(selectedDate, new Date())
    ? assignedExercises
    : completedExercises.filter((item) => sameDay(item.completed_at, selectedDate))
  const categoryProgress = Object.values(
    assignedExercises.reduce((categories, item) => {
      const category = item.exercises?.category || 'Overig'
      const current = categories[category] || { label: category, total: 0, count: 0 }
      current.total += item.completion_percentage || 0
      current.count += 1
      categories[category] = current
      return categories
    }, {})
  ).map((item) => ({ ...item, progress: Math.round(item.total / item.count) }))

  const saveProfile = async () => {
    if (!parentProfile?.id || !profileForm.fullName.trim()) return

    setIsSaving(true)
    setSettingsMessage('')

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: profileForm.fullName.trim() })
      .eq('id', parentProfile.id)
      .select()
      .single()

    setIsSaving(false)

    if (error) {
      console.error(error)
      setSettingsMessage('Je profiel kon niet worden opgeslagen.')
      return
    }

    setParentProfile(data)
    setIsEditingProfile(false)
    setSettingsMessage('Je profiel werd opgeslagen.')
  }

  const toggleNotification = (key) => {
    setNotifications((current) => {
      const next = { ...current, [key]: !current[key] }
      if (parentProfile?.id) {
        localStorage.setItem(`parentNotifications-${parentProfile.id}`, JSON.stringify(next))
      }
      return next
    })
  }

  const pageTitles = {
    dashboard: 'Dashboard',
    schedule: 'Oefenplanning',
    settings: 'Instellingen',
  }

  return (
    <main className="parent-page">
      <ParentSidebar
        active={activeView}
        onSelect={setActiveView}
        onLogout={() => onNavigate('login')}
      />

      <section className="parent-main">
        <header className="parent-topbar">
          <div>
            <span>Ouderportaal</span>
            <h1>{pageTitles[activeView]}</h1>
          </div>
          <div className="parent-account-avatar" title={parentProfile?.full_name || 'Ouder'}>
            {(parentProfile?.full_name || 'O').slice(0, 1).toUpperCase()}
          </div>
        </header>

        {activeView !== 'settings' && (
          <section className="parent-patient-header">
            <div className="parent-child-avatar">
              <img src={profileIcon} alt="Profiel" />
            </div>
            <div>
              <h2>
                {patient ? `${patient.first_name} ${patient.last_name}` : 'Kindprofiel laden...'}
              </h2>
              <div className="parent-child-meta">
                <span><strong>{patient?.age || '-'}</strong> jaar</span>
                <span>{patient?.goal || 'Behandeldoel laden...'}</span>
              </div>
            </div>
          </section>
        )}

        {activeView === 'dashboard' && (
          <div className="parent-content parent-dashboard-layout">
            <section className="parent-dashboard-primary">
              <section className="parent-week-strip-card">
                {weekDays.map((date) => {
                  const count = completedExercises.filter((item) => sameDay(item.completed_at, date)).length
                  const isToday = sameDay(date, new Date())
                  const isPast = date < new Date() && !isToday

                  return (
                    <div className="parent-week-day" key={date.toISOString()}>
                      <span>{date.toLocaleDateString('nl-BE', { weekday: 'short' }).slice(0, 2)}</span>
                      <div className={`parent-week-dot ${count ? 'done' : isToday ? 'today' : isPast ? 'past' : ''}`}>
                        {count ? '✓' : isToday ? date.getDate() : ''}
                      </div>
                    </div>
                  )
                })}
              </section>

              <section className="parent-summary-grid">
                <div className="parent-summary-item"><span>Totale voortgang</span><strong>{overallProgress}%</strong></div>
                <div className="parent-summary-item"><span>Voltooide oefeningen</span><strong>{completedExercises.length}/{assignedExercises.length}</strong></div>
                <div className="parent-summary-item"><span>Verdiende XP</span><strong>{totalXp}</strong></div>
              </section>

              <section className="parent-card parent-chart-card">
                <div className="parent-section-title">
                  <div><span>Deze week</span><h3>Oefenactiviteit</h3></div>
                  <strong>{completedExercises.length} voltooid</strong>
                </div>

                <div className="parent-bar-chart" aria-label="Voltooide oefeningen per dag">
                  {activityPerDay.map(({ date, count }) => (
                    <div className="parent-chart-column" key={date.toISOString()}>
                      <div className="parent-chart-value"><div style={{ height: `${(count / maxDailyActivity) * 100}%` }} /></div>
                      <span>{date.toLocaleDateString('nl-BE', { weekday: 'short' }).slice(0, 2)}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="parent-card parent-category-card">
                <div className="parent-section-title"><h3>Voortgang per categorie</h3></div>
                {categoryProgress.length ? (
                  <div className="parent-metrics">
                    {categoryProgress.map((metric) => (
                      <div className="parent-metric" key={metric.label}>
                        <div><span>{metric.label}</span><strong>{metric.progress}%</strong></div>
                        <div className="parent-bar"><div style={{ width: `${metric.progress}%` }} /></div>
                      </div>
                    ))}
                  </div>
                ) : <p className="parent-empty-text">Nog geen voortgang beschikbaar.</p>}
              </section>
            </section>

            <aside className="parent-dashboard-side">
              <section className="parent-side-section">
                <div className="parent-section-title"><h3>Oefeningen van vandaag</h3><button onClick={() => setActiveView('schedule')}>Bekijk planning</button></div>
                <div className="parent-exercise-list">
                  {assignedExercises.length ? assignedExercises.slice(0, 3).map((item) => (
                    <ExerciseRow assignment={item} key={item.id} />
                  )) : <p className="parent-empty-text">Nog geen oefeningen toegewezen.</p>}
                </div>
              </section>

              <section className="parent-side-section">
                <div className="parent-section-title"><h3>Recente activiteiten</h3></div>
                <div className="parent-recent-list"><RecentActivityList activities={recentActivities} /></div>
              </section>
            </aside>
          </div>
        )}

        {activeView === 'schedule' && (
          <div className="parent-content parent-schedule-layout">
            <section className="parent-schedule-primary">
              <section className="parent-calendar-card">
                <div className="parent-calendar-heading">
                  <span />
                  <strong>{formatShortDate(weekDays[0])} – {formatShortDate(weekDays[6])}</strong>
                  <span />
                </div>
                <div className="parent-calendar-days">
                  {weekDays.map((date) => (
                    <button
                      key={date.toISOString()}
                      className={sameDay(date, selectedDate) ? 'active' : ''}
                      onClick={() => setSelectedDate(date)}
                    >
                      <span>{date.toLocaleDateString('nl-BE', { weekday: 'short' }).slice(0, 2)}</span>
                      <strong>{date.getDate()}</strong>
                    </button>
                  ))}
                </div>
              </section>

              <section className="parent-agenda-list">
                <div className="parent-agenda-heading">
                  <div><span>Geselecteerde dag</span><h2>{selectedDate.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}</h2></div>
                  <strong>{selectedDayExercises.length} oefeningen</strong>
                </div>

                {selectedDayExercises.length ? selectedDayExercises.map((item) => (
                  <ExerciseRow assignment={item} showProgress key={item.id} />
                )) : (
                  <div className="parent-empty-agenda">
                    <h3>Geen sessies geregistreerd</h3>
                    <p>Voor deze dag zijn er geen voltooide oefeningen gevonden.</p>
                  </div>
                )}
              </section>
            </section>

            <aside className="parent-dashboard-side">
              <section className="parent-side-section">
                <div className="parent-section-title"><h3>Toegewezen oefeningen</h3></div>
                <div className="parent-exercise-list">
                  {assignedExercises.length ? assignedExercises.slice(0, 3).map((item) => (
                    <ExerciseRow assignment={item} key={item.id} />
                  )) : <p className="parent-empty-text">Nog geen oefeningen toegewezen.</p>}
                </div>
              </section>
              <section className="parent-side-section">
                <div className="parent-section-title"><h3>Recente activiteiten</h3></div>
                <div className="parent-recent-list"><RecentActivityList activities={recentActivities} /></div>
              </section>
            </aside>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="parent-content parent-settings-layout">
            <section className="parent-settings-primary">
              <section className="parent-settings-section">
                <div className="parent-settings-heading">
                  <div><span>Account</span><h2>Profielgegevens</h2></div>
                  {!isEditingProfile && <button className="parent-text-button" onClick={() => setIsEditingProfile(true)}>Bewerken</button>}
                </div>

                {isEditingProfile ? (
                  <div className="parent-settings-form">
                    <label>Naam<input value={profileForm.fullName} onChange={(event) => setProfileForm({ fullName: event.target.value })} /></label>
                    <label>E-mail<input value={parentProfile?.email || ''} disabled /><small>Je e-mailadres wordt beheerd door je beveiligde account.</small></label>
                    <div className="parent-form-actions">
                      <button className="parent-secondary-button" onClick={() => setIsEditingProfile(false)}>Annuleren</button>
                      <button className="parent-primary-button" onClick={saveProfile} disabled={isSaving}>{isSaving ? 'Opslaan...' : 'Wijzigingen opslaan'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="parent-profile-rows">
                    <div><span>Naam</span><strong>{parentProfile?.full_name || 'Niet ingesteld'}</strong></div>
                    <div><span>E-mail</span><strong>{parentProfile?.email || 'Niet ingesteld'}</strong></div>
                    <div><span>Gekoppeld kind</span><strong>{patient ? `${patient.first_name} ${patient.last_name}` : 'Geen kind gekoppeld'}</strong></div>
                  </div>
                )}
                {settingsMessage && <p className="parent-settings-message" aria-live="polite">{settingsMessage}</p>}
              </section>

              <section className="parent-settings-section">
                <div className="parent-settings-heading"><div><span>Voorkeuren</span><h2>Meldingen</h2></div></div>
                <div className="parent-toggle-list">
                  {[
                    ['exerciseReminder', 'Herinnering voor oefeningen'],
                    ['progressUpdates', 'Updates over voortgang'],
                    ['weeklySummary', 'Wekelijks overzicht'],
                  ].map(([key, label]) => (
                    <div className="parent-toggle-row" key={key}>
                      <span>{label}</span>
                      <button role="switch" aria-checked={notifications[key]} className={notifications[key] ? 'active' : ''} onClick={() => toggleNotification(key)}><span /></button>
                    </div>
                  ))}
                </div>
              </section>
            </section>

            <aside className="parent-support-card">
              <span>Hulp nodig?</span>
              <h2>Support</h2>
              <p>Vind snel een antwoord of neem contact op met Nimbli.</p>
              <a className="parent-primary-button" href="mailto:support@nimbli.be">Contact opnemen</a>
              <button className="parent-secondary-button" onClick={() => setActiveView('dashboard')}>Terug naar dashboard</button>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}
