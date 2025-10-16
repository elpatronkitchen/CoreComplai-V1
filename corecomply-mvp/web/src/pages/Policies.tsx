import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../lib/api'

interface Policy {
  id: number
  title: string
  version: string
  status: string
  owner: string
  effectiveDate: string
  reviewDate: string
}

function Policies() {
  const { data: policies, isLoading } = useQuery<Policy[]>({
    queryKey: ['policies'],
    queryFn: () => apiRequest('/policies'),
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Policies</h1>
        <button className="btn btn-primary">Add Policy</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Version</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Effective Date</th>
              <th>Review Date</th>
            </tr>
          </thead>
          <tbody>
            {policies?.map((policy) => (
              <tr key={policy.id}>
                <td>{policy.title}</td>
                <td>{policy.version}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: policy.status === 'Approved' ? '#e6f7e6' : '#fff3cd',
                    color: policy.status === 'Approved' ? '#00aa00' : '#856404'
                  }}>
                    {policy.status}
                  </span>
                </td>
                <td>{policy.owner}</td>
                <td>{new Date(policy.effectiveDate).toLocaleDateString()}</td>
                <td>{policy.reviewDate ? new Date(policy.reviewDate).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Policies
