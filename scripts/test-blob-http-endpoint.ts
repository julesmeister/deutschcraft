/**
 * Test blob HTTP endpoint
 * Start dev server first: npm run dev
 * Then run: npx tsx scripts/test-blob-http-endpoint.ts
 */

async function testEndpoint() {
  const testAudioId = 'audio_1768317183705_w3w81c7nr';
  const url = `http://localhost:3000/api/materials/audio/${testAudioId}/blob`;

  console.log(`🧪 Testing blob HTTP endpoint\n`);
  console.log(`URL: ${url}\n`);

  try {
    console.log('Fetching...');
    const response = await fetch(url);

    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      console.log(`\n✅ Success!`);
      console.log(`   Size: ${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`   First 10 bytes: ${Array.from(bytes.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
    } else {
      const text = await response.text();
      console.log(`\n❌ Failed!`);
      console.log(`Response body: ${text}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEndpoint();
