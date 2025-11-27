/**
 * Dictionary Search API
 * Search German-English dictionary from local SQLite database
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchDictionary, lookupGermanWord, lookupEnglishWord } from '@/lib/services/dictionaryService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'german', 'english', or 'both'
    const exact = searchParams.get('exact') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    let results;

    switch (type) {
      case 'german':
        results = lookupGermanWord(query, exact);
        break;
      case 'english':
        results = lookupEnglishWord(query, exact);
        break;
      default:
        results = searchDictionary(query, limit);
    }

    return NextResponse.json({
      query,
      type: type || 'both',
      exact,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('[Dictionary API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search dictionary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
