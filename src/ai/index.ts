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
   * Generates high-quality images using SDXL.
   */
  async generateImage(prompt: string): Promise<Blob> {
    const response = await this.hf.textToImage({
      inputs: prompt,
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      parameters: {
        negative_prompt: 'blurry, bad quality, distorted, ugly, deformed, text, watermark'
      }
    });
    return response as unknown as Blob;
  }

  /**
   * Generates text or code using a powerful, free instruction-tuned model.
   */
  async generateText(prompt: string, history: {role: string, content: string}[], isCode: boolean = false): Promise<string> {
    // Using Mixtral for high-quality, fast, and free text/code generation
    const model = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
    
    let formattedPrompt = '<s>[INST] You are a highly intelligent, helpful, and accurate AI assistant. ';
    if (isCode) {
      formattedPrompt += 'The user wants you to write code. Provide the code in markdown blocks so it can be easily copied. ';
    }
    formattedPrompt += '[/INST] Understood.</s>\n';

    // Append history
    for (const msg of history.reverse()) {
      if (msg.role === 'user') {
        formattedPrompt += `[INST] ${msg.content} [/INST]\n`;
      } else {
        formattedPrompt += `${msg.content}\n`;
      }
    }
    
    // Append current prompt
    formattedPrompt += `[INST] ${prompt} [/INST]\n`;

    const response = await this.hf.textGeneration({
      model: model,
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: 1024,
        temperature: isCode ? 0.2 : 0.7, // Lower temp for code to be more precise
        return_full_text: false,
        top_p: 0.95
      }
    });
    
    return response.generated_text.trim();
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
    
    return `Here is what I see in the image: ${caption}`;
  }
}
