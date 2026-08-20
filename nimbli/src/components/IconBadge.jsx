import '../styles/IconBadge.css'

export default function IconBadge({ src, alt = '', className = '' }) {
    return (
        <span className={`icon-badge ${className}`.trim()}>
            <img src={src} alt={alt} />
        </span>
    )
}
