export default function CodeInput({ length = 6, values, onChange }) {
  const digits = values || Array.from({ length }, () => '')

  const handleChange = (index, value) => {
    const next = [...digits]
    next[index] = value.slice(-1)
    onChange?.(next)
  }

  return (
    <div className="code-inputs">
      {digits.map((digit, index) => (
        <input
          key={index}
          className="code-digit"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
        />
      ))}
    </div>
  )
}
