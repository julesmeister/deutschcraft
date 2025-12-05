/**
 * Migration Script: Add 'name' field to all users
 *
 * This script updates all user documents to include a 'name' field
 * by combining firstName and lastName. This maintains backwards
 * compatibility with legacy code that expects a 'name' field.
 *
 * Usage:
 *   npx tsx scripts/migrate-add-name-field.ts
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

interface User {
  userId: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

async function migrateUsers() {
  console.log('🚀 Starting migration: Add name field to users...\n');

  try {
    // Fetch all users
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Found ${usersSnapshot.size} total users\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each user
    for (const doc of usersSnapshot.docs) {
      const user = { userId: doc.id, ...doc.data() } as User;

      // Skip if user already has a 'name' field
      if (user.name) {
        console.log(`⏭️  Skipping ${user.email} - already has name field: "${user.name}"`);
        skippedCount++;
        continue;
      }

      // Generate name from firstName and lastName
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const combinedName = `${firstName} ${lastName}`.trim();

      if (!combinedName) {
        console.log(`⚠️  Warning: ${user.email} has no firstName or lastName, using email`);
      }

      const name = combinedName || user.email;

      try {
        // Update the document
        await db.collection('users').doc(user.userId).update({
          name: name,
          updatedAt: Date.now(),
        });

        console.log(`✅ Updated ${user.email} - name: "${name}"`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating ${user.email}:`, error);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors:  ${errorCount}`);
    console.log(`📊 Total:   ${usersSnapshot.size}`);
    console.log('='.repeat(60));

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with errors. Please review the logs above.');
    }
  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run migration
migrateUsers()
  .then(() => {
    console.log('\n✨ Script finished. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
