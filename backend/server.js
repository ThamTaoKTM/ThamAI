// ThamAI backend (Express) - supports OpenAI call if OPENAI_API_KEY present
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const OPENAI_KEY = process.env.OPENAI_API_KEY || null;

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ThamAI backend running' });
});

app.post('/api', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing "prompt" string in body' });
    }

    // If no key, return an echo/fallback response so frontend can test
    if (!OPENAI_KEY) {
      const echo = `Echo (no OPENAI_API_KEY): ${prompt}`;
      return res.json({ choices: [{ message: { role: 'assistant', content: echo } }] });
    }

    // Call OpenAI Chat Completions
    const payload = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('OpenAI error', resp.status, text);
      return res.status(502).json({ error: 'OpenAI API error', status: resp.status, detail: text });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (err) {
    console.error('Server error', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ThamAI backend listening on ${PORT}`));
