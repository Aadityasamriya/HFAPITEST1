import TelegramBot from 'node-telegram-bot-api';
import { getUser, updateUserApiKey, addMessage, getAllUsers, getPollMapping } from '../../db/index';
import { ModelManager } from '../../ai/index';
import { AgentService } from '../../services/agent.service';
import { sendSafeHtml, withContinuousAction, processAndSendAiResponse } from '../utils/telegram';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function handlePollAnswer(bot: TelegramBot, pollAnswer: TelegramBot.PollAnswer) {
  try {
    const userId = pollAnswer.user.id;
    const pollId = pollAnswer.poll_id;
    const pollMapping = await getPollMapping(pollId);
    
    if (!pollMapping) return; // poll wasn't recorded or expired
    
    const user = await getUser(userId, pollAnswer.user.first_name, pollAnswer.user.username);
    if (!user.hfApiKey) return; // no api key
    
    const ai = new ModelManager(user.hfApiKey);
    const selectedOptions = pollAnswer.option_ids.map(id => pollMapping.options[id]).join(', ');
    
    const userMessage = `[Poll Answer] For the question "${pollMapping.question}", I selected: ${selectedOptions}. Please acknowledge or continue based on my answer.`;
    
    await addMessage(userId, 'user', userMessage, pollMapping.topic_id);
    
    // Simulate thinking state with action
    // Send standard typing text to notify user
    await sendSafeHtml(bot, userId, `<i>Received your vote: ${selectedOptions}. Thinking...</i>`);
    
    const finalResponse = await AgentService.processTelegramMessage(ai, userMessage, user, user.name, bot, userId, 0); // No message ID since it's a poll answer
    await processAndSendAiResponse(bot, userId, finalResponse, userId, pollMapping.topic_id);
    await addMessage(userId, 'assistant', finalResponse, pollMapping.topic_id);

  } catch (error) {
    console.error('Error handling poll answer:', error);
  }
}

