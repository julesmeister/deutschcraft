/**
 * Fix Script: Remove trailing spaces from batchId
 *
 * This script fixes the specific issue where a user has
 * batchId with trailing space: "BATCH_1762708446772 "
 *
 * Usage:
 *   npx tsx scripts/fix-batchid-trailing-space.ts
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function fixBatchIdSpaces() {
  console.log('🚀 Starting fix: Remove trailing spaces from batchId...\n');

  try {
    // Fetch all users
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Found ${usersSnapshot.size} total users\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each user
    for (const doc of usersSnapshot.docs) {
      const user = { userId: doc.id, ...doc.data() };
      const batchId = user.batchId;

      // Skip if no batchId
      if (!batchId) {
        skippedCount++;
        continue;
      }

      // Check if batchId has trailing or leading spaces
      const trimmedBatchId = batchId.trim();

      if (batchId !== trimmedBatchId) {
        console.log(`🔧 Found batchId with spaces: "${batchId}" -> "${trimmedBatchId}"`);
        console.log(`   User: ${user.email}`);

        try {
          // Update the document
          await db.collection('users').doc(user.userId).update({
            batchId: trimmedBatchId,
            updatedAt: Date.now(),
          });

          console.log(`✅ Fixed ${user.email}`);
          updatedCount++;
        } catch (error) {
          console.error(`❌ Error updating ${user.email}:`, error);
          errorCount++;
        }
      } else {
        skippedCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 Fix Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors:  ${errorCount}`);
    console.log(`📊 Total:   ${usersSnapshot.size}`);
    console.log('='.repeat(60));

    if (errorCount === 0) {
      console.log('\n🎉 Fix completed successfully!');
    } else {
      console.log('\n⚠️  Fix completed with errors. Please review the logs above.');
    }
  } catch (error) {
    console.error('❌ Fatal error during fix:', error);
    process.exit(1);
  }
}

// Run fix
fixBatchIdSpaces()
  .then(() => {
    console.log('\n✨ Script finished. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
