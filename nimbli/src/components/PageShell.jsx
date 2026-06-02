export default function PageShell({ children }) {
  return (
    <main className="app-shell">
      <div className="login-card">{children}</div>
    </main>
  )
}
