import TelegramBot from 'node-telegram-bot-api';
import { getUser, updateUserApiKey, addMessage, getAllUsers } from '../../db/index';
import { ModelManager } from '../../ai/index';
import { AgentService } from '../../services/agent.service';
import { sendSafeMarkdown, withContinuousAction, processAndSendAiResponse } from '../utils/telegram';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { PDFParse } from 'pdf-parse';

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
        await sendSafeMarkdown(bot, chatId, `✅ *API Key saved successfully!* You are now ready to use the bot. Try asking me to generate an image or write some code!`);
      } else {
        await sendSafeMarkdown(bot, chatId, `❌ *Invalid API Key.* Please check your key and try /settings again.`);
      }
    } else {
      await sendSafeMarkdown(bot, chatId, `❌ *Invalid format.* Hugging Face keys usually start with 'hf_'. Try /settings again.`);
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
        await sendSafeMarkdown(bot, u.id, `📢 *Announcement*\n\n${text}`);
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
    await sendSafeMarkdown(bot, chatId, `⚠️ *API Key Required*\nPlease set your Hugging Face API key using /settings before chatting.`);
    return;
  }

  const ai = new ModelManager(user.hfApiKey);
  await addMessage(userId, 'user', text);

  try {
    const finalResponse = await AgentService.processTelegramMessage(ai, text, user, user.name, bot, chatId, msg.message_id);
    await processAndSendAiResponse(bot, chatId, finalResponse);
    await addMessage(userId, 'assistant', finalResponse);
  } catch (error: any) {
    console.error('Agentic Loop Error:', error);
    await sendSafeMarkdown(bot, chatId, `❌ *An error occurred while processing your request.* Please try again later.`);
  }
}

export async function handleVoiceMessage(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;
  const user = await getUser(userId, msg.from!.first_name, msg.from!.username);

  if (!user.hfApiKey) {
    await sendSafeMarkdown(bot, chatId, `⚠️ *API Key Required*\nPlease set your Hugging Face API key using /settings before sending voice messages.`);
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

    await sendSafeMarkdown(bot, chatId, `🎙️ *Transcription:*\n_${transcription}_\n\n🤖 *Thinking...*`);
    
    await addMessage(userId, 'user', `[Voice Message Transcription]: ${transcription}`);
    const finalResponse = await AgentService.processTelegramMessage(ai, transcription, user, user.name, bot, chatId, msg.message_id);
    await processAndSendAiResponse(bot, chatId, finalResponse);
    await addMessage(userId, 'assistant', finalResponse);

  } catch (error) {
    console.error('Voice processing error:', error);
    await sendSafeMarkdown(bot, chatId, `❌ *Failed to process voice message.*`);
  }
}

export async function handleDocumentMessage(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;
  const user = await getUser(userId, msg.from!.first_name, msg.from!.username);

  if (!user.hfApiKey) {
    await sendSafeMarkdown(bot, chatId, `⚠️ *API Key Required*\nPlease set your Hugging Face API key using /settings before sending documents.`);
    return;
  }

  const ai = new ModelManager(user.hfApiKey);
  const doc = msg.document!;
  const fileSize = doc.file_size || 0;

  if (fileSize > 10 * 1024 * 1024) {
    await sendSafeMarkdown(bot, chatId, `❌ *File too large.* Please send files smaller than 10MB.`);
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
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
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
        await sendSafeMarkdown(bot, chatId, `❌ *Unsupported file type.* I can read PDFs, ZIPs (containing text), and plain text files.`);
        return;
      }

      if (!extractedText.trim()) {
        await sendSafeMarkdown(bot, chatId, `⚠️ *Could not extract any text from the file.*`);
        return;
      }

      const truncatedText = extractedText.substring(0, 15000); // Limit context size
      const prompt = `I have uploaded a file named "${doc.file_name}". Here is its content:\n\n${truncatedText}\n\nPlease analyze this file and tell me what it is about, or answer my next questions about it.`;
      
      await addMessage(userId, 'user', `[Uploaded File: ${doc.file_name}]`);
      const finalResponse = await AgentService.processTelegramMessage(ai, prompt, user, user.name, bot, chatId, msg.message_id);
      await processAndSendAiResponse(bot, chatId, finalResponse);
      await addMessage(userId, 'assistant', finalResponse);
    });
  } catch (error) {
    console.error('Document processing error:', error);
    await sendSafeMarkdown(bot, chatId, `❌ *Failed to process document.*`);
  }
}
