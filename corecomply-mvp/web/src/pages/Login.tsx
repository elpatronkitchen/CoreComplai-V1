import { useMsal } from '@azure/msal-react'
import { loginRequest } from '../lib/auth'

function Login() {
  const { instance } = useMsal()

  const handleLogin = () => {
    instance.loginRedirect(loginRequest)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <h1>CoreComply</h1>
        <p style={{ margin: '20px 0' }}>Compliance Management System</p>
        <button onClick={handleLogin} className="btn btn-primary" style={{ width: '100%' }}>
          Sign in with Microsoft
        </button>
      </div>
    </div>
  )
}

export default Login
