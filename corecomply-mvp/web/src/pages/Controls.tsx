import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../lib/api'

interface Control {
  id: number
  controlId: string
  title: string
  category: string
  status: string
  owner: string
  dueDate: string
}

function Controls() {
  const { data: controls, isLoading } = useQuery<Control[]>({
    queryKey: ['controls'],
    queryFn: () => apiRequest('/controls'),
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Controls</h1>
        <button className="btn btn-primary">Add Control</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Control ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {controls?.map((control) => (
              <tr key={control.id}>
                <td>{control.controlId}</td>
                <td>{control.title}</td>
                <td>{control.category}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: control.status === 'Compliant' ? '#e6f7e6' : '#fff3cd',
                    color: control.status === 'Compliant' ? '#00aa00' : '#856404'
                  }}>
                    {control.status}
                  </span>
                </td>
                <td>{control.owner}</td>
                <td>{control.dueDate ? new Date(control.dueDate).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Controls
