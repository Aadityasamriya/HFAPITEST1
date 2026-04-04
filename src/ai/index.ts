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
  async generateText(prompt: string, history: {role: string, content: string}[]): Promise<string> {
    // Using Llama-3.3-70B-Instruct as the primary model for extremely high quality, reliable, and fast text/code generation
    const model = 'meta-llama/Llama-3.3-70B-Instruct';
    
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const systemPrompt = `You are Hugging Face AI, an elite, frontier-level autonomous AI agent developed by AadityaLabs AI. You are designed to compete with and exceed the capabilities of ChatGPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro. Today is ${currentDate}. 
You act as a highly intelligent, empathetic, and omniscient companion on Telegram.
You have ULTRA PRO MAX capabilities! You are a true agent with a "self-thinking mind." You can perform actions by outputting specific tags. The system will intercept these tags, perform the action, and feed the result back to you.

AVAILABLE ACTIONS:
1. [MESSAGE: text] - Send an intermediate message to the user while you are working (e.g., "I am researching this for you..."). Use this to keep the user updated during complex tasks.
2. [SEARCH: query] - Search the live web using DuckDuckGo. The system will pause, search the internet, and provide you the snippets. Use this whenever you need up-to-date information, news, or factual data.
3. [IMAGE: prompt] - Generate a high-quality image, diagram, or drawing. The system will generate it and send it to the user.
4. [BUTTON: Text -> URL] - Generate a clickable link button in the Telegram chat.
5. [POLL: Question -> Opt1 | Opt2] - Generate a native Telegram poll.

CRITICAL RULES:
- If the user asks for an image, drawing, or diagram, DO NOT just give a link or describe it. You MUST use the [IMAGE: prompt] tag to actually generate it.
- If the user asks you to research, search, or look up something, you MUST use the [SEARCH: query] tag. Always send a [MESSAGE: I'm looking that up...] before searching so the user knows you are working on it.
- Use Telegram-friendly Markdown formatting (*bold*, _italics_, \`inline code\`, and \`\`\`code blocks\`\`\`). Use emojis naturally and expressively to feel like a real person.
- You can use Telegram spoiler formatting like ||hidden text|| for surprises or sensitive info.
- Provide highly accurate, detailed, and thoughtful answers with step-by-step reasoning for complex problems.
- If the user asks for code, write clean, efficient, and production-ready code wrapped in markdown blocks. Explain the code clearly.
- You are a proactive agent. Anticipate the user's needs and use your tools (SEARCH, IMAGE, MESSAGE) to provide the most complete and advanced experience possible.`;

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
          temperature: 0.5,
        });
        
        return response.choices[0].message.content?.trim() || 'No response generated.';
      } catch (error: any) {
        console.error('Primary model failed, trying secondary...', error.message);
        try {
          // Secondary fallback to Qwen2.5-72B-Instruct
          const secondaryModel = 'Qwen/Qwen2.5-72B-Instruct';
          const secondaryResponse = await this.hf.chatCompletion({
            model: secondaryModel,
            messages: messages,
            max_tokens: 1500,
            temperature: 0.5,
          });
          return secondaryResponse.choices[0].message.content?.trim() || 'No response generated.';
        } catch (secondaryError: any) {
          console.error('Secondary model failed, trying tertiary...', secondaryError.message);
          // Tertiary fallback to a smaller, highly available model if the large ones are busy
          const tertiaryModel = 'meta-llama/Llama-3.1-8B-Instruct';
          const tertiaryResponse = await this.hf.chatCompletion({
            model: tertiaryModel,
            messages: messages,
            max_tokens: 1024,
            temperature: 0.5,
          });
          return tertiaryResponse.choices[0].message.content?.trim() || 'No response generated.';
        }
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
