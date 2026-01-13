/**
 * Verify R2 Setup and CORS Configuration
 * Run with: npx tsx scripts/verify-r2-setup.ts
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

console.log('🔍 Verifying R2 Setup...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('   R2_PUBLIC_URL:', R2_PUBLIC_URL || '❌ NOT SET');
console.log('   R2_ENDPOINT:', R2_ENDPOINT || '❌ NOT SET');
console.log('   R2_BUCKET_NAME:', R2_BUCKET_NAME || '❌ NOT SET');
console.log('');

if (!R2_PUBLIC_URL) {
  console.error('❌ R2_PUBLIC_URL is not set in .env.local');
  process.exit(1);
}

// Test 1: Check if public URL is accessible
console.log('🧪 Test 1: Checking Public URL accessibility...');
console.log(`   Testing: ${R2_PUBLIC_URL}`);

fetch(R2_PUBLIC_URL)
  .then(response => {
    if (response.ok || response.status === 404) {
      console.log('   ✅ Public URL is accessible');
      console.log(`   Status: ${response.status}`);
    } else {
      console.log('   ⚠️  Unexpected status:', response.status);
    }
  })
  .catch(error => {
    console.error('   ❌ Failed to reach public URL:', error.message);
  })
  .finally(() => {
    // Test 2: Check CORS headers
    console.log('\n🧪 Test 2: Checking CORS configuration...');
    console.log('   Testing HEAD request to audio file...');

    const testAudioUrl = `${R2_PUBLIC_URL}/materials/test.mp3`;

    fetch(testAudioUrl, {
      method: 'HEAD',
      headers: {
        'Origin': 'http://localhost:3000',
      },
    })
      .then(response => {
        const corsHeader = response.headers.get('access-control-allow-origin');
        const allowMethods = response.headers.get('access-control-allow-methods');

        if (corsHeader) {
          console.log('   ✅ CORS is configured!');
          console.log('   Access-Control-Allow-Origin:', corsHeader);
          if (allowMethods) {
            console.log('   Access-Control-Allow-Methods:', allowMethods);
          }
        } else {
          console.log('   ❌ CORS headers not found');
          console.log('   This means CORS is NOT configured on R2 bucket');
        }
      })
      .catch(error => {
        console.error('   ❌ CORS test failed:', error.message);
        console.log('\n   This usually means:');
        console.log('   1. CORS is not configured on R2 bucket, OR');
        console.log('   2. Public access is not enabled on R2 bucket');
      })
      .finally(() => {
        // Print summary
        console.log('\n' + '═'.repeat(60));
        console.log('📊 Summary');
        console.log('═'.repeat(60));
        console.log('\n✅ To fix audio playback:');
        console.log('   1. Go to Cloudflare R2 dashboard');
        console.log('   2. Select "testmanship" bucket');
        console.log('   3. Click "Settings" tab');
        console.log('   4. Enable "Public Access"');
        console.log('   5. Add CORS policy (see CORS-SETUP-GUIDE.md)');
        console.log('\n📖 Full guide: ./CORS-SETUP-GUIDE.md');
        console.log('═'.repeat(60));
      });
  });
