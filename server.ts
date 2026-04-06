import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { startBot } from './src/bot/index';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Check required environment variables
  if (!process.env.MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI environment variable is missing.');
    console.warn('Database features will not work until this is set.');
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('WARNING: TELEGRAM_BOT_TOKEN environment variable is missing.');
    console.warn('Telegram bot will not start until this is set.');
  }

  app.use(cors());
  app.use(express.json());

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  app.post('/api/auth', (req, res) => {
    const { token } = req.body;
    if (token === process.env.TELEGRAM_BOT_TOKEN) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'Invalid token' });
    }
  });

  app.get('/api/stats', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token !== process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { getStats } = await import('./src/db/index');
      const stats = await getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  app.post('/api/chat', async (req, res) => {
    const { message, history, hfApiKey, userName } = req.body;
    
    if (!hfApiKey) {
      return res.status(400).json({ error: 'Hugging Face API key is required' });
    }

    try {
      const { ModelManager } = await import('./src/ai/index');
      const { AgentService } = await import('./src/services/agent.service');
      const ai = new ModelManager(hfApiKey);
      
      const result = await AgentService.processWebMessage(ai, message, history || [], userName || 'User');
      
      res.json(result);
    } catch (error: any) {
      console.error('Chat API Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate response' });
    }
  });

  // Start the Telegram bot
  if (process.env.TELEGRAM_BOT_TOKEN) {
    try {
      await startBot(process.env.TELEGRAM_BOT_TOKEN);
      console.log('Telegram bot started successfully');
    } catch (error) {
      console.error('Failed to start Telegram bot:', error);
    }
  } else {
    console.warn('Skipping Telegram bot startup because TELEGRAM_BOT_TOKEN is missing.');
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
