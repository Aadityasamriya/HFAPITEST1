import TelegramBot from 'node-telegram-bot-api';
import { getUser, updateUserApiKey, addMessage, getChatHistory, clearChatHistory, resetDatabase, getStats, getAllUsers } from '../db/index';
import { ModelManager } from '../ai/index';

// State to track if user is currently entering an API key
const waitingForApiKey = new Set<number>();
// State to track if admin is broadcasting
const waitingForBroadcast = new Set<number>();

export async function startBot(token: string) {
  const bot = new TelegramBot(token, { polling: true });
  const adminId = process.env.ADMIN_TELEGRAM_ID;

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getUser(chatId.toString());

    if (user.hf_api_key) {
      const welcomeBack = `
🚀 <b>Welcome back to Hugging Face By AadityaLabs AI!</b>

Your API key is already configured and you are ready to go.
Just send me a message, ask me to generate an image, write some code, or send a file/photo to analyze!

<i>Use /settings to manage your account or /newchat to clear the current conversation.</i>
      `;
      await bot.sendMessage(chatId, welcomeBack, { parse_mode: 'HTML' });
    } else {
      const welcomeMessage = `
🚀 <b>Welcome to Hugging Face By AadityaLabs AI!</b>

I am an advanced AI assistant powered by the best open-source models on Hugging Face. I can chat, generate stunning images, write code, and analyze files.

<b>To get started, you need to set up your Hugging Face API Key:</b>
1. Go to <a href="https://huggingface.co/settings/tokens">huggingface.co/settings/tokens</a> and create an account if you don't have one.
2. Create a new token (the "Read" role is fine).
3. Use the /settings command below to add your API key.

<i>Your API key is stored securely in your personal database partition and is only used for your requests.</i>
      `;
      await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
    }
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

  bot.onText(/\/newchat/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getUser(chatId.toString());
    await clearChatHistory(user.id);
    await bot.sendMessage(chatId, "🧹 <b>Chat history cleared.</b> Let's start fresh!", { parse_mode: 'HTML' });
  });

  bot.onText(/\/resetdb/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getUser(chatId.toString());
    await resetDatabase(user.id);
    await bot.sendMessage(chatId, '💥 <b>Database reset successfully.</b> All your data and API keys have been deleted.', { parse_mode: 'HTML' });
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

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands
    if (text && text.startsWith('/')) return;

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
      await bot.sendChatAction(chatId, 'typing');
      try {
        const ai = new ModelManager(user.hf_api_key);
        const intent = await ai.classifyIntent(text);

        await addMessage(user.id, 'user', text);

        if (intent === 'image_generation') {
          await bot.sendMessage(chatId, '🎨 <i>Generating image, please wait...</i>', { parse_mode: 'HTML' });
          const imageBlob = await ai.generateImage(text);
          const arrayBuffer = await imageBlob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          await bot.sendPhoto(chatId, buffer);
          await addMessage(user.id, 'assistant', '[Image Generated]');
        } else {
          const isCode = intent === 'code_generation';
          const history = await getChatHistory(user.id, 5);
          const response = await ai.generateText(text, history, isCode);
          await bot.sendMessage(chatId, response, { parse_mode: isCode ? 'Markdown' : undefined });
          await addMessage(user.id, 'assistant', response);
        }
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
    } else if (msg.photo) {
      await bot.sendChatAction(chatId, 'typing');
      try {
        const ai = new ModelManager(user.hf_api_key);
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        const fileLink = await bot.getFileLink(fileId);
        
        const response = await fetch(fileLink);
        const blob = await response.blob();
        
        const caption = msg.caption || 'Describe this image';
        const analysis = await ai.analyzeImage(blob, caption);
        
        await bot.sendMessage(chatId, analysis);
        await addMessage(user.id, 'user', `[Image Sent] ${caption}`);
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

      await bot.sendChatAction(chatId, 'typing');
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
        } else if (fileName.endsWith('.zip')) {
          await bot.sendMessage(chatId, '🗜️ <i>Analyzing ZIP...</i>', { parse_mode: 'HTML' });
          const AdmZip = (await import('adm-zip')).default;
          const zip = new AdmZip(buffer);
          const zipEntries = zip.getEntries();
          
          extractedText = `ZIP Contents of ${fileName}:\n`;
          zipEntries.forEach((zipEntry) => {
            extractedText += `- ${zipEntry.entryName} (${zipEntry.header.size} bytes)\n`;
            if (!zipEntry.isDirectory && zipEntry.header.size < 50000 && (zipEntry.entryName.endsWith('.txt') || zipEntry.entryName.endsWith('.md') || zipEntry.entryName.endsWith('.json') || zipEntry.entryName.endsWith('.py') || zipEntry.entryName.endsWith('.js'))) {
               extractedText += `  Content preview: ${zipEntry.getData().toString('utf8').substring(0, 200)}...\n`;
            }
          });
        } else {
          await bot.sendMessage(chatId, '⚠️ <b>Unsupported file type.</b> I can analyze PDF and ZIP files.', { parse_mode: 'HTML' });
          return;
        }

        const prompt = `I have extracted the following content from a file named ${fileName}. Please analyze it and provide a summary or answer my question about it.\n\nContent:\n${extractedText.substring(0, 4000)}\n\nUser Question: ${msg.caption || 'What is this file about?'}`;
        
        const history = await getChatHistory(user.id, 5);
        const aiResponse = await ai.generateText(prompt, history, false);
        
        await bot.sendMessage(chatId, aiResponse);
        await addMessage(user.id, 'user', `[Sent file: ${fileName}] ${msg.caption || ''}`);
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
