import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../lib/api'

interface Framework {
  id: number
  name: string
  version: string
  description: string
  effectiveDate: string
  isActive: boolean
}

function Frameworks() {
  const { data: frameworks, isLoading } = useQuery<Framework[]>({
    queryKey: ['frameworks'],
    queryFn: () => apiRequest('/frameworks'),
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Frameworks</h1>
        <button className="btn btn-primary">Add Framework</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Version</th>
              <th>Description</th>
              <th>Effective Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {frameworks?.map((framework) => (
              <tr key={framework.id}>
                <td>{framework.name}</td>
                <td>{framework.version}</td>
                <td>{framework.description}</td>
                <td>{new Date(framework.effectiveDate).toLocaleDateString()}</td>
                <td>
                  <span style={{ color: framework.isActive ? '#00aa00' : '#999' }}>
                    {framework.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Frameworks
