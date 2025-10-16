import StatusBadge from '../StatusBadge';

export default function StatusBadgeExample() {
  const statuses = [
    'Compliant',
    'In Progress', 
    'Evidence Pending',
    'Not Started',
    'Audit Ready',
    'Draft',
    'Published',
    'Archived',
    'Critical',
    'High',
    'Medium',
    'Low',
    'Info'
  ];

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Status Badge Examples</h3>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
      </div>
    </div>
  );
}