import { useEffect, useId } from 'react'

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Verwijderen',
    cancelLabel = 'Annuleren',
    isConfirming = false,
    onConfirm,
    onCancel,
}) {
    const titleId = useId()
    const messageId = useId()

    useEffect(() => {
        if (!isOpen) return undefined

        const closeOnEscape = (event) => {
            if (event.key === 'Escape' && !isConfirming) onCancel()
        }

        window.addEventListener('keydown', closeOnEscape)
        return () => window.removeEventListener('keydown', closeOnEscape)
    }, [isConfirming, isOpen, onCancel])

    if (!isOpen) return null

    return (
        <div
            className="nimbli-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isConfirming) onCancel()
            }}
        >
            <section
                className="nimbli-modal-card"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={messageId}
            >
                <h2 id={titleId}>{title}</h2>
                <p id={messageId}>{message}</p>
                <div className="nimbli-modal-actions">
                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={onCancel}
                        disabled={isConfirming}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className="danger-btn"
                        onClick={onConfirm}
                        disabled={isConfirming}
                    >
                        {isConfirming ? 'Verwijderen...' : confirmLabel}
                    </button>
                </div>
            </section>
        </div>
    )
}
