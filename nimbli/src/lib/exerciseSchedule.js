export const formatDateValue = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

export const addDaysToDateValue = (dateValue, days) => {
    const [year, month, day] = dateValue.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    date.setDate(date.getDate() + days)

    return formatDateValue(date)
}

export const getDefaultExerciseSchedule = () => {
    const startDate = formatDateValue(new Date())

    return {
        startDate,
        endDate: addDaysToDateValue(startDate, 13),
    }
}

export const isValidExerciseSchedule = ({ startDate, endDate }) =>
    Boolean(startDate && endDate && endDate >= startDate)

export const toDateValue = (value) => {
    if (!value) return ''

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value
    }

    return formatDateValue(new Date(value))
}

export const isAssignmentPlannedForDate = (assignment, date = new Date()) => {
    const selectedDate = formatDateValue(date)
    const fallbackDate = toDateValue(assignment.assigned_at) || selectedDate
    const startDate = assignment.start_date || fallbackDate
    const endDate = assignment.end_date || startDate

    return selectedDate >= startDate && selectedDate <= endDate
}

export const formatScheduleDate = (value) => {
    const dateValue = toDateValue(value)

    if (!dateValue) return 'Niet ingesteld'

    return new Date(`${dateValue}T00:00:00`).toLocaleDateString('nl-BE')
}

export const getAssignmentSchedule = (assignment) => {
    const fallbackDate = toDateValue(assignment.assigned_at)
    const startDate = assignment.start_date || fallbackDate

    return {
        startDate,
        endDate: assignment.end_date || startDate,
    }
}

export const formatExerciseScheduleRange = (assignment) => {
    const { startDate, endDate } = getAssignmentSchedule(assignment)

    if (!startDate) return 'Niet ingesteld'

    return `${formatScheduleDate(startDate)} – ${formatScheduleDate(endDate)}`
}

export const getWeekDates = (weekOffset = 0, weekStartsOn = 1) => {
    const today = new Date()
    const startDate = new Date(today)
    const daysSinceStart = (today.getDay() - weekStartsOn + 7) % 7
    startDate.setDate(today.getDate() - daysSinceStart + (weekOffset * 7))
    startDate.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + index)
        return date
    })
}
