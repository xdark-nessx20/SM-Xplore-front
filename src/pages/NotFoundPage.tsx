import { Link } from 'react-router-dom'
import { AuthShell } from './auth/AuthShell'

export default function NotFoundPage() {
  return (
    <AuthShell
      title="Página no encontrada"
      subtitle="La ruta que buscas no existe o no tienes acceso a ella."
      footer={
        <p>
          <Link to="/app">Volver al inicio</Link>
        </p>
      }
    >
      <p>Verifica la dirección o regresa al panel principal.</p>
    </AuthShell>
  )
}
