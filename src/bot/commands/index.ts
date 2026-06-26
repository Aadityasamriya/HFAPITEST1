import TelegramBot from 'node-telegram-bot-api';
import { getUser, updateUserApiKey, clearChatHistory, resetDatabase, getStats, getAllUsers, getTopics, setActiveTopic } from '../../db/index';
import { ModelManager } from '../../ai/index';
import { sendSafeHtml } from '../utils/telegram';

export async function handleStartCommand(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  try {
    const user = await getUser(msg.from!.id, msg.from!.first_name, msg.from!.username);
    const webUrl = process.env.PUBLIC_URL || 'https://ais-pre-kqqznwd43u52hcij2wfzgv-15028068203.asia-east1.run.app';
    
    const welcomeMessage = `
🌟 <b>Welcome to Hugging Face, ${user.name}!</b> 🌟

I am a highly advanced AI Assistant. I can:
💬 Chat with you using state-of-the-art intelligence
🎨 Generate breathtaking images
🎙️ Transcribe voice messages
🔍 Search the web for real-time info
📄 Read PDFs and ZIP files

<b>To get started, you need to connect your API Key.</b>
Get it for free here: <a href="https://huggingface.co/settings/tokens">API Tokens</a>
    `;
    
    await sendSafeHtml(bot, chatId, welcomeMessage, { 
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: '⚙️ Configure API Key', callback_data: 'action_settings' }],
          [{ text: '➕ New Chat', callback_data: 'action_newchat' }, { text: '📜 History', callback_data: 'action_history' }],
          [{ text: '💻 Launch Mini App', web_app: { url: webUrl } }]
        ]
      }
    });
  } catch (error: any) {
    console.error('Start Command Error:', error);
    if (error.name === 'MongoServerSelectionError' || error.message?.includes('MongoNetworkError') || error.message?.includes('getaddrinfo EAI_AGAIN')) {
      await sendSafeHtml(bot, chatId, `❌ <b>Database Connection Failed.</b>\nYour <code>MONGODB_URI</code> seems to be invalid or private.`);
    }
  }
}

export async function handleSettingsCommand(bot: TelegramBot, msg: TelegramBot.Message, waitingForApiKey: Set<number>) {
  const chatId = msg.chat.id;
  try {
    const user = await getUser(msg.from!.id, msg.from!.first_name, msg.from!.username);
    
    let statusMsg = `⚙️ <b>Settings</b>\n\n`;
    if (user.hfApiKey) {
      statusMsg += `✅ <b>API Key:</b> Connected (ends in ...${user.hfApiKey.slice(-4)})\n`;
    } else {
      statusMsg += `❌ <b>API Key:</b> Not connected\n`;
    }
    
    statusMsg += `\nTo update your API key, reply to this message with your new key.`;
    
    waitingForApiKey.add(msg.from!.id);
    await sendSafeHtml(bot, chatId, statusMsg);
  } catch (error: any) {
    if (error.name === 'MongoServerSelectionError' || error.message?.includes('MongoNetworkError') || error.message?.includes('getaddrinfo EAI_AGAIN')) {
      await sendSafeHtml(bot, chatId, `❌ <b>Database Connection Failed.</b>\nYour <code>MONGODB_URI</code> seems to be invalid or private.`);
    }
  }
}

export async function handleNewChatCommand(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  try {
    await setActiveTopic(msg.from!.id, `topic_${Date.now()}`);
    await sendSafeHtml(bot, chatId, `✨ <b>New chat started!</b> What's on your mind?`);
  } catch (error: any) {
    if (error.name === 'MongoServerSelectionError' || error.message?.includes('MongoNetworkError') || error.message?.includes('getaddrinfo')) {
      await sendSafeHtml(bot, chatId, `❌ <b>Database Connection Failed.</b>\nYour <code>MONGODB_URI</code> seems to be invalid or private.`);
    }
  }
}

export async function handleHistoryCommand(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  try {
    const topics = await getTopics(msg.from!.id);
    
    if (topics.length === 0) {
      await sendSafeHtml(bot, chatId, `📜 <b>History</b>\n\nYou don't have any past conversations yet. Start chatting!`);
      return;
    }
    
    const inlineKeyboard = topics.slice(0, 10).map(topic => ([{
      text: `💬 ${topic.title}`,
      callback_data: `topic_${topic.topic_id}`
    }]));
    
    await sendSafeHtml(bot, chatId, `📜 <b>Your Recent Conversations</b>\n\nClick a button below to resume a topic (Note: Telegram bot currently uses a single continuous context, but you can view these topics on the website!):`, {
      reply_markup: { inline_keyboard: inlineKeyboard }
    });
  } catch (error: any) {
    if (error.name === 'MongoServerSelectionError' || error.message?.includes('MongoNetworkError') || error.message?.includes('getaddrinfo')) {
      await sendSafeHtml(bot, chatId, `❌ <b>Database Connection Failed.</b>\nYour <code>MONGODB_URI</code> seems to be invalid or private.`);
    }
  }
}

export async function handleResetDbCommand(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  try {
    await resetDatabase(msg.from!.id);
    await sendSafeHtml(bot, chatId, `🗑️ <b>Database Reset Complete.</b> All your data, history, and settings have been wiped. Use /start to begin again.`);
  } catch (error: any) {}
}

export async function handleLoginCommand(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  try {
    const webUrl = process.env.PUBLIC_URL || 'https://ais-pre-kqqznwd43u52hcij2wfzgv-15028068203.asia-east1.run.app';
    
    await sendSafeHtml(bot, chatId, `🔐 <b>Launch Mini App</b>\n\nClick the button below to open the app seamlessly inside Telegram.\nYour account will be connected instantly.`, {
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: "🚀 Launch App", web_app: { url: webUrl } }]]
      }
    });
  } catch (error: any) {
    console.error('Login Command Error:', error);
    await sendSafeHtml(bot, chatId, `❌ <b>Failed to generate dashboard link.</b> Please try again.`);
  }
}

export async function handleAdminCommand(bot: TelegramBot, msg: TelegramBot.Message, waitingForBroadcast: Set<number>) {
  const chatId = msg.chat.id;
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  
  // Check if user is admin
  if (!adminId || msg.from?.id.toString() !== adminId) {
    await sendSafeHtml(bot, chatId, `❌ <b>Access Denied.</b> You are not an administrator.`);
    return;
  }
  
  const stats = await getStats();
  
  const adminMsg = `
👑 <b>Admin Dashboard</b>

👥 Total Users: ${stats.users}
💬 Total Messages: ${stats.messages}

Reply to this message with text to broadcast an announcement to all users.
  `;
  
  waitingForBroadcast.add(msg.from!.id);
  await sendSafeHtml(bot, chatId, adminMsg);
}
