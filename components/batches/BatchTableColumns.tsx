import { SlimTableRenderers } from '@/components/ui/SlimTable';
import { CompactButtonDropdown } from '@/components/ui/CompactButtonDropdown';
import { CEFRLevel } from '@/lib/models';

export interface BatchTableRow {
  id: string;
  name: string;
  level: string;
  levelColor: string;
  students: number;
  status: string;
  statusText: string;
  statusColor: string;
  startDate: string;
  endDate: string | null;
  description: string;
  batchData: any;
}

interface GetBatchTableColumnsParams {
  onEdit: (batchData: any) => void;
  onDelete: (batchId: string, batchName: string) => void;
}

export function getBatchTableColumns({ onEdit, onDelete }: GetBatchTableColumnsParams) {
  return [
    {
      key: 'name',
      label: 'Batch Name',
      render: (value: any, row: BatchTableRow) => (
        <div>
          {SlimTableRenderers.Link(value)}
          {SlimTableRenderers.Status(row.statusColor, row.statusText)}
        </div>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      align: 'center' as const,
      render: (value: any, row: BatchTableRow) => (
        <span className={`${row.levelColor} px-3 py-1 rounded text-xs font-bold text-gray-900 inline-block`}>
          {value}
        </span>
      ),
    },
    {
      key: 'students',
      label: 'Students',
      align: 'center' as const,
      render: (value: any) => <p className="text-gray-500 text-xs text-center">{value}</p>,
    },
    {
      key: 'startDate',
      label: 'Start',
      align: 'center' as const,
      render: (value: any) => <p className="text-gray-500 text-xs text-center">{value}</p>,
    },
    {
      key: 'endDate',
      label: 'End',
      align: 'center' as const,
      render: (value: any) => (
        <p className="text-gray-500 text-xs text-center">
          {value || <span className="text-gray-400 italic">-</span>}
        </p>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: any) => (
        <p className="text-gray-500 text-xs truncate max-w-[200px]">
          {value || <span className="text-gray-400 italic">No description</span>}
        </p>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (_: any, row: BatchTableRow) => (
        <CompactButtonDropdown
          label="Modify"
          options={[
            { value: 'edit', label: 'Edit Batch' },
            { value: 'delete', label: 'Delete Batch' },
          ]}
          onChange={(action) => {
            if (action === 'edit') {
              onEdit(row.batchData);
            } else if (action === 'delete') {
              onDelete(row.id, row.name);
            }
          }}
          buttonClassName="!text-xs"
        />
      ),
    },
  ];
}

export const levelColors: Record<CEFRLevel, string> = {
  [CEFRLevel.A1]: 'bg-piku-yellow-light',
  [CEFRLevel.A2]: 'bg-piku-mint',
  [CEFRLevel.B1]: 'bg-piku-cyan',
  [CEFRLevel.B2]: 'bg-piku-purple-light',
  [CEFRLevel.C1]: 'bg-piku-orange',
  [CEFRLevel.C2]: 'bg-piku-gold',
};
