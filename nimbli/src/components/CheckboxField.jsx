export default function CheckboxField({ label, checked, onChange, className = '', ...props }) {
  return (
    <label className={`checkbox-field ${className}`}>
      <input type="checkbox" checked={checked} onChange={onChange} {...props} />
      <span>{label}</span>
    </label>
  )
}
