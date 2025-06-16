import { Controller, Post, Body } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('api')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('explain')
  async explain(@Body() body: { question: string; userAnswer: string; correctAnswer: string }) {
    const { question, userAnswer, correctAnswer } = body;
    const prompt = `
You are a helpful math tutor. A student answered a multiple-choice question incorrectly.

Question: ${question}
Their answer: "${userAnswer}"
Correct answer: "${correctAnswer}"

Please explain why the student's answer is incorrect, and why the correct answer is right, in simple terms.
`;

    const explanation = await this.aiService.generateChatCompletion(prompt);
    return { explanation };
  }
}
