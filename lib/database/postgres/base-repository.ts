/**
 * PostgreSQL Base Repository Implementation (EXAMPLE)
 *
 * This is an example implementation showing how you would create
 * a PostgreSQL provider. To use this in production:
 *
 * 1. Install dependencies: npm install pg
 * 2. Set up environment variables (see .env.example)
 * 3. Complete the implementation
 * 4. Set NEXT_PUBLIC_DATABASE_TYPE=postgres
 */

import { BaseRepository, QueryOptions, QueryResult, WhereCondition } from '../types';

/**
 * Abstract base repository for PostgreSQL
 * This is a simplified example - production code would need more robust implementation
 */
export abstract class PostgresBaseRepository<T extends { id?: string; createdAt?: number; updatedAt?: number }>
  implements BaseRepository<T>
{
  protected tableName: string;
  // In production, inject a connection pool here
  // protected pool: Pool;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  protected buildWhereClause(conditions?: WhereCondition[]): { sql: string; params: any[] } {
    if (!conditions || conditions.length === 0) {
      return { sql: '', params: [] };
    }

    const clauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    conditions.forEach((condition) => {
      switch (condition.operator) {
        case '==':
          clauses.push(`${condition.field} = $${paramIndex}`);
          params.push(condition.value);
          paramIndex++;
          break;
        case '!=':
          clauses.push(`${condition.field} != $${paramIndex}`);
          params.push(condition.value);
          paramIndex++;
          break;
        case '<':
          clauses.push(`${condition.field} < $${paramIndex}`);
          params.push(condition.value);
          paramIndex++;
          break;
        case '<=':
          clauses.push(`${condition.field} <= $${paramIndex}`);
          params.push(condition.value);
          paramIndex++;
          break;
        case '>':
          clauses.push(`${condition.field} > $${paramIndex}`);
          params.push(condition.value);
          paramIndex++;
          break;
        case '>=':
          clauses.push(`${condition.field} >= $${paramIndex}`);
          params.push(condition.value);
          paramIndex++;
          break;
        case 'in':
          clauses.push(`${condition.field} = ANY($${paramIndex})`);
          params.push(condition.value);
          paramIndex++;
          break;
        default:
          throw new Error(`Unsupported operator: ${condition.operator}`);
      }
    });

    return {
      sql: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
      params,
    };
  }

  protected buildOrderByClause(options: QueryOptions): string {
    if (!options.orderBy || options.orderBy.length === 0) {
      return '';
    }

    const clauses = options.orderBy.map((order) => `${order.field} ${order.direction.toUpperCase()}`);

    return `ORDER BY ${clauses.join(', ')}`;
  }

  // ============================================================================
  // Create Operations
  // ============================================================================

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    // Example SQL:
    // INSERT INTO users (email, name, role, created_at, updated_at)
    // VALUES ($1, $2, $3, $4, $5)
    // RETURNING *

    throw new Error('PostgreSQL implementation not complete. Install pg and implement database operations.');
  }

  async createBatch(dataArray: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]> {
    // Example SQL:
    // INSERT INTO users (email, name, role, created_at, updated_at)
    // VALUES
    //   ($1, $2, $3, $4, $5),
    //   ($6, $7, $8, $9, $10)
    // RETURNING *

    throw new Error('PostgreSQL implementation not complete.');
  }

  // ============================================================================
  // Read Operations
  // ============================================================================

  async findById(id: string): Promise<T | null> {
    // Example SQL:
    // SELECT * FROM users WHERE id = $1

    throw new Error('PostgreSQL implementation not complete.');
  }

  async findOne(options: QueryOptions): Promise<T | null> {
    const result = await this.findMany({ ...options, limit: 1 });
    return result.data[0] || null;
  }

  async findMany(options: QueryOptions): Promise<QueryResult<T>> {
    // Example SQL:
    // SELECT * FROM users
    // WHERE teacher_id = $1
    // ORDER BY last_active_date DESC
    // LIMIT 21
    // OFFSET 0

    throw new Error('PostgreSQL implementation not complete.');
  }

  async findAll(): Promise<T[]> {
    // Example SQL:
    // SELECT * FROM users

    throw new Error('PostgreSQL implementation not complete.');
  }

  // ============================================================================
  // Update Operations
  // ============================================================================

  async update(id: string, data: Partial<T>): Promise<T> {
    // Example SQL:
    // UPDATE users
    // SET name = $1, updated_at = $2
    // WHERE id = $3
    // RETURNING *

    throw new Error('PostgreSQL implementation not complete.');
  }

  async updateBatch(updates: { id: string; data: Partial<T> }[]): Promise<T[]> {
    // Use a transaction for batch updates
    throw new Error('PostgreSQL implementation not complete.');
  }

  // ============================================================================
  // Delete Operations
  // ============================================================================

  async delete(id: string): Promise<void> {
    // Example SQL:
    // DELETE FROM users WHERE id = $1

    throw new Error('PostgreSQL implementation not complete.');
  }

  async deleteBatch(ids: string[]): Promise<void> {
    // Example SQL:
    // DELETE FROM users WHERE id = ANY($1)

    throw new Error('PostgreSQL implementation not complete.');
  }

  // ============================================================================
  // Utility Operations
  // ============================================================================

  async count(options?: QueryOptions): Promise<number> {
    // Example SQL:
    // SELECT COUNT(*) FROM users WHERE teacher_id = $1

    throw new Error('PostgreSQL implementation not complete.');
  }

  async exists(id: string): Promise<boolean> {
    // Example SQL:
    // SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)

    throw new Error('PostgreSQL implementation not complete.');
  }
}
