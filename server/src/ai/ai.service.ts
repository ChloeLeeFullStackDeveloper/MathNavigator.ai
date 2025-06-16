import { Injectable } from '@nestjs/common';
import OpenAI from 'openai'; // ✅ 최신 방식

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateChatCompletion(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0]?.message?.content || 'No response from AI';
  }
}
