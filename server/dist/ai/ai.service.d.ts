export declare class AIService {
    private openai;
    constructor();
    generateChatCompletion(prompt: string): Promise<string>;
}
