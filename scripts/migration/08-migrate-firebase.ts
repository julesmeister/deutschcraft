import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!privateKey) {
    console.error('❌ FIREBASE_PRIVATE_KEY not found in environment variables');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = admin.firestore();
const MAPPING_FILE = path.join(__dirname, 'migration-mapping.json');

async function migrateFirebase() {
  console.log('🚀 Starting Firebase Migration (Phase 4)...\n');

  // 1. Load Mapping
  if (!fs.existsSync(MAPPING_FILE)) {
    console.error(`❌ Mapping file not found: ${MAPPING_FILE}`);
    process.exit(1);
  }
  const mappingData = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
  const mapping = new Map(Object.entries(mappingData.mapping));
  console.log(`✅ Loaded ${mapping.size} ID mappings`);

  // 2. Fetch all progress documents
  console.log('📦 Fetching flashcard-progress documents...');
  const snapshot = await db.collection('flashcard-progress').get();
  console.log(`   Found ${snapshot.size} documents.`);

  if (snapshot.empty) {
    console.log('   No documents to migrate.');
    return;
  }

  // 3. Process documents
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 400; // Safety margin below 500 limit

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const docId = doc.id;
    
    // Parse ID: userId_flashcardId
    // Note: userId might contain underscores? Usually email or simple ID.
    // Assuming format: {userId}_{flashcardId}
    // But flashcardId might also contain hyphens/underscores.
    // However, we know flashcardId is at the end.
    // AND we know old flashcard IDs start with 'syllabus-' or 'FLASH_syllabus-'
    
    // Let's try to extract flashcardId based on known old format
    let flashcardId = '';
    let userId = '';

    // Strategy: Look for 'syllabus-' inside the string
    const splitIndex = docId.indexOf('_syllabus-');
    if (splitIndex !== -1) {
       userId = docId.substring(0, splitIndex);
       flashcardId = docId.substring(splitIndex + 1); // include syllabus-
    } else {
       // Maybe it has FLASH_ prefix?
       // user_FLASH_syllabus-...
       const splitIndexFlash = docId.indexOf('_FLASH_');
       if (splitIndexFlash !== -1) {
          userId = docId.substring(0, splitIndexFlash);
          flashcardId = docId.substring(splitIndexFlash + 1);
       } else {
          // Fallback: split by first underscore? No, user ID might have it.
          // Try to match with known keys in mapping?
          // This is expensive O(N*M).
          // Better: we stored flashcardId in the document data?
          if (data.flashcardId) {
             flashcardId = data.flashcardId;
             // Verify if docId ends with flashcardId
             if (docId.endsWith(flashcardId)) {
                userId = docId.slice(0, -flashcardId.length - 1); // remove _ and id
             }
          }
       }
    }

    if (!flashcardId || !userId) {
       // Fallback for clean IDs if data.flashcardId is present
       if (data.flashcardId) {
           flashcardId = data.flashcardId;
           // If docId is just userId_flashcardId
           if (docId.includes(flashcardId)) {
               userId = docId.replace(`_${flashcardId}`, '');
           }
       }
    }

    if (!flashcardId) {
        // console.warn(`   ⚠️  Could not parse ID: ${docId}`);
        skippedCount++;
        continue;
    }

    // Check mapping
    // Handle FLASH_ prefix if present in ID but not in mapping (mapping keys are raw IDs)
    const cleanId = flashcardId.replace('FLASH_', '');
    const newId = mapping.get(cleanId);

    if (newId) {
        // Migration needed!
        const newDocId = `${userId}_${newId}`;
        const newRef = db.collection('flashcard-progress').doc(newDocId);
        const oldRef = db.collection('flashcard-progress').doc(docId);

        // Update data with new IDs
        const newData = {
            ...data,
            flashcardId: newId,
            wordId: newId, // Assuming wordId tracks flashcardId in this context
            updatedAt: Date.now() // Touch update time
        };

        // Batch operations
        batch.set(newRef, newData);
        batch.delete(oldRef);

        migratedCount++;
        batchCount += 2; // 1 set + 1 delete

        if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            console.log(`   💾 Committed batch of changes...`);
            batch = db.batch();
            batchCount = 0;
        }
    } else {
        // console.log(`   No mapping for ${flashcardId}`);
        skippedCount++;
    }
  }

  // Commit remaining
  if (batchCount > 0) {
      await batch.commit();
      console.log(`   💾 Committed final batch.`);
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   - Total documents: ${snapshot.size}`);
  console.log(`   - Migrated: ${migratedCount}`);
  console.log(`   - Skipped/No mapping: ${skippedCount}`);
  console.log(`   - Errors: ${errorCount}`);
}

migrateFirebase().catch(console.error);
