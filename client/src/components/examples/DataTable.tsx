import DataTable, { type Column } from '../DataTable';
import StatusBadge from '../StatusBadge';
import { useAppStore } from '@/lib/store';
import type { Control } from '@shared/schema';

export default function DataTableExample() {
  const { controls } = useAppStore();

  const columns: Column<Control>[] = [
    {
      key: 'id',
      label: 'Control ID',
      sortable: true,
      width: 'w-32'
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.category}</div>
        </div>
      )
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Data Table Example</h3>
      <p className="text-sm text-muted-foreground">
        Interactive table with sorting, filtering, and selection
      </p>
      <DataTable
        data={controls}
        columns={columns}
        getRowId={(row) => row.id}
        selectable
        onSelectionChange={(ids) => console.log('Selected:', ids)}
        onRowClick={(row) => console.log('Clicked:', row.title)}
      />
    </div>
  );
}