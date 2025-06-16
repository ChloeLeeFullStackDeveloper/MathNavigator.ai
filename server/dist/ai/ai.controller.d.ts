import { AIService } from './ai.service';
export declare class AIController {
    private readonly aiService;
    constructor(aiService: AIService);
    explain(body: {
        question: string;
        userAnswer: string;
        correctAnswer: string;
    }): Promise<{
        explanation: string;
    }>;
}
