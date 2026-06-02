export default function TextInput({ label, type = 'text', placeholder, value, onChange, className = '', ...props }) {
  return (
    <label className={`input-label ${className}`}>
      <span className="visually-hidden">{label}</span>
      <input
        className="login-field"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </label>
  )
}
