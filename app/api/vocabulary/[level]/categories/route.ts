import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import path from 'path';
import fs from 'fs/promises';
import { CEFRLevel } from '@/lib/models/cefr';

// Cache category index for 1 hour (static content)
const getCachedCategoryIndex = unstable_cache(
  async (level: string) => {
    const filePath = path.join(
      process.cwd(),
      'lib',
      'data',
      'vocabulary',
      'split',
      level.toLowerCase(),
      '_index.json'
    );

    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  },
  ['vocabulary-categories'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['vocabulary-categories'],
  }
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const { level: levelParam } = await params;
    const level = levelParam.toUpperCase();

    // Validate level
    if (!Object.values(CEFRLevel).includes(level as CEFRLevel)) {
      return NextResponse.json(
        { error: 'Invalid CEFR level' },
        { status: 400 }
      );
    }

    // Fetch from cache (or compute and cache if not present)
    try {
      const data = await getCachedCategoryIndex(level);
      return NextResponse.json(data);
    } catch (error) {
      console.error(`Error reading vocabulary index for level ${level}:`, error);
      return NextResponse.json(
        { error: 'Vocabulary index not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in vocabulary categories API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
