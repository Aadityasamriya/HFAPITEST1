import TelegramBot from 'node-telegram-bot-api';
import { getUser, updateUserApiKey, addMessage, getChatHistory, clearChatHistory, resetDatabase, getStats, getAllUsers } from '../db/index';
import { ModelManager } from '../ai/index';

// State to track if user is currently entering an API key
const waitingForApiKey = new Set<number>();
// State to track if admin is broadcasting
const waitingForBroadcast = new Set<number>();

// Helper to safely send Markdown messages (fallback to plain text if Markdown fails)
async function sendSafeMarkdown(bot: TelegramBot, chatId: number | string, text: string, options?: TelegramBot.SendMessageOptions) {
  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...options });
  } catch (e: any) {
    if (e.message && e.message.includes('parse entities')) {
      // Fallback to plain text if Markdown is malformed
      await bot.sendMessage(chatId, text, options);
    } else {
      throw e;
    }
  }
}

// Helper to keep sending chat actions (typing, upload_photo, etc.) for long-running tasks
async function withContinuousAction<T>(bot: TelegramBot, chatId: number | string, action: TelegramBot.ChatAction, fn: () => Promise<T>): Promise<T> {
  let isDone = false;
  const interval = setInterval(() => {
    if (!isDone) {
      bot.sendChatAction(chatId, action).catch(() => {});
    }
  }, 4000); // Telegram chat actions expire after 5 seconds, so we renew every 4s

  try {
    await bot.sendChatAction(chatId, action);
    return await fn();
  } finally {
    isDone = true;
    clearInterval(interval);
  }
}

// Helper to parse AI response for UI elements (Buttons, Polls) and send them
async function processAndSendAiResponse(bot: TelegramBot, chatId: number | string, aiResponse: string) {
  let cleanResponse = aiResponse;
  const inlineKeyboard: TelegramBot.InlineKeyboardButton[][] = [];
  const polls: { question: string, options: string[] }[] = [];

  // Extract buttons: [BUTTON: Text -> URL]
  const buttonRegex = /\[BUTTON:\s*(.+?)\s*->\s*(https?:\/\/[^\s\]]+)\s*\]/g;
  let match;
  while ((match = buttonRegex.exec(aiResponse)) !== null) {
    inlineKeyboard.push([{ text: match[1].trim(), url: match[2].trim() }]);
    cleanResponse = cleanResponse.replace(match[0], '').trim();
  }

  // Extract polls: [POLL: Question -> Opt1 | Opt2]
  const pollRegex = /\[POLL:\s*(.+?)\s*->\s*(.+?)\]/g;
  while ((match = pollRegex.exec(aiResponse)) !== null) {
    const question = match[1].trim();
    const options = match[2].split('|').map(o => o.trim()).filter(o => o.length > 0);
    if (options.length >= 2 && options.length <= 10) {
      polls.push({ question, options });
    }
    cleanResponse = cleanResponse.replace(match[0], '').trim();
  }

  // Send the main text message (with buttons if any)
  if (cleanResponse.length > 0 || inlineKeyboard.length > 0) {
    const opts: TelegramBot.SendMessageOptions = {};
    if (inlineKeyboard.length > 0) {
      opts.reply_markup = { inline_keyboard: inlineKeyboard };
    }
    await sendSafeMarkdown(bot, chatId, cleanResponse || 'Here you go!', opts);
  }

  // Send any polls
  for (const poll of polls) {
    await bot.sendPoll(chatId, poll.question, poll.options, { is_anonymous: false });
  }
}

