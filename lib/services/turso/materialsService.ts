/**
 * Materials Service - Turso Implementation
 * Manages PDF learning materials (Schritte International textbooks)
 */

import { db } from '@/turso/client';

export interface Material {
  materialId: string;
  title: string;
  description: string | null;
  filePath: string;
  fileSize: number | null;
  level: 'A1.1' | 'A1.2' | 'A2.1' | 'A2.2' | 'B1.1' | 'B1.2' | 'General';
  category: 'Textbook' | 'Teaching Plan' | 'Copy Template' | 'Test' | 'Solutions' | 'Transcripts' | 'Extra Materials';
  lessonNumber: number | null;
  isPublic: boolean;
  uploadedBy: string | null;
  tags: string[];
  downloadCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface AudioMaterial {
  audioId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  level: 'A1.1' | 'A1.2' | 'A2.1' | 'A2.2' | 'B1.1' | 'B1.2';
  bookType: 'KB' | 'AB';  // Kursbuch or Arbeitsbuch
  cdNumber: string | null;
  trackNumber: string | null;
  lessonNumber: number | null;
  description: string | null;
  isPublic: boolean;
  playCount: number;
  hasBlob?: boolean;  // Indicates if blob backup is available
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new material record
 */
export async function createMaterial(data: Omit<Material, 'materialId' | 'downloadCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const materialId = `mat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.execute({
      sql: `INSERT INTO materials (
        material_id, title, description, file_path, file_size,
        level, category, lesson_number, is_public, uploaded_by, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        materialId,
        data.title,
        data.description,
        data.filePath,
        data.fileSize,
        data.level,
        data.category,
        data.lessonNumber,
        data.isPublic ? 1 : 0,
        data.uploadedBy,
        JSON.stringify(data.tags),
      ],
    });

    return materialId;
  } catch (error) {
    console.error('[materialsService] Error creating material:', error);
    throw error;
  }
}

/**
 * Update material visibility
 */
export async function updateMaterialVisibility(
  materialId: string,
  isPublic: boolean
): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE materials SET is_public = ?, updated_at = ? WHERE material_id = ?',
      args: [isPublic ? 1 : 0, Date.now(), materialId],
    });
  } catch (error) {
    console.error('[materialsService] Error updating visibility:', error);
    throw error;
  }
}

/**
 * Increment download count
 */
export async function incrementDownloadCount(materialId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE materials SET download_count = download_count + 1 WHERE material_id = ?',
      args: [materialId],
    });
  } catch (error) {
    console.error('[materialsService] Error incrementing download count:', error);
    throw error;
  }
}

/**
 * Delete a material
 */
export async function deleteMaterial(materialId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM materials WHERE material_id = ?',
      args: [materialId],
    });
  } catch (error) {
    console.error('[materialsService] Error deleting material:', error);
    throw error;
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all public materials
 */
export async function getPublicMaterials(): Promise<Material[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM materials WHERE is_public = 1 ORDER BY level, lesson_number, title`,
      args: [],
    });

    return result.rows.map(mapRowToMaterial);
  } catch (error) {
    console.error('[materialsService] Error fetching public materials:', error);
    throw error;
  }
}

/**
 * Get all materials (for teachers)
 */
