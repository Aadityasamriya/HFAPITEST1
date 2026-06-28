import TelegramBot from 'node-telegram-bot-api';
import { handleStartCommand, handleSettingsCommand, handleNewChatCommand, handleResetDbCommand, handleAdminCommand, handleHistoryCommand, handleLoginCommand } from './commands/index';
import { handleTextMessage, handleVoiceMessage, handleDocumentMessage, handlePhotoMessage, handlePollAnswer } from './handlers/index';

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
  bot.onText(/^\/(login|web)$/, (msg) => handleLoginCommand(bot, msg));

  // --- Message Handlers ---
  bot.on('message', async (msg) => {
    if (msg.from) {
      const { redisCache } = await import('../lib/redis');
      const rateLimitKey = `rate_limit_tg_${msg.from.id}`;
      // Max 10 messages per 30 seconds
      const count = await redisCache.incrementRateLimit(rateLimitKey, 30);
      if (count > 10) {
        if (count === 11) {
          await bot.sendMessage(msg.chat.id, "⚠️ <b>Spam Detected</b>\nYou are sending messages too quickly. Please wait 30 seconds before trying again.", { parse_mode: 'HTML' });
        }
        return; // drop message
      }
    }

    if (msg.text) {
      await handleTextMessage(bot, msg, waitingForApiKey, waitingForBroadcast);
    }
  });

  bot.on('voice', async (msg) => {
    if (msg.from) {
      const { redisCache } = await import('../lib/redis');
      const rateLimitKey = `rate_limit_tg_${msg.from.id}`;
      const count = await redisCache.incrementRateLimit(rateLimitKey, 30);
      if (count > 10) return;
    }
    await handleVoiceMessage(bot, msg);
  });

  bot.on('document', async (msg) => {
    if (msg.from) {
      const { redisCache } = await import('../lib/redis');
      const rateLimitKey = `rate_limit_tg_${msg.from.id}`;
      const count = await redisCache.incrementRateLimit(rateLimitKey, 30);
      if (count > 10) return;
    }
    await handleDocumentMessage(bot, msg);
  });
  
  bot.on('photo', async (msg) => {
    if (msg.from) {
      const { redisCache } = await import('../lib/redis');
      const rateLimitKey = `rate_limit_tg_${msg.from.id}`;
      const count = await redisCache.incrementRateLimit(rateLimitKey, 30);
      if (count > 10) return;
    }
    await handlePhotoMessage(bot, msg);
  });
  
  bot.on('poll_answer', async (pollAnswer) => {
    await handlePollAnswer(bot, pollAnswer);
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
    if (query.data === 'action_login_web') {
      await bot.answerCallbackQuery(query.id);
      await handleLoginCommand(bot, query.message!);
      return;
    }

    if (query.data && query.data.startsWith('topic_')) {
      const topicId = query.data.replace('topic_', '');
      
      const { getChatHistory, setActiveTopic } = await import('../db/index');
      
      // If it's from the session expired message (or from history), we want to let them continue
      // Let's set it as the active topic.
      await setActiveTopic(query.from.id, topicId);
      
      await bot.answerCallbackQuery(query.id, { text: 'Topic loaded. You can continue chatting!' });
      
      const history = await getChatHistory(query.from.id, 5, topicId);
      
      if (history.length === 0) {
        await bot.sendMessage(query.message!.chat.id, '✅ Conversation restored. You can continue chatting now.');
        return;
      }
      
      let historyText = `✅ <b>Conversation Restored!</b>\nHere are the last few messages:\n\n`;
      history.reverse().forEach(msg => {
        const role = msg.role === 'user' ? '👤 <b>You:</b>' : '🤖 <b>AadityaLabs AI:</b>';
        const content = msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content;
        historyText += `${role} ${content}\n\n`;
      });
      
      await bot.sendMessage(query.message!.chat.id, historyText, { parse_mode: 'HTML' });
    }
  });

  // Profile Setup
  try {
    await bot.setMyCommands([
      { command: '/start', description: '🚀 Start or reboot the bot' },
      { command: '/newchat', description: '💬 Start a fresh conversation' },
      { command: '/history', description: '📜 View past conversations' },
      { command: '/settings', description: '⚙️ Configure API Key & Settings' },
      { command: '/resetdb', description: '🗑️ Wipe your entire database profile' }
    ]);
  } catch (error: any) {
    console.warn(`[Bot Profile Setup] Could not set commands (possibly rate limited). Continuing...`);
  }

  console.log('Bot is running with Enterprise Modular Architecture...');
}