export async function handleTextMessage(
  bot: TelegramBot, 
  msg: TelegramBot.Message, 
  waitingForApiKey: Set<number>, 
  waitingForBroadcast: Set<number>
) {
  const chatId = msg.chat.id;
  const text = msg.text!;
  const userId = msg.from!.id;

  // Ignore commands
  if (text.startsWith('/')) return;

  try {
    const user = await getUser(userId, msg.from!.first_name, msg.from!.username);

    // Handle API Key Input
    if (waitingForApiKey.has(userId)) {
      waitingForApiKey.delete(userId);
      const key = text.trim();
      if (key.startsWith('hf_')) {
        const tempAi = new ModelManager(key);
        const isValid = await tempAi.validateApiKey();
        if (isValid) {
          await updateUserApiKey(userId, key);
          await sendSafeHtml(bot, chatId, `✅ <b>API Key saved successfully!</b> You are now ready to use the bot. Try asking me to generate an image or write some code!`);
        } else {
          await sendSafeHtml(bot, chatId, `❌ <b>Invalid API Key.</b> Please check your key and try /settings again.`);
        }
      } else {
        await sendSafeHtml(bot, chatId, `❌ <b>Invalid format.</b> API keys usually start with 'hf_'. Try /settings again.`);
      }
      return;
    }

    // Handle Broadcast Input
    if (waitingForBroadcast.has(userId)) {
      waitingForBroadcast.delete(userId);
      const users = await getAllUsers();
      let successCount = 0;
      
      await bot.sendMessage(chatId, `📢 Broadcasting message to ${users.length} users...`);
      
      for (const u of users) {
        try {
          await sendSafeHtml(bot, u.id, `📢 <b>Announcement</b>\n\n${text}`);
          successCount++;
        } catch (e) {
          // User might have blocked the bot
        }
      }
      
      await bot.sendMessage(chatId, `✅ Broadcast complete. Sent to ${successCount}/${users.length} users.`);
      return;
    }

    // Normal Chat Flow
    if (!user.hfApiKey) {
      await sendSafeHtml(bot, chatId, `⚠️ <b>API Key Required</b>\nPlease set your API key using /settings before chatting.`);
      return;
    }

    const ai = new ModelManager(user.hfApiKey);
    const topicId = user.activeTopicId || `topic_${Date.now()}`;
    
    // Check if this is the first message in the topic
    const { getChatHistory, saveTopic } = await import('../../db/index');
    const history = await getChatHistory(userId, 1, topicId);
    const isFirstMessage = history.length === 0;

    await addMessage(userId, 'user', text, topicId);

    const finalResponse = await AgentService.processTelegramMessage(ai, text, user, user.name, bot, chatId, msg.message_id);
    await processAndSendAiResponse(bot, chatId, finalResponse, userId, topicId);
    await addMessage(userId, 'assistant', finalResponse, topicId);
    
    if (isFirstMessage) {
      try {
        const titlePrompt = `Generate a very short (2-4 words) title for this conversation based on this message: "${text}". Just return the title, nothing else.`;
        const titleResponse = await ai.generateText(titlePrompt, [], 'System', 'telegram');
        await saveTopic(userId, topicId, titleResponse.trim().replace(/["']/g, ''));
      } catch (e) {
        await saveTopic(userId, topicId, text.substring(0, 30) + '...');
      }
    }

  } catch (error: any) {
    console.error('Agentic Loop Error:', error);
    try {
      const errMsg = error.message || '';
      if (error.name === 'MongoServerSelectionError' || errMsg.includes('MongoNetworkError') || errMsg.includes('getaddrinfo EAI_AGAIN')) {
        await sendSafeHtml(bot, chatId, `❌ <b>Database Connection Failed.</b>\nYour <code>MONGODB_URI</code> seems to be invalid or private (e.g., a '.internal' address). Please use a publicly accessible connection string in your environment variables.`);
      } else {
        await sendSafeHtml(bot, chatId, `❌ <b>An error occurred while processing your request.</b> Please try again later.\n<code>${errMsg}</code>`);
      }
    } catch (e) {
      // Ignore if we can't send the error message (e.g. user blocked bot)
    }
  }
}

export async function handleVoiceMessage(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;
  const user = await getUser(userId, msg.from!.first_name, msg.from!.username);

  if (!user.hfApiKey) {
    await sendSafeHtml(bot, chatId, `⚠️ <b>API Key Required</b>\nPlease set your API key using /settings before sending voice messages.`);
    return;
  }

  const ai = new ModelManager(user.hfApiKey);

  try {
    const transcription = await withContinuousAction(bot, chatId, 'typing', async () => {
      const fileLink = await bot.getFileLink(msg.voice!.file_id);
      const response = await fetch(fileLink);
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/ogg' });
      return await ai.transcribeAudio(blob);
    });

    await sendSafeHtml(bot, chatId, `🎙️ <b>Transcription:</b>\n<i>${transcription}</i>\n\n🤖 <b>Thinking...</b>`);
    
    await addMessage(userId, 'user', `[Voice Message Transcription]: ${transcription}`);
    const finalResponse = await AgentService.processTelegramMessage(ai, transcription, user, user.name, bot, chatId, msg.message_id);
    await processAndSendAiResponse(bot, chatId, finalResponse);
    await addMessage(userId, 'assistant', finalResponse);

  } catch (error) {
    console.error('Voice processing error:', error);
    try {
      await sendSafeHtml(bot, chatId, `❌ <b>Failed to process voice message.</b>`);
    } catch(e) {}
  }
}

export async function handleDocumentMessage(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;
  
  try {
    const user = await getUser(userId, msg.from!.first_name, msg.from!.username);

    if (!user.hfApiKey) {
      await sendSafeHtml(bot, chatId, `⚠️ <b>API Key Required</b>\nPlease set your API key using /settings before sending documents.`);
      return;
    }

    const ai = new ModelManager(user.hfApiKey);
    const doc = msg.document!;
    const fileSize = doc.file_size || 0;

    if (fileSize > 10 * 1024 * 1024) {
      await sendSafeHtml(bot, chatId, `❌ <b>File too large.</b> Please send files smaller than 10MB.`);
      return;
    }

    try {
      await withContinuousAction(bot, chatId, 'typing', async () => {
        const fileLink = await bot.getFileLink(doc.file_id);
        const response = await fetch(fileLink);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let extractedText = '';

        if (doc.mime_type === 'application/pdf' || doc.file_name?.endsWith('.pdf')) {
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } else if (doc.mime_type === 'application/zip' || doc.mime_type === 'application/x-zip-compressed' || doc.file_name?.endsWith('.zip')) {
          const zip = new AdmZip(buffer);
          const zipEntries = zip.getEntries();
          
          for (const entry of zipEntries) {
            if (!entry.isDirectory && !entry.entryName.startsWith('__MACOSX') && !entry.entryName.includes('.DS_Store')) {
              const content = entry.getData().toString('utf8');
              // Only include text files (basic heuristic)
              if (content.indexOf('\0') === -1) {
                extractedText += `\n--- File: ${entry.entryName} ---\n${content.substring(0, 5000)}\n`;
              }
            }
          }
        } else if (doc.mime_type?.startsWith('text/') || doc.file_name?.match(/\.(txt|json|csv|md|py|js|ts|html|css)$/i)) {
          extractedText = buffer.toString('utf8');
        } else {
          await sendSafeHtml(bot, chatId, `❌ <b>Unsupported file type.</b> I can read PDFs, ZIPs (containing text), and plain text files.`);
          return;
        }

        if (!extractedText.trim()) {
          await sendSafeHtml(bot, chatId, `⚠️ <b>Could not extract any text from the file.</b>`);
          return;
        }

        const truncatedText = extractedText.substring(0, 15000); // Limit context size
        const prompt = `I have uploaded a file named "${doc.file_name}". Here is its content:\n\n${truncatedText}\n\nPlease analyze this file and tell me what it is about, or answer my next questions about it.`;
        
        await addMessage(userId, 'user', `[Uploaded File: ${doc.file_name}]`);
        const finalResponse = await AgentService.processTelegramMessage(ai, prompt, user, user.name, bot, chatId, msg.message_id);
        await processAndSendAiResponse(bot, chatId, finalResponse);
        await addMessage(userId, 'assistant', finalResponse);
      });
    } catch (error: any) {
      console.error('Document processing error:', error);
      try {
        const errMsg = error.message || '';
        if (error.name === 'MongoServerSelectionError' || errMsg.includes('MongoNetworkError') || errMsg.includes('getaddrinfo')) {
          await sendSafeHtml(bot, chatId, `❌ <b>Database Connection Failed.</b>\nYour <code>MONGODB_URI</code> seems to be invalid or using a private network.`);
        } else {
          await sendSafeHtml(bot, chatId, `❌ <b>Failed to process document.</b>\n<code>${errMsg || 'Unknown Error'}</code>`);
        }
      } catch (e) {}
    }
  } catch (outerError: any) {
    try {
      await sendSafeHtml(bot, chatId, `❌ <b>Failed to process document request.</b>`);
    } catch(e) {}
  }
}