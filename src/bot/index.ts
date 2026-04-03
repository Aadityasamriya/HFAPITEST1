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
    const welcomeMessage = `
Welcome to Hugging Face By AadityaLabs AI! 🚀

I am an advanced AI assistant powered by Hugging Face models. I can chat, generate images, write code, and analyze files.

To get started, you need to set up your Hugging Face API Key.
1. Go to huggingface.co and create an account.
2. Go to Settings > Access Tokens and create a new token (read role is fine for inference).
3. Use the /settings command to add your API key.

Your API key is stored securely in your personal database and your credits will be used for all generations.
    `;
    await bot.sendMessage(chatId, welcomeMessage);
  });

  bot.onText(/\/settings/, async (msg) => {
    const chatId = msg.chat.id;
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔑 Set HF API Key', callback_data: 'set_api_key' },
            { text: '🗑 Reset Database', callback_data: 'reset_db' }
          ]
        ]
      }
    };
    await bot.sendMessage(chatId, '⚙️ Settings Menu:', opts);
  });

  bot.onText(/\/newchat/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getUser(chatId.toString());
    await clearChatHistory(user.id);
    await bot.sendMessage(chatId, "🧹 Chat history cleared. Let's start fresh!");
  });

  bot.onText(/\/resetdb/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getUser(chatId.toString());
    await resetDatabase(user.id);
    await bot.sendMessage(chatId, '💥 Database reset successfully. All your data has been deleted.');
  });

  // Admin Commands
  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    if (adminId && chatId.toString() === adminId) {
      const stats = await getStats();
      await bot.sendMessage(chatId, `📊 Bot Statistics:\n\nUsers: ${stats.users}\nMessages Processed: ${stats.messages}`);
    }
  });

  bot.onText(/\/broadcast/, async (msg) => {
    const chatId = msg.chat.id;
    if (adminId && chatId.toString() === adminId) {
      waitingForBroadcast.add(chatId);
      await bot.sendMessage(chatId, '📢 Please send the message you want to broadcast to all users:');
    }
  });

  bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    if (!msg) return;
    const chatId = msg.chat.id;

    if (callbackQuery.data === 'set_api_key') {
      waitingForApiKey.add(chatId);
      await bot.sendMessage(chatId, 'Please send me your Hugging Face API Key now:');
    } else if (callbackQuery.data === 'reset_db') {
      const user = await getUser(chatId.toString());
      await resetDatabase(user.id);
      await bot.sendMessage(chatId, '💥 Database reset successfully. All your data has been deleted.');
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
          await bot.sendMessage(user.telegram_id, `📢 Admin Broadcast:\n\n${text}`);
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
      
      await bot.sendMessage(chatId, '⏳ Validating your API key...');
      const isValid = await ai.validateApiKey();
      
      if (isValid) {
        await updateUserApiKey(chatId.toString(), apiKey);
        waitingForApiKey.delete(chatId);
        await bot.sendMessage(chatId, '✅ Hugging Face API Key saved successfully! You can now start chatting.');
      } else {
        await bot.sendMessage(chatId, '❌ Invalid API Key. Please check your key and try again. Send the key again, or use /settings later.');
      }
      return;
    }

    const user = await getUser(chatId.toString());
    if (!user.hf_api_key) {
      await bot.sendMessage(chatId, '⚠️ Please set your Hugging Face API Key first using the /settings command.');
      return;
    }

    if (text) {
      await bot.sendChatAction(chatId, 'typing');
      try {
        const ai = new ModelManager(user.hf_api_key);
        const intent = await ai.classifyIntent(text);

        await addMessage(user.id, 'user', text);

        if (intent === 'image_generation') {
          await bot.sendMessage(chatId, '🎨 Generating image, please wait...');
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
           await bot.sendMessage(chatId, '❌ Your Hugging Face API Key is no longer working or invalid. Please set a new one using /settings.');
        } else {
           await bot.sendMessage(chatId, '❌ Error processing your request. The model might be loading or unavailable. Please try again later.');
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
           await bot.sendMessage(chatId, '❌ Your Hugging Face API Key is no longer working. Please set a new one using /settings.');
        } else {
           await bot.sendMessage(chatId, '❌ Error analyzing image.');
        }
      }
    } else if (msg.document) {
      const fileId = msg.document.file_id;
      const fileName = msg.document.file_name || '';
      const fileSize = msg.document.file_size || 0;
      
      if (fileSize > 10 * 1024 * 1024) {
        await bot.sendMessage(chatId, '❌ File is too large. Please send files smaller than 10MB.');
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
          await bot.sendMessage(chatId, '📄 Reading PDF...');
          const pdfParse = (await import('pdf-parse')) as any;
          const pdfParseFn = pdfParse.default || pdfParse;
          const pdfData = await pdfParseFn(buffer);
          extractedText = pdfData.text;
        } else if (fileName.endsWith('.zip')) {
          await bot.sendMessage(chatId, '🗜️ Analyzing ZIP...');
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
          await bot.sendMessage(chatId, '⚠️ Unsupported file type. I can analyze PDF and ZIP files.');
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
           await bot.sendMessage(chatId, '❌ Your Hugging Face API Key is no longer working. Please set a new one using /settings.');
        } else {
           await bot.sendMessage(chatId, '❌ Error processing the document.');
        }
      }
    }
  });
}
