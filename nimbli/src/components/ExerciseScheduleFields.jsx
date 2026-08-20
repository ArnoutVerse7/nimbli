import { addDaysToDateValue, formatDateValue } from '../lib/exerciseSchedule'

export default function ExerciseScheduleFields({
    schedule,
    onChange,
    title = 'Plan de oefeningen',
    helpText,
}) {
    const earliestStartDate = formatDateValue(new Date())

    const updateStartDate = (startDate) => {
        onChange({
            startDate,
            endDate: schedule.endDate < startDate
                ? addDaysToDateValue(startDate, 13)
                : schedule.endDate,
        })
    }

    return (
        <div className="exercise-schedule-panel">
            <strong>{title}</strong>
            <div className="exercise-schedule-grid">
                <label>
                    Startdatum
                    <input
                        type="date"
                        min={earliestStartDate}
                        value={schedule.startDate}
                        onChange={(event) => updateStartDate(event.target.value)}
                    />
                </label>
                <label>
                    Einddatum
                    <input
                        type="date"
                        min={schedule.startDate}
                        value={schedule.endDate}
                        onChange={(event) => onChange({
                            ...schedule,
                            endDate: event.target.value,
                        })}
                    />
                </label>
            </div>
            <small>{helpText}</small>
        </div>
    )
}