// Agentic Text Generation Loop (handles Web Search, Image Gen, and Multi-message)
async function generateAgenticText(ai: ModelManager, prompt: string, user: any, userName: string, bot: TelegramBot, chatId: number | string, messageId: number): Promise<string> {
  let history = await getChatHistory(user.id, 10);
  
  // We don't show "Thinking..." immediately, we let the AI decide if it needs to send a status message.
  bot.sendChatAction(chatId, 'typing').catch(() => {});
  
  let currentPrompt = prompt;
  let finalResponse = "";
  let loopCount = 0;
  const MAX_LOOPS = 5; // Prevent infinite loops

  while (loopCount < MAX_LOOPS) {
    let aiResponse = await ai.generateText(currentPrompt, history, userName);
    
    // Process [REACT: emoji] - React to user's message
    const reactRegex = /\[REACT:\s*(.+?)\]/g;
    let reactMatch;
    while ((reactMatch = reactRegex.exec(aiResponse)) !== null) {
      const emoji = reactMatch[1].trim();
      try {
        // Use raw request to ensure compatibility with all node-telegram-bot-api versions
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

    // Process [MESSAGE: text] - Send immediate intermediate message
    const messageRegex = /\[MESSAGE:\s*(.+?)\]/g;
    let msgMatch;
    while ((msgMatch = messageRegex.exec(aiResponse)) !== null) {
      const msgText = msgMatch[1].trim();
      await sendSafeMarkdown(bot, chatId, msgText);
      aiResponse = aiResponse.replace(msgMatch[0], '').trim();
    }

    // Process [IMAGE: prompt] - Generate image inline
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

    // Process [SEARCH: query] - DuckDuckGo HTML Search
    const searchMatch = aiResponse.match(/\[SEARCH:\s*(.+?)\]/);
    if (searchMatch) {
      const query = searchMatch[1].trim();
      const searchMsg = await bot.sendMessage(chatId, `🔍 <i>Searching the web for "${query}"...</i>`, { parse_mode: 'HTML' });
      
      try {
        // Using DuckDuckGo HTML search for free web search
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const html = await res.text();
        
        // Simple regex extraction of snippets (since we don't have cheerio)
        const snippetRegex = /<a class="result__snippet[^>]*>(.*?)<\/a>/g;
        let snippets = [];
        let sMatch;
        while ((sMatch = snippetRegex.exec(html)) !== null && snippets.length < 3) {
          snippets.push(sMatch[1].replace(/<[^>]+>/g, '').trim());
        }
        
        const summary = snippets.length > 0 ? snippets.join('\n\n') : "No relevant search results found.";
        
        // Save the AI's intent to search
        await addMessage(user.id, 'assistant', aiResponse);
        // Feed the results back
        await addMessage(user.id, 'system', `[Web Search Results for "${query}"]:\n${summary}`);
        
        await bot.deleteMessage(chatId, searchMsg.message_id).catch(() => {});
        
        currentPrompt = `Search results:\n${summary}\n\nPlease continue your answer based on these results.`;
        history = await getChatHistory(user.id, 12);
        loopCount++;
        continue;
      } catch (e) {
        await bot.deleteMessage(chatId, searchMsg.message_id).catch(() => {});
        currentPrompt = `[System: Web search failed. Inform the user and answer based on your existing knowledge.]`;
        history = await getChatHistory(user.id, 12);
        loopCount++;
        continue;
      }
    }

    // If no action tags are found, this is the final response
    finalResponse = aiResponse;
    break;
  }

  return finalResponse;
}

export async function startBot(token: string) {
  const bot = new TelegramBot(token, { 
    polling: {
      params: {
        allowed_updates: ['message', 'callback_query', 'message_reaction']
      }
    } 
  });
  const adminId = process.env.ADMIN_TELEGRAM_ID;

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getUser(chatId.toString());

    if (user.hf_api_key) {
      const welcomeBack = `
🚀 <b>Welcome back to Hugging Face AI!</b>

Your API key is already configured and you are ready to go.
Just send me a message, ask me to generate an image, write some code, or send a file/photo/voice note to analyze!

<i>Use /help to see everything I can do!</i>
      `;
      await bot.sendMessage(chatId, welcomeBack, { parse_mode: 'HTML' });
    } else {
      const welcomeMessage = `
🚀 <b>Welcome to Hugging Face AI!</b>
<i>Developed by AadityaLabs AI</i>

I am an advanced, Ultra Pro Max AI assistant powered by the best open-source models on Hugging Face. I work exactly like ChatGPT, but right here in Telegram! 

I have memory, I can generate stunning images, write code, analyze files, and even listen to your voice notes.

<b>To get started, you need to set up your Hugging Face API Key:</b>
1. Go to <a href="https://huggingface.co/settings/tokens">huggingface.co/settings/tokens</a> and create an account if you don't have one.
2. Create a new token (the "Read" role is fine).
3. Use the /settings command below to add your API key.

<i>Your API key is stored securely in your personal database partition and is only used for your requests.</i>
      `;
      await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
    }
  });

  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
🤖 <b>Hugging Face AI - Ultra Pro Max Features</b>

Here is what I can do for you:

💬 <b>Smart Chat & Memory:</b> Just talk to me! I remember our last 10 messages.
🌐 <b>Web Search & Reading:</b> I can search Wikipedia or read links you send me!
🎨 <b>Image Generation:</b> Say "generate an image of..." or "draw a..."
💻 <b>Code Generation:</b> Ask me to write code in any language.
🎙️ <b>Voice Recognition:</b> Send me a voice note, and I will transcribe and reply to it!
🔊 <b>Text-to-Speech:</b> Use <code>/tts [text]</code> to make me speak!
👁️ <b>Vision:</b> Send me a photo and ask me questions about it.
📄 <b>Document Analysis:</b> Send me a PDF, ZIP, TXT, CSV, or code file and I will read it!

<b>Commands:</b>
/start - Start the bot
/help - Show this message
/settings - Manage your API Key and Database
/newchat or /clear - Clear my memory of our current conversation
/tts [text] - Convert text to speech
/stats - View your usage statistics (Admin only)
    `;
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
  });

  bot.onText(/\/settings/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getUser(chatId.toString());

    let messageText = '⚙️ <b>Settings Menu</b>\n\n';
    let buttons = [];

    if (user.hf_api_key) {
      messageText += `✅ <b>API Key Status:</b> Connected\n`;
      messageText += `🔑 <b>Your API Key:</b> <tg-spoiler>${user.hf_api_key}</tg-spoiler>\n<i>(Tap to reveal)</i>\n\n`;
      messageText += `What would you like to do?`;
      
      buttons = [
        [
          { text: '🔄 Change API Key', callback_data: 'set_api_key' },
          { text: '🗑 Reset Database', callback_data: 'reset_db' }
        ]
      ];
    } else {
      messageText += `❌ <b>API Key Status:</b> Not Connected\n\n`;
      messageText += `Please set your Hugging Face API key to start using the bot.`;
      
      buttons = [
        [
          { text: '🔑 Set HF API Key', callback_data: 'set_api_key' },
          { text: '🗑 Reset Database', callback_data: 'reset_db' }
        ]
      ];
    }

    const opts = {
      parse_mode: 'HTML' as const,
      reply_markup: {
        inline_keyboard: buttons
      }
    };
    await bot.sendMessage(chatId, messageText, opts);
  });

  bot.onText(/\/(newchat|clear)/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getUser(chatId.toString());
    await clearChatHistory(user.id);
    await bot.sendMessage(chatId, "🧹 <b>Memory cleared.</b> Let's start a fresh conversation!", { parse_mode: 'HTML' });
  });

  bot.onText(/\/resetdb/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getUser(chatId.toString());
    await resetDatabase(user.id);
    await bot.sendMessage(chatId, '💥 <b>Database reset successfully.</b> All your data and API keys have been deleted.', { parse_mode: 'HTML' });
  });

  bot.onText(/\/tts (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const textToSpeak = match ? match[1] : '';
    
    if (!textToSpeak) {
      await bot.sendMessage(chatId, '⚠️ Please provide text. Example: <code>/tts Hello world!</code>', { parse_mode: 'HTML' });
      return;
    }

    const user = await getUser(chatId.toString());
    if (!user.hf_api_key) {
      await bot.sendMessage(chatId, '⚠️ <b>Please set your Hugging Face API Key first</b> using the /settings command.', { parse_mode: 'HTML' });
      return;
    }

    try {
      const ai = new ModelManager(user.hf_api_key);
      await bot.sendMessage(chatId, '🔊 <i>Generating audio...</i>', { parse_mode: 'HTML' });
      
      const audioBlob = await withContinuousAction(bot, chatId, 'record_voice', async () => {
        const langCode = await ai.detectLanguage(textToSpeak);
        return await ai.generateAudio(textToSpeak, langCode);
      });
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await bot.sendVoice(chatId, buffer);
    } catch (error: any) {
      console.error(error);
      await bot.sendMessage(chatId, '❌ <b>Failed to generate audio.</b> The TTS model might be temporarily unavailable.', { parse_mode: 'HTML' });
    }
  });

  // Admin Commands
  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    if (adminId && chatId.toString() === adminId) {
      const stats = await getStats();
      await bot.sendMessage(chatId, `📊 <b>Bot Statistics:</b>\n\n👥 Users: ${stats.users}\n💬 Messages Processed: ${stats.messages}`, { parse_mode: 'HTML' });
    }
  });

  bot.onText(/\/broadcast/, async (msg) => {
    const chatId = msg.chat.id;
    if (adminId && chatId.toString() === adminId) {
      waitingForBroadcast.add(chatId);
      await bot.sendMessage(chatId, '📢 <b>Please send the message you want to broadcast to all users:</b>', { parse_mode: 'HTML' });
    }
  });

  bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    if (!msg) return;
    const chatId = msg.chat.id;

    if (callbackQuery.data === 'set_api_key') {
      waitingForApiKey.add(chatId);
      await bot.sendMessage(chatId, '🔑 <b>Please send me your Hugging Face API Key now:</b>', { parse_mode: 'HTML' });
    } else if (callbackQuery.data === 'reset_db') {
      const user = await getUser(chatId.toString());
      await resetDatabase(user.id);
      await bot.sendMessage(chatId, '💥 <b>Database reset successfully.</b> All your data has been deleted.', { parse_mode: 'HTML' });
    }
    
    await bot.answerCallbackQuery(callbackQuery.id);
  });

  bot.onText(/\/cancel/, async (msg) => {
    const chatId = msg.chat.id;
    if (waitingForApiKey.has(chatId) || waitingForBroadcast.has(chatId)) {
      waitingForApiKey.delete(chatId);
      waitingForBroadcast.delete(chatId);
      await bot.sendMessage(chatId, '🚫 <b>Operation cancelled.</b>', { parse_mode: 'HTML' });
    } else {
      await bot.sendMessage(chatId, 'Nothing to cancel.', { parse_mode: 'HTML' });
    }
  });

  // Handle user reactions to messages
  bot.on('message_reaction' as any, async (reaction: any) => {
    try {
      const chatId = reaction.chat.id;
      const user = await getUser(chatId.toString());
      
      if (reaction.new_reaction && reaction.new_reaction.length > 0) {
        const emojis = reaction.new_reaction.filter((r: any) => r.type === 'emoji').map((r: any) => r.emoji).join(', ');
        if (emojis) {
          // Coordinate memory: Save the reaction so the AI knows the user's emotion/response
          await addMessage(user.id, 'user', `[User reacted to your message with: ${emojis}]`);
        }
      }
    } catch (e) {
      console.error('Error handling reaction:', e);
    }
  });

  // Handle polling errors gracefully (e.g. invalid token)
  bot.on('polling_error', (error: any) => {
    console.error('Telegram Polling Error:', error.message);
    if (error.message && error.message.includes('401 Unauthorized')) {
      console.error('CRITICAL: The Telegram Bot Token is invalid or revoked. Please check your TELEGRAM_BOT_TOKEN environment variable.');
    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands
    if (text && text.startsWith('/')) return;

    // Handle unsupported message types gracefully
    if (msg.video || msg.sticker || msg.location || msg.contact) {
      await bot.sendMessage(chatId, '🙏 <b>Sorry!</b> I currently only support text, photos, voice notes, and documents (PDF/ZIP/Code).', { parse_mode: 'HTML' });
      return;
    }

    // Admin Broadcast Logic
    if (waitingForBroadcast.has(chatId) && text && adminId && chatId.toString() === adminId) {
      waitingForBroadcast.delete(chatId);
      await bot.sendMessage(chatId, '📢 Broadcasting message...');
      
      const users = await getAllUsers();
      let successCount = 0;
      for (const user of users) {
        try {
          await bot.sendMessage(user.telegram_id, `📢 <b>Admin Broadcast:</b>\n\n${text}`, { parse_mode: 'HTML' });
          successCount++;
        } catch (e) {
          console.error(`Failed to send broadcast to ${user.telegram_id}`);
        }
      }
      await bot.sendMessage(chatId, `✅ Broadcast sent successfully to ${successCount}/${users.length} users.`);
      return;
    }

    // API Key Input Logic
    if (waitingForApiKey.has(chatId) && text) {
      const apiKey = text.trim();
      const ai = new ModelManager(apiKey);
      
      await bot.sendMessage(chatId, '⏳ <i>Validating your API key...</i>', { parse_mode: 'HTML' });
      const isValid = await ai.validateApiKey();
      
      if (isValid) {
        await updateUserApiKey(chatId.toString(), apiKey);
        waitingForApiKey.delete(chatId);
        await bot.sendMessage(chatId, '✅ <b>Hugging Face API Key saved successfully!</b> You can now start chatting.', { parse_mode: 'HTML' });
      } else {
        await bot.sendMessage(chatId, '❌ <b>Invalid API Key.</b> Please check your key and try again. Send the key again, or use /settings later.', { parse_mode: 'HTML' });
      }
      return;
    }

    const user = await getUser(chatId.toString());
    if (!user.hf_api_key) {
      await bot.sendMessage(chatId, '⚠️ <b>Please set your Hugging Face API Key first</b> using the /settings command.', { parse_mode: 'HTML' });
      return;
    }

    if (text) {
      try {
        const ai = new ModelManager(user.hf_api_key);

        await addMessage(user.id, 'user', text);

        // URL Extraction & Reading
        let enhancedPrompt = text;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = text.match(urlRegex);
        if (urls && urls.length > 0) {
          const url = urls[0];
          const readingMsg = await bot.sendMessage(chatId, `🌐 <i>Reading webpage: ${url}...</i>`, { parse_mode: 'HTML' });
          try {
            const res = await fetch(url);
            const html = await res.text();
            const textContent = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                                    .replace(/<[^>]+>/g, ' ')
                                    .replace(/\s+/g, ' ')
                                    .substring(0, 5000);
            enhancedPrompt = `User provided a link: ${url}\n\nExtracted Webpage Content:\n${textContent}\n\nUser's message: ${text}`;
          } catch (e) {
            enhancedPrompt = `User provided a link: ${url} but I couldn't read it. User's message: ${text}`;
          }
          await bot.deleteMessage(chatId, readingMsg.message_id).catch(() => {});
        }
        
        const response = await generateAgenticText(ai, enhancedPrompt, user, msg.from?.first_name || 'User', bot, chatId, msg.message_id);
        
        // Use safe Markdown sending for beautiful formatting
        await processAndSendAiResponse(bot, chatId, response);
        await addMessage(user.id, 'assistant', response);
      } catch (error: any) {
        console.error(error);
        if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Invalid token'))) {
           await bot.sendMessage(chatId, '❌ <b>Your Hugging Face API Key is no longer working or invalid.</b> Please set a new one using /settings.', { parse_mode: 'HTML' });
        } else if (error.message && error.message.includes('loading')) {
           await bot.sendMessage(chatId, '⏳ <i>The AI model is currently loading on Hugging Face servers. Please try again in 10-20 seconds.</i>', { parse_mode: 'HTML' });
        } else {
           await bot.sendMessage(chatId, '❌ <b>Error processing your request.</b> The model might be overloaded or temporarily unavailable. Please try again in a moment.', { parse_mode: 'HTML' });
        }
      }
    } else if (msg.voice || msg.audio) {
      try {
        const ai = new ModelManager(user.hf_api_key);
        const fileId = msg.voice ? msg.voice.file_id : msg.audio!.file_id;
        const fileLink = await bot.getFileLink(fileId);
        
        await bot.sendMessage(chatId, '🎙️ <i>Listening to your audio...</i>', { parse_mode: 'HTML' });
        
        const response = await fetch(fileLink);
        const blob = await response.blob();
        
        const transcribedText = await withContinuousAction(bot, chatId, 'typing', async () => {
          return await ai.transcribeAudio(blob);
        });
        
        await bot.sendMessage(chatId, `🗣️ <b>You said:</b> "${transcribedText}"\n\n<i>Thinking...</i>`, { parse_mode: 'HTML' });
        
        // Coordinate memory: Save the transcribed voice note as user input
        await addMessage(user.id, 'user', `[Voice Note]: ${transcribedText}`);
        
        // Fetch history and generate response based on transcribed text
        const history = await getChatHistory(user.id, 10);
        
        // Instruct the AI to be concise and use the same language
        const voicePrompt = `[Voice Note from User]: "${transcribedText}"\n\nInstruction: Reply to this voice note in the EXACT SAME LANGUAGE the user spoke. Keep your response concise, friendly, and conversational, as it will be converted to a voice message. Do not use code blocks or complex markdown.`;
        
        const aiResponse = await generateAgenticText(ai, voicePrompt, user, msg.from?.first_name || 'User', bot, chatId, msg.message_id);
        
        await processAndSendAiResponse(bot, chatId, aiResponse);
        await addMessage(user.id, 'assistant', aiResponse);

        // Generate Voice Note Reply
        await bot.sendMessage(chatId, '🎙️ <i>Recording reply...</i>', { parse_mode: 'HTML' });
        
        const audioBlob = await withContinuousAction(bot, chatId, 'record_voice', async () => {
          const langCode = await ai.detectLanguage(aiResponse);
          return await ai.generateAudio(aiResponse, langCode);
        });
        
        const arrayBuffer = await audioBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await bot.sendVoice(chatId, buffer);

      } catch (error: any) {
        console.error(error);
        if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
           await bot.sendMessage(chatId, '❌ <b>Your Hugging Face API Key is no longer working.</b> Please set a new one using /settings.', { parse_mode: 'HTML' });
        } else {
           await bot.sendMessage(chatId, '❌ <b>Error processing audio.</b> The transcription model might be temporarily unavailable.', { parse_mode: 'HTML' });
        }
      }
    } else if (msg.photo) {
      try {
        const ai = new ModelManager(user.hf_api_key);
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        const fileLink = await bot.getFileLink(fileId);
        
        const thinkingMsg = await bot.sendMessage(chatId, '👁️ <i>Analyzing image...</i>', { parse_mode: 'HTML' });
        
        const response = await fetch(fileLink);
        const blob = await response.blob();
        
        const caption = msg.caption || 'Describe this image';
        
        const analysis = await withContinuousAction(bot, chatId, 'typing', async () => {
          return await ai.analyzeImage(blob, caption);
        });
        
        await bot.deleteMessage(chatId, thinkingMsg.message_id).catch(() => {});
        
        await sendSafeMarkdown(bot, chatId, analysis);
        
        // Coordinate memory: Save the image description so the text model knows what the user sent
        await addMessage(user.id, 'user', `[User sent an image. Visual description of the image: "${analysis}". User's caption: "${caption}"]`);
        await addMessage(user.id, 'assistant', analysis);
      } catch (error: any) {
        console.error(error);
        if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
           await bot.sendMessage(chatId, '❌ <b>Your Hugging Face API Key is no longer working.</b> Please set a new one using /settings.', { parse_mode: 'HTML' });
        } else {
           await bot.sendMessage(chatId, '❌ <b>Error analyzing image.</b> The vision model might be temporarily unavailable.', { parse_mode: 'HTML' });
        }
      }
    } else if (msg.document) {
      const fileId = msg.document.file_id;
      const fileName = msg.document.file_name || '';
      const fileSize = msg.document.file_size || 0;
      
      if (fileSize > 10 * 1024 * 1024) {
        await bot.sendMessage(chatId, '❌ <b>File is too large.</b> Please send files smaller than 10MB.', { parse_mode: 'HTML' });
        return;
      }

      try {
        const ai = new ModelManager(user.hf_api_key);
        const fileLink = await bot.getFileLink(fileId);
        const response = await fetch(fileLink);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let extractedText = '';

        if (fileName.endsWith('.pdf')) {
          await bot.sendMessage(chatId, '📄 <i>Reading PDF...</i>', { parse_mode: 'HTML' });
          const pdfParse = (await import('pdf-parse')) as any;
          const pdfParseFn = pdfParse.default || pdfParse;
          const pdfData = await pdfParseFn(buffer);
          extractedText = pdfData.text;
        } else if (fileName.match(/\.(txt|md|csv|json|js|py|ts|html|css|cpp|java)$/i)) {
          await bot.sendMessage(chatId, `📄 <i>Reading ${fileName}...</i>`, { parse_mode: 'HTML' });
          extractedText = buffer.toString('utf-8');
        } else if (fileName.endsWith('.zip')) {
          await bot.sendMessage(chatId, '🗜️ <i>Analyzing ZIP...</i>', { parse_mode: 'HTML' });
          const AdmZip = (await import('adm-zip')).default;
          const zip = new AdmZip(buffer);
          const zipEntries = zip.getEntries();
          
          extractedText = `ZIP Contents of ${fileName}:\n`;
          zipEntries.forEach((zipEntry) => {
            extractedText += `- ${zipEntry.entryName} (${zipEntry.header.size} bytes)\n`;
            if (!zipEntry.isDirectory && zipEntry.header.size < 50000 && (zipEntry.entryName.match(/\.(txt|md|csv|json|js|py|ts|html|css)$/i))) {
               extractedText += `  Content preview: ${zipEntry.getData().toString('utf8').substring(0, 200)}...\n`;
            }
          });
        } else {
          await bot.sendMessage(chatId, '⚠️ <b>Unsupported file type.</b> I can analyze PDF, ZIP, and plain text/code files.', { parse_mode: 'HTML' });
          return;
        }

        const prompt = `I have extracted the following content from a file named ${fileName}. Please analyze it and provide a summary or answer my question about it.\n\nContent:\n${extractedText.substring(0, 4000)}\n\nUser Question: ${msg.caption || 'What is this file about?'}`;
        
        // Coordinate memory: Save the file content so the text model remembers it
        await addMessage(user.id, 'user', `[User sent a file named ${fileName}. Extracted content preview: "${extractedText.substring(0, 1000)}...". User's caption: "${msg.caption || ''}"]`);
        
        const history = await getChatHistory(user.id, 10);
        
        const thinkingMsg = await bot.sendMessage(chatId, '🧠 <i>Analyzing document...</i>', { parse_mode: 'HTML' });
        
        const aiResponse = await generateAgenticText(ai, prompt, user, msg.from?.first_name || 'User', bot, chatId, msg.message_id);
        
        await bot.deleteMessage(chatId, thinkingMsg.message_id).catch(() => {});
        
        await processAndSendAiResponse(bot, chatId, aiResponse);
        await addMessage(user.id, 'assistant', aiResponse);

      } catch (error: any) {
        console.error(error);
        if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
           await bot.sendMessage(chatId, '❌ <b>Your Hugging Face API Key is no longer working.</b> Please set a new one using /settings.', { parse_mode: 'HTML' });
        } else {
           await bot.sendMessage(chatId, '❌ <b>Error processing the document.</b>', { parse_mode: 'HTML' });
        }
      }
    }
  });
}
