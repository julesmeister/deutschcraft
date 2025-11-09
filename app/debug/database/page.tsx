'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/database';

export default function DatabaseDebugPage() {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    async function testDatabase() {
      try {
        setStatus('Testing database connection...');

        // Test 1: Check if db exists
        console.log('DB object:', db);
        setStatus('DB object exists ✓');

        // Test 2: Check if students repository exists
        console.log('Students repo:', db.students);
        setStatus('Students repository exists ✓');

        // Test 3: Try to find students
        setStatus('Fetching students for teacher TCH001...');
        const result = await db.students.findByTeacherId('TCH001', {
          limit: 5,
        });

        console.log('Query result:', result);
        setResults(result);
        setStatus(`Success! Found ${result.data.length} students`);
      } catch (err: any) {
        console.error('Database test error:', err);
        setError(err.message || String(err));
        setStatus('Error occurred');
      }
    }

    testDatabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Debug Page</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-bold mb-2">Status</h2>
          <p className="text-lg">{status}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {results && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-900 mb-2">Results</h2>
            <pre className="text-sm text-green-700 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
