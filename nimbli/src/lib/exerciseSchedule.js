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
