import { HfInference } from '@huggingface/inference';

export class ModelManager {
  private hf: HfInference;

  constructor(apiKey: string) {
    this.hf = new HfInference(apiKey);
  }

  async classifyIntent(prompt: string): Promise<'image_generation' | 'code_generation' | 'conversation'> {
    try {
      // Simple keyword based classification for speed and reliability, 
      // can be replaced with a zero-shot classifier model if needed
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('generate image') || lowerPrompt.includes('create image') || lowerPrompt.includes('draw') || lowerPrompt.includes('picture of')) {
        return 'image_generation';
      }
      if (lowerPrompt.includes('code') || lowerPrompt.includes('script') || lowerPrompt.includes('python') || lowerPrompt.includes('javascript') || lowerPrompt.includes('html')) {
        return 'code_generation';
      }
      return 'conversation';
    } catch (e) {
      return 'conversation';
    }
  }

  async generateImage(prompt: string): Promise<Blob> {
    const response = await this.hf.textToImage({
      inputs: prompt,
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      parameters: {
        negative_prompt: 'blurry, bad quality, distorted'
      }
    });
    return response as unknown as Blob;
  }

  async generateText(prompt: string, history: {role: string, content: string}[]): Promise<string> {
    // Format history for the model
    let formattedPrompt = history.reverse().map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    formattedPrompt += `\nUser: ${prompt}\nAssistant:`;

    const response = await this.hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false
      }
    });
    return response.generated_text;
  }

  async analyzeImage(imageBlob: Blob, prompt: string): Promise<string> {
    const response = await this.hf.imageToText({
      data: imageBlob,
      model: 'Salesforce/blip-image-captioning-large'
    });
    return response.generated_text;
  }
}
