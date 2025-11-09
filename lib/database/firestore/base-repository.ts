/**
 * Firestore Base Repository Implementation
 *
 * Provides base CRUD operations for Firestore collections
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  Firestore,
  Query,
  DocumentData,
  QueryConstraint,
  writeBatch,
} from 'firebase/firestore';
import { BaseRepository, QueryOptions, QueryResult, WhereCondition, OrderByCondition } from '../types';

/**
 * Abstract base repository for Firestore
 * Implements common CRUD operations using Firestore SDK
 */
export abstract class FirestoreBaseRepository<T extends { id?: string; createdAt?: number; updatedAt?: number }>
  implements BaseRepository<T>
{
  protected db: Firestore;
  protected collectionName: string;

  constructor(db: Firestore, collectionName: string) {
    this.db = db;
    this.collectionName = collectionName;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  protected getCollectionRef() {
    return collection(this.db, this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(this.db, this.collectionName, id);
  }

  protected buildQuery(options: QueryOptions): Query<DocumentData> {
    const constraints: QueryConstraint[] = [];

    // Add where conditions
    if (options.where) {
      options.where.forEach((condition: WhereCondition) => {
        constraints.push(where(condition.field, condition.operator, condition.value));
      });
    }

    // Add order by
    if (options.orderBy) {
      options.orderBy.forEach((order: OrderByCondition) => {
        constraints.push(orderBy(order.field, order.direction));
      });
    }

    // Add limit
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Add pagination cursor
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }

    return query(this.getCollectionRef(), ...constraints);
  }

  protected docToEntity(id: string, data: DocumentData): T {
    return {
      id,
      ...data,
    } as T;
  }

  // ============================================================================
  // Create Operations
  // ============================================================================

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = Date.now();
    const docData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(this.getCollectionRef(), docData);
    return this.docToEntity(docRef.id, docData);
  }

  async createBatch(dataArray: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]> {
    const batch = writeBatch(this.db);
    const now = Date.now();
    const results: T[] = [];

    dataArray.forEach((data) => {
      const docRef = doc(this.getCollectionRef());
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(docRef, docData);
      results.push(this.docToEntity(docRef.id, docData));
    });

    await batch.commit();
    return results;
  }

  // ============================================================================
  // Read Operations
  // ============================================================================

  async findById(id: string): Promise<T | null> {
    const docRef = this.getDocRef(id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.docToEntity(docSnap.id, docSnap.data());
  }

  async findOne(options: QueryOptions): Promise<T | null> {
    const q = this.buildQuery({ ...options, limit: 1 });
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return this.docToEntity(doc.id, doc.data());
  }

  async findMany(options: QueryOptions): Promise<QueryResult<T>> {
    // Fetch one extra document to check if there's a next page
    const fetchLimit = options.limit ? options.limit + 1 : undefined;
    const q = this.buildQuery({ ...options, limit: fetchLimit });

    const snapshot = await getDocs(q);
    const data: T[] = [];
    let lastCursor: any = null;
    let hasNextPage = false;

    snapshot.docs.forEach((doc, index) => {
      if (!options.limit || index < options.limit) {
        data.push(this.docToEntity(doc.id, doc.data()));
        lastCursor = doc;
      } else {
        hasNextPage = true;
      }
    });

    return {
      data,
      lastCursor,
      hasNextPage,
    };
  }

  async findAll(): Promise<T[]> {
    const snapshot = await getDocs(this.getCollectionRef());
    return snapshot.docs.map((doc) => this.docToEntity(doc.id, doc.data()));
  }

  // ============================================================================
  // Update Operations
  // ============================================================================

  async update(id: string, data: Partial<T>): Promise<T> {
    const docRef = this.getDocRef(id);
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    };

    await updateDoc(docRef, updateData);

    // Fetch and return updated document
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Document ${id} not found after update`);
    }

    return updated;
  }

  async updateBatch(updates: { id: string; data: Partial<T> }[]): Promise<T[]> {
    const batch = writeBatch(this.db);
    const now = Date.now();

    updates.forEach(({ id, data }) => {
      const docRef = this.getDocRef(id);
      batch.update(docRef, {
        ...data,
        updatedAt: now,
      });
    });

    await batch.commit();

    // Fetch updated documents
    return Promise.all(updates.map(({ id }) => this.findById(id).then((doc) => doc!)));
  }

  // ============================================================================
  // Delete Operations
  // ============================================================================

  async delete(id: string): Promise<void> {
    const docRef = this.getDocRef(id);
    await deleteDoc(docRef);
  }

  async deleteBatch(ids: string[]): Promise<void> {
    const batch = writeBatch(this.db);

    ids.forEach((id) => {
      const docRef = this.getDocRef(id);
      batch.delete(docRef);
    });

    await batch.commit();
  }

  // ============================================================================
  // Utility Operations
  // ============================================================================

  async count(options?: QueryOptions): Promise<number> {
    if (!options) {
      const snapshot = await getCountFromServer(this.getCollectionRef());
      return snapshot.data().count;
    }

    const q = this.buildQuery(options);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  async exists(id: string): Promise<boolean> {
    const docRef = this.getDocRef(id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  }
}
