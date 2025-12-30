import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { CEFRLevel } from '@/lib/models/cefr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string; filename: string }> }
) {
  try {
    const { level: levelParam, filename } = await params;
    const level = levelParam.toUpperCase();

    // Validate level
    if (!Object.values(CEFRLevel).includes(level as CEFRLevel)) {
      return NextResponse.json(
        { error: 'Invalid CEFR level' },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-.]/g, '');
    if (!sanitizedFilename.endsWith('.json')) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Construct file path
    const filePath = path.join(
      process.cwd(),
      'lib',
      'data',
      'vocabulary',
      'split',
      level.toLowerCase(),
      sanitizedFilename
    );

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      return NextResponse.json(data);
    } catch (error) {
      console.error(`Error reading vocabulary file ${filename} for level ${level}:`, error);
      return NextResponse.json(
        { error: 'Vocabulary file not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in vocabulary category API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
