import { HfInference } from '@huggingface/inference';

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
      // Use the official whoami endpoint to reliably check if the token is valid
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
    const imageKeywords = ['generate image', 'create image', 'draw', 'picture of', 'photo of', 'render'];
    if (imageKeywords.some(kw => lowerPrompt.includes(kw))) {
      return 'image_generation';
    }

    const codeKeywords = ['write code', 'script', 'python', 'javascript', 'html', 'css', 'react', 'debug', 'function', 'json'];
    if (codeKeywords.some(kw => lowerPrompt.includes(kw))) {
      return 'code_generation';
    }

    return 'conversation';
  }

  /**
   * Generates high-quality images using FLUX.1-schnell (very fast and reliable).
   */
  async generateImage(prompt: string): Promise<Blob> {
    const response = await this.hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    });
    return response as unknown as Blob;
  }

  /**
   * Generates text or code using a powerful, free instruction-tuned model.
   */
  async generateText(prompt: string, history: {role: string, content: string}[], isCode: boolean = false): Promise<string> {
    // Using Qwen2.5-72B-Instruct for extremely high quality, reliable, and fast text/code generation
    const model = 'Qwen/Qwen2.5-72B-Instruct';
    
    const messages: {role: 'system' | 'user' | 'assistant', content: string}[] = [
      {
        role: 'system',
        content: isCode 
          ? 'You are an expert programmer. Write clean, efficient code. Always wrap your code in markdown blocks (e.g., ```python) so it can be easily copied.' 
          : 'You are a highly intelligent, helpful, and accurate AI assistant.'
      }
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
  }

  /**
   * Analyzes an image and answers questions about it.
   */
  async analyzeImage(imageBlob: Blob, prompt: string): Promise<string> {
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
  }
}
