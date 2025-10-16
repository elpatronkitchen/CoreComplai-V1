import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../lib/api'

interface Audit {
  id: number
  auditType: string
  title: string
  status: string
  startDate: string
  endDate: string
  auditor: string
  scope: string
}

function Audits() {
  const { data: audits, isLoading } = useQuery<Audit[]>({
    queryKey: ['audits'],
    queryFn: () => apiRequest('/audits'),
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Audits</h1>
        <button className="btn btn-primary">Create Audit</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Status</th>
              <th>Auditor</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Scope</th>
            </tr>
          </thead>
          <tbody>
            {audits?.map((audit) => (
              <tr key={audit.id}>
                <td>{audit.auditType}</td>
                <td>{audit.title}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: audit.status === 'Completed' ? '#e6f7e6' : 
                                audit.status === 'In Progress' ? '#e6f0ff' : '#fff3cd',
                    color: audit.status === 'Completed' ? '#00aa00' : 
                           audit.status === 'In Progress' ? '#0066cc' : '#856404'
                  }}>
                    {audit.status}
                  </span>
                </td>
                <td>{audit.auditor}</td>
                <td>{new Date(audit.startDate).toLocaleDateString()}</td>
                <td>{audit.endDate ? new Date(audit.endDate).toLocaleDateString() : '-'}</td>
                <td>{audit.scope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Audits
