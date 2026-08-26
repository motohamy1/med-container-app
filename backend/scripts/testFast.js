require('dotenv').config();

async function testFast() {
  const t0 = Date.now();
  console.log('Testing fast generation...');
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NVIDIA_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: 'Output pure JSON with an array of topics: {"topics": [{"title": "Acute Pulmonary Embolism", "clinical_content": []}]}' },
          { role: 'user', content: 'Generate 2 emergency pulmonology topics with full clinical content' }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });
    const d = await res.json();
    console.log('Nvidia took', (Date.now() - t0), 'ms');
    console.log('Choices count:', d.choices?.length);
    console.log('Snippet:', d.choices?.[0]?.message?.content?.substring(0, 200));
  } catch (e) {
    console.error('Nvidia error:', e);
  }
}
testFast();
