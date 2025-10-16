import { useState, useMemo, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  className?: string;
  getRowId: (row: T) => string;
  emptyState?: React.ReactNode;
  actions?: React.ReactNode;
}

export type SortDirection = 'asc' | 'desc' | null;

export default function DataTable<T>({ 
  data, 
  columns, 
  searchable = true,
  selectable = false,
  onSelectionChange,
  onRowClick,
  className,
  getRowId,
  emptyState,
  actions
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(row => 
        columns.some(col => {
          const value = row[col.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row => {
          const cellValue = row[key as keyof T];
          return cellValue && cellValue.toString().toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, filters, columns]);

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(current => 
        current === 'asc' ? 'desc' : current === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredAndSortedData.map(getRowId)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    setSelectedRows(newSelection);
  };

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(Array.from(selectedRows));
  }, [selectedRows, onSelectionChange]);

  const allSelected = filteredAndSortedData.length > 0 && selectedRows.size === filteredAndSortedData.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < filteredAndSortedData.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="table-search"
              />
            </div>
          )}
          
          {selectedRows.size > 0 && (
            <Badge variant="secondary" data-testid="selection-count">
              {selectedRows.size} selected
            </Badge>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected || someSelected}
                    onCheckedChange={handleSelectAll}
                    data-testid="select-all-checkbox"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead 
                  key={String(column.key)} 
                  className={cn(
                    column.sortable && "cursor-pointer hover:bg-muted/50",
                    column.width
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                  data-testid={`column-header-${String(column.key)}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            "h-3 w-3",
                            sortColumn === column.key && sortDirection === 'asc' 
                              ? "text-primary" 
                              : "text-muted-foreground"
                          )} 
                        />
                        <ChevronDown 
                          className={cn(
                            "h-3 w-3 -mt-1",
                            sortColumn === column.key && sortDirection === 'desc' 
                              ? "text-primary" 
                              : "text-muted-foreground"
                          )} 
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="text-center py-12"
                >
                  {emptyState || (
                    <div className="text-muted-foreground">
                      {searchTerm ? 'No results found' : 'No data available'}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.has(rowId);
                
                return (
                  <TableRow 
                    key={rowId}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      isSelected && "bg-muted/50"
                    )}
                    onClick={() => onRowClick?.(row)}
                    data-testid={`table-row-${rowId}`}
                  >
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(rowId, checked as boolean)}
                          data-testid={`row-checkbox-${rowId}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell 
                        key={String(column.key)}
                        data-testid={`cell-${rowId}-${String(column.key)}`}
                      >
                        {column.render 
                          ? column.render(row[column.key], row) 
                          : String(row[column.key] || '')
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}