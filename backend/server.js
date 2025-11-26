require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => res.json({ status: 'ok', message: 'ThamAI backend running' }));

app.post('/api', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  if (!process.env.OPENAI_API_KEY) {
    // Fallback echo to allow frontend testing without OpenAI key
    return res.json({ choices: [{ message: { content: `Echo (no API key): ${prompt}` } }] });
  }

  try {
    const payload = { model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 500 };
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const t = await resp.text();
      return res.status(502).json({ error: 'OpenAI error', detail: t });
    }
    const data = await resp.json();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`ThamAI backend listening on ${PORT}`));