export async function getAllMaterials(): Promise<Material[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM materials ORDER BY level, lesson_number, title`,
      args: [],
    });

    return result.rows.map(mapRowToMaterial);
  } catch (error) {
    console.error('[materialsService] Error fetching all materials:', error);
    throw error;
  }
}

/**
 * Get materials by level
 */
export async function getMaterialsByLevel(
  level: string,
  publicOnly: boolean = true
): Promise<Material[]> {
  try {
    const sql = publicOnly
      ? `SELECT * FROM materials WHERE level = ? AND is_public = 1 ORDER BY lesson_number, title`
      : `SELECT * FROM materials WHERE level = ? ORDER BY lesson_number, title`;

    const result = await db.execute({
      sql,
      args: [level],
    });

    return result.rows.map(mapRowToMaterial);
  } catch (error) {
    console.error('[materialsService] Error fetching materials by level:', error);
    throw error;
  }
}

/**
 * Get materials by category
 */
export async function getMaterialsByCategory(
  category: string,
  publicOnly: boolean = true
): Promise<Material[]> {
  try {
    const sql = publicOnly
      ? `SELECT * FROM materials WHERE category = ? AND is_public = 1 ORDER BY level, lesson_number, title`
      : `SELECT * FROM materials WHERE category = ? ORDER BY level, lesson_number, title`;

    const result = await db.execute({
      sql,
      args: [category],
    });

    return result.rows.map(mapRowToMaterial);
  } catch (error) {
    console.error('[materialsService] Error fetching materials by category:', error);
    throw error;
  }
}

/**
 * Get material by ID
 */
export async function getMaterialById(materialId: string): Promise<Material | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM materials WHERE material_id = ? LIMIT 1',
      args: [materialId],
    });

    if (result.rows.length === 0) return null;

    return mapRowToMaterial(result.rows[0]);
  } catch (error) {
    console.error('[materialsService] Error fetching material by ID:', error);
    throw error;
  }
}

/**
 * Search materials
 */
export async function searchMaterials(
  query: string,
  publicOnly: boolean = true
): Promise<Material[]> {
  try {
    const searchPattern = `%${query}%`;
    const sql = publicOnly
      ? `SELECT * FROM materials
         WHERE (title LIKE ? OR description LIKE ?) AND is_public = 1
         ORDER BY level, lesson_number, title`
      : `SELECT * FROM materials
         WHERE title LIKE ? OR description LIKE ?
         ORDER BY level, lesson_number, title`;

    const result = await db.execute({
      sql,
      args: [searchPattern, searchPattern],
    });

    return result.rows.map(mapRowToMaterial);
  } catch (error) {
    console.error('[materialsService] Error searching materials:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapRowToMaterial(row: any): Material {
  return {
    materialId: row.material_id as string,
    title: row.title as string,
    description: row.description as string | null,
    filePath: row.file_path as string,
    fileSize: row.file_size as number | null,
    level: row.level as Material['level'],
    category: row.category as Material['category'],
    lessonNumber: row.lesson_number as number | null,
    isPublic: (row.is_public as number) === 1,
    uploadedBy: row.uploaded_by as string | null,
    tags: JSON.parse((row.tags as string) || '[]'),
    downloadCount: row.download_count as number,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

// ============================================================================
// AUDIO MATERIALS - WRITE OPERATIONS
// ============================================================================

/**
 * Create a new audio material record
 */
export async function createAudioMaterial(data: Omit<AudioMaterial, 'audioId' | 'playCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const audioId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO audio_materials (
        audio_id, title, file_name, file_url, file_size,
        level, book_type, cd_number, track_number, lesson_number,
        description, is_public, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        audioId,
        data.title,
        data.fileName,
        data.fileUrl,
        data.fileSize,
        data.level,
        data.bookType,
        data.cdNumber,
        data.trackNumber,
        data.lessonNumber,
        data.description,
        data.isPublic ? 1 : 0,
        now,
        now,
      ],
    });

    return audioId;
  } catch (error) {
    console.error('[materialsService] Error creating audio material:', error);
    throw error;
  }
}

/**
 * Increment play count for audio
 */
export async function incrementPlayCount(audioId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE audio_materials SET play_count = play_count + 1 WHERE audio_id = ?',
      args: [audioId],
    });
  } catch (error) {
    console.error('[materialsService] Error incrementing play count:', error);
    throw error;
  }
}

/**
 * Delete an audio material
 */
export async function deleteAudioMaterial(audioId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM audio_materials WHERE audio_id = ?',
      args: [audioId],
    });
  } catch (error) {
    console.error('[materialsService] Error deleting audio material:', error);
    throw error;
  }
}

// ============================================================================
// AUDIO MATERIALS - READ OPERATIONS
// ============================================================================

/**
 * Get all public audio materials
 */
export async function getPublicAudioMaterials(): Promise<AudioMaterial[]> {
  try {
    const result = await db.execute({
      sql: `SELECT
        audio_id, title, file_name, file_url, file_size,
        level, book_type, cd_number, track_number, lesson_number,
        description, is_public, play_count, created_at, updated_at,
        CASE WHEN audio_blob IS NOT NULL THEN 1 ELSE 0 END as has_blob
      FROM audio_materials
      WHERE is_public = 1
      ORDER BY level, lesson_number, track_number`,
      args: [],
    });

    return result.rows.map(mapRowToAudioMaterial);
  } catch (error) {
    console.error('[materialsService] Error fetching public audio materials:', error);
    throw error;
  }
}

/**
 * Get all audio materials (for teachers)
 */
export async function getAllAudioMaterials(): Promise<AudioMaterial[]> {
  try {
    const result = await db.execute({
      sql: `SELECT
        audio_id, title, file_name, file_url, file_size,
        level, book_type, cd_number, track_number, lesson_number,
        description, is_public, play_count, created_at, updated_at,
        CASE WHEN audio_blob IS NOT NULL THEN 1 ELSE 0 END as has_blob
      FROM audio_materials
      ORDER BY level, lesson_number, track_number`,
      args: [],
    });

    return result.rows.map(mapRowToAudioMaterial);
  } catch (error) {
    console.error('[materialsService] Error fetching all audio materials:', error);
    throw error;
  }
}

/**
 * Get audio materials by level
 */
export async function getAudioMaterialsByLevel(
  level: string,
  publicOnly: boolean = true
): Promise<AudioMaterial[]> {
  try {
    const selectClause = `SELECT
      audio_id, title, file_name, file_url, file_size,
      level, book_type, cd_number, track_number, lesson_number,
      description, is_public, play_count, created_at, updated_at,
      CASE WHEN audio_blob IS NOT NULL THEN 1 ELSE 0 END as has_blob
    FROM audio_materials`;

    const sql = publicOnly
      ? `${selectClause} WHERE level = ? AND is_public = 1 ORDER BY lesson_number, track_number`
      : `${selectClause} WHERE level = ? ORDER BY lesson_number, track_number`;

    const result = await db.execute({
      sql,
      args: [level],
    });

    return result.rows.map(mapRowToAudioMaterial);
  } catch (error) {
    console.error('[materialsService] Error fetching audio materials by level:', error);
    throw error;
  }
}

/**
 * Get audio material by ID
 */
export async function getAudioMaterialById(audioId: string): Promise<AudioMaterial | null> {
  try {
    const result = await db.execute({
      sql: `SELECT
        audio_id, title, file_name, file_url, file_size,
        level, book_type, cd_number, track_number, lesson_number,
        description, is_public, play_count, created_at, updated_at,
        CASE WHEN audio_blob IS NOT NULL THEN 1 ELSE 0 END as has_blob
      FROM audio_materials
      WHERE audio_id = ? LIMIT 1`,
      args: [audioId],
    });

    if (result.rows.length === 0) return null;

    return mapRowToAudioMaterial(result.rows[0]);
  } catch (error) {
    console.error('[materialsService] Error fetching audio material by ID:', error);
    throw error;
  }
}

/**
 * Search audio materials
 */
export async function searchAudioMaterials(
  query: string,
  publicOnly: boolean = true
): Promise<AudioMaterial[]> {
  try {
    const searchPattern = `%${query}%`;
    const selectClause = `SELECT
      audio_id, title, file_name, file_url, file_size,
      level, book_type, cd_number, track_number, lesson_number,
      description, is_public, play_count, created_at, updated_at,
      CASE WHEN audio_blob IS NOT NULL THEN 1 ELSE 0 END as has_blob
    FROM audio_materials`;

    const sql = publicOnly
      ? `${selectClause}
         WHERE (title LIKE ? OR file_name LIKE ? OR description LIKE ?) AND is_public = 1
         ORDER BY level, lesson_number, track_number`
      : `${selectClause}
         WHERE title LIKE ? OR file_name LIKE ? OR description LIKE ?
         ORDER BY level, lesson_number, track_number`;

    const result = await db.execute({
      sql,
      args: [searchPattern, searchPattern, searchPattern],
    });

    return result.rows.map(mapRowToAudioMaterial);
  } catch (error) {
    console.error('[materialsService] Error searching audio materials:', error);
    throw error;
  }
}

/**
 * Get audio blob data by audio ID
 */
export async function getAudioBlob(audioId: string): Promise<Buffer | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT audio_blob FROM audio_materials WHERE audio_id = ? LIMIT 1',
      args: [audioId],
    });

    if (result.rows.length === 0 || !result.rows[0].audio_blob) {
      return null;
    }

    const blobData = result.rows[0].audio_blob;

    // Handle different blob data formats from Turso
    if (Buffer.isBuffer(blobData)) {
      return blobData;
    } else if (blobData instanceof Uint8Array) {
      return Buffer.from(blobData);
    } else if (ArrayBuffer.isView(blobData)) {
      return Buffer.from(blobData.buffer, blobData.byteOffset, blobData.byteLength);
    } else if (blobData instanceof ArrayBuffer) {
      return Buffer.from(blobData);
    } else {
      console.error('[materialsService] Unexpected blob data type:', typeof blobData);
      return null;
    }
  } catch (error) {
    console.error('[materialsService] Error fetching audio blob:', error);
    throw error;
  }
}

function mapRowToAudioMaterial(row: any): AudioMaterial {
  return {
    audioId: row.audio_id as string,
    title: row.title as string,
    fileName: row.file_name as string,
    fileUrl: row.file_url as string,
    fileSize: row.file_size as number | null,
    level: row.level as AudioMaterial['level'],
    bookType: row.book_type as 'KB' | 'AB',
    cdNumber: row.cd_number as string | null,
    trackNumber: row.track_number as string | null,
    lessonNumber: row.lesson_number as number | null,
    description: row.description as string | null,
    isPublic: (row.is_public as number) === 1,
    playCount: row.play_count as number,
    hasBlob: (row.has_blob as number) === 1, // From SQL: CASE WHEN audio_blob IS NOT NULL THEN 1 ELSE 0 END
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}
