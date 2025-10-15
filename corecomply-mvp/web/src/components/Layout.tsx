import { Link, useLocation } from 'react-router-dom'
import { useMsal } from '@azure/msal-react'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  const { instance } = useMsal()
  const location = useLocation()

  const handleLogout = () => {
    instance.logoutRedirect()
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/frameworks', label: 'Frameworks' },
    { path: '/controls', label: 'Controls' },
    { path: '/policies', label: 'Policies' },
    { path: '/audits', label: 'Audits' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: '240px', background: '#f5f5f5', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px' }}>CoreComply</h2>
        <ul style={{ listStyle: 'none' }}>
          {navItems.map((item) => (
            <li key={item.path} style={{ marginBottom: '10px' }}>
              <Link
                to={item.path}
                style={{
                  display: 'block',
                  padding: '10px',
                  textDecoration: 'none',
                  color: location.pathname === item.path ? '#0066cc' : '#333',
                  background: location.pathname === item.path ? '#e6f0ff' : 'transparent',
                  borderRadius: '4px',
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} className="btn btn-primary" style={{ marginTop: '30px', width: '100%' }}>
          Logout
        </button>
      </nav>
      <main style={{ flex: 1, padding: '20px' }}>{children}</main>
    </div>
  )
}

export default Layout
