import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/admin/availability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token' // This will fail auth but should return JSON 401
    },
    body: JSON.stringify({ test: true })
  });
  console.log('Status:', res.status);
  console.log('Content-Type:', res.headers.get('content-type'));
  const body = await res.text();
  console.log('Body prefix:', body.substring(0, 100));
}
test();
