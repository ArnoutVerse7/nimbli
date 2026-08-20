const iconPaths = {
    check: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="m8 12 2.5 2.5L16.5 8.5" />
        </>
    ),
    star: (
        <path d="m12 3 2.75 5.55 6.13.9-4.44 4.31 1.05 6.09L12 17l-5.49 2.85 1.05-6.09-4.44-4.31 6.13-.9L12 3Z" />
    ),
    target: (
        <>
            <circle cx="11" cy="13" r="7.5" />
            <circle cx="11" cy="13" r="3.5" />
            <path d="m13.5 10.5 6-6M16 4.5h3.5V8" />
        </>
    ),
    cross: <path d="m7 7 10 10M17 7 7 17" />,
    moon: <path d="M19 15.5A8 8 0 0 1 8.5 5a8 8 0 1 0 10.5 10.5Z" />,
    lock: (
        <>
            <rect x="5" y="10" width="14" height="10" rx="2.5" />
            <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10M12 14v2" />
        </>
    ),
    chest: (
        <>
            <path d="M4 10h16v9H4zM3 7h18v4H3z" />
            <path d="M8 7V5h8v2M10 13h4v3h-4z" />
        </>
    ),
}

const missionIconNames = {
    exercise: 'check',
    xp: 'star',
    day: 'target',
}

export default function ChildIcon({ name, className = '' }) {
    return (
        <svg
            className={`child-symbol ${className}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            {iconPaths[name] || iconPaths.star}
        </svg>
    )
}

export function MissionIcon({ missionId }) {
    return <ChildIcon name={missionIconNames[missionId]} />
}
