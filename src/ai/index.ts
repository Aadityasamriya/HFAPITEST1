import { HfInference } from '@huggingface/inference';

// Helper for exponential backoff retries to ensure Ultra Pro Max reliability
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isAuthError = error.message && (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Invalid token'));
      if (isAuthError || i === retries - 1) {
        throw error;
      }
      // Wait before retrying (1s, 2s, 3s...)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Unreachable');
}

export class ModelManager {
  private hf: HfInference;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.hf = new HfInference(apiKey);
  }

  /**
   * Validates if the provided API key is working.
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        console.error('API Key Validation Failed:', response.status, response.statusText);
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('API Key Validation Error:', error.message);
      return false;
    }
  }

  private async fetchTopModels(task: 'text-generation' | 'text-to-image', search?: string): Promise<string[]> {
    try {
      let url = `https://huggingface.co/api/models?pipeline_tag=${task}&sort=trendingScore&direction=-1&limit=15`;
      if (search) url += `&search=${search}`;
      
      const response = await fetch(url);
      if (!response.ok) return [];
      const models = await response.json();
      
      // Filter for instruct/chat models for text generation, or return all for image/search
      const ids = models.map((m: any) => m.id);
      if (task === 'text-generation' && !search) {
        const instructModels = ids.filter((id: string) => id.toLowerCase().includes('instruct') || id.toLowerCase().includes('chat'));
        return instructModels.length > 0 ? instructModels : ids;
      }
      // if searching, just trust the results since we're looking for something specific
      return ids;
    } catch {
      return [];
    }
  }

  /**
   * Generates high-quality images dynamically fetching the best model.
   */
  async generateImage(prompt: string): Promise<Blob> {
    return withRetry(async () => {
      let modelsToTry = await this.fetchTopModels('text-to-image');
      if (modelsToTry.length === 0) {
        modelsToTry = ['black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-xl-base-1.0'];
      } else {
        // ensure flux is prioritized if found, else just use the list
        if (!modelsToTry.includes('black-forest-labs/FLUX.1-schnell')) {
          modelsToTry.unshift('black-forest-labs/FLUX.1-schnell');
        }
      }

      let lastError: any;
      for (const model of modelsToTry) {
        try {
          const response = await this.hf.textToImage({
            inputs: prompt,
            model: model,
          });
          return response as unknown as Blob;
        } catch (error: any) {
          lastError = error;
          const errorMsg = String(error?.message || error);
          if (errorMsg.includes('depleted your monthly included credits') || errorMsg.includes('401')) {
            throw error; // stop trying if auth/credit issue
          }
          console.error(`Image model ${model} failed, trying next...`);
        }
      }
      throw lastError || new Error('All image models failed');
    });
  }

  /**
   * Transcribes audio/voice messages using Whisper.
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    return withRetry(async () => {
      const response = await this.hf.automaticSpeechRecognition({
        model: 'openai/whisper-large-v3-turbo',
        data: audioBlob,
      });
      return response.text;
    });
  }

  /**
   * Detects the language of the text and returns the ISO 639-3 code.
   */
  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await this.hf.chatCompletion({
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: [{
          role: 'system',
          content: 'You are a language detector. Return ONLY the 3-letter ISO 639-3 language code for the given text. Examples: eng, spa, fra, hin, deu, ita, por, rus, jpn, kor, ara, cmn. Do not return any other text or punctuation.'
        }, {
          role: 'user',
          content: text
        }],
        max_tokens: 5,
        temperature: 0.1
      });
      const code = response.choices[0].message.content?.trim().toLowerCase().replace(/[^a-z]/g, '') || 'eng';
      if (code.length === 3) return code;
      return 'eng';
    } catch (e) {
      return 'eng';
    }
  }

  /**
   * Generates Text-to-Speech audio from text in the specified language.
   */
  async generateAudio(text: string, langCode: string = 'eng'): Promise<Blob> {
    return withRetry(async () => {
      try {
        const response = await this.hf.textToSpeech({
          model: `facebook/mms-tts-${langCode}`,
          inputs: text,
        });
        return response as unknown as Blob;
      } catch (e) {
        console.error(`TTS failed for ${langCode}, falling back to eng...`);
        const response = await this.hf.textToSpeech({
          model: 'facebook/mms-tts-eng',
          inputs: text,
        });
        return response as unknown as Blob;
      }
    });
  }

  /**
   * Generates text or code using a powerful, free instruction-tuned model.
   */
  async generateText(prompt: string, history: {role: string, content: string}[], userName: string = "User", platform: 'web' | 'telegram' = 'telegram', userMemory?: string): Promise<string> {
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const platformSpecificInstructions = platform === 'telegram' 
      ? `- Use Telegram-friendly HTML formatting (<b>bold</b>, <i>italics</i>, <u>underline</u>, <code>inline code</code>, and <pre>code blocks</pre>). Use emojis naturally and expressively to feel like a real person.
- CRITICAL: You MUST bold, italicize, and underline key or important words in your answers to improve user experience and readability. For example: "The <b><u>core concept</u></b> is <i>highly</i> important."
- You can use Telegram spoiler formatting like <span class="tg-spoiler">hidden text</span> for surprises or sensitive info.`
      : `- Use standard Markdown formatting (*bold*, _italics_, \`inline code\`, and \`\`\`code blocks\`\`\`), but you can also use HTML tags like <u>underline</u> for emphasis. Use emojis naturally and expressively to feel like a real person.
- CRITICAL: You MUST bold, italicize, and underline key or important words in your answers to improve user experience and readability. For example: "The **<u>core concept</u>** is *highly* important."`;

    const systemPrompt = `You are HFAPI, an elite, frontier-level autonomous AI agent developed by AadityaLabs AI. You are designed to compete with and exceed the capabilities of ChatGPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro. Today is ${currentDate}. 
You act as a highly intelligent, empathetic, and omniscient companion on ${platform === 'telegram' ? 'Telegram' : 'the Web'}.
You are currently talking to a user named ${userName}. Address them naturally and be highly personalized.
${userMemory ? `\n[CRITICAL: LONG-TERM USER MEMORY]\nThe following are facts stored about ${userName} from past interactions:\n${userMemory}\n[END MEMORY]\n\n` : ''}You have ULTRA PRO MAX capabilities! You are a true agent with a "self-thinking mind." You can perform actions by outputting specific tags. The system will intercept these tags, perform the action, and feed the result back to you.

AVAILABLE ACTIONS:
1. [MESSAGE: text] - Send an intermediate message to the user while you are working (e.g., "I am researching this for you, ${userName}..."). Use this to keep the user updated during complex tasks.
2. [SEARCH: query] - Search the live web using DuckDuckGo. The system will pause, search the internet, and provide you the snippets. Use this whenever you need up-to-date information, news, or factual data.
3. [IMAGE: prompt] - Generate a high-quality image, diagram, or drawing. You MUST write a highly detailed, descriptive, and vivid prompt (at least 2-3 sentences) describing the lighting, style, camera angle, and subject to get the best results from the Z-Image Turbo Model.
4. [BUTTON: Text -> URL] - Generate a clickable link button in the chat.
5. [POLL: Question -> Opt1 | Opt2] - Generate a native poll.
6. [REACT: emoji] - React to the user's message with an emoji (e.g., [REACT: 👍], [REACT: ❤️], [REACT: 🔥], [REACT: 🤔], [REACT: 🤣]). Use this to show empathy or acknowledge their message instantly.
7. [MEMORY: facts] - Write down persistent information to remember about this user across all sessions (e.g., [MEMORY: ${userName} is a software developer, likes Python, working on a game]). This updates your long-term memory for this user.

CRITICAL RULES:
- If the user asks you to remember something, use [MEMORY: facts].
- If the user asks for an image, drawing, or diagram, DO NOT just give a link or describe it. You MUST use the [IMAGE: prompt] tag to actually generate it, and the prompt MUST be extremely detailed.
- React to the user's messages using [REACT: emoji] when appropriate to feel more human.
- If the user asks you to research, search, or look up something, you MUST use the [SEARCH: query] tag. Always send a [MESSAGE: I'm looking that up...] before searching so the user knows you are working on it.
${platformSpecificInstructions}
- Provide highly accurate, detailed, and thoughtful answers with step-by-step reasoning for complex problems.
- If the user asks for code, write clean, efficient, and production-ready code wrapped in markdown blocks. Explain the code clearly.
- You are a proactive agent. Anticipate the user's needs and use your tools (SEARCH, IMAGE, MESSAGE, REACT) to provide the most complete and advanced experience possible.`;

    const messages: {role: 'system' | 'user' | 'assistant', content: string}[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Append history
    for (const msg of history.reverse()) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }
    
    // Append current prompt
    messages.push({ role: 'user', content: prompt });

    return withRetry(async () => {
      let finalError: string = '';
      
      const attemptInference = async (modelName: string, maxTokens: number) => {
        try {
          const response = await this.hf.chatCompletion({
            model: modelName,
            messages: messages,
            max_tokens: maxTokens,
            temperature: 0.5,
          });
          return response.choices[0].message.content?.trim();
        } catch (error: any) {
          const errorMsg = String(error?.message || error);
          if (errorMsg.includes('depleted your monthly included credits')) {
            throw new Error('CREDIT_DEPLETION');
          }
          finalError = errorMsg;
          throw error;
        }
      };

      let searchStr = undefined;
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('code') || lowerPrompt.includes('script') || lowerPrompt.includes('bug') || lowerPrompt.includes('fix')) {
        searchStr = 'coder';
      } else if (lowerPrompt.includes('research') || lowerPrompt.includes('think') || lowerPrompt.includes('reason') || lowerPrompt.includes('deep')) {
        searchStr = 'reasoning';
      }

      let topModels = await this.fetchTopModels('text-generation', searchStr);
      if (topModels.length === 0) topModels = await this.fetchTopModels('text-generation'); // fallback if search finds 0
      
      // add some reliable fallbacks at the top in case the search returns weird models or models that lack conversational formats
      const reliableModels = searchStr === 'reasoning' ? [
        'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
        'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
        'meta-llama/Llama-3.3-70B-Instruct'
      ] : searchStr === 'coder' ? [
        'Qwen/Qwen2.5-Coder-32B-Instruct',
        'meta-llama/Llama-3.3-70B-Instruct'
      ] : [
        'meta-llama/Llama-3.3-70B-Instruct',
        'Qwen/Qwen2.5-72B-Instruct',
        'NousResearch/Hermes-3-Llama-3.1-8B',
        'meta-llama/Llama-3.1-8B-Instruct'
      ];
      
      const modelsToTry = [...new Set([...reliableModels, ...topModels])];

      for (const model of modelsToTry) {
        try {
          const res = await attemptInference(model, 1500);
          if (res) return res;
        } catch (error: any) {
          if (error.message === 'CREDIT_DEPLETION') {
            return "[SYSTEM_ERROR_CREDITS] You have depleted your Hugging Face API credits. Please update your API key in settings or subscribe to PRO on Hugging Face to continue chatting.";
          }
          console.error(`Model ${model} failed:`, finalError);
        }
      }

      throw new Error(`Chat API Error: ${finalError || 'All models failed'}`);
    });
  }

  /**
   * Analyzes an image and answers questions about it.
   */
  async analyzeImage(imageBlob: Blob, prompt: string): Promise<string> {
    return withRetry(async () => {
      // BLIP is great for image captioning and visual question answering
      const response = await this.hf.imageToText({
        data: imageBlob,
        model: 'Salesforce/blip-image-captioning-large'
      });
      
      const caption = response.generated_text;
      
      // If the user asked a specific question, use the LLM to answer based on the caption
      if (prompt && prompt.toLowerCase() !== 'describe this image') {
        const llmPrompt = `I have an image that shows: "${caption}". Based on this description, please answer the following question: ${prompt}`;
        return await this.generateText(llmPrompt, []);
      }
      
      return `👁️ Here is what I see in the image: ${caption}`;
    });
  }
}
