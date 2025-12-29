import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { CEFRLevel } from '@/lib/models/cefr';

export async function GET(
  request: NextRequest,
  { params }: { params: { level: string } }
) {
  try {
    const level = params.level.toUpperCase();

    // Validate level
    if (!Object.values(CEFRLevel).includes(level as CEFRLevel)) {
      return NextResponse.json(
        { error: 'Invalid CEFR level' },
        { status: 400 }
      );
    }

    // Construct file path
    // Note: In production (Vercel), we might need to adjust how we access files
    // if they are not bundled correctly. But for standard deployments this often works.
    const filePath = path.join(
      process.cwd(),
      'lib',
      'data',
      'vocabulary',
      'levels',
      `${level.toLowerCase()}.json`
    );

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      return NextResponse.json(data);
    } catch (error) {
      console.error(`Error reading vocabulary file for level ${level}:`, error);
      return NextResponse.json(
        { error: 'Vocabulary data not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in vocabulary API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
