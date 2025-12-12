'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

interface MigrationStats {
  users?: number;
  batches?: number;
  tasks?: number;
  submissions?: number;
  progress?: number;
  vocabulary?: number;
  flashcards?: number;
  flashcardProgress?: number;
  total?: number;
}

export function DatabaseMigrationTab() {
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showMigrateConfirm, setShowMigrateConfirm] = useState(false);
  const [exportedData, setExportedData] = useState<any | null>(null);
  const [migrationStats, setMigrationStats] = useState<MigrationStats>({});

  // Export Firestore data to JSON
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/database/export', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();
      setExportedData(data);
      setMigrationStats(data.stats || {});

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `firestore-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Firestore data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Import JSON file to Turso
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/database/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result = await response.json();
      setMigrationStats(result.stats || {});

      toast.success('Data imported to Turso successfully!');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Direct migration (Firestore → Turso)
  const handleDirectMigration = async () => {
    setShowMigrateConfirm(false);
    setIsMigrating(true);

    try {
      const response = await fetch('/api/database/migrate', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Migration failed');
      }

      const result = await response.json();
      setMigrationStats(result.stats || {});

      toast.success('Data migrated successfully!');
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Failed to migrate data');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Database Migration</h2>
        <p className="text-gray-600">
          Migrate data between Firestore and Turso databases. Use export/import for backup or direct migration for quick transfer.
        </p>
      </div>

      {/* Migration Options */}
      <div className="space-y-6">
        {/* Option 1: Export from Firestore */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Export from Firestore</h3>
              <p className="text-gray-600 mb-4">
                Export all data from Firestore to a JSON file. This creates a backup that you can import later.
              </p>
              <div className="max-w-xs">
                <ActionButton
                  onClick={handleExport}
                  disabled={isExporting}
                  variant="cyan"
                  icon={<ActionButtonIcons.Document />}
                >
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </ActionButton>
              </div>
            </div>
          </div>
        </div>

        {/* Option 2: Import to Turso */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Import to Turso</h3>
              <p className="text-gray-600 mb-4">
                Import data from a JSON file into Turso database. Select a previously exported file.
              </p>
              <div className="max-w-xs">
                <label className="block">
                  <ActionButton
                    disabled={isImporting}
                    variant="mint"
                    icon={<ActionButtonIcons.Plus />}
                  >
                    {isImporting ? 'Importing...' : 'Select File to Import'}
                  </ActionButton>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    disabled={isImporting}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Option 3: Direct Migration */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Direct Migration</h3>
              <p className="text-gray-600 mb-4">
                Directly migrate all data from Firestore to Turso without creating an intermediate file. This is the fastest option.
              </p>
              <div className="max-w-xs">
                <ActionButton
                  onClick={() => setShowMigrateConfirm(true)}
                  disabled={isMigrating}
                  variant="purple"
                  icon={<ActionButtonIcons.ArrowRight />}
                >
                  {isMigrating ? 'Migrating...' : 'Migrate Now'}
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Migration Statistics */}
      {Object.keys(migrationStats).length > 0 && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Migration Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(migrationStats).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-2xl font-black text-gray-900">{value}</div>
                <div className="text-sm text-gray-600 capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Notice */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="text-sm font-bold text-yellow-900 mb-1">Important Notes</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Always backup your data before performing migrations</li>
              <li>• Direct migration will overwrite existing data in Turso</li>
              <li>• Large datasets may take several minutes to migrate</li>
              <li>• Ensure you have proper permissions to access both databases</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showMigrateConfirm}
        onClose={() => setShowMigrateConfirm(false)}
        onConfirm={handleDirectMigration}
        title="Confirm Migration"
        message="This will migrate all data from Firestore to Turso. Existing data in Turso will be overwritten. Are you sure you want to continue?"
        confirmText="Yes, Migrate"
        cancelText="Cancel"
        variant="danger"
        isLoading={isMigrating}
      />
    </div>
  );
}
