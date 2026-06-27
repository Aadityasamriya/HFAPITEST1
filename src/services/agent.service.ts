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
  static async processWebMessage(ai: ModelManager, message: string, history: any[], userName: string, userId?: string | number, userMemory?: string, onStatus?: (status: string) => void): Promise<AgentResponse> {
    let currentPrompt = message;
    let finalResponse = "";
    let loopCount = 0;
    const MAX_LOOPS = 5;
    const actions: AgentAction[] = [];
    let currentMemory = userMemory;

    while (loopCount < MAX_LOOPS) {
      let aiResponse: string;
      try {
        if (onStatus) onStatus("🤔 Thinking...");
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

      // Process [BUTTON: Text -> URL]
      const buttonRegex = /\[BUTTON:\s*(.+?)\s*->\s*(https?:\/\/[^\s\]]+)\s*\]/g;
      let btnMatch;
      while ((btnMatch = buttonRegex.exec(aiResponse)) !== null) {
        const btnText = btnMatch[1].trim().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        actions.push({ type: 'message', text: btnText, url: btnMatch[2].trim() });
        aiResponse = aiResponse.replace(btnMatch[0], '').trim();
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
        if (onStatus) onStatus(`🎨 Generating image: ${imgPrompt}...`);
        try {
          const imageBlob = await ai.generateImage(imgPrompt);
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          actions.push({ type: 'image', url: `data:image/jpeg;base64,${base64}`, prompt: imgPrompt });
          
          currentPrompt = `[System: Image generated successfully for "${imgPrompt}". Continue your response.]`;
          loopCount++;
          if (onStatus) onStatus(`🤔 Analyzing generated image...`);
          continue;
        } catch (e) {
          currentPrompt = `[System: Failed to generate image. Inform the user and continue.]`;
          loopCount++;
          if (onStatus) onStatus(`🤔 Failed to generate image, recovering...`);
          continue;
        }
      }

      // Process [SEARCH: query]
      const searchMatch = aiResponse.match(/\[SEARCH:\s*(.+?)\]/);
      if (searchMatch) {
        const query = searchMatch[1].trim();
        actions.push({ type: 'message', text: `🔍 Searching the web for "${query}"...` });
        if (onStatus) onStatus(`🔍 Searching the web for "${query}"...`);
        
        try {
          const { redisCache } = await import('../lib/redis');
          const cacheKey = `search_google_${query.replace(/\s+/g, '_')}`;
          let summary = await redisCache.get<string>(cacheKey);

          if (!summary) {
            const google = (await import('googlethis')).default;
            const options = {
              page: 0, 
              safe: false, 
              additional_params: {
                hl: 'en' 
              }
            };
            const response = await google.search(query, options);
            
            let snippets = response.results.slice(0, 3).map((r: any) => r.description);
            summary = snippets.length > 0 ? snippets.join('\n\n') : "No relevant search results found.";
            
            if (snippets.length > 0) {
              await redisCache.set(cacheKey, summary, 3600); // cache for 1 hour
            }
          }
          currentPrompt = `[System: Web Search Results for "${query}"]\n${summary}\n\n[System: Continue your response based on these results.]`;
          loopCount++;
          if (onStatus) onStatus(`🤔 Reading search results...`);
          continue;
        } catch (e) {
          currentPrompt = `[System: Search failed. Inform the user and continue.]`;
          loopCount++;
          if (onStatus) onStatus(`🤔 Search failed, recovering...`);
          continue;
        }
      }

      // Process [CMD: command]
      const cmdMatch = aiResponse.match(/\[CMD:\s*([\s\S]+?)\]/);
      if (cmdMatch) {
        const command = cmdMatch[1].trim();
        actions.push({ type: 'message', text: `💻 Executing command...` });
        if (onStatus) onStatus(`💻 Executing command...`);
        
        try {
          const { executeUserCommand } = await import('../lib/cmd');
          const output = await executeUserCommand(userId as string, command);
          currentPrompt = `[System: Command executed. Output:]\n${output}\n\n[System: Continue your response.]`;
          loopCount++;
          if (onStatus) onStatus(`🤔 Analyzing output...`);
          continue;
        } catch (e: any) {
          currentPrompt = `[System: Command failed with error: ${e.message}. Inform the user and continue.]`;
          loopCount++;
          if (onStatus) onStatus(`🤔 Command failed, recovering...`);
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
    let statusMsg = await bot.sendMessage(chatId, `🤔 <i>Thinking...</i>`, { parse_mode: 'HTML' }).catch(() => null);
    
    let currentPrompt = prompt;
    let finalResponse = "";
    let loopCount = 0;
    const MAX_LOOPS = 5;

    while (loopCount < MAX_LOOPS) {
      let aiResponse: string;
      try {
        aiResponse = await ai.generateText(currentPrompt, history, userName, 'telegram', user.memory);
        
        if (aiResponse.includes('[SYSTEM_ERROR_CREDITS]')) {
           finalResponse = aiResponse.replace('[SYSTEM_ERROR_CREDITS]', '⚠️ <b>API Limits Exceeded:</b>\n');
           break;
        }
      } catch (e: any) {
        finalResponse = `⚠️ <b>Error:</b> ${e.message}`;
        break;
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
        if (statusMsg) {
          await bot.editMessageText(`🎨 <i>Generating image: ${imgPrompt}...</i>`, { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }).catch(() => {});
        }
        try {
          const imageBlob = await ai.generateImage(imgPrompt);
          const arrayBuffer = await imageBlob.arrayBuffer();
          await bot.sendPhoto(chatId, Buffer.from(arrayBuffer), { caption: `🎨 ${imgPrompt}` });
          
          await addMessage(user.id, 'assistant', `[I generated an image: "${imgPrompt}"]`);
          currentPrompt = `[System: Image generated successfully for "${imgPrompt}". Continue your response.]`;
          history = await getChatHistory(user.id, 12);
          loopCount++;
          if (statusMsg) await bot.editMessageText(`🤔 <i>Analyzing generated image...</i>`, { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }).catch(() => {});
          continue;
        } catch (e) {
          currentPrompt = `[System: Failed to generate image. Inform the user and continue.]`;
          history = await getChatHistory(user.id, 12);
          loopCount++;
          if (statusMsg) await bot.editMessageText(`🤔 <i>Failed to generate image, recovering...</i>`, { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }).catch(() => {});
          continue;
        }
      }

      // Process [SEARCH: query]
      const searchMatch = aiResponse.match(/\[SEARCH:\s*(.+?)\]/);
      if (searchMatch) {
        const query = searchMatch[1].trim();
        if (statusMsg) {
          await bot.editMessageText(`🔍 <i>Searching the web for "${query}"...</i>`, { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }).catch(() => {});
        }
        
        try {
          const { redisCache } = await import('../lib/redis');
          const cacheKey = `search_google_${query.replace(/\s+/g, '_')}`;
          let summary = await redisCache.get<string>(cacheKey);

          if (!summary) {
            const google = (await import('googlethis')).default;
            const options = {
              page: 0, 
              safe: false, 
              additional_params: {
                hl: 'en' 
              }
            };
            const response = await google.search(query, options);
            
            let snippets = response.results.slice(0, 3).map((r: any) => r.description);
            summary = snippets.length > 0 ? snippets.join('\n\n') : "No relevant search results found.";
            
            if (snippets.length > 0) {
              await redisCache.set(cacheKey, summary, 3600); // 1 hour
            }
          }
          currentPrompt = `[System: Web Search Results for "${query}"]\n${summary}\n\n[System: Continue your response based on these results.]`;
          history = await getChatHistory(user.id, 12);
          loopCount++;
          if (statusMsg) await bot.editMessageText(`🤔 <i>Reading search results...</i>`, { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }).catch(() => {});
          continue;
        } catch (e) {
          currentPrompt = `[System: Search failed. Inform the user and continue.]`;
          history = await getChatHistory(user.id, 12);
          loopCount++;
          if (statusMsg) await bot.editMessageText(`🤔 <i>Search failed, recovering...</i>`, { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }).catch(() => {});
          continue;
        }
      }

      // Process [CMD: command]
      const cmdMatch = aiResponse.match(/\[CMD:\s*([\s\S]+?)\]/);
      if (cmdMatch) {
        const command = cmdMatch[1].trim();
        if (statusMsg) {
          await bot.editMessageText(`💻 <i>Executing command...</i>`, { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }).catch(() => {});
        }
        
        try {
          const { executeUserCommand } = await import('../lib/cmd');
          const output = await executeUserCommand(user.id, command);
          currentPrompt = `[System: Command executed. Output:]\n${output}\n\n[System: Continue your response.]`;
          history = await getChatHistory(user.id, 12);
          loopCount++;
          if (statusMsg) await bot.editMessageText(`🤔 <i>Analyzing output...</i>`, { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }).catch(() => {});
          continue;
        } catch (e: any) {
          currentPrompt = `[System: Command failed with error: ${e.message}. Inform the user and continue.]`;
          history = await getChatHistory(user.id, 12);
          loopCount++;
          if (statusMsg) await bot.editMessageText(`🤔 <i>Command failed, recovering...</i>`, { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }).catch(() => {});
          continue;
        }
      }

      finalResponse = aiResponse;
      break;
    }

    if (statusMsg) {
      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    }

    return finalResponse;
  }
}
