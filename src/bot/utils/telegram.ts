import TelegramBot from 'node-telegram-bot-api';

// Helper to safely send HTML messages (fallback to plain text if HTML fails)
export async function sendSafeHtml(bot: TelegramBot, chatId: number | string, text: string, options?: TelegramBot.SendMessageOptions) {
  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...options });
  } catch (e: any) {
    if (e.message && e.message.includes('parse entities')) {
      // Fallback to plain text if HTML is malformed
      await bot.sendMessage(chatId, text, options);
    } else {
      throw e;
    }
  }
}

// Helper to keep sending chat actions (typing, upload_photo, etc.) for long-running tasks
export async function withContinuousAction<T>(bot: TelegramBot, chatId: number | string, action: TelegramBot.ChatAction, fn: () => Promise<T>): Promise<T> {
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
export async function processAndSendAiResponse(bot: TelegramBot, chatId: number | string, aiResponse: string) {
  let cleanResponse = aiResponse;
  const inlineKeyboard: TelegramBot.InlineKeyboardButton[][] = [];
  const polls: { question: string, options: string[] }[] = [];

  // Extract buttons: [BUTTON: Text -> URL]
  const buttonRegex = /\[BUTTON:\s*(.+?)\s*->\s*(https?:\/\/[^\s\]]+)\s*\]/g;
  let match;
  while ((match = buttonRegex.exec(cleanResponse)) !== null) {
    inlineKeyboard.push([{ text: match[1].trim(), url: match[2].trim() }]);
    cleanResponse = cleanResponse.replace(match[0], '').trim();
  }

  // Extract polls: [POLL: Question -> Opt1 | Opt2]
  const pollRegex = /\[POLL:\s*(.+?)\s*->\s*(.+?)\]/g;
  while ((match = pollRegex.exec(cleanResponse)) !== null) {
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
    await sendSafeHtml(bot, chatId, cleanResponse || 'Here you go!', opts);
  }

  // Send any polls
  for (const poll of polls) {
    await bot.sendPoll(chatId, poll.question, poll.options, { is_anonymous: false });
  }
}
