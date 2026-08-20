import { isAssignmentPlannedForDate } from './exerciseSchedule'

export const toProgress = (value, target) =>
    target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0

export const getCompletionStreak = (assignments, referenceDate = new Date()) => {
    const completedDates = new Set(
        assignments
            .filter((item) => item.completed_at)
            .map((item) => new Date(item.completed_at).toDateString())
    )
    const cursor = new Date(referenceDate)

    if (!completedDates.has(cursor.toDateString())) {
        cursor.setDate(cursor.getDate() - 1)
    }

    let streak = 0

    while (completedDates.has(cursor.toDateString())) {
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
    }

    return streak
}

export const getChildProgress = (assignments, referenceDate = new Date()) => {
    const todayExercises = assignments.filter((item) =>
        isAssignmentPlannedForDate(item, referenceDate)
    )
    const completedExercises = assignments.filter((item) => item.completed)
    const completedToday = todayExercises.filter((item) => item.completed)
    const totalXp = assignments.reduce((total, item) => total + (item.xp_earned || 0), 0)
    const todayXp = completedToday.reduce((total, item) => total + (item.xp_earned || 0), 0)
    const completionStreak = getCompletionStreak(assignments, referenceDate)

    return {
        todayExercises,
        completedExercises,
        completedToday,
        totalXp,
        todayXp,
        completionStreak,
        missions: [
            {
                id: 'exercise',
                title: 'Voltooi één oefening',
                detail: `${Math.min(completedToday.length, 1)}/1 voltooid`,
                progress: toProgress(completedToday.length, 1),
                completed: completedToday.length >= 1,
            },
            {
                id: 'xp',
                title: 'Verdien 50 XP',
                detail: `${todayXp}/50 XP`,
                progress: toProgress(todayXp, 50),
                completed: todayXp >= 50,
            },
            {
                id: 'day',
                title: 'Maak je dag compleet',
                detail: `${completedToday.length}/${todayExercises.length} oefeningen`,
                progress: toProgress(completedToday.length, todayExercises.length),
                completed:
                    todayExercises.length > 0
                    && completedToday.length === todayExercises.length,
            },
        ],
    }
}
