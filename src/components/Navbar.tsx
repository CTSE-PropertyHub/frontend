import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation()
  const active = pathname.startsWith(to)
  return (
    <Link
      to={to}
      className={`text-sm transition-colors ${active ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav className="border-b bg-background sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-13 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="font-bold text-sm tracking-tight text-primary">
            PropertyHub
          </Link>
          <div className="flex items-center gap-4">
            <NavLink to="/properties">Properties</NavLink>
            {user.role === 'Landlord' && (
              <NavLink to="/properties/my">My Listings</NavLink>
            )}
            {(user.role === 'Landlord' || user.role === 'Tenant' || user.role === 'Admin') && (
              <NavLink to="/tenancies">Tenancies</NavLink>
            )}
            {(user.role === 'Landlord' || user.role === 'Inspector' || user.role === 'Admin' || user.role === 'Tenant') && (
              <NavLink to="/inspections">Inspections</NavLink>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {user.firstName} <span className="text-muted-foreground/60">·</span> <span className="font-medium text-foreground">{user.role}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  )
}
