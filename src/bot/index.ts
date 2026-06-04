import TelegramBot from 'node-telegram-bot-api';
import { handleStartCommand, handleSettingsCommand, handleNewChatCommand, handleResetDbCommand, handleAdminCommand, handleHistoryCommand } from './commands/index';
import { handleTextMessage, handleVoiceMessage, handleDocumentMessage } from './handlers/index';

// State to track if user is currently entering an API key
const waitingForApiKey = new Set<number>();
// State to track if admin is broadcasting
const waitingForBroadcast = new Set<number>();

export async function startBot(token: string) {
  const bot = new TelegramBot(token, { polling: true });

  bot.on('error', (error: any) => {
    console.error(`[Telegram Bot Error]:`, error);
  });

  bot.on('polling_error', (error: any) => {
    console.error(`[Telegram Polling Error]: ${error.code} - ${error.message}`);
    if (error.code === 'ETELEGRAM' && error.message.includes('401 Unauthorized')) {
      console.error('CRITICAL: Your TELEGRAM_BOT_TOKEN is invalid or has been revoked. Please update it in your environment variables.');
    }
  });

  // --- Commands ---
  bot.onText(/^\/start$/, (msg) => handleStartCommand(bot, msg));
  bot.onText(/^\/settings$/, (msg) => handleSettingsCommand(bot, msg, waitingForApiKey));
  bot.onText(/^\/newchat$/, (msg) => handleNewChatCommand(bot, msg));
  bot.onText(/^\/history$/, (msg) => handleHistoryCommand(bot, msg));
  bot.onText(/^\/resetdb$/, (msg) => handleResetDbCommand(bot, msg));
  bot.onText(/^\/admin$/, (msg) => handleAdminCommand(bot, msg, waitingForBroadcast));

  // --- Message Handlers ---
  bot.on('message', async (msg) => {
    if (msg.text) {
      await handleTextMessage(bot, msg, waitingForApiKey, waitingForBroadcast);
    }
  });

  bot.on('voice', async (msg) => {
    await handleVoiceMessage(bot, msg);
  });

  bot.on('document', async (msg) => {
    await handleDocumentMessage(bot, msg);
  });

  bot.on('callback_query', async (query) => {
    // Inject the actual user info into the message so handlers see the correct user
    if (query.message) {
      query.message.from = query.from;
    }
    
    if (query.data === 'action_settings') {
      await bot.answerCallbackQuery(query.id);
      await handleSettingsCommand(bot, query.message!, waitingForApiKey);
      return;
    }
    if (query.data === 'action_newchat') {
      await bot.answerCallbackQuery(query.id);
      await handleNewChatCommand(bot, query.message!);
      return;
    }
    if (query.data === 'action_history') {
      await bot.answerCallbackQuery(query.id);
      await handleHistoryCommand(bot, query.message!);
      return;
    }

    if (query.data && query.data.startsWith('topic_')) {
      const topicId = query.data.replace('topic_', '');
      await bot.answerCallbackQuery(query.id, { text: 'Loading history...' });
      
      const { getChatHistory } = await import('../db/index');
      const history = await getChatHistory(query.from.id, 10, topicId);
      
      if (history.length === 0) {
        await bot.sendMessage(query.message!.chat.id, 'No messages found for this topic.');
        return;
      }
      
      let historyText = `📜 <b>History for Topic</b>\n\n`;
      history.reverse().forEach(msg => {
        const role = msg.role === 'user' ? '👤 <b>You:</b>' : '🤖 <b>HFAPI:</b>';
        // Truncate long messages for display
        const content = msg.content.length > 200 ? msg.content.substring(0, 200) + '...' : msg.content;
        historyText += `${role} ${content}\n\n`;
      });
      
      await bot.sendMessage(query.message!.chat.id, historyText, { parse_mode: 'HTML' });
    }
  });

  // Profile Setup
  try {
    await bot.setMyName({ name: 'HFAPI' });
    await bot.setMyShortDescription({ short_description: 'Advanced Intelligence. Chat, search the web, generate images, and read files seamlessly.' });
    await bot.setMyDescription({ description: 'Welcome to HFAPI, your absolute ultimate Artificial Intelligence companion.\n\nCapabilities include:\n- Intelligent Chat and Coding\n- Real-Time Web Search\n- Breathtaking Image Generation\n- PDF Document Analysis\n- Voice Recognition\n\nProvide your API key and unleash frontier AI today!' });
    
    await bot.setMyCommands([
      { command: '/start', description: 'Start the bot' },
      { command: '/newchat', description: 'Start a new chat' },
      { command: '/history', description: 'View past conversations' },
      { command: '/settings', description: 'Configure API Key & Settings' },
      { command: '/resetdb', description: 'Wipe your entire database profile' }
    ]);
  } catch (error) {
    console.error('Failed to setup bot profile settings:', error);
  }

  console.log('Bot is running with Enterprise Modular Architecture...');
}
