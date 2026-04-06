import TelegramBot from 'node-telegram-bot-api';
import { handleStartCommand, handleSettingsCommand, handleNewChatCommand, handleResetDbCommand, handleAdminCommand } from './commands/index';
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

  // Set bot commands menu
  bot.setMyCommands([
    { command: '/start', description: 'Start the bot' },
    { command: '/newchat', description: 'Start a new chat (clear history)' },
    { command: '/settings', description: 'Configure API Key' },
    { command: '/resetdb', description: 'Reset your database' }
  ]).catch(console.error);

  console.log('Bot is running with Enterprise Modular Architecture...');
}
