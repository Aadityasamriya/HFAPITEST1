import { ModelManager } from '../ai/index';
import { getChatHistory, addMessage } from '../db/index';
import TelegramBot from 'node-telegram-bot-api';
import { sendSafeHtml } from '../bot/utils/telegram';

export interface AgentAction {
  type: 'reaction' | 'message' | 'image' | 'search';
  emoji?: string;
  text?: string;
  url?: string;
  prompt?: string;
  query?: string;
}

export interface AgentResponse {
  response: string;
  actions: AgentAction[];
}

export class AgentService {
  /**
   * Shared Agentic Loop for Web API
   */
  static async processWebMessage(ai: ModelManager, message: string, history: any[], userName: string, userId?: string | number, userMemory?: string): Promise<AgentResponse> {
    let currentPrompt = message;
    let finalResponse = "";
    let loopCount = 0;
    const MAX_LOOPS = 5;
    const actions: AgentAction[] = [];
    let currentMemory = userMemory;

    while (loopCount < MAX_LOOPS) {
      let aiResponse: string;
      try {
        aiResponse = await ai.generateText(currentPrompt, history, userName, 'web', currentMemory);
        
        if (aiResponse.includes('[SYSTEM_ERROR_CREDITS]')) {
           return { response: aiResponse.replace('[SYSTEM_ERROR_CREDITS]', '⚠️ **API Limits Exceeded:**\n'), actions };
        }
      } catch (e: any) {
        return { response: `⚠️ **Error:** ${e.message}`, actions };
      }
      
      // Process [MEMORY: facts]
      const memoryRegex = /\[MEMORY:\s*(.+?)\]/g;
      let memMatch;
      while ((memMatch = memoryRegex.exec(aiResponse)) !== null) {
        const memoryFact = memMatch[1].trim();
        if (userId) {
          const { updateUserMemory } = await import('../db/index');
          let newMemory = currentMemory ? `${currentMemory}\n- ${memoryFact}` : `- ${memoryFact}`;
          if (newMemory.length > 2000) newMemory = newMemory.substring(newMemory.length - 2000);
          await updateUserMemory(userId, newMemory);
          currentMemory = newMemory;
        }
        aiResponse = aiResponse.replace(memMatch[0], '').trim();
      }

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
          const { redisCache } = await import('../lib/redis');
          const cacheKey = `search_ddg_${query.replace(/\s+/g, '_')}`;
          let summary = await redisCache.get<string>(cacheKey);

          if (!summary) {
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
            
            summary = snippets.length > 0 ? snippets.join('\n\n') : "No relevant search results found.";
            if (snippets.length > 0) {
              await redisCache.set(cacheKey, summary, 3600); // cache for 1 hour
            }
          }
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
    
    return { response: finalResponse, actions };
  }

  /**
   * Shared Agentic Loop for Telegram Bot
   */
  static async processTelegramMessage(ai: ModelManager, prompt: string, user: any, userName: string, bot: TelegramBot, chatId: number | string, messageId: number): Promise<string> {
    let history = await getChatHistory(user.id, 10);
    
    bot.sendChatAction(chatId, 'typing').catch(() => {});
    
    let currentPrompt = prompt;
    let finalResponse = "";
    let loopCount = 0;
    const MAX_LOOPS = 5;

    while (loopCount < MAX_LOOPS) {
      let aiResponse: string;
      try {
        aiResponse = await ai.generateText(currentPrompt, history, userName, 'telegram', user.memory);
        
        if (aiResponse.includes('[SYSTEM_ERROR_CREDITS]')) {
           return aiResponse.replace('[SYSTEM_ERROR_CREDITS]', '⚠️ <b>API Limits Exceeded:</b>\n');
        }
      } catch (e: any) {
        return `⚠️ <b>Error:</b> ${e.message}`;
      }
      
      // Process [MEMORY: facts]
      const memoryRegex = /\[MEMORY:\s*(.+?)\]/g;
      let memMatch;
      while ((memMatch = memoryRegex.exec(aiResponse)) !== null) {
        const memoryFact = memMatch[1].trim();
        const { updateUserMemory } = await import('../db/index');
        
        let newMemory = user.memory ? `${user.memory}\n- ${memoryFact}` : `- ${memoryFact}`;
        // Prevent memory from blowing up to infinite length
        if (newMemory.length > 2000) newMemory = newMemory.substring(newMemory.length - 2000);
        
        await updateUserMemory(user.id, newMemory);
        user.memory = newMemory; // Update local ref
        aiResponse = aiResponse.replace(memMatch[0], '').trim();
      }

      // Process [REACT: emoji]
      const reactRegex = /\[REACT:\s*(.+?)\]/g;
      let reactMatch;
      while ((reactMatch = reactRegex.exec(aiResponse)) !== null) {
        const emoji = reactMatch[1].trim();
        try {
          await (bot as any)._request('setMessageReaction', {
            form: {
              chat_id: chatId,
              message_id: messageId,
              reaction: JSON.stringify([{ type: 'emoji', emoji: emoji }])
            }
          });
        } catch (e) {
          console.error('Failed to set reaction:', e);
        }
        aiResponse = aiResponse.replace(reactMatch[0], '').trim();
      }

      // Process [MESSAGE: text]
      const messageRegex = /\[MESSAGE:\s*(.+?)\]/g;
      let msgMatch;
      while ((msgMatch = messageRegex.exec(aiResponse)) !== null) {
        const msgText = msgMatch[1].trim();
        await sendSafeHtml(bot, chatId, msgText);
        aiResponse = aiResponse.replace(msgMatch[0], '').trim();
      }

      // Process [IMAGE: prompt]
      const imageMatch = aiResponse.match(/\[IMAGE:\s*(.+?)\]/);
      if (imageMatch) {
        const imgPrompt = imageMatch[1].trim();
        await bot.sendMessage(chatId, `🎨 <i>Generating image: ${imgPrompt}...</i>`, { parse_mode: 'HTML' });
        try {
          const imageBlob = await ai.generateImage(imgPrompt);
          const arrayBuffer = await imageBlob.arrayBuffer();
          await bot.sendPhoto(chatId, Buffer.from(arrayBuffer), { caption: `🎨 ${imgPrompt}` });
          
          await addMessage(user.id, 'assistant', `[I generated an image: "${imgPrompt}"]`);
          currentPrompt = `[System: Image generated successfully for "${imgPrompt}". Continue your response.]`;
          history = await getChatHistory(user.id, 12);
          loopCount++;
          continue;
        } catch (e) {
          currentPrompt = `[System: Failed to generate image. Inform the user and continue.]`;
          history = await getChatHistory(user.id, 12);
          loopCount++;
          continue;
        }
      }

      // Process [SEARCH: query]
      const searchMatch = aiResponse.match(/\[SEARCH:\s*(.+?)\]/);
      if (searchMatch) {
        const query = searchMatch[1].trim();
        await bot.sendMessage(chatId, `🔍 <i>Searching the web for "${query}"...</i>`, { parse_mode: 'HTML' });
        
        try {
          const { redisCache } = await import('../lib/redis');
          const cacheKey = `search_ddg_${query.replace(/\s+/g, '_')}`;
          let summary = await redisCache.get<string>(cacheKey);

          if (!summary) {
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
            
            summary = snippets.length > 0 ? snippets.join('\n\n') : "No relevant search results found.";
            if (snippets.length > 0) {
              await redisCache.set(cacheKey, summary, 3600); // 1 hour
            }
          }
          currentPrompt = `[System: Web Search Results for "${query}"]\n${summary}\n\n[System: Continue your response based on these results.]`;
          history = await getChatHistory(user.id, 12);
          loopCount++;
          continue;
        } catch (e) {
          currentPrompt = `[System: Search failed. Inform the user and continue.]`;
          history = await getChatHistory(user.id, 12);
          loopCount++;
          continue;
        }
      }

      finalResponse = aiResponse;
      break;
    }

    return finalResponse;
  }
}
