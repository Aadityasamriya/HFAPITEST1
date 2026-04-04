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
   * Validates if the provided Hugging Face API key is working.
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

  /**
   * Classifies the user's intent to route to the correct specialized model.
   */
  async classifyIntent(prompt: string): Promise<'image_generation' | 'code_generation' | 'conversation'> {
    const lowerPrompt = prompt.toLowerCase();
    
    // Fast keyword-based routing for immediate response
    const imageKeywords = ['generate image', 'create image', 'draw', 'picture of', 'photo of', 'render', 'generate a picture', 'imagine'];
    if (imageKeywords.some(kw => lowerPrompt.includes(kw))) {
      return 'image_generation';
    }

    const codeKeywords = ['write code', 'script', 'python', 'javascript', 'html', 'css', 'react', 'debug', 'function', 'json', 'typescript', 'c++', 'java'];
    if (codeKeywords.some(kw => lowerPrompt.includes(kw))) {
      return 'code_generation';
    }

    return 'conversation';
  }

  /**
   * Generates high-quality images using FLUX.1-schnell (very fast and reliable).
   */
  async generateImage(prompt: string): Promise<Blob> {
    return withRetry(async () => {
      const response = await this.hf.textToImage({
        inputs: prompt,
        model: 'black-forest-labs/FLUX.1-schnell',
      });
      return response as unknown as Blob;
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
  async generateText(prompt: string, history: {role: string, content: string}[], isCode: boolean = false): Promise<string> {
    // Using Qwen2.5-72B-Instruct for extremely high quality, reliable, and fast text/code generation
    const model = 'Qwen/Qwen2.5-72B-Instruct';
    
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const systemPrompt = isCode 
      ? `You are Hugging Face AI, an elite, frontier-level AI programmer developed by AadityaLabs AI. Today is ${currentDate}. You rival the coding capabilities of Claude 3.5 Sonnet and GPT-4o. Write clean, efficient, and production-ready code. Always wrap your code in markdown blocks (e.g., \`\`\`python) so it can be easily copied. Explain your code briefly and clearly.` 
      : `You are Hugging Face AI, an elite, frontier-level conversational assistant developed by AadityaLabs AI, designed to compete with and exceed ChatGPT, Claude, and Gemini. Today is ${currentDate}. 
You act as a highly intelligent, empathetic, and omniscient companion on Telegram.
You have ULTRA PRO MAX capabilities!
1. UI Elements: Generate buttons [BUTTON: Text -> URL] and polls [POLL: Question -> Opt1 | Opt2].
2. Web Search: If you need factual, real-time, or encyclopedic information, output EXACTLY: [WIKI: search term]. The system will pause, search Wikipedia, and provide you the results to continue.
Use Telegram-friendly Markdown formatting (*bold*, _italics_, \`inline code\`, and \`\`\`code blocks\`\`\`). Use emojis naturally. Provide highly accurate, detailed, and thoughtful answers with step-by-step reasoning for complex problems.`;

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
      try {
        const response = await this.hf.chatCompletion({
          model: model,
          messages: messages,
          max_tokens: 1500,
          temperature: isCode ? 0.2 : 0.7,
        });
        
        return response.choices[0].message.content?.trim() || 'No response generated.';
      } catch (error: any) {
        console.error('Primary model failed, trying fallback...', error.message);
        // Fallback to a smaller, highly available model if the large one is busy
        const fallbackModel = 'meta-llama/Meta-Llama-3-8B-Instruct';
        const fallbackResponse = await this.hf.chatCompletion({
          model: fallbackModel,
          messages: messages,
          max_tokens: 1024,
          temperature: isCode ? 0.2 : 0.7,
        });
        return fallbackResponse.choices[0].message.content?.trim() || 'No response generated.';
      }
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
