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
