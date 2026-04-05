import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { startBot } from './src/bot/index';

async function startServer() {
  const app = express();
  const PORT = 3000;

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
      const ai = new ModelManager(hfApiKey);
      
      // We'll simulate the agentic loop here for the web interface
      let currentPrompt = message;
      let finalResponse = "";
      let loopCount = 0;
      const MAX_LOOPS = 5;
      
      const actions = [];

      while (loopCount < MAX_LOOPS) {
        let aiResponse = await ai.generateText(currentPrompt, history || [], userName || 'User');
        
        // Process [REACT: emoji]
        const reactRegex = /\[REACT:\s*(.+?)\]/g;
        let reactMatch;
        while ((reactMatch = reactRegex.exec(aiResponse)) !== null) {
          actions.push({ type: 'reaction', emoji: reactMatch[1].trim() });
          aiResponse = aiResponse.replace(reactMatch[0], '').trim();
        }

        // Process [MESSAGE: text]
        const messageRegex = /\[MESSAGE:\s*(.+?)\]/g;
        let msgMatch;
        while ((msgMatch = messageRegex.exec(aiResponse)) !== null) {
          actions.push({ type: 'message', text: msgMatch[1].trim() });
          aiResponse = aiResponse.replace(msgMatch[0], '').trim();
        }

        // Process [IMAGE: prompt]
        const imageMatch = aiResponse.match(/\[IMAGE:\s*(.+?)\]/);
        if (imageMatch) {
          const imgPrompt = imageMatch[1].trim();
          actions.push({ type: 'message', text: `🎨 Generating image: ${imgPrompt}...` });
          try {
            const imageBlob = await ai.generateImage(imgPrompt);
            const arrayBuffer = await imageBlob.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            actions.push({ type: 'image', url: `data:image/jpeg;base64,${base64}`, prompt: imgPrompt });
            
            currentPrompt = `[System: Image generated successfully for "${imgPrompt}". Continue your response.]`;
            loopCount++;
            continue;
          } catch (e) {
            currentPrompt = `[System: Failed to generate image. Inform the user and continue.]`;
            loopCount++;
            continue;
          }
        }

        // Process [SEARCH: query]
        const searchMatch = aiResponse.match(/\[SEARCH:\s*(.+?)\]/);
        if (searchMatch) {
          const query = searchMatch[1].trim();
          actions.push({ type: 'message', text: `🔍 Searching the web for "${query}"...` });
          
          try {
            const fetchRes = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            const html = await fetchRes.text();
            
            const snippetRegex = /<a class="result__snippet[^>]*>(.*?)<\/a>/g;
            let snippets = [];
            let sMatch;
            while ((sMatch = snippetRegex.exec(html)) !== null && snippets.length < 3) {
              snippets.push(sMatch[1].replace(/<[^>]+>/g, '').trim());
            }
            
            const summary = snippets.length > 0 ? snippets.join('\n\n') : "No relevant search results found.";
            currentPrompt = `[System: Web Search Results for "${query}"]\n${summary}\n\n[System: Continue your response based on these results.]`;
            loopCount++;
            continue;
          } catch (e) {
            currentPrompt = `[System: Search failed. Inform the user and continue.]`;
            loopCount++;
            continue;
          }
        }

        // If no special tags, we are done
        finalResponse = aiResponse;
        break;
      }
      
      res.json({ response: finalResponse, actions });
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
    console.warn('TELEGRAM_BOT_TOKEN is not set. Bot will not start.');
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

startServer();
