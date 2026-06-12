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

  // --- Telegram Login Widget Auth ---
  
  app.get('/api/web/config', (req, res) => {
    res.json({ 
      success: true, 
      botUsername: process.env.TELEGRAM_BOT_USERNAME || '',
      requiresSetup: !process.env.TELEGRAM_BOT_USERNAME
    });
  });

  app.post('/api/web/telegram-auth-widget', async (req, res) => {
    try {
      const data = req.body;
      const crypto = await import('crypto');
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) return res.status(500).json({ error: 'Bot token not configured' });

      // Telegram verification logic
      const checkString = Object.keys(data)
        .filter(key => key !== 'hash')
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('\n');
        
      const secretKey = crypto.createHash('sha256').update(token).digest();
      const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
      
      if (hash !== data.hash) {
        return res.status(403).json({ error: 'Data is NOT from Telegram' });
      }
      
      // Check auth date. Expire in 10 minutes to prevent replay attacks
      if (Date.now() / 1000 - data.auth_date > 600) {
        return res.status(403).json({ error: 'Auth session expired' });
      }

      // Validated. Register or update the user
      const { getUser } = await import('./src/db/index');
      const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username || 'User';
      const user = await getUser(data.id, name, data.username, data.photo_url);
      
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Keep API Key update endpoint
  app.post('/api/web/update-api-key', async (req, res) => {
    const { telegramId, apiKey } = req.body;
    if (!telegramId || !apiKey) return res.status(400).json({ error: 'Telegram ID and API key are required' });
    
    try {
      const { updateUserApiKey, getUser } = await import('./src/db/index');
      await updateUserApiKey(telegramId, apiKey);
      const user = await getUser(telegramId);
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/web/topics/:userId', async (req, res) => {
    try {
      const { redisCache } = await import('./src/lib/redis');
      const cacheKey = `topics_${req.params.userId}`;
      let topics = await redisCache.get<any[]>(cacheKey);
      
      if (!topics) {
        const { getTopics } = await import('./src/db/index');
        topics = await getTopics(req.params.userId);
        await redisCache.set(cacheKey, topics, 10); // Cache for 10 seconds
      }
      
      res.json({ success: true, topics });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/web/history/:userId/:topicId', async (req, res) => {
    try {
      const { getChatHistory } = await import('./src/db/index');
      const history = await getChatHistory(req.params.userId, 50, req.params.topicId);
      res.json({ success: true, history: history.reverse() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/chat', async (req, res) => {
    const { message, history, hfApiKey, userName, userId, topicId } = req.body;
    
    if (!hfApiKey) {
      return res.status(400).json({ error: 'Hugging Face API key is required' });
    }

    try {
      const { redisCache } = await import('./src/lib/redis');
      const rateLimitKey = `rate_limit_web_${userId || req.ip || 'anonymous'}`;
      const count = await redisCache.incrementRateLimit(rateLimitKey, 30); // 30 seconds window
      
      if (count > 10) {
        return res.status(429).json({ error: 'Too many requests. Please wait 30 seconds before sending another message.' });
      }

      const { ModelManager } = await import('./src/ai/index');
      const { AgentService } = await import('./src/services/agent.service');
      const { addMessage, saveTopic, getUserByUsernameOrId } = await import('./src/db/index');
      
      const ai = new ModelManager(hfApiKey);
      let userMemory: string | undefined;
      
      if (userId) {
        await addMessage(userId, 'user', message, topicId);
        const user = await getUserByUsernameOrId(userId);
        if (user && user.memory) {
          userMemory = user.memory;
        }
      }
      
      const result = await AgentService.processWebMessage(ai, message, history || [], userName || 'User', userId, userMemory);
      
      if (userId) {
        await addMessage(userId, 'assistant', result.response, topicId);
        
        // Generate topic title if it's the first message
        if (!history || history.length === 0) {
          try {
            const titlePrompt = `Generate a very short (2-4 words) title for this conversation based on this message: "${message}". Just return the title, nothing else.`;
            const titleResponse = await ai.generateText(titlePrompt, [], 'System', 'web');
            await saveTopic(userId, topicId, titleResponse.trim().replace(/["']/g, ''));
          } catch (e) {
            await saveTopic(userId, topicId, message.substring(0, 30) + '...');
          }
          // Invalidate cache since a new topic was created
          await redisCache.del(`topics_${userId}`);
        }
      }
      
      res.json(result);
    } catch (error: any) {
      console.error('Chat API Error:', error);
      if (error.name === 'MongoServerSelectionError' || error.message?.includes('getaddrinfo EAI_AGAIN')) {
         res.status(500).json({ error: 'Database connection failed: Your MONGODB_URI points to a private network like .internal. Provide a public URL before chatting.' });
      } else {
         res.status(500).json({ error: error.message || 'Failed to generate response' });
      }
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
