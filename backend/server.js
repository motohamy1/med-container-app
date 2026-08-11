require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { hasApiKey } = require('./services/geminiService');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Chat endpoint
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Med Arena Clinical Backend running on http://0.0.0.0:${PORT}`);
    if (hasApiKey) {
        console.log(`   Gemini API key active`);
    } else {
        console.log(`   ⚠️ GEMINI_API_KEY is missing in backend/.env`);
    }
});
