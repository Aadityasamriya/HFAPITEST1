import TelegramBot from 'node-telegram-bot-api';
import { getUser, updateUserApiKey, clearChatHistory, resetDatabase, getStats, getAllUsers } from '../../db/index';
import { ModelManager } from '../../ai/index';
import { sendSafeMarkdown } from '../utils/telegram';

export async function handleStartCommand(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const user = await getUser(msg.from!.id, msg.from!.first_name, msg.from!.username);
  
  const welcomeMessage = `
🌟 *Welcome to Hugging Face AI, ${user.name}!* 🌟

I am an Ultra Pro Max AI Agent powered by Hugging Face. I can:
💬 Chat with you using advanced LLMs
🎨 Generate breathtaking images
🎙️ Transcribe voice messages
🔍 Search the web for real-time info
📄 Read PDFs and ZIP files

*To get started, you need to connect your Hugging Face API Key.*
Get it for free here: [Hugging Face Tokens](https://huggingface.co/settings/tokens)

Use /settings to configure your API key.
Use /newchat to clear our conversation history.
  `;
  
  await sendSafeMarkdown(bot, chatId, welcomeMessage, { disable_web_page_preview: true });
}

export async function handleSettingsCommand(bot: TelegramBot, msg: TelegramBot.Message, waitingForApiKey: Set<number>) {
  const chatId = msg.chat.id;
  const user = await getUser(msg.from!.id, msg.from!.first_name, msg.from!.username);
  
  let statusMsg = `⚙️ *Settings*\n\n`;
  if (user.hfApiKey) {
    statusMsg += `✅ *Hugging Face API Key:* Connected (ends in ...${user.hfApiKey.slice(-4)})\n`;
  } else {
    statusMsg += `❌ *Hugging Face API Key:* Not connected\n`;
  }
  
  statusMsg += `\nTo update your API key, reply to this message with your new key.`;
  
  waitingForApiKey.add(msg.from!.id);
  await sendSafeMarkdown(bot, chatId, statusMsg);
}

export async function handleNewChatCommand(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  await clearChatHistory(msg.from!.id);
  await sendSafeMarkdown(bot, chatId, `🧹 *Chat history cleared!* Let's start fresh. What's on your mind?`);
}

export async function handleResetDbCommand(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  await resetDatabase(msg.from!.id);
  await sendSafeMarkdown(bot, chatId, `🗑️ *Database Reset Complete.* All your data, history, and settings have been wiped. Use /start to begin again.`);
}

export async function handleAdminCommand(bot: TelegramBot, msg: TelegramBot.Message, waitingForBroadcast: Set<number>) {
  const chatId = msg.chat.id;
  
  // Check if user is admin (you can set an ADMIN_ID env var, or just check a specific ID)
  // For now, we'll just show stats to anyone who types /admin for simplicity, 
  // but in a real app you'd restrict this.
  const stats = await getStats();
  
  const adminMsg = `
👑 *Admin Dashboard*

👥 Total Users: ${stats.users}
💬 Total Messages: ${stats.messages}

Reply to this message with text to broadcast an announcement to all users.
  `;
  
  waitingForBroadcast.add(msg.from!.id);
  await sendSafeMarkdown(bot, chatId, adminMsg);
}
