import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../lib/api'

interface Stats {
  totalFrameworks: number
  totalControls: number
  totalPolicies: number
  totalAudits: number
}

function Dashboard() {
  const { data: frameworks } = useQuery({
    queryKey: ['frameworks'],
    queryFn: () => apiRequest('/frameworks'),
  })

  const { data: controls } = useQuery({
    queryKey: ['controls'],
    queryFn: () => apiRequest('/controls'),
  })

  const { data: policies } = useQuery({
    queryKey: ['policies'],
    queryFn: () => apiRequest('/policies'),
  })

  const { data: audits } = useQuery({
    queryKey: ['audits'],
    queryFn: () => apiRequest('/audits'),
  })

  const stats: Stats = {
    totalFrameworks: frameworks?.length || 0,
    totalControls: controls?.length || 0,
    totalPolicies: policies?.length || 0,
    totalAudits: audits?.length || 0,
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Frameworks</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>{stats.totalFrameworks}</p>
        </div>
        <div className="card">
          <h3>Controls</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>{stats.totalControls}</p>
        </div>
        <div className="card">
          <h3>Policies</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>{stats.totalPolicies}</p>
        </div>
        <div className="card">
          <h3>Audits</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>{stats.totalAudits}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
