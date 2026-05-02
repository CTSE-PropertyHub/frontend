import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="font-semibold text-primary">
            PropertyHub
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/properties" className="text-muted-foreground hover:text-foreground transition-colors">
              Properties
            </Link>
            {user.role === 'Landlord' && (
              <Link to="/properties/my" className="text-muted-foreground hover:text-foreground transition-colors">
                My Listings
              </Link>
            )}
            {(user.role === 'Landlord' || user.role === 'Tenant' || user.role === 'Admin') && (
              <Link to="/tenancies" className="text-muted-foreground hover:text-foreground transition-colors">
                Tenancies
              </Link>
            )}
            {(user.role === 'Landlord' || user.role === 'Inspector' || user.role === 'Admin' || user.role === 'Tenant') && (
              <Link to="/inspections" className="text-muted-foreground hover:text-foreground transition-colors">
                Inspections
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {user.firstName} · <span className="font-medium">{user.role}</span>
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  )
}
