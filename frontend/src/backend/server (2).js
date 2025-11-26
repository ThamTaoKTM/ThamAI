// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_KEY = process.env.OPENAI_API_KEY || null;

// CORS: cho phép mọi origin (để dễ test), nếu muốn bảo mật chỉ định origin cụ thể
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ThamAI backend running' });
});

app.post('/api', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Thiếu trường "prompt" (string).' });
    }

    // Nếu không có OpenAI key, trả fallback (echo) để frontend vẫn thử nghiệm được
    if (!OPENAI_KEY) {
      const echo = `Echo (no OPENAI_API_KEY): ${prompt}`;
      return res.json({
        choices: [
          { message: { role: 'assistant', content: echo } }
        ]
      });
    }

    // Gọi OpenAI REST API (Chat Completions)
    const payload = {
      model: 'gpt-4o-mini', // anh có thể đổi model nếu cần
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 800
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload),
      // timeout handling could be added here
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('OpenAI API error:', resp.status, errText);
      return res.status(502).json({ error: 'Lỗi từ OpenAI', status: resp.status, detail: errText });
    }

    const data = await resp.json();
    // Trả nguyên vẹn object OpenAI về frontend (frontend hiện xử lý data.choices[0].message.content)
    return res.json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ThamAI backend listening on port ${PORT}`);
});
