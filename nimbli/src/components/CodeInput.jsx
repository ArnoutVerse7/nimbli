export default function CodeInput({ length = 6, value = '', onChange }) {
  const handleChange = (event) => {
    const nextValue = event.target.value
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, length)
      .toUpperCase()

    onChange?.(nextValue)
  }

  return (
    <label className="code-input-label">
      <span>Activatiecode</span>
      <input
        className="activation-code-field"
        type="text"
        inputMode="text"
        autoComplete="one-time-code"
        autoCapitalize="characters"
        spellCheck="false"
        maxLength={length}
        placeholder="Bijv. A1B2C3"
        value={value}
        onChange={handleChange}
      />
    </label>
  )
}
