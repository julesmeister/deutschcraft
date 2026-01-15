/**
 * Test HTTP Range Requests for audio blob endpoint
 * Start dev server first: npm run dev
 * Then run: npx tsx scripts/test-range-requests.ts
 */

async function testRangeRequests() {
  const testAudioId = 'audio_1768317183705_w3w81c7nr';
  const url = `http://localhost:3000/api/materials/audio/${testAudioId}/blob`;

  console.log('🧪 Testing HTTP Range Requests\n');
  console.log(`URL: ${url}\n`);

  // Test 1: Full content request
  console.log('📊 Test 1: Full content request');
  console.log('─'.repeat(60));
  try {
    const response = await fetch(url);
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:');
    console.log('  Accept-Ranges:', response.headers.get('accept-ranges'));
    console.log('  Content-Length:', response.headers.get('content-length'));
    console.log('  Content-Type:', response.headers.get('content-type'));
    console.log('  ETag:', response.headers.get('etag'));
    console.log('  Cache-Control:', response.headers.get('cache-control'));

    if (response.ok) {
      const size = parseInt(response.headers.get('content-length') || '0');
      console.log(`✅ Full content received: ${(size / (1024 * 1024)).toFixed(2)} MB\n`);
    } else {
      console.log('❌ Request failed\n');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test 2: Range request (first 1KB)
  console.log('📊 Test 2: Range request (first 1KB)');
  console.log('─'.repeat(60));
  try {
    const response = await fetch(url, {
      headers: {
        'Range': 'bytes=0-1023'
      }
    });
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:');
    console.log('  Content-Range:', response.headers.get('content-range'));
    console.log('  Content-Length:', response.headers.get('content-length'));

    if (response.status === 206) {
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      console.log(`✅ Partial content received: ${buffer.byteLength} bytes`);
      console.log(`  First 10 bytes: ${Array.from(bytes.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' ')}\n`);
    } else {
      console.log('❌ Expected 206 Partial Content\n');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test 3: Range request (middle chunk)
  console.log('📊 Test 3: Range request (middle chunk - 100KB-200KB)');
  console.log('─'.repeat(60));
  try {
    const response = await fetch(url, {
      headers: {
        'Range': 'bytes=102400-204799'
      }
    });
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:');
    console.log('  Content-Range:', response.headers.get('content-range'));
    console.log('  Content-Length:', response.headers.get('content-length'));

    if (response.status === 206) {
      const buffer = await response.arrayBuffer();
      console.log(`✅ Partial content received: ${buffer.byteLength} bytes\n`);
    } else {
      console.log('❌ Expected 206 Partial Content\n');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test 4: Range request (from position to end)
  console.log('📊 Test 4: Range request (last 1KB)');
  console.log('─'.repeat(60));
  try {
    const response = await fetch(url, {
      headers: {
        'Range': 'bytes=-1024'
      }
    });
    console.log('Status:', response.status);

    if (response.status === 206 || response.status === 200) {
      const buffer = await response.arrayBuffer();
      console.log(`✅ Content received: ${buffer.byteLength} bytes\n`);
    } else {
      console.log('Status:', response.statusText, '\n');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test 5: ETag caching
  console.log('📊 Test 5: ETag caching (304 Not Modified)');
  console.log('─'.repeat(60));
  try {
    // First request to get ETag
    const firstResponse = await fetch(url);
    const etag = firstResponse.headers.get('etag');
    console.log('Received ETag:', etag);

    // Second request with If-None-Match
    const secondResponse = await fetch(url, {
      headers: {
        'If-None-Match': etag || ''
      }
    });
    console.log('Status:', secondResponse.status, secondResponse.statusText);

    if (secondResponse.status === 304) {
      console.log('✅ Cache validation working (304 Not Modified)\n');
    } else {
      console.log('⚠️  Expected 304 but got', secondResponse.status, '\n');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('='.repeat(60));
  console.log('✅ All tests completed!');
}

testRangeRequests().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
