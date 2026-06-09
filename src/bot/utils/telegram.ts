import TelegramBot from 'node-telegram-bot-api';

function formatTelegramHtml(text: string): string {
  // First, escape &, <, > to prevent native HTML issues (except the ones we parse)
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Parse code blocks first
  escaped = escaped.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  // Parse inline code
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Parse bold
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  // Parse italic (ignore _ inside words)
  escaped = escaped.replace(/(^|\s)_([^_]+)_(\s|$)/g, '$1<i>$2</i>$3');
  escaped = escaped.replace(/(^|\s)\*([^*]+)\*(\s|$)/g, '$1<i>$2</i>$3');
  // Parse underline
  escaped = escaped.replace(/__([^_]+)__/g, '<u>$1</u>');
  // Parse strikethrough
  escaped = escaped.replace(/~~([^~]+)~~/g, '<s>$1</s>');
  // Parse links
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return escaped;
}

// Helper to safely send HTML messages (fallback to plain text if HTML fails)
export async function sendSafeHtml(bot: TelegramBot, chatId: number | string, text: string, options?: TelegramBot.SendMessageOptions) {
  try {
    // Only apply the markdown -> HTML formatter if it doesn't already contain explicit telegram HTML tags we injected ourself.
    // Actually, our internal generated strings use raw <b> / <i>. It's better to just try raw first,
    // usually if it comes from AI it needs parsing, but if from our system it's already HTML.
    // So we apply standard parser if there are no native `<b`, `<i>`, `<a>` in it.
    let formattedText = text;
    if (!text.includes('<b>') && !text.includes('<i>') && !text.includes('<code>')) {
      formattedText = formatTelegramHtml(text);
    }
    
    await bot.sendMessage(chatId, formattedText, { parse_mode: 'HTML', ...options });
  } catch (e: any) {
    if (e.message && e.message.includes('parse entities')) {
      // Fallback to plain text if HTML is malformed, stripping out HTML tags
      const plainText = text.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      try {
        await bot.sendMessage(chatId, plainText, options);
      } catch (innerE) {
        // Absolute fallback without any text mangling
        await bot.sendMessage(chatId, text, options).catch(() => {});
      }
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
export async function processAndSendAiResponse(bot: TelegramBot, chatId: number | string, aiResponse: string, userId?: string | number, topicId?: string) {
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
    const sentPollMsg = await bot.sendPoll(chatId, poll.question, poll.options, { is_anonymous: false });
    if (userId && topicId && sentPollMsg.poll) {
       const { savePollMapping } = await import('../../db/index');
       await savePollMapping(userId, sentPollMsg.poll.id, topicId, poll.question, poll.options);
    }
  }
}

