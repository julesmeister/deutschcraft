import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { CEFRLevel } from '@/lib/models/cefr';

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

    // Construct file path to _index.json
    const filePath = path.join(
      process.cwd(),
      'lib',
      'data',
      'vocabulary',
      'split',
      level.toLowerCase(),
      '_index.json'
    );

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
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
